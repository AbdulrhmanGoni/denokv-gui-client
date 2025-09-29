import { type Kv, openKv } from "@deno/kv";
import { BridgeServerClient, openBridgeServerInNode } from '@denokv-gui-client/bridge-server';
import { type AddressInfo } from "node:net";

let serverRef: { close: () => void } | null = null;
let kv: Kv | null = null;
let serverClient: BridgeServerClient | null = null;

export async function openServer(kvStore: KvStore): Promise<boolean> {
    let bridgeServerUrl = "";
    if (kvStore.type == "bridge") {
        bridgeServerUrl = kvStore.url
    } else {
        kv = await openKv(kvStore.url, { accessToken: kvStore.accessToken })
        const server = await openBridgeServerInNode(kv, 0);
        const address = server.address() as AddressInfo
        bridgeServerUrl = `http://localhost:${address.port}`;
        serverRef = server
    }

    serverClient = new BridgeServerClient(bridgeServerUrl)
    return true
}

export function closeServer(): void {
    serverClient = null
    kv?.close();
    kv = null;
    serverRef?.close();
    serverRef = null;
}

export function getServerClient(): BridgeServerClient {
    if (!serverClient) {
        throw "Trying to use the bridge server client before it gets initialized!"
    }

    return serverClient
}
