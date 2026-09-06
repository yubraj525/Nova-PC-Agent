import { spawn } from "child_process";
import type { Tools } from "../core/Tools.js";
import { z } from "zod";
export class BrowserSearchTool implements Tools {
  name = "browser_search";
  schema: z.ZodType = z.object({
    query: z
      .string()
      .describe("The search query to use in the browser search."),
  });

  description = "Search the web using the default browser.";

  async execute(args: Record<string, unknown>) {
    const query = args.query as string;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    spawn("start", ["", url], {
      shell: true,
      detached: true,
      stdio: "ignore",
    }).unref();

    return {
      success: true,
      query,
      url,
    };
  }
}
