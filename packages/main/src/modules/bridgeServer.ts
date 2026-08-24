import { ipcMain } from "electron";
import type { AppModule, ModuleContext } from "./types.js";
import { type Kv, openKv } from "@deno/kv";
import { openBridgeServerInNode } from "@app/bridge-server";
import { randomBytes } from "node:crypto";
import { asyncTrycatch } from "../helpers.js";

type OpenedBridgeServer = {
  url: string;
  authToken: string | null;
};

class BridgeServerController {
  private serverRef: ReturnType<typeof openBridgeServerInNode> | null = null;
  private kv: Kv | null = null;
  private bridgeServerAuthToken: string | null = null;
  private bridgeServerUrl: string | null = null;

  async open(kvStore: KvStore): Promise<TrycatchResult<OpenedBridgeServer>> {
    return asyncTrycatch(async () => {
      await this.close();

      if (kvStore.type == "bridge") {
        this.bridgeServerUrl = kvStore.url;
        this.bridgeServerAuthToken = kvStore.authToken;

        return {
          url: this.bridgeServerUrl,
          authToken: this.bridgeServerAuthToken!,
        };
      }

      const bridgeServerAuthToken = randomBytes(30).toString("base64");
      this.kv = await openKv(kvStore.url, { accessToken: kvStore.accessToken });
      this.serverRef = openBridgeServerInNode(this.kv, {
        port: 0,
        authToken: bridgeServerAuthToken,
      });

      const address = this.serverRef.address();
      if (!address) {
        throw new Error(
          "Failed to start and get an address for the in-app bridge server!",
        );
      }
      if (typeof address === "string") {
        throw new Error(
          "the in-app bridge server address is not a TCP address, it's either a pipe or a Unix domain socket",
        );
      }

      this.bridgeServerUrl = `http://localhost:${address.port}`;
      this.bridgeServerAuthToken = bridgeServerAuthToken;

      return {
        url: this.bridgeServerUrl,
        authToken: this.bridgeServerAuthToken,
      };
    });
  }

  async close(): Promise<TrycatchResult<void>> {
    return asyncTrycatch(async () => {
      this.kv?.close();
      this.kv = null;
      this.serverRef?.close();
      this.serverRef = null;
      this.bridgeServerAuthToken = null;
    });
  }

  getOpenedServer(): OpenedBridgeServer | null {
    if (!this.bridgeServerUrl) {
      return null;
    }

    return {
      url: this.bridgeServerUrl!,
      authToken: this.bridgeServerAuthToken!,
    };
  }
}

const bridgeServerController = new BridgeServerController();

export interface BridgeServerInterface {
  openServer(kvStore: KvStore): Promise<TrycatchResult<OpenedBridgeServer>>;
  getOpenedServer(): Promise<OpenedBridgeServer | null>;
  closeServer(): Promise<TrycatchResult<void>>;
}

export class BridgeServerModule implements AppModule {
  enable(_context: ModuleContext): void {
    const openServer: BridgeServerInterface["openServer"] = async (kvStore) => {
      return bridgeServerController.open(kvStore);
    };
    ipcMain.handle(
      "bridgeServer:openServer",
      (_, ...args: Parameters<typeof openServer>) => {
        return openServer(...args);
      },
    );

    const getOpenedServer: BridgeServerInterface["getOpenedServer"] = async () => {
      return bridgeServerController.getOpenedServer();
    };
    ipcMain.handle("bridgeServer:getOpenedServer", getOpenedServer);

    const closeServer: BridgeServerInterface["closeServer"] = () => {
      return bridgeServerController.close();
    };
    ipcMain.handle("bridgeServer:closeServer", closeServer);
  }
}
