import type { Tools } from "../../core/Tools.js";
import { BrowserManager } from "../../browser/browserManager.js";
import { z } from "zod";
export class BrowserNavigateTool implements Tools {
  name = "browser_navigate";

  description =
    "Navigate an existing browser tab to a specified URL.";
  schema: z.ZodType = z.object({
    tabId: z.string().describe("The ID of the browser tab."),
    url: z.string().describe("The URL to navigate to."),
  });

  constructor(
    private browserManager: BrowserManager
  ) {}

  async execute(
    args: Record<string, unknown>
  ): Promise<unknown> {

    const tabId = args.tabId;
    const url = args.url;

    if (typeof tabId !== "string") {
      throw new Error("tabId must be a string");
    }

    if (typeof url !== "string") {
      throw new Error("url must be a string");
    }

    return await this.browserManager.navigateTab(
      tabId,
      url
    );
  }
}