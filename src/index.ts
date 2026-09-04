import { WebSocketServer } from "ws";

import { ToolRegistry } from "./core/toolsregistry.js";
import { ToolRouter } from "./core/toolsrouter.js";

import { OpenApplicationTool } from "./tools/openApplication.js";
import { OpenBrowserTool } from "./tools/OpenBrowserTool.js";

import { ProcessManager } from "./process/ProcessManager.js";


async function main() {

    console.log("Starting NOVA PC Agent...");


    // --------------------------------------------------
    // 1. Process Manager
    // --------------------------------------------------

    const processManager = new ProcessManager();

    await processManager.initialize();

    console.log("\nInitial running applications:");

    console.log(
        processManager.listRunningProcesses().map(process => ({
            id: process.id,
            pid: process.pid,
            name: process.name,
            status: process.status
        }))
    );


    // --------------------------------------------------
    // 2. Tool Registry
    // --------------------------------------------------

    const registry = new ToolRegistry();


    // --------------------------------------------------
    // 3. Register Tools
    // --------------------------------------------------

    registry.register(
        new OpenApplicationTool(processManager)
    );

    registry.register(
        new OpenBrowserTool()
    );


    // --------------------------------------------------
    // 4. Tool Router
    // --------------------------------------------------

    const router = new ToolRouter(registry);


    // --------------------------------------------------
    // 5. WebSocket Server
    // --------------------------------------------------

    const wss = new WebSocketServer({
        port: 8080
    });


    wss.on("connection", (ws) => {

        console.log("NOVA client connected");

        ws.on("message", async (message) => {

            console.log("Received:", message.toString());

            // WebSocket command handling will come here later.
            // For now we only receive the connection/message.
        });


        ws.on("close", () => {

            console.log("NOVA client disconnected");

        });

    });
    const result = await router.execute(
    "open_application",
    {
        application: "notepad"
    }
);

console.log("Tool result:");
console.log(result);

const result2 = await processManager.discoverRunningApplications();

console.log("Tool result 2:");
console.log(result2);


    console.log("\n--------------------------------");
    console.log("NOVA PC Agent is running");
    console.log("WebSocket: ws://localhost:8080");
    console.log("--------------------------------\n");
}


main().catch(error => {

    console.error("NOVA PC Agent failed:");

    console.error(error);

});