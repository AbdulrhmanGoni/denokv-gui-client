export type KvStore = {
  id: string;
  name: string;
  url: string;
  type: "local" | "remote" | "bridge" | "default";
  accessToken: string | null;
  authToken: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AppMetadata = {
  appVersion: string;
  nodeVersion: string;
  electronVersion: string;
  chromiumVersion: string;
  githubRepo: string;
  environment: string;
};

export type CreateKvStoreInput = Pick<
  KvStore,
  "name" | "url" | "type" | "accessToken" | "authToken"
> & {
  replaceExisting?: boolean;
};

export type EditKvStoreInput = Partial<Pick<KvStore, "name" | "url" | "type">> & {
  accessToken: KvStore["accessToken"];
  authToken: KvStore["authToken"];
};

export type TestKvStoreParams = Pick<
  KvStore,
  "url" | "type" | "accessToken" | "authToken"
>;

import type { BrowsingOptions } from "@app/bridge-server";

export type BrowsingParams = {
  prefix: string;
  start: string;
  end: string;
  limit: NonNullable<BrowsingOptions["limit"]>;
  batchSize: NonNullable<BrowsingOptions["batchSize"]>;
  consistency: NonNullable<BrowsingOptions["consistency"]>;
  reverse: NonNullable<BrowsingOptions["reverse"]>;
};

export type SavedBrowsingParams = Pick<
  BrowsingParams,
  "prefix" | "start" | "end" | "limit" | "batchSize" | "consistency" | "reverse"
>;

export type TrycatchResult<T> =
  | { result: T; error: null }
  | { result: null; error: string };

export type SavedBrowsingParamsRecord<T> = {
  id: string;
  kvStoreId: string;
  paramsAsJson: T;
  isDefault: 1 | 0;
  createdAt: number;
  updatedAt: number;
};

export type Settings = Partial<{
  autoCheckForUpdate: boolean;
  disableHardwareAcceleration: boolean;
}>;

export type LastFetchedUpdate = {
  data: UpdateCheckResult;
  doNotNotify: boolean;
};

export type UpdateCheckResult = import("electron-updater").UpdateCheckResult;

export type ProgressInfo = import("electron-updater").ProgressInfo;
