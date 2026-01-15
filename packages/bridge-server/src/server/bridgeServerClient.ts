import { EnqueueRequestInput } from "../validation/main.ts";
import type { SerializedKvEntry, SerializedKvKey, SerializedKvValue } from "../serialization/main.ts";

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type CallBridgeServerOptions = Record<string, SerializedKvKey | number | string | boolean>

type CallBridgeServerParams = {
    url: string,
    body?: unknown,
    method?: "GET" | "PUT" | "DELETE" | "POST",
    options?: CallBridgeServerOptions,
    headers?: Record<string, string>
}

type CallBridgeServerReturn<ResultT> = Promise<{
    result: ResultT | null;
    error: string | null;
}>

function optionsToUrlSearchParams(options: CallBridgeServerOptions): URLSearchParams {
    return new URLSearchParams(
        Object.entries(options)
            .map(([option, value]) => (
                [option, `${value instanceof Array ? JSON.stringify(value) : value}`]
            ))
    )
}

async function callBridgeServerRequest<ResultT = unknown>(
    { url, method, body, options, headers }: CallBridgeServerParams
): CallBridgeServerReturn<ResultT> {
    let res: Response;
    const returnValue: UnwrapPromise<CallBridgeServerReturn<ResultT>> = {
        result: null,
        error: null,
    }

    try {
        res = await fetch(
            url + (options ? "?" + optionsToUrlSearchParams(options).toString() : ""),
            {
                method: method ?? "GET",
                body: body ? JSON.stringify(body) : undefined,
                headers,
            }
        );
    } catch {
        returnValue.error = "Something went wrong!. It might be network issue or the bridge server is down"
        return returnValue
    }

    try {
        const json = await res.json()
        if (res.ok) {
            returnValue.result = json?.result
        } else {
            returnValue.error = json?.error || "Unexpected error from the server"
        }
    } catch {
        returnValue.error = "Invalid JSON response received"
    }

    return returnValue
};

export type BrowsingOptions = {
    limit?: number;
    cursor?: string;
    batchSize?: number;
    consistency?: string;
    reverse?: boolean;
    prefix?: SerializedKvKey;
    start?: SerializedKvKey;
    end?: SerializedKvKey;
}

export type SetKeyOptions = {
    expires?: number;
}

export type BrowseReturn = {
    entries: SerializedKvEntry[];
    cursor: string;
}

type BridgeServerClientOptions = {
    authToken?: string
}

export class BridgeServerClient {
    constructor(private baseUrl: string, options?: BridgeServerClientOptions) {
        if (options?.authToken) this.headers = { Authorization: options.authToken }
    }

    private headers?: Record<string, string>;

    browse(options?: BrowsingOptions): CallBridgeServerReturn<BrowseReturn> {
        return callBridgeServerRequest<BrowseReturn>({
            url: `${this.baseUrl}/browse`,
            options,
            headers: this.headers,
            method: "GET"
        })
    }

    set(key: SerializedKvKey, value: SerializedKvValue, options?: SetKeyOptions): CallBridgeServerReturn<boolean> {
        return callBridgeServerRequest<boolean>({
            url: `${this.baseUrl}/set`,
            options: {
                key,
                ...options,
            },
            method: "PUT",
            body: value,
            headers: this.headers,
        })
    }

    get(key: SerializedKvKey): CallBridgeServerReturn<SerializedKvEntry> {
        return callBridgeServerRequest<SerializedKvEntry>({
            url: `${this.baseUrl}/get/${encodeURIComponent(JSON.stringify(key))}`,
            headers: this.headers,
            method: "GET"
        })
    }

    delete(key: SerializedKvKey): CallBridgeServerReturn<true> {
        return callBridgeServerRequest<true>({
            url: `${this.baseUrl}/delete`,
            options: { key },
            headers: this.headers,
            method: "DELETE"
        })
    }

    enqueue(value: EnqueueRequestInput["value"], options?: EnqueueRequestInput["options"]): CallBridgeServerReturn<boolean> {
        return callBridgeServerRequest<boolean>({
            url: `${this.baseUrl}/enqueue`,
            body: { value, options },
            method: "POST",
            headers: this.headers,
        })
    }
}
