import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface DiscoveredProcess {
    name: string;
    pid: number;
    status: "running";
}

export class ProcessDiscovery {

    async findPidsByExecutable(executable: string): Promise<number[]> {
        const { stdout } = await execAsync(
            `tasklist /FO CSV /NH /FI "IMAGENAME eq ${executable}"`,
        );

        return stdout
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.toLowerCase().startsWith(`"${executable.toLowerCase()}"`))
            .map((line) => Number(line.split('","')[1]?.replace(/"/g, "")))
            .filter((pid): pid is number => Number.isInteger(pid) && pid > 0);
    }

    async discover(
        applications: Record<string, string>
    ): Promise<DiscoveredProcess[]> {

        const processes: DiscoveredProcess[] = [];

        for (const [name, executable] of Object.entries(applications)) {

            const pids = await this.findPidsByExecutable(executable);

            for (const pid of pids) {
                processes.push({
                    name,
                    pid,
                    status: "running"
                });
            }
        }

        return processes;
    }
}
