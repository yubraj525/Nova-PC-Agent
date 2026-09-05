import { spawn } from "child_process";
import { EventEmitter } from "events";
import { applications } from "../cofig/applicationRegistry";
import { DiscoveredProcess, ProcessDiscovery } from "./ProcessDiscovery";

export interface ManagedProcess {
  id: string;
  /** PID of the real application executable, never the launcher PID. */
  pid: number;
  name: string;
  status: "running" | "stopped";
}

export class ProcessManager extends EventEmitter {
  private processes = new Map<string, ManagedProcess>();
  private discovery = new ProcessDiscovery();

  /**
   * Launch an app, resolve its actual executable PID, then watch that PID.
   * Launcher/stub exit is intentionally ignored for application status.
   */
  async start(name: string, command: string, executable: string, args: string[] = []): Promise<ManagedProcess> {
    const pidsBeforeLaunch = await this.discovery.findPidsByExecutable(executable);
    const launcher = spawn(command, args, { detached: false, stdio: "ignore" });

    if (launcher.pid === undefined) throw new Error(`Failed to launch '${name}'`);

    launcher.on("exit", (code, signal) => {
      console.log(`Launcher for '${name}' exited: pid=${launcher.pid}, code=${code}, signal=${signal}`);
    });
    launcher.on("error", (error) => console.error(`Launcher for '${name}' failed:`, error));

    const pid = await this.resolveApplicationPid(executable, pidsBeforeLaunch);
    return this.observe(name, pid);
  }

  /** Track an already-known real application PID. */
  observe(name: string, pid: number): ManagedProcess {
    if (!Number.isInteger(pid) || pid <= 0) throw new Error(`Invalid PID '${pid}'`);

    const existing = this.list().find(
      (managedProcess) => managedProcess.pid === pid && managedProcess.status === "running",
    );
    if (existing) return existing;

    const processInfo: ManagedProcess = { id: crypto.randomUUID(), pid, name, status: "running" };
    this.processes.set(processInfo.id, processInfo);
    this.watchActualProcess(processInfo);
    return processInfo;
  }

  get(id: string): ManagedProcess | undefined {
    return this.processes.get(id);
  }

  list(): ManagedProcess[] {
    return Array.from(this.processes.values());
  }

  listRunningProcesses(): ManagedProcess[] {
    return this.list().filter((managedProcess) => managedProcess.status === "running");
  }

  stop(id: string): void {
    const processInfo = this.processes.get(id);
    if (!processInfo) throw new Error(`Process '${id}' not found`);

    // Kill the real application PID. Its watcher updates status after OS exit.
    process.kill(processInfo.pid);
  }

  async discoverRunningApplications(): Promise<DiscoveredProcess[]> {
    return this.discovery.discover(applications);
  }

  async initialize(): Promise<void> {
    const discovered = await this.discovery.discover(applications);
    for (const process of discovered) this.observe(process.name, process.pid);
  }

  private async resolveApplicationPid(executable: string, pidsBeforeLaunch: number[]): Promise<number> {
    const knownPids = new Set(pidsBeforeLaunch);

    // Retries are used only for launch-time PID resolution. Exit monitoring below
    // waits on a Windows process handle and never polls tasklist.
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const pids = await this.discovery.findPidsByExecutable(executable);
      const newPid = pids.find((pid) => !knownPids.has(pid));
      if (newPid !== undefined) return newPid;
      await new Promise<void>((resolve) => setTimeout(resolve, 50));
    }

    // A single-instance app may forward launch to its existing process.
    if (pidsBeforeLaunch.length === 1) return pidsBeforeLaunch[0];
    throw new Error(`Could not resolve the real '${executable}' PID after launch`);
  }

  /** Wait on the actual Windows PID. This is OS-event-driven, not polling. */
  private watchActualProcess(processInfo: ManagedProcess): void {
    if (process.platform !== "win32") return;

    const script = [
      `$ProcessId = ${processInfo.pid}`,
      "try {",
      "  $target = [System.Diagnostics.Process]::GetProcessById($ProcessId)",
      "  $target.EnableRaisingEvents = $true",
      "  $target.WaitForExit()",
      "  [Console]::Out.WriteLine('exited')",
      "} catch [System.ArgumentException] {",
      "  [Console]::Out.WriteLine('not-found')",
      "} catch {",
      "  [Console]::Out.WriteLine('watcher-error')",
      "  [Console]::Error.WriteLine($_.Exception.Message)",
      "  exit 1",
      "}",
    ].join("\n");

    const watcher = spawn("powershell.exe", [
      "-NoLogo", "-NoProfile", "-NonInteractive", "-Command", script,
    ], { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });

    let result = "watcher-error";
    watcher.stdout.on("data", (chunk: Buffer) => { result = chunk.toString().trim() || result; });
    watcher.stderr.on("data", (chunk: Buffer) => console.error(`PID ${processInfo.pid} watcher: ${chunk}`));
    watcher.on("error", (error) => console.error(`Could not watch PID ${processInfo.pid}:`, error));
    watcher.on("close", () => this.onActualProcessClosed(processInfo.id, result));
  }

  /** Called only by the watcher for the real application PID. */
  private onActualProcessClosed(id: string, reason: string): void {
    const processInfo = this.processes.get(id);
    if (!processInfo || processInfo.status === "stopped") return;

    processInfo.status = "stopped";
    console.log(`Application closed: '${processInfo.name}', pid=${processInfo.pid}, reason=${reason}`);
    this.emit("processClosed", processInfo);
  }
}
