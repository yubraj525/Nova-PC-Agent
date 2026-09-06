import type { Tools } from "../../core/Tools.js";
import { BrowserManager } from "../../browser/browserManager.js";
import { z } from "zod";
export class BrowserPressTool implements Tools {
  name = "browser_press";

  description =
    "Press a keyboard key on an interactive browser element.";
schema: z.ZodType = z.object({
    tabId: z.string().describe("The ID of the browser tab."),
    elementId: z.string().describe("The ID of the element to press the key on."),
    key: z.string().describe("The keyboard key to press."),
  }); 
  constructor(
    private browserManager: BrowserManager
  ) {}

  async execute(
    args: Record<string, unknown>
  ): Promise<unknown> {

    const tabId = args.tabId;
    const elementId = args.elementId;
    const key = args.key;

    if (typeof tabId !== "string") {
      throw new Error("tabId must be a string");
    }

    if (typeof elementId !== "string") {
      throw new Error("elementId must be a string");
    }

    if (typeof key !== "string") {
      throw new Error("key must be a string");
    }

    await this.browserManager.pressKeyOn(
      tabId,
      elementId,
      key
    );

    return {
      success: true,
      action: "press",
      elementId,
      key,
    };
  }
}