import { WebSocketServer } from "ws";

import { ToolRegistry } from "./core/toolsregistry.js";
import { ToolRouter } from "./core/toolsrouter.js";

import { OpenApplicationTool } from "./tools/openApplication.js";
import { BrowserManager } from "./browser/browserManager.js";

import { ProcessManager } from "./process/ProcessManager.js";
import { setupBrowserTools } from "./cofig/ToolRegister.js";
import { BrowserTabInfo } from "./cofig/types.js";

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
  // await browserManager.start();
  //   const result = (await router.execute("browser_open_tab", {
  //     url: "https://www.youtube.com",
  //   })) as BrowserTabInfo;

  //   const tabId = result.id;

  //   console.log("Opened new browser tab with ID:", tabId);

  //   const observation = await router.execute("browser_observe", {
  //     tabId: tabId.toString(),
  //   });

  //   console.dir(observation, {
  //     depth: null,
  //   });

  //   const result2 = await router.execute("browser_fill", {
  //     tabId: tabId.toString(),
  //     elementId: "e2",
  //     value: "birds of a feather",
  //   });
  //   console.log("Filled input element with ID e6 with value 'birds of a feather'");

  //   console.log(result2);
  //   const result3 = await router.execute("browser_press", {
  //     tabId: tabId.toString(),
  //     elementId: "e3",
  //     key: "Enter",
  //   });

  //   console.log(result3);
  //   const observation2 = await router.execute("browser_observe", {
  //   tabId: tabId.toString(),
  // });
  // console.log("Observed interactive elements after filling input and pressing Enter:");
  // console.dir(observation2, { depth: null });

  //another test -----------------------------------------
  await browserManager.start();

  const result = (await router.execute("browser_open_tab", {
    url: "https://www.youtube.com",
  })) as BrowserTabInfo;

  const tabId = result.id;

  console.log("Opened browser tab:", tabId);

  // --------------------------------
  // STEP 1: Observe YouTube
  // --------------------------------

  const observation = await router.execute("browser_observe", {
    tabId,
  });

  console.log("\n--- Initial Observation ---");
  console.dir(observation, { depth: null });

  // From your current observation:
  // e2 = Search textbox

  // --------------------------------
  // STEP 2: Fill search box
  // --------------------------------

  const fillResult = await router.execute("browser_fill", {
    tabId,
    elementId: "e2",
    value: "birds of a feather",
  });

  console.log("\n--- Fill Result ---");
  console.log(fillResult);

  // --------------------------------
  // STEP 3: Press Enter
  // --------------------------------

  const pressResult = await router.execute("browser_press", {
    tabId,
    elementId: "e2",
    key: "Enter",
  });

  console.log("\n--- Press Result ---");
  console.log(pressResult);

  // --------------------------------
  // STEP 4: Observe NEW page
  // --------------------------------

  await new Promise((resolve) => setTimeout(resolve, 3000));
  const searchObservation = await router.execute("browser_observe", {
    tabId,
    role: "link",
    limit: 10,
  });
  console.log("\n--- Search Results Observation ---");
  console.dir(searchObservation, { depth: null });
  console.log("\n--- Click on the first search result ---");

  const result4 = await router.execute("browser_click", {
    tabId,
    elementId: "e8",
  });

  console.log(result4);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const result5 = await router.execute("browser_go_back", {
    tabId,
  });
  console.log(result5);

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
