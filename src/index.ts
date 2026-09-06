import { WebSocketServer } from "ws";

import { ToolRegistry } from "./core/toolsregistry.js";
import { ToolRouter } from "./core/toolsrouter.js";

import { OpenApplicationTool } from "./tools/openApplication.js";
import { BrowserManager } from "./browser/browserManager.js";

import { ProcessManager } from "./process/ProcessManager.js";
import { setupBrowserTools } from "./cofig/ToolRegister.js";

async function main() {
  console.log("Starting NOVA PC Agent...");

  //  Process Manager and Browser Manager initialization

  const processManager = new ProcessManager();
  const browserManager = new BrowserManager();

  await processManager.initialize?.();

  const registry = new ToolRegistry();
  setupBrowserTools(registry, browserManager);

  console.log("\nInitial running applications:");

  // register the OpenApplicationTool with the processManager
  registry.register(new OpenApplicationTool(processManager));

  console.log("Available tools:");
  console.log(JSON.stringify(registry.getToolSchemas(), null, 2));

  const router = new ToolRouter(registry);

  const wss = new WebSocketServer({
    port: 8080,
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
  // const result2 = await router.execute("open_application", {
  //   application: "notepad",
  // });

  // const result = await router.execute("open_browser", {
  //   url: "https://www.google.com",
  // });

  //   const result2 = await processManager.listRunning();

  console.log("\n--------------------------------");
  console.log("NOVA PC Agent is running");
  console.log("WebSocket: ws://localhost:8080");
  console.log("--------------------------------\n");
}

main().catch((error) => {
  console.error("NOVA PC Agent failed:");

  console.error(error);
});

// import { BrowserManager } from "./browser/browserManager.js";
// async function main() {
//   console.log("Starting NOVA PC Agent...");

//   const browserManager = new BrowserManager();

//   await browserManager.start();

//   const tab = await browserManager.openTab("https://www.google.com");

//   // console.log("YouTube opened:");
//   // console.log(tab);

//   // await browserManager.fillInput(
//   //   tab.id,
//   //   'input[name="search_query"]',
//   //   "Birds of  a feather",
//   // );

//   // await browserManager.pressKeyOn(
//   //   tab.id,
//   //   'input[name="search_query"]',
//   //   "Enter",
//   // );

//   // console.log("Search submitted");
//   // await new Promise((resolve) => setTimeout(resolve, 3000));

//   // const results = await browserManager.getVideoResults(tab.id, 20);

//   // console.log("Top 20 results:");

//   // results.forEach((result, index) => {
//   //   console.log(`${index + 1}. ${result.title}`);
//   //   console.log(`   ${result.url}`);
//   // });

//   // await browserManager.openVideoResult(tab.id, results, 0);
//   const interactiveElements = await browserManager.getInteractiveElements(
//     tab.id,
//   );
//   console.log("Interactive elements:");
//   console.dir(interactiveElements, {
//     depth: null,
//   });
// }

// main();
