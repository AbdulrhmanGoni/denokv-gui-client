import {
  AtomicOperationInput,
  EnqueueRequestInput,
} from "../validation/main.ts";
import type {
  SerializedKvEntry,
  SerializedKvKey,
  SerializedKvValue,
} from "../serialization/main.ts";

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type CallBridgeServerOptions = Record<
  string,
  SerializedKvKey | number | string | boolean
>;

type CallBridgeServerParams = {
  url: string;
  body?: unknown;
  method?: "GET" | "PUT" | "DELETE" | "POST";
  options?: CallBridgeServerOptions;
  headers?: Record<string, string>;
};

type CallBridgeServerReturn<ResultT> = Promise<{
  result: ResultT | null;
  error: string | null;
}>;

function optionsToUrlSearchParams(
  options: CallBridgeServerOptions,
): URLSearchParams {
  return new URLSearchParams(
    Object.entries(options).map(([option, value]) => [
      option,
      `${value instanceof Array ? JSON.stringify(value) : value}`,
    ]),
  );
}

async function callBridgeServerRequest<ResultT = unknown>({
  url,
  method,
  body,
  options,
  headers,
}: CallBridgeServerParams): CallBridgeServerReturn<ResultT> {
  let res: Response;
  const returnValue: UnwrapPromise<CallBridgeServerReturn<ResultT>> = {
    result: null,
    error: null,
  };

  try {
    res = await fetch(
      url + (options ? "?" + optionsToUrlSearchParams(options).toString() : ""),
      {
        method: method ?? "GET",
        body: body ? JSON.stringify(body) : undefined,
        headers,
      },
    );
  } catch {
    returnValue.error =
      "Something went wrong!. It might be network issue or the bridge server is down";
    return returnValue;
  }

  try {
    const json = await res.json();
    if (res.ok) {
      returnValue.result = json?.result;
    } else {
      returnValue.error = json?.error || "Unexpected error from the server";
    }
  } catch {
    returnValue.error = "Invalid JSON response received";
  }

  return returnValue;
}

export type BrowsingOptions = {
  /** Maximum number of entries to return */
  limit?: number;
  /** Cursor for pagination (obtained from previous browse result) */
  cursor?: string;
  /** The number of entries to fetch from the database at once */
  batchSize?: number;
  /** The consistency level of the list operation: "strong" or "eventual" */
  consistency?: string;
  /** Whether to return the entries in reverse order */
  reverse?: boolean;
  /** Filter entries by key prefix */
  prefix?: SerializedKvKey;
  /** Start key for range query (inclusive) */
  start?: SerializedKvKey;
  /** End key for range query (exclusive) */
  end?: SerializedKvKey;
  /** Whether to escape HTML characters and JS line terminators from strings (defaults to true) */
  xssSafe?: boolean;
};

/** Options for setting a KV key */
export type SetKeyOptions = {
  /** Expiration timestamp in milliseconds */
  expires?: number;
  /** Whether to overwrite the value if the key already exists (defaults to true) */
  overwrite?: boolean;
};

/** The result of a set operation */
export type SetKeyReturn = {
  /** Whether the set operation was committed */
  ok: boolean;
  /** The new versionstamp of the created or updated entry */
  versionstamp: string;
};

/** The result of a browse operation */
export type BrowseReturn = {
  /** The list of serialized KV entries */
  entries: SerializedKvEntry[];
  /** The cursor for the next page of results */
  cursor: string;
};

type BridgeServerClientOptions = {
  authToken?: string;
};

/**
 * A client to interact with a Denokv bridge server via HTTP.
 */
export class BridgeServerClient {
  /**
   * @param baseUrl The base URL of the bridge server (e.g., http://localhost:47168)
   * @param options Optional configuration
   */
  constructor(
    private baseUrl: string,
    options?: BridgeServerClientOptions,
  ) {
    if (options?.authToken) this.headers = { Authorization: options.authToken };
  }

  private headers?: Record<string, string>;

  /**
   * Lists KV entries based on the provided options.
   * @param options Filtering and pagination options
   */
  browse(options?: BrowsingOptions): CallBridgeServerReturn<BrowseReturn> {
    return callBridgeServerRequest<BrowseReturn>({
      url: `${this.baseUrl}/browse`,
      options,
      headers: this.headers,
      method: "GET",
    });
  }

