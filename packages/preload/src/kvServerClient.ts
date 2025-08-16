import { getServerClient } from "./server.js"
import { serializeKvKey } from '@denokv-gui-client/bridge-server';

export function browse(params: BrowsingOptions) {
    const serverClient = getServerClient()
    return serverClient.browse(params)
}

export async function set(kvKey: string | SerializedKvKey, value: SerializedKvValue, options?: SetKeyOptions) {
    const serverClient = getServerClient();

    if (typeof kvKey == "string") {
        const result = kvKeyStringToSerializedForm(kvKey)
        if (result.key) {
            return serverClient.set(result.key, value, options)
        }

        return {
            error: result.error,
            result: null
        }
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

function kvKeyStringToSerializedForm(stringKvKey: string): { key: SerializedKvKey | null, error: string | null } {
    const key = eval(`(${stringKvKey})`)

    if (!(key instanceof Array)) {
        return {
            key: null,
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
            key: null,
            error:
                "Invalid Key Part. The key should contain only string, number, bigint, boolean or Uint8Array",
        };
    }

    return {
        key: serializeKvKey(key),
        error: null
    };
}