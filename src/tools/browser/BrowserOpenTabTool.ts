import type { Tools } from "../../core/Tools.js";
import { BrowserManager } from "../../browser/browserManager.js";
import { z } from "zod";
export class BrowserOpenTabTool implements Tools {
  name = "browser_open_tab";

  description =
    "Open a new browser tab and optionally navigate to a URL.";
    schema: z.ZodType = z.object({
      url: z.string().optional().describe("The URL to navigate to in the new tab."),
    });

  constructor(
    private browserManager: BrowserManager
  ) {}

  async execute(
    args: Record<string, unknown>
  ): Promise<unknown> {

    const url = args.url;

    if (
      url !== undefined &&
      typeof url !== "string"
    ) {
      throw new Error("url must be a string");
    }

    return await this.browserManager.openTab(url);
  }
}