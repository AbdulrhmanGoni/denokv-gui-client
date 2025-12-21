import { createBridgeApp } from "./createBridgeApp.ts";
import type { OpenBridgeServerOptions } from "./types.ts";

/**
 * Starts the bridge server in Deno runtime
 *
 * @param kv An instance of `Deno.Kv`.
 * @param options Optional configuration options
 * @param options.port Server port. Defaults to `47168`
 * @param options.authToken Authentication token to protect the server, if not set, the server will be publicly accessable. 
 * Defaults to `DENOKV_BRIDGE_SERVER_AUTH_TOKEN` environment variable. 
 *
 * @returns Promise resolving to `Deno.HttpServer<Deno.NetAddr>`
 *
 * @example
 * ```typescript
 * const kv = await Deno.openKv();
 * await openBridgeServerInDeno(kv, { port: 4634 });
 * // now the bridge server is listening on port 4634
 * ```
 *
 * @example
 * ```typescript
 * const kv = await Deno.openKv();
 * await openBridgeServerInDeno(kv, { port: 4634, authToken: "my-secret-token" });
 * // now the bridge server can only be accessed with "my-secret-token" authentication token passed as "Authorization" header
 * ```
 */
export function openBridgeServerInDeno(kv: Deno.Kv, options?: OpenBridgeServerOptions): Deno.HttpServer<Deno.NetAddr> {
    const authToken = options?.authToken ?? Deno.env.get("DENOKV_BRIDGE_SERVER_AUTH_TOKEN")
    const app = createBridgeApp(kv, { authToken })
    return Deno.serve({ port: options?.port ?? 47168 }, app.fetch)
}