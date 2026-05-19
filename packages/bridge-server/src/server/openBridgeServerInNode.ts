import type { Kv } from "@deno/kv";
import { createBridgeApp } from "./createBridgeApp.ts";
import { serve, type ServerType } from '@hono/node-server';
import type { OpenBridgeServerOptions } from "./types.ts";
import process from "node:process";

/**
 * Starts the bridge server in Node.js runtime
 *
 * @param kv An instance created by `openKv()` from `@deno/kv`.
 * @param options Optional configuration options
 * @param options.port Server port. Defaults to `47168`
 * @param options.authToken Authentication token to protect the server, if not set, the server will be publicly accessable. 
 * Defaults to `DENOKV_BRIDGE_SERVER_AUTH_TOKEN` environment variable.
 * 
 * @returns An instance of `ServerType` from `@hono/node-server`
 *
 * @example
 * ```typescript
 * import { openKv } from "@deno/kv";
 * const kv = await openKv()
 * openBridgeServerInNode(kv, { port: 3626 });
 * // Now the bridge server is listening on port 3626
 * ```
 *
 * @example
 * ```typescript
 * import { openKv } from "@deno/kv";
 * const kv = await openKv()
 * openBridgeServerInNode(kv, { port: 3626, authToken: "my-secret-token" });
 * // now the bridge server can only be accessed with "my-secret-token" authentication token passed as "Authorization" header
 * ```
 */
export function openBridgeServerInNode(kv: Kv, options?: OpenBridgeServerOptions): ServerType {
    const authToken = options?.authToken ?? process.env.DENOKV_BRIDGE_SERVER_AUTH_TOKEN
    const app = createBridgeApp(kv, { authToken })
    return serve({ fetch: app.fetch, port: options?.port ?? 47168 })
}