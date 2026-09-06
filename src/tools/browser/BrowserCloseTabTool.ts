import type { Tools } from "../../core/Tools.js";
import { BrowserManager } from "../../browser/browserManager.js";
import { z } from "zod";

export class BrowserCloseTabTool implements Tools {
  name = "browser_close_tab";

  description =
    "Close the specified browser tab.";

  schema: z.ZodType = z.object({
    tabId: z.string().describe("The ID of the browser tab to close."),
  });

  constructor(private browserManager: BrowserManager) {}

  async execute(args: Record<string, unknown>): Promise<unknown> {
    const tabId = args.tabId;

    if (typeof tabId !== "string") {
      throw new Error("tabId must be a string");
    }

    await this.browserManager.closeTab(tabId);

    return {
      success: true,
      action: "close_tab",
      tabId,
    };
  }
}