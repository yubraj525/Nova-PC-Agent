import type { Tools } from "../../core/Tools.js";
import { BrowserManager } from "../../browser/browserManager.js";
import { z } from "zod";
export class BrowserObserveTool implements Tools {
  name = "browser_observe";

  description =
    "Observe the current browser tab and return the interactive elements available on the page.";
  schema: z.ZodType = z.object({
    tabId: z.string().describe("The ID of the browser tab."),
  });

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