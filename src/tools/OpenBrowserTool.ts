import { spawn } from "child_process";

export class OpenBrowserTool {
    name = "open_browser";

    description = "Open a web browser.";

    async execute(args: { url?: string }) {
        const url = args.url ?? "https://www.google.com";

        const child = spawn("start", ["", url], {
            shell: true,
            detached: true,
            stdio: "ignore",
        });

        child.unref();

        return {
            success: true,
            url,
            pid: child.pid,
        };
    }
}