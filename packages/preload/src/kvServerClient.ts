import { getServerClient } from "./server.js"

export function browse(params: BrowsingOptions) {
    const serverClient = getServerClient()
    return serverClient.browse(params)
}

export function set(key: SerializedKvKey, value: SerializedKvValue, options?: SetKeyOptions) {
    const serverClient = getServerClient()
    return serverClient.set(key, value, options)
}

export function deleteKey(key: SerializedKvKey) {
    const serverClient = getServerClient()
    return serverClient.delete(key)
}

export function get(key: SerializedKvKey) {
    const serverClient = getServerClient()
    return serverClient.get(key)
}
