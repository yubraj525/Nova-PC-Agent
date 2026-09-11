
import { ToolRegistry } from "./core/toolsregistry.js";
import { ToolRouter } from "./core/toolsrouter.js";

import { OpenApplicationTool } from "./tools/openApplication.js";
import { BrowserManager } from "./browser/browserManager.js";

import { ProcessManager } from "./process/ProcessManager.js";
import { setupBrowserTools } from "./cofig/ToolRegister.js";
import { BrowserTabInfo } from "./cofig/types.js";
import { MasterConnection } from "./connection/websocket.js";
   
async function main() {
    console.log("Starting NOVA PC Agent...");

  //  Process Manager and Browser Manager initialization

  const processManager = new ProcessManager();
  const browserManager = new BrowserManager();
  
  await processManager.initialize?.();
  
  const registry = new ToolRegistry();
  setupBrowserTools(registry, browserManager);
  

const clientId = "pc-agent-1";
   
    const router = new ToolRouter(registry);
    
new MasterConnection(
    "ws://localhost:8080",
    clientId,
    registry,
);
}

main().catch((error) => {
  console.error("NOVA PC Agent failed:");

  console.error(error);
});
