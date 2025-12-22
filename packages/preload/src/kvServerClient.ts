import { getServerClient } from "./server.js"
import { serializeKvKey } from '@app/bridge-server';

export function browse(params: BrowsingParams, nextCursor?: string) {
    const serverClient = getServerClient()

    const options: BrowseRouteOptions = {
        limit: params.limit,
    }

    if (nextCursor) {
        options.cursor = nextCursor
    }

    for (const param of ["prefix", "start", "end"] as const) {
        const result = kvKeyStringToSerializedForm(params[param])
        if (result.key && result.key.length) {
            Object.assign(options, { [param]: result.key })
        } else {
            if (!result.key) {
                return {
                    error: result.error,
                    result: null,
                }
            }
        }
    }

    return serverClient.browse(options)
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

export function get(key: string | SerializedKvKey) {
    const serverClient = getServerClient()

    if (typeof key == "string") {
        const result = kvKeyStringToSerializedForm(key)
        if (result.key) {
            return serverClient.get(result.key)
        }

        return {
            error: result.error,
            result: null
        }
    }

    return serverClient.get(key)
}

function kvKeyStringToSerializedForm(stringKvKey: string): { key: SerializedKvKey | null, error: string | null } {
    let key = null
    try {
        key = eval(`(${stringKvKey})`)
    } catch (error) {
        return {
            key: null,
            error: String(error)
        };
    }

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