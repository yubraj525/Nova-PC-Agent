import { Tools } from "./Tools";
import { z } from "zod";
export class ToolRegistry {

    private tools: Map<string, Tools> = new Map();

    register(tool: Tools): void {
        this.tools.set(tool.name, tool);
    }

    get(name: string): Tools {

        const tool = this.tools.get(name);

        if (!tool) {
            throw new Error(`Tool '${name}' is not registered.`);
        }

        return tool;
    }

    listTools(): Tools[] {
        return Array.from(this.tools.values());
    }

    getToolSchemas() {
    return this.listTools().map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: z.toJSONSchema(tool.schema),
    }));
}
}