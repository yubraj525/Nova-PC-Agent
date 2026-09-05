import { ChildProcess, spawn } from "child_process";
import crypto from "crypto";

import { applications } from "../cofig/applicationRegistry";
import {
    ProcessDiscovery,
    DiscoveredProcess
} from "./ProcessDiscovery";

export interface ManagedProcess {
    id: string;
    name: string;
    executable: string;

    pid: number;
    parentPid?: number;

    status: "running" | "stopped";

    executablePath?: string;
    commandLine?: string;
    creationTime?: string;

    process?: ChildProcess;
}

export class ProcessManager {

    private processes = new Map<string, ManagedProcess>();

    private discovery = new ProcessDiscovery();

    async initialize(): Promise<void> {

        console.log("Initializing ProcessManager...");

        const discovered =
            await this.discovery.discoverAll();

        for (const process of discovered) {

            const application =
                Object.entries(applications).find(
                    ([, executable]) =>
                        executable.toLowerCase() ===
                        process.name.toLowerCase()
                );

            if (!application) {
                continue;
            }

            const managedProcess =
                this.createManagedProcess(process);

            this.processes.set(
                managedProcess.id,
                managedProcess
            );
        }

        console.log(
            `Discovered ${this.processes.size} managed process(es).`
        );
    }

    private createManagedProcess(
        process: DiscoveredProcess
    ): ManagedProcess {

        const application =
            Object.entries(applications).find(
                ([, executable]) =>
                    executable.toLowerCase() ===
                    process.name.toLowerCase()
            );

        if (!application) {
            throw new Error(
                `Unknown application '${process.name}'`
            );
        }

        return {
            id: crypto.randomUUID(),

            name: application[0],

            executable: application[1],

            pid: process.pid,

            parentPid: process.parentPid,

            status: "running",

            executablePath: process.executablePath,

            commandLine: process.commandLine,

            creationTime: process.creationTime
        };
    }

    async start(
        name: string,
        args: string[] = []
    ): Promise<ManagedProcess> {

        const applicationName =
            name.toLowerCase();

        const executable =
            applications[applicationName];

        if (!executable) {
            throw new Error(
                `Application '${name}' is not supported`
            );
        }

        const existing =
            await this.findRunning(
                applicationName
            );

        if (existing) {
            return existing;
        }

        const child =
            spawn(
                executable,
                args,
                {
                    detached: false,
                    stdio: "ignore"
                }
            );

        if (child.pid === undefined) {
            throw new Error(
                `Failed to start '${name}'`
            );
        }

        const launcherPid =
            child.pid;

        console.log(
            `Launcher PID: ${launcherPid}`
        );

        child.unref();

        const actualProcess =
            await this.discovery.findChildProcess(
                launcherPid,
                executable
            );

        if (actualProcess) {

            console.log(
                `Actual process found: PID=${actualProcess.pid}`
            );

            const processInfo =
                this.createManagedProcess(
                    actualProcess
                );

            this.processes.set(
                processInfo.id,
                processInfo
            );

            return processInfo;
        }

        const processInfo: ManagedProcess = {
            id: crypto.randomUUID(),

            name: applicationName,

            executable,

            pid: launcherPid,

            status: "running",

            process: child
        };

        this.processes.set(
            processInfo.id,
            processInfo
        );

        return processInfo;
    }

    private async findRunning(
        name: string
    ): Promise<ManagedProcess | undefined> {

        const existing =
            Array.from(
                this.processes.values()
            ).find(
                process =>
                    process.name === name &&
                    process.status === "running"
            );

        if (existing) {
            return existing;
        }

        const executable =
            applications[name];

        if (!executable) {
            return undefined;
        }

        const discovered =
            await this.discovery.findByExecutable(
                executable
            );

        const found =
            discovered[0];

        if (!found) {
            return undefined;
        }

        const managedProcess =
            this.createManagedProcess(
                found
            );

        this.processes.set(
            managedProcess.id,
            managedProcess
        );

        return managedProcess;
    }

    get(
        id: string
    ): ManagedProcess | undefined {

        return this.processes.get(id);
    }

    list(): ManagedProcess[] {

        return Array.from(
            this.processes.values()
        );
    }

    listRunning(): ManagedProcess[] {

        return this.list().filter(
            process =>
                process.status === "running"
        );
    }
}