import type { Tools } from "../../core/Tools.js";
import { BrowserManager } from "../../browser/browserManager.js";

export class BrowserOpenTabTool implements Tools {
  name = "browser_open_tab";

  description =
    "Open a new browser tab and optionally navigate to a URL.";

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