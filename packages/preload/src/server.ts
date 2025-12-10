import { type Kv, openKv } from "@deno/kv";
import { BridgeServerClient, openBridgeServerInNode } from '@denokv-gui-client/bridge-server';
import { type AddressInfo } from "node:net";
import { randomBytes } from "node:crypto";

let serverRef: { close: () => void } | null = null;
let kv: Kv | null = null;
let serverClient: BridgeServerClient | null = null;
let bridgeServerAuthToken: string | null = null;

export async function openServer(kvStore: KvStore): Promise<boolean> {
    let bridgeServerUrl = "";
    if (kvStore.type == "bridge") {
        bridgeServerUrl = kvStore.url
        bridgeServerAuthToken = kvStore.authToken
    } else {
        bridgeServerAuthToken = randomBytes(30).toString("base64")
        kv = await openKv(kvStore.url, { accessToken: kvStore.accessToken })
        const server = openBridgeServerInNode(kv, { port: 0, authToken: bridgeServerAuthToken });
        const address = server.address() as AddressInfo
        bridgeServerUrl = `http://localhost:${address.port}`;
        serverRef = server
    }

    serverClient = new BridgeServerClient(bridgeServerUrl, { authToken: bridgeServerAuthToken ?? "" })
    return true
}

export function closeServer(): void {
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
