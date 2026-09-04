import { ChildProcess, spawn } from "child_process";
import { applications } from "../cofig/applicationRegistry";
import {
  DiscoveredProcess,
  ProcessDiscovery,
} from "./ProcessDiscovery";

interface ManagedProcess {
  id: string;
  pid: number;
  name: string;
  status: "running" | "stopped";
  process?: ChildProcess;
}

export class ProcessManager {
  private processes = new Map<string, ManagedProcess>();
  private discovery = new ProcessDiscovery();

  /**
   * Start a new application process.
   */
  start(
    name: string,
    command: string,
    args: string[] = [],
  ): ManagedProcess {

    const child = spawn(command, args, {
      detached: false,
      stdio: "ignore",
    });

    if (child.pid === undefined) {
      throw new Error(`Failed to start '${name}'`);
    }

    const id = crypto.randomUUID();

    const processInfo: ManagedProcess = {
      id,
      pid: child.pid,
      name,
      status: "running",
      process: child,
    };

    this.processes.set(id, processInfo);

    /**
     * Windows process actually exited.
     */
    child.on("exit", (code, signal) => {
      const managedProcess = this.processes.get(id);

      if (!managedProcess) {
        return;
      }

      managedProcess.status = "stopped";

      console.log(
        `Process '${name}' with PID ${child.pid} exited.`,
        `code=${code}`,
        `signal=${signal}`,
      );
    });

    /**
     * Process failed to start.
     */
    child.on("error", (error) => {
      const managedProcess = this.processes.get(id);

      if (!managedProcess) {
        return;
      }

      managedProcess.status = "stopped";

      console.error(
        `Failed to start process '${name}' with PID ${child.pid}:`,
        error,
      );
    });

    return processInfo;
  }

  /**
   * Get one managed process.
   */
  get(id: string): ManagedProcess | undefined {
    return this.processes.get(id);
  }

  /**
   * Get all managed processes.
   */
  list(): ManagedProcess[] {
    return Array.from(this.processes.values());
  }

  /**
   * Get only processes currently marked as running.
   */
  listRunningProcesses(): ManagedProcess[] {
    return this.list().filter(
      (process) => process.status === "running",
    );
  }

  /**
   * Stop a process started by NOVA.
   */
  stop(id: string): void {

    const processInfo = this.processes.get(id);

    if (!processInfo) {
      throw new Error(`Process '${id}' not found`);
    }

    if (!processInfo.process) {
      throw new Error(
        `Process '${processInfo.name}' was discovered, not started by NOVA`,
      );
    }

    processInfo.process.kill();

    /**
     * Do NOT set status here.
     *
     * The 'exit' event will update the status
     * when Windows actually terminates the process.
     */
  }

  /**
   * Ask Windows which registered applications
   * are currently running.
   */
  async discoverRunningApplications(): Promise<DiscoveredProcess[]> {
    return this.discovery.discover(applications);
  }

  /**
   * Discover applications that were already running
   * before NOVA started.
   */
  async initialize(): Promise<void> {

    const discovered = await this.discovery.discover(
      applications,
    );

    for (const discoveredProcess of discovered) {

      const id = crypto.randomUUID();

      this.processes.set(id, {
        id,
        pid: discoveredProcess.pid,
        name: discoveredProcess.name,
        status: "running",
      });
    }
  }
}