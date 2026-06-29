import {
  serializeKvValue,
  deserializeKvKey,
  deserializeKvValue,
  serializeEntries,
  SerializedKvKey,
  SerializedKvEntry,
  serializeKvKey,
} from "../serialization/main.ts";
import {
  validateBrowseRequestParams,
  validateSetRequestParams,
  validateEnqueueRequest,
  validateAtomicOperations,
} from "../validation/main.ts";
import type { Kv, KvEntry, KvEntryMaybe } from "@deno/kv";
import { Hono } from "hono/tiny";
import type { BlankEnv, BlankSchema } from "hono/types";
import { isSameKvKey } from "../kv-utils.ts";

/**
 * Creates the bridge server which is a Hono web application that provides HTTP endpoints to interact with
 * a given Deno KV database.
 *
 * @param kv An instance of the official Deno.Kv API class or compatible KV implementation
 * @param options Optional configuration for the bridge server
 * @param options.authToken Authentication token to protect the server
 * @returns An instance of the `Hono` class which represents the entry point of the bridge server
 *
 * @example
 * ```typescript
 * const kv = await Deno.openKv();
 * const app = createBridgeApp(kv);
 *
 * // Start a server
 * Deno.serve({ port: 8000 }, app.fetch);
 * ```
 *
 * The bridge server provides the following endpoints:
 * - `GET /browse` - List KV entries (mirroring 'Deno.Kv.list()')
 * - `GET /get/:key` - Retrieve a specific KV entry by key (mirroring `Deno.Kv.get()`)
 * - `PUT /set` - Create or update a KV entry (mirroring `Deno.Kv.set()`)
 * - `DELETE /delete` - Remove a KV entry (mirroring `Deno.Kv.delete()`)
 * - `POST /enqueue` - Enqueue a message to a Deno Kv queue (mirroring `Deno.Kv.enqueue()`)
 * - `POST /atomic` - Perform atomic operations on KV entries (mirroring `Deno.Kv.atomic()`)
 * - `POST /watch` - Watch specific keys for updates (mirroring `Deno.Kv.watch()`)
 * - `GET /check` - Health check endpoint to verify KV connectivity
 *
 * All endpoints include CORS headers allowing cross-origin requests from any domain.
 */
