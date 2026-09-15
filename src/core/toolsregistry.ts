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
    return this.listTools().map((tool) => {
      // 1. Convert Zod schema to standard JSON Schema
      const rawSchema = z.toJSONSchema(tool.schema) as Record<string, any>;

      // 2. Extract properties and required fields, stripping $schema metadata
      const { $schema, ...cleanSchema } = rawSchema;

      return {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: "object",
          properties: cleanSchema.properties || {},
          required: cleanSchema.required || [],
        },
      };
    });
  }
}
