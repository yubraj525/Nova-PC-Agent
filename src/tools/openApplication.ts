import { ProcessManager } from "../process/ProcessManager";
import { applications } from "../cofig/applicationRegistry";

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

        const executable = applications[application.toLowerCase()];

        if (!executable) {
            throw new Error(`Unsupported application '${application}'`);
        }

        const process = await this.processManager.start(
            application
            
        );

        return {
            success: true,
            message: `Opened ${application}`,
            processId: process.id,
            pid: process.pid
        };
    }
}
