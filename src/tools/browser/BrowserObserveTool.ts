import type { Tools } from "../../core/Tools.js";
import { BrowserManager } from "../../browser/browserManager.js";

export class BrowserObserveTool implements Tools {
  name = "browser_observe";

  description =
    "Observe the current browser tab and return the interactive elements available on the page.";

  constructor(
    private browserManager: BrowserManager
  ) {}

  async execute(
    args: Record<string, unknown>
  ): Promise<unknown> {

    const tabId = args.tabId;

    if (typeof tabId !== "string") {
      throw new Error("tabId must be a string");
    }

    return await this.browserManager.getInteractiveElements(tabId);
  }
}