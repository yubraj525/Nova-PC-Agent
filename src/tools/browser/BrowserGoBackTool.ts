import type { Tools } from "../../core/Tools.js";
import { BrowserManager } from "../../browser/browserManager.js";
import { z } from "zod";

export class BrowserGoBackTool implements Tools {
  name = "browser_go_back";

  description =
    "Navigate the browser tab back to the previous page in its history.";

  schema: z.ZodType = z.object({
    tabId: z.string().describe("The ID of the browser tab."),
  });

  constructor(private browserManager: BrowserManager) {}

  async execute(args: Record<string, unknown>): Promise<unknown> {
    const tabId = args.tabId;

    if (typeof tabId !== "string") {
      throw new Error("tabId must be a string");
    }

    await this.browserManager.goBack(tabId);

    return {
      success: true,
      action: "go_back",
      tabId,
    };
  }
}