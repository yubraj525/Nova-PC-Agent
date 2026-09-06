import { ProcessManager } from "../process/ProcessManager";
import { applications } from "../cofig/applicationRegistry";
import { Tools } from "../core/Tools";
import { z } from "zod";
export class OpenApplicationTool implements Tools {

    name = "open_application";

    description = "Open an application on the Windows computer.";
    schema: z.ZodType = z.object({
        application: z.string().describe("The name of the application to open."),
    });

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
