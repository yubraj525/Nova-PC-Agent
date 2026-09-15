import { ToolRegistry } from "./toolsregistry";

export class ToolRouter {
  constructor(private registry: ToolRegistry) {}

  async execute(
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    const tool = this.registry.get(toolName);

    console.log(`[ToolRouter] Tool schema:`, tool);

    return await tool.execute(args);
  }
}
