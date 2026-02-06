import { describe } from "vitest";
import { openBridgeServerInNode } from "../../src/server/main.ts";
import { fakeData } from "../fakeTestData.ts";
import { BridgeServerClient } from "../../src/server/bridgeServerClient.ts";
import { browseEndpointSpec } from "./browse.spec.ts";
import { setEndpointSpec } from "./set.spec.ts";
import { getEndpointSpec } from "./get.spec.ts";
import { deleteEndpointSpec } from "./delete.spec.ts";
import { enqueueEndpointSpec } from "./enqueue.spec.ts";
import { randomBytes } from "node:crypto";
import { type Kv, openKv } from "@deno/kv";
import type { AddressInfo } from "node:net";

export type TestDependencies = {
  kv: Kv;
  bridgeServerClient: BridgeServerClient
};

const kv = await openKv(":memory:");
for (const element of fakeData) {
  await kv.set(element.key, element.value);
}

const authToken = randomBytes(30).toString("base64")

const server = openBridgeServerInNode(kv, { port: 7963, authToken });

const addressInfo = server.address() as AddressInfo

const testsDependencies = {
  kv,
  bridgeServerClient: new BridgeServerClient(
    `http://localhost:${addressInfo.port}`,
    { authToken }
  ),
};

describe("End-to-End tests for Deno server", () => {
  browseEndpointSpec(testsDependencies);
  setEndpointSpec(testsDependencies);
  getEndpointSpec(testsDependencies);
  deleteEndpointSpec(testsDependencies);
  enqueueEndpointSpec(testsDependencies);
});
