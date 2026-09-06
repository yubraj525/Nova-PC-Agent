import type { Tools } from "../../core/Tools.js";
import { BrowserManager } from "../../browser/browserManager.js";

export class BrowserFillTool implements Tools {
  name = "browser_fill";

  description =
    "Fill a textbox or input element with text using its element ID.";

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