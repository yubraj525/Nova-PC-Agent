import WebSocket from "ws";
import { ToolRegistry } from "../core/toolsregistry";
import { ToolRouter } from "../core/toolsrouter";
import { request } from "node:http";
export class MasterConnection {
  private ws: WebSocket;

  constructor(
    private serverUrl: string,
    private clientId: string,
    private toolRegistry: ToolRegistry,
    private router: ToolRouter
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
    this.ws.on("ping", () => {
      console.log("[MASTER] Ping received");
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
    if (data.type === "execute_tool") {
      console.log(`[MASTER] Received execute_tool request:`, data);
      const { tool_name, } = data;
      
      console.log(`[MASTER] Executing tool: ${tool_name} with args:`, data.arguments);
      this.router.execute(tool_name, data.arguments)
        .then((result) => {
          console.log(`[MASTER] Tool executed successfully:`, result);
          this.send({
            type: "response_execute_tool",
            request_id: data.request_id,
            client_name: this.clientId,
           
            tool_name,
            result,
          });
        })
        .catch((error) => {
          this.send({
            type: "response_execute_tool",
            client_name: this.clientId,
            tool_name,
            error: error.message,
          });
        });
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
    // const toolschema = this.toolRegistry.getToolSchemas();
    // for (const tool of toolschema) {
    //   console.log(tool);
    // }
  }

  private send(data: unknown) {
    this.ws.send(JSON.stringify(data));
  }
}
