export type CreateKvStoreInput =
    Pick<KvStore, "name" | "url" | "type" | "accessToken" | "authToken">
    & { replaceExisting?: boolean }

export type EditKvStoreInput = Partial<Pick<KvStore, "name" | "url" | "type">> & {
    accessToken: KvStore["accessToken"];
    authToken: KvStore["authToken"];
}

export type TestKvStoreParams = Pick<KvStore, "url" | "type" | "accessToken" | "authToken">

export type BrowseRouteOptions = import("@app/bridge-server").BrowsingOptions

export type BrowsingParams = {
    prefix: string;
    start: string;
    end: string;
    limit: NonNullable<BrowseRouteOptions["limit"]>;
    batchSize: NonNullable<BrowseRouteOptions["batchSize"]>;
    consistency: NonNullable<BrowseRouteOptions["consistency"]>;
    reverse: NonNullable<BrowseRouteOptions["reverse"]>;
}

export type SavedBrowsingParams =
    Pick<BrowsingParams, "prefix" | "start" | "end" | "limit" | "batchSize" | "consistency" | "reverse">

export type SavedBrowsingParamsRecord<T> = {
    id: string;
    kvStoreId: string;
    paramsAsJson: T;
    isDefault: 1 | 0;
    createdAt: number;
    updatedAt: number;
}

export type SerializedKvKey = import("@app/bridge-server").SerializedKvKey

export type SetKeyOptions = import("@app/bridge-server").SetKeyOptions

export type SerializedKvValue = import("@app/bridge-server").SerializedKvValue

export type SerializedKvEntry = import("@app/bridge-server").SerializedKvEntry

export type KvEntry = SerializedKvEntry

export type EnqueueOptions =
    Omit<NonNullable<import("@app/bridge-server").EnqueueRequestInput["options"]>, "keysIfUndelivered"> &
    { keysIfUndelivered: string }

export type DownloadUpdateProgressInfo = import("electron-updater").ProgressInfo

export type UpdateCheckResult = import("electron-updater").UpdateCheckResult

export type Settings = Partial<{
    autoCheckForUpdate: boolean;
}>