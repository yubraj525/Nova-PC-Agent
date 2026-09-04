import { ProcessManager } from "../process/ProcessManager";

export class OpenApplicationTool {

    name = "open_application";

    description = "Open an application on the Windows computer.";

    constructor(
        private processManager: ProcessManager
    ) {}

    async execute(args: Record<string, unknown>): Promise<unknown> {

        const application = args.application;

        if (typeof application !== "string") {
            throw new Error("application must be a string");
        }

        const process = this.processManager.start(
            application,
            `${application}.exe`
        );

        return {
            success: true,
            message: `Opened ${application}`,
            processId: process.id,
            pid: process.pid
        };
    }
}