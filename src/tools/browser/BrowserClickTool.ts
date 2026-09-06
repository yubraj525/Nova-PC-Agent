import type { Tools } from "../../core/Tools.js";
import { BrowserManager } from "../../browser/browserManager.js";
import { z } from "zod";

export class BrowserClickTool implements Tools {
  name = "browser_click";

  description =
    "Click an interactive element on a browser page using its element ID.";
  schema: z.ZodType = z.object({
    tabId: z.string().describe("The ID of the browser tab."),
    elementId: z.string().describe("The ID of the element to click."),
  });

  constructor(
    private browserManager: BrowserManager
  ) {}

  async execute(
    args: Record<string, unknown>
  ): Promise<unknown> {

    const tabId = args.tabId;
    const elementId = args.elementId;

    if (typeof tabId !== "string") {
      throw new Error("tabId must be a string");
    }

    if (typeof elementId !== "string") {
      throw new Error("elementId must be a string");
    }

    await this.browserManager.click(
      tabId,
      elementId
    );

    return {
      success: true,
      action: "click",
      elementId,
    };
  }
}