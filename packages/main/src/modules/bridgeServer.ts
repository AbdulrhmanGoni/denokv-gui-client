import { ipcMain } from "electron";
import { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";
import { type Kv, openKv } from "@deno/kv";
import { BridgeServerClient, openBridgeServerInNode } from '@app/bridge-server';
import { type AddressInfo } from "node:net";
import { randomBytes } from "node:crypto";

let serverRef: { close: () => void } | null = null;
let kv: Kv | null = null;
let serverClient: BridgeServerClient | null = null;
let bridgeServerAuthToken: string | null = null;

export class BridgeServerModule implements AppModule {
    enable(_context: ModuleContext): void {
        ipcMain.handle("bridgeServer:openServer", async (_, kvStore: KvStore) => {
            let bridgeServerUrl = "";
            if (kvStore.type == "bridge") {
                bridgeServerUrl = kvStore.url
                bridgeServerAuthToken = kvStore.authToken
            } else {
                bridgeServerAuthToken = randomBytes(30).toString("base64")
                if (kv || serverRef) {
                    await closeServer()
                }
                kv = await openKv(kvStore.url, { accessToken: kvStore.accessToken })
                const server = openBridgeServerInNode(kv, { port: 0, authToken: bridgeServerAuthToken });
                const address = server.address() as AddressInfo
                bridgeServerUrl = `http://localhost:${address.port}`;
                serverRef = server
            }

            serverClient = new BridgeServerClient(bridgeServerUrl, { authToken: bridgeServerAuthToken ?? "" })
            return true
        });

        ipcMain.handle("bridgeServer:closeServer", () => closeServer());
    }
}

async function closeServer(): Promise<void> {
    await serverClient?.cancelWatcher()
    serverClient = null
    kv?.close();
    kv = null;
    serverRef?.close();
    serverRef = null;
    bridgeServerAuthToken = null
}

export function getServerClient(): BridgeServerClient {
    if (!serverClient) {
        throw "Trying to use the bridge server client before it gets initialized!"
    }

    return serverClient
}