export function createBridgeApp(
  kv: Kv | Deno.Kv,
  options?: { authToken?: string },
): Hono<BlankEnv, BlankSchema, "/"> {
  const app = new Hono();

  app.use(async (c, next) => {
    const auth = c.req.header("Authorization");
    if (options?.authToken) {
      if (auth !== options.authToken) {
        return c.json({ error: "Authorization Failed" }, 401);
      }
    }
    c.res.headers.set("Access-Control-Allow-Origin", "*");
    await next();
  });

  app.get("/browse", async (c) => {
    const { listSelector, options, xssSafe } = validateBrowseRequestParams(
      new URL(c.req.url),
    );

    const iterator = kv.list(listSelector, options);
    const records: KvEntry<unknown>[] = [];
    for await (const record of iterator) {
      records.push(record as KvEntry<unknown>);
    }

    return c.json(
      {
        result: {
          entries: serializeEntries(records, xssSafe),
          cursor: records.length ? iterator.cursor : "",
        },
      },
      200,
    );
  });

  app.get("/get/:key", async (c) => {
    const targetKey = c.req.param("key");
    const xssSafe = c.req.query("xssSafe") === "false" ? false : true;
    const jsKey = c.req.query("jsKey") === "true";

    const key = deserializeKvKey(targetKey, { jsKey });

    const entry = await kv.get(key);

    if (entry.value === null && entry.versionstamp === null) {
      return c.json({ error: "Entry not found" }, 404);
    } else {
      return c.json({
        result: {
          key: serializeKvKey(key),
          value: serializeKvValue(entry.value, xssSafe),
          versionstamp: entry.versionstamp,
        },
      });
    }
  });

  app.put("/set", async (c) => {
    const { key, expires, overwrite } = validateSetRequestParams(
      new URL(c.req.url),
    );
    const validValue = deserializeKvValue(await c.req.json());

    if (overwrite === false) {
      const result = await kv
        .atomic()
        .check({ key, versionstamp: null })
        .set(key, validValue, { expireIn: expires })
        .commit();

      if (result.ok) {
        return c.json({
          result: {
            ok: result.ok,
            versionstamp: result.versionstamp,
          },
        });
      } else {
        return c.json({ error: "The Kv Entry is already existing." }, 400);
      }
    } else {
      const result = await kv.set(key, validValue, { expireIn: expires });
      return c.json({
        result: {
          ok: result.ok,
          versionstamp: result.versionstamp,
        },
      });
    }
  });

  app.delete("/delete", async (c) => {
    const targetKey = c.req.query("key");
    if (!targetKey) {
      return c.json({ error: "No target key to delete." }, 400);
    }
    const jsKey = c.req.query("jsKey") === "true";

    const key = deserializeKvKey(targetKey, { jsKey });

    await kv.delete(key);

    return c.json({ result: true });
  });

  app.post("/enqueue", async (c) => {
    const { value, options } = validateEnqueueRequest(await c.req.json());
    const result = await kv.enqueue(value, options);
    return c.json({ result: result.ok });
  });

  app.post("/atomic", async (c) => {
    const jsKey = c.req.query("jsKey") === "true";

    const atomicOperations = validateAtomicOperations(await c.req.json(), {
      jsKey,
    });

    let kvAtomicOperation = kv.atomic();

    for (const operation of atomicOperations) {
      switch (operation.name) {
        case "check":
          kvAtomicOperation = kvAtomicOperation.check({
            key: operation.key,
            versionstamp: operation.versionstamp,
          });
          break;

        case "sum":
          kvAtomicOperation = kvAtomicOperation.sum(
            operation.key,
            operation.value,
          );
          break;

        case "min":
          kvAtomicOperation = kvAtomicOperation.min(
            operation.key,
            operation.value,
          );
          break;

        case "max":
          kvAtomicOperation = kvAtomicOperation.max(
            operation.key,
            operation.value,
          );
          break;

        case "set":
          kvAtomicOperation = kvAtomicOperation.set(
            operation.key,
            operation.value,
            { expireIn: operation.expiresIn },
          );
          break;

        case "delete":
          kvAtomicOperation = kvAtomicOperation.delete(operation.key);
          break;

        case "enqueue":
          kvAtomicOperation = kvAtomicOperation.enqueue(
            operation.value,
            operation.options,
          );
          break;
      }
    }

    const { ok } = await kvAtomicOperation.commit();
    return c.json({ result: ok });
  });

  app.get("/check", async (c) => {
    // Trying to get a random entry to make sure the database is existant
    await kv.get([crypto.randomUUID()]);
    // If `kv.get` resolves, The database is reachable
    return c.json({ result: true });
  });

  let watchedEntries: { key: SerializedKvKey; versionstamp: string | null }[] =
    [];
  let watchStreamReader: ReadableStreamDefaultReader<
    Deno.KvEntryMaybe<unknown>[] | KvEntryMaybe<unknown>[]
  > | null = null;
  async function closeWatchStreamReader() {
    if (watchedEntries.length) watchedEntries = [];
    if (watchStreamReader) {
      await watchStreamReader.cancel().catch(() => {});
      watchStreamReader = null;
    }
  }
  app.post("/watch", async (c) => {
    const serializedKeys = (await c.req.json()) as string[];

    if (!Array.isArray(serializedKeys)) {
      return c.json({ error: "No keys provided to watch." }, 400);
    }

    const jsKey = c.req.query("jsKey") === "true";

    const keys = serializedKeys.map((key) => deserializeKvKey(key, { jsKey }));

    await closeWatchStreamReader();

    const watchStream = kv.watch(keys, { raw: true });
    watchStreamReader = watchStream.getReader();

    c.req.raw.signal.addEventListener("abort", closeWatchStreamReader);

    const xssSafe = c.req.query("xssSafe") === "false" ? false : true;

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        const pingTimerId = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(": ping"));
          } catch {
            clearInterval(pingTimerId);
          }
        }, 4 * 60_000);

        try {
          while (true) {
            const { value: entries, done } = await watchStreamReader!.read();
            if (done) {
              clearInterval(pingTimerId);
              controller.close();
              break;
            }

            const serializedEntries = serializeEntries(
              entries as KvEntry<unknown>[],
              xssSafe,
            );
            let updatedEntries: SerializedKvEntry[] = [];
            if (watchedEntries.length) {
              updatedEntries = serializedEntries.filter((entry) =>
                watchedEntries.some(
                  (wEntry) =>
                    isSameKvKey(wEntry.key, entry.key) &&
                    wEntry.versionstamp !== entry.versionstamp,
                ),
              );
            } else {
              updatedEntries = serializedEntries;
            }

            controller.enqueue(encoder.encode(JSON.stringify(updatedEntries)));

            watchedEntries = serializedEntries.map((entry) => ({
              key: entry.key,
              versionstamp: entry.versionstamp,
            }));
          }
        } catch (err) {
          clearInterval(pingTimerId);
          await closeWatchStreamReader();
          controller.error(err);
          try {
            controller.close();
          } catch {}
        }
      },
      cancel() {
        closeWatchStreamReader();
      },
    });

    c.header("Content-Type", "text/event-stream; charset=utf-8");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");

    return new Response(readableStream, { headers: c.res.headers });
  });

  app.all("*", (c) => {
    return c.json(
      { error: `'${c.req.method} ${c.req.path}' route dosen't exist` },
      404,
    );
  });

  app.onError((err, c) => {
    return c.json(
      { error: (err.cause ? err.cause + ": " : "") + err.message },
      err.cause ? 400 : 500,
    );
  });

  return app;
}
