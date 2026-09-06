import { BrowserManager } from "../browser/browserManager.js";

import { ToolRegistry } from "../core/toolsregistry.js";

import { BrowserObserveTool } from "../tools/browser/BrowserObserveTool.js";
import { BrowserOpenTabTool } from "../tools/browser/BrowserOpenTabTool.js";
import { BrowserNavigateTool } from "../tools/browser/BrowserNavigateTool.js";
import { BrowserClickTool } from "../tools/browser/BrowserClickTool.js";
import { BrowserFillTool } from "../tools/browser/BrowserFillTool.js";
import { BrowserPressTool } from "../tools/browser/BrowserPressTool.js";

export function setupBrowserTools(
  registry: ToolRegistry,
  browserManager: BrowserManager
) {
  registry.register(
    new BrowserObserveTool(browserManager)
  );

  registry.register(
    new BrowserOpenTabTool(browserManager)
  );

  registry.register(
    new BrowserNavigateTool(browserManager)
  );

  registry.register(
    new BrowserClickTool(browserManager)
  );

  registry.register(
    new BrowserFillTool(browserManager)
  );

  registry.register(
    new BrowserPressTool(browserManager)
  );
}