import { spawn } from "child_process";

export class BrowserSearchTool {
    name = "browser_search";

    description = "Search the web using the default browser.";

    async execute(args: { query: string }) {
        const url =
            `https://www.google.com/search?q=${encodeURIComponent(args.query)}`;

        spawn("start", ["", url], {
            shell: true,
            detached: true,
            stdio: "ignore",
        }).unref();

        return {
            success: true,
            query: args.query,
            url,
        };
    }
}