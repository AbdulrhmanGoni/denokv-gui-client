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
  keys: SerializedKvKey[],
): Promise<WatchConnection> {
  const abortController = new AbortController();
  const response = await fetch(`${bridgeServerUrl}/watch`, {
    method: "POST",
    headers: { Authorization: authToken },
    body: JSON.stringify(keys.map((key) => JSON.stringify(key))),
    signal: abortController.signal,
  });

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

  while (true) {
    const { value, done } = await reader.read();
    expect(done).toBe(false);

    const data = decoder.decode(value);
    if (data === ": ping") continue;

    return JSON.parse(data);
  }
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
  });
}
