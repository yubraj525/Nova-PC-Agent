import WebSocket from "ws";
import { ToolRegistry } from "../core/toolsregistry";

export class MasterConnection {
  private ws: WebSocket;

  constructor(
    private serverUrl: string,
    private clientId: string,
    private toolRegistry: ToolRegistry,
  ) {
    this.ws = new WebSocket(serverUrl);

    this.ws.on("open", () => {
      console.log("[MASTER] Connected");
      this.register();
    });

    this.ws.on("message", (data) => {
      this.handleMessage(data.toString());
    });

    this.ws.on("close", () => {
      console.log("[MASTER] Disconnected");
    });

    this.ws.on("error", (error) => {
      console.error("[MASTER] Error:", error);
    });
  }

  private register() {
    this.send({
      type: "register",
      client_type: "pc",
      client_name: this.clientId, // Changed from client_id to client_name
    });

    console.log(`[MASTER] Registered as ${this.clientId}`);
  }

  private handleMessage(message: string) {
    const data = JSON.parse(message);

    if (data.type === "request_tools") {
      this.sendTools();
    }
  }

  private sendTools() {
    const tools = this.toolRegistry.getToolSchemas();

    this.send({
      type: "response_tools",
      client_name: this.clientId,
      tools,
    });

    console.log(`[MASTER] Sending ${tools.length} tools`);
  }

  private send(data: unknown) {
    this.ws.send(JSON.stringify(data));
  }
}
