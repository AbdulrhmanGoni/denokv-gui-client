import { getServerClient } from "./server.js"
import { serializeKvKey } from '@denokv-gui-client/bridge-server';

export function browse(params: BrowsingOptions) {
    const serverClient = getServerClient()
    return serverClient.browse(params)
}

export async function set(kvKey: string | SerializedKvKey, value: SerializedKvValue, options?: SetKeyOptions) {
    const serverClient = getServerClient();

    if (typeof kvKey == "string") {
        const key = eval(`(${kvKey})`)

        if (!(key instanceof Array)) {
            return {
                result: null,
                error:
                    "Invalid Key. It should be an array of string, number, bigint, boolean or Uint8Array",
            };
        }

        const allKeyPartsAreValid = key.every(
            (part) =>
                ["string", "number", "bigint", "boolean"].includes(typeof part) ||
                part instanceof Uint8Array
        );

        if (!allKeyPartsAreValid) {
            return {
                result: null,
                error:
                    "Invalid Key Part. The key should contain only string, number, bigint, boolean or Uint8Array",
            };
        }

        return serverClient.set(serializeKvKey(key), value, options)
    }

    return serverClient.set(kvKey, value, options)
}

export function deleteKey(key: SerializedKvKey) {
    const serverClient = getServerClient()
    return serverClient.delete(key)
}

export function get(key: SerializedKvKey) {
    const serverClient = getServerClient()
    return serverClient.get(key)
}
