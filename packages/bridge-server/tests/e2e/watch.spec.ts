import { describe, it, expect } from "vitest";
import type { TestDependencies } from "./index.test.ts";
import type {
  SerializedKvEntry,
  SerializedKvKey,
} from "../../src/serialization/main.ts";

type WatchConnection = {
  reader: ReadableStreamDefaultReader<Uint8Array>;
  abortController: AbortController;
};

async function openWatchConnection(
  { bridgeServerUrl, authToken }: TestDependencies,
  keys: SerializedKvKey[] | string[],
  queryParams?: Record<string, string>,
): Promise<WatchConnection> {
  const abortController = new AbortController();
  const response = await fetch(
    `${bridgeServerUrl}/watch?${new URLSearchParams(queryParams)}`,
    {
      method: "POST",
      headers: { Authorization: authToken },
      body: JSON.stringify(
        typeof keys[0] == "string"
          ? keys
          : keys.map((key) => JSON.stringify(key)),
      ),
      signal: abortController.signal,
    },
  );

  expect(response.ok).toBe(true);
  expect(response.headers.get("Content-Type")).toMatch(/text\/event-stream/);
  expect(response.body).toBeTruthy();

  return {
    reader: response.body!.getReader(),
    abortController,
  };
}

async function closeWatchConnection({
  reader,
  abortController,
}: WatchConnection) {
  await reader.cancel().catch(() => {});
  abortController.abort();
}

async function readNextWatchMessage(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): Promise<SerializedKvEntry[]> {
  const decoder = new TextDecoder();
  const { value, done } = await reader.read();
  expect(done).toBe(false);
  const data = decoder.decode(value);
  return JSON.parse(data);
}

export function watchEndpointSpec(dependencies: TestDependencies) {
  const { kv } = dependencies;

  describe("'POST /watch' endpoint's specifications", () => {
    it("should stream the current entries for watched keys", async () => {
      const key1 = ["e2e", "watch", "initial", "one", Date.now()];
      const key2 = ["e2e", "watch", "initial", "two", Date.now()];
      await kv.set(key1, "first");
      await kv.set(key2, "second");

      const watchConnection = await openWatchConnection(dependencies, [
        key1,
        key2,
      ]);

      try {
        const entries = await readNextWatchMessage(watchConnection.reader);

        expect(entries).toHaveLength(2);
        expect(entries).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              key: key1,
              value: { type: "String", data: "first" },
              versionstamp: expect.any(String),
            }),
            expect.objectContaining({
              key: key2,
              value: { type: "String", data: "second" },
              versionstamp: expect.any(String),
            }),
          ]),
        );
      } finally {
        await closeWatchConnection(watchConnection);
      }
    });

    it("should stream only updated entries after the initial watch message", async () => {
      const key1 = ["e2e", "watch", "updates", "one", Date.now()];
      const key2 = ["e2e", "watch", "updates", "two", Date.now()];
      await kv.set(key1, "initial first");
      await kv.set(key2, "initial second");

      const watchConnection = await openWatchConnection(dependencies, [
        key1,
        key2,
      ]);

      try {
        await readNextWatchMessage(watchConnection.reader);
        await kv.set(key1, "updated first");

        const entries = await readNextWatchMessage(watchConnection.reader);

        expect(entries).toHaveLength(1);
        expect(entries).toEqual([
          expect.objectContaining({
            key: key1,
            value: { type: "String", data: "updated first" },
            versionstamp: expect.any(String),
          }),
        ]);
      } finally {
        await closeWatchConnection(watchConnection);
      }
    });

    it("should fail if request body is not an array of keys", async () => {
      const response = await fetch(`${dependencies.bridgeServerUrl}/watch`, {
        method: "POST",
        headers: { Authorization: dependencies.authToken },
        body: JSON.stringify({ key: ["not", "valid"] }),
      });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe("No keys provided to watch.");
    });

    it("should fail if the passed keys are JS literals but jsKey query parameter is false or missing", async () => {
      const res1 = await fetch(`${dependencies.bridgeServerUrl}/watch`, {
        method: "POST",
        headers: { Authorization: dependencies.authToken },
        body: `["['js only', 777777n]"]`,
      });
      const json1 = await res1.json();
      expect(res1.status).toBe(400);
      expect(json1.error).toContain("Invalid JSON format for KvKey.");

      const res2 = await fetch(`${dependencies.bridgeServerUrl}/watch`, {
        method: "POST",
        headers: { Authorization: dependencies.authToken },
        body: `["['js only', new Uint8Array([1, 2, 3])]"]`,
      });
      const json2 = await res2.json();
      expect(res2.status).toBe(400);
      expect(json2.error).toContain("Invalid JSON format for KvKey.");
    });

    it("should handle keys passed as JS literals and stream updates for them when jsKey query parameter is true", async () => {
      const key1 = ["updates", 1000n, new Uint8Array([10, 10, 10])] as const;
      const key2 = ["updates", 2000n, new Uint8Array([20, 20, 20])] as const;
      await kv.set(key1, "initial 1000n");
      await kv.set(key2, "initial 2000n");

      const watchConnection = await openWatchConnection(
        dependencies,
        [
          "['updates', 1000n, new Uint8Array([10, 10, 10])]",
          "['updates', 2000n, new Uint8Array([20, 20, 20])]",
        ],
        { jsKey: "true" },
      );

      // consume the initial values so the stream queue becomes empty for the next steps
      await readNextWatchMessage(watchConnection.reader);

      for (const key of [key1, key2]) {
        const newValue = `updated-${crypto.randomUUID()}`;
        const { versionstamp: newVersionstamp } = await kv.set(key, newValue);

        const entries = await readNextWatchMessage(watchConnection.reader);
        expect(entries).toHaveLength(1);
        expect(entries).toEqual([
          expect.objectContaining({
            key: [
              "updates",
              {
                type: "BigInt",
                value: String(key[1]),
              },
              {
                type: "Uint8Array",
                value: `new Uint8Array([${key[2].join(",")}])`,
              },
            ],
            value: { type: "String", data: newValue },
            versionstamp: newVersionstamp,
          }),
        ]);
      }

      await closeWatchConnection(watchConnection);
    });
  });
}
