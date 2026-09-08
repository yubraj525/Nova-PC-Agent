import { WebSocketServer } from "ws";

import { ToolRegistry } from "./core/toolsregistry.js";
import { ToolRouter } from "./core/toolsrouter.js";

import { OpenApplicationTool } from "./tools/openApplication.js";
import { BrowserManager } from "./browser/browserManager.js";

import { ProcessManager } from "./process/ProcessManager.js";
import { setupBrowserTools } from "./cofig/ToolRegister.js";
import { BrowserTabInfo } from "./cofig/types.js";
import { MasterConnection } from "./connection/websocket.js";

async function main() {

  const masterConnection = new MasterConnection();
  masterConnection.connect();

}

main().catch((error) => {
  console.error("NOVA PC Agent failed:");

  console.error(error);
});
