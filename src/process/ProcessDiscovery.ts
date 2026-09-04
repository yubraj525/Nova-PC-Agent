import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface DiscoveredProcess {
    name: string;
    pid: number;
    status: "running";
}

export class ProcessDiscovery {

    async discover(
        applications: Record<string, string>
    ): Promise<DiscoveredProcess[]> {

        const { stdout } = await execAsync("tasklist /FO CSV /NH");

        const processes: DiscoveredProcess[] = [];

        for (const [name, executable] of Object.entries(applications)) {

            const lines = stdout.split("\n");

            for (const line of lines) {

                if (!line.toLowerCase().includes(executable.toLowerCase())) {
                    continue;
                }

                const parts = line.split('","');

                if (parts.length < 2) {
                    continue;
                }

                const pid = Number(
                    parts[1].replace(/"/g, "")
                );

                if (!Number.isNaN(pid)) {
                    processes.push({
                        name,
                        pid,
                        status: "running"
                    });

                    break;
                }
            }
        }

        return processes;
    }
}