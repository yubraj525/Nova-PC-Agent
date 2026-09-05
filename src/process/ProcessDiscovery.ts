import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface DiscoveredProcess {
    pid: number;
    parentPid: number;
    name: string;
    executablePath?: string;
    commandLine?: string;
    creationTime?: string;
    status: "running";
}

export interface ProcessReference {
    pid?: number;
    parentPid?: number;
    executable?: string;
    name?: string;
}

export class ProcessDiscovery {

    async discoverAll(): Promise<DiscoveredProcess[]> {

        const { stdout } = await execAsync(
            `powershell -NoProfile -Command "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name,ExecutablePath,CommandLine,CreationDate | ConvertTo-Json -Compress"`
        );

        if (!stdout.trim()) {
            return [];
        }

        const data = JSON.parse(stdout);

        const processes = Array.isArray(data)
            ? data
            : [data];

        return processes
            .map(process => this.mapProcess(process))
            .filter(
                process =>
                    process.pid > 0
            );
    }

    async discoverByReference(
        reference: ProcessReference
    ): Promise<DiscoveredProcess[]> {

        const processes =
            await this.discoverAll();

        return processes.filter(process => {

            if (
                reference.pid !== undefined &&
                process.pid !== reference.pid
            ) {
                return false;
            }

            if (
                reference.parentPid !== undefined &&
                process.parentPid !== reference.parentPid
            ) {
                return false;
            }

            if (
                reference.executable !== undefined &&
                process.name.toLowerCase() !==
                reference.executable.toLowerCase()
            ) {
                return false;
            }

            if (
                reference.name !== undefined &&
                process.name.toLowerCase() !==
                reference.name.toLowerCase()
            ) {
                return false;
            }

            return true;
        });
    }

    async findByPid(
        pid: number
    ): Promise<DiscoveredProcess | undefined> {

        const processes =
            await this.discoverByReference({
                pid
            });

        return processes[0];
    }

    async findChildren(
        parentPid: number
    ): Promise<DiscoveredProcess[]> {

        return this.discoverByReference({
            parentPid
        });
    }

    async findChildProcess(
        parentPid: number,
        executable: string
    ): Promise<DiscoveredProcess | undefined> {

        const processes =
            await this.discoverByReference({
                parentPid,
                executable
            });

        return processes[0];
    }

    async findByExecutable(
        executable: string
    ): Promise<DiscoveredProcess[]> {

        return this.discoverByReference({
            executable
        });
    }

    private mapProcess(
        process: any
    ): DiscoveredProcess {

        return {
            pid: Number(process.ProcessId),

            parentPid:
                Number(process.ParentProcessId),

            name:
                process.Name,

            executablePath:
                process.ExecutablePath || undefined,

            commandLine:
                process.CommandLine || undefined,

            creationTime:
                process.CreationDate || undefined,

            status: "running"
        };
    }
}