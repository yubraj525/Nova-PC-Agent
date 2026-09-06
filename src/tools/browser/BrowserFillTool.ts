import type { Tools } from "../../core/Tools.js";
import { BrowserManager } from "../../browser/browserManager.js";
import { z } from "zod";
export class BrowserFillTool implements Tools {
  name = "browser_fill";

  description =
    "Fill a textbox or input element with text using its element ID.";
  schema: z.ZodType = z.object({
    tabId: z.string().describe("The ID of the browser tab."),
    elementId: z.string().describe("The ID of the element to fill."),
    value: z.string().describe("The text value to fill into the input element."),
  });

  constructor(
    private browserManager: BrowserManager
  ) {}

  async execute(
    args: Record<string, unknown>
  ): Promise<unknown> {

    const tabId = args.tabId;
    const elementId = args.elementId;
    const value = args.value;

    if (typeof tabId !== "string") {
      throw new Error("tabId must be a string");
    }

    if (typeof elementId !== "string") {
      throw new Error("elementId must be a string");
    }

    if (typeof value !== "string") {
      throw new Error("value must be a string");
    }

    await this.browserManager.fillInput(
      tabId,
      elementId,
      value
    );

    return {
      success: true,
      action: "fill",
      elementId,
    };
  }
}