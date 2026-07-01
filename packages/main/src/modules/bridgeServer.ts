import { ipcMain } from "electron";
import { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";
import { type Kv, openKv } from "@deno/kv";
import { BridgeServerClient, openBridgeServerInNode } from "@app/bridge-server";
import { randomBytes } from "node:crypto";

class BridgeServerController {
  private serverRef: ReturnType<typeof openBridgeServerInNode> | null = null;
  private kv: Kv | null = null;
  private serverClient: BridgeServerClient | null = null;
  private bridgeServerAuthToken: string | null = null;

  async open(kvStore: KvStore): Promise<boolean> {
    await this.close();

    if (kvStore.type == "bridge") {
      this.bridgeServerAuthToken = kvStore.authToken;
      this.serverClient = new BridgeServerClient(kvStore.url, {
        authToken: this.bridgeServerAuthToken ?? "",
      });
      return true;
    }

    this.bridgeServerAuthToken = randomBytes(30).toString("base64");
    this.kv = await openKv(kvStore.url, { accessToken: kvStore.accessToken });
    this.serverRef = openBridgeServerInNode(this.kv, {
      port: 0,
      authToken: this.bridgeServerAuthToken,
    });

    const address = this.serverRef.address();
    if (!address) return false;
    if (typeof address === "string") {
      throw new Error(
        "the in-app bridge server address is not a TCP address, it's either a pipe or a Unix domain socket",
      );
    }

    this.serverClient = new BridgeServerClient(
      `http://localhost:${address.port}`,
      {
        authToken: this.bridgeServerAuthToken,
      },
    );

    return true;
  }

  async close(): Promise<void> {
    await this.serverClient?.cancelWatcher();
    this.serverClient = null;
    this.kv?.close();
    this.kv = null;
    this.serverRef?.close();
    this.serverRef = null;
    this.bridgeServerAuthToken = null;
  }

  get client(): BridgeServerClient {
    if (!this.serverClient) {
      throw new Error(
        "Trying to use the bridge server client before it gets initialized!",
      );
    }

    return this.serverClient;
  }
}

export const bridgeServerController = new BridgeServerController();

export class BridgeServerModule implements AppModule {
  enable(_context: ModuleContext): void {
    ipcMain.handle(
      "bridgeServer:openServer",
      async (_, kvStore: KvStore) => await bridgeServerController.open(kvStore),
    );

    ipcMain.handle("bridgeServer:closeServer", () =>
      bridgeServerController.close(),
    );
  }
}