  /**
   * Creates or updates a Deno KV entry.
   * @param key The key to set
   * @param value The value to set (must be in `SerializedKvValue` type)
   * @param options Optional settings like expiration time and overwrite behavior
   */
  set(
    key: SerializedKvKey,
    value: SerializedKvValue,
    options?: SetKeyOptions,
  ): CallBridgeServerReturn<SetKeyReturn> {
    return callBridgeServerRequest<SetKeyReturn>({
      url: `${this.baseUrl}/set`,
      options: {
        key,
        ...options,
      },
      method: "PUT",
      body: value,
      headers: this.headers,
    });
  }

  /**
   * Retrieves a single Deno KV entry by its key.
   * @param key The key to retrieve
   * @param options Optional settings like xssSafe
   * @param options.xssSafe Whether to escape HTML characters and JS line terminators from strings (defaults to true). Set to false to disable.
   */
  get(
    key: SerializedKvKey,
    options?: { xssSafe?: boolean },
  ): CallBridgeServerReturn<SerializedKvEntry> {
    return callBridgeServerRequest<SerializedKvEntry>({
      url: `${this.baseUrl}/get/${encodeURIComponent(JSON.stringify(key))}`,
      options,
      headers: this.headers,
      method: "GET",
    });
  }

  /**
   * Deletes a Deno KV entry by its key.
   * @param key The key to delete
   */
  delete(key: SerializedKvKey): CallBridgeServerReturn<true> {
    return callBridgeServerRequest<true>({
      url: `${this.baseUrl}/delete`,
      options: { key },
      headers: this.headers,
      method: "DELETE",
    });
  }

  /**
   * Enqueues a message into Deno Kv Queue for later delivery.
   * @param value The value to enqueue
   * @param options Optional enqueue settings
   */
  enqueue(
    value: EnqueueRequestInput["value"],
    options?: EnqueueRequestInput["options"],
  ): CallBridgeServerReturn<boolean> {
    return callBridgeServerRequest<boolean>({
      url: `${this.baseUrl}/enqueue`,
      body: { value, options },
      method: "POST",
      headers: this.headers,
    });
  }

  /**
   * Performs an atomic operation consisting of multiple checks and mutations.
   * @param atomicOperations An array of atomic operations to perform
   */
  atomic(
    atomicOperations: AtomicOperationInput[],
  ): CallBridgeServerReturn<boolean> {
    return callBridgeServerRequest<boolean>({
      url: `${this.baseUrl}/atomic`,
      body: atomicOperations,
      method: "POST",
      headers: this.headers,
    });
  }

  /**
   * Watches a set of keys for updates via Server-Sent Events (SSE).
   *
   * Whenever a watched key changes, the provided listener is called with the updated entries.
   * Use `cancelWatcher()` to stop watching and close the connection.
   *
   * @param keys An array of KV keys to watch
   * @param listener A callback function to be called when one of the watched keys is updated
   * @param options Optional configuration settings
   * @param options.xssSafe Whether to escape HTML characters and JS line terminators from strings (defaults to true).
   * @returns A promise that resolves when the watch stream is closed or cancelled
   */
  async watch(
    keys: SerializedKvKey[],
    listener: (updatedEntries: SerializedKvEntry[]) => void,
    options?: { xssSafe?: boolean },
  ): Promise<void> {
    try {
      const controller = new AbortController();
      const queryParams = new URLSearchParams();
      if (options?.xssSafe !== undefined) {
        queryParams.append("xssSafe", options.xssSafe.toString());
      }
      const response = await fetch(`${this.baseUrl}/watch?${queryParams}`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(keys.map((key) => JSON.stringify(key))),
        signal: controller.signal,
      });

      if (!response.body) throw "No response body (stream) found.";

      this.watchReader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await this.watchReader.read();
        if (done) break;
        const data = decoder.decode(value);
        if (data !== ": ping") listener(JSON.parse(data));
      }
    } catch {}
  }

  /**
   * The reader of the stream of updates on the watched keys using `watch` method.
   */
  private watchReader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  /**
   * Cancels the reader (if exists) that listens for changes on the set of watched keys using `watch` method.
   */
  async cancelWatcher() {
    if (this.watchReader) {
      await this.watchReader.cancel().catch(() => {});
      this.watchReader = null;
    }
  }
}
