import { Tools } from "./Tools";

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
}