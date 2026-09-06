import type { Tools } from "../../core/Tools.js";
import { BrowserManager } from "../../browser/browserManager.js";
import { z } from "zod";
export class BrowserObserveTool implements Tools {
  name = "browser_observe";

  description =
    "Observe the current browser tab and return the interactive elements available on the page.";
  schema: z.ZodType = z.object({
    tabId: z.string().describe("The ID of the browser tab."),
    role: z
      .string()
      .optional()
      .describe(
        "The role of the elements to observe (e.g., 'button', 'input','link').",
      ),
    limit: z
      .number()
      .optional()
      .describe("The maximum number of elements to return."),
  });

  constructor(private browserManager: BrowserManager) {}

  async execute(args: Record<string, unknown>): Promise<unknown> {
    const tabId = args.tabId;

    if (typeof tabId !== "string") {
      throw new Error("tabId must be a string");
    }

    const role = args.role as Parameters<
      BrowserManager["getInteractiveElements"]
    >[1];
    const limit = args.limit as number | undefined;

    return await this.browserManager.getInteractiveElements(tabId, role, limit);
  }
}
