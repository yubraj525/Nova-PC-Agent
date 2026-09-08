import WebSocket from "ws";

export class MasterConnection {

    private ws?: WebSocket;

    connect(): void {

        this.ws = new WebSocket(
            "http:/10.0.3.1:8080"
        );

        this.ws.on("open", () => {

            console.log(
                "Connected to NOVA Master"
            );

            this.register();
        });

        this.ws.on("message", message => {

            console.log(
                "Master:",
                message.toString()
            );
        });

        this.ws.on("close", () => {

            console.log(
                "Disconnected from NOVA Master"
            );
        });

        this.ws.on("error", error => {

            console.error(
                "Master connection error:",
                error
            );
        });
    }

    private register(): void {

        this.ws?.send(
            JSON.stringify({
                type: "register",
                agent_id: "linux-pc-01",
                agent_type: "pc",
                platform: "linux"
            })
        );
    }
}