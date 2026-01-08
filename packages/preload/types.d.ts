type CreateKvStoreInput =
    Pick<KvStore, "name" | "url" | "type" | "accessToken" | "authToken">
    & { replaceExisting?: boolean }

type EditKvStoreInput = Partial<Pick<KvStore, "name" | "url" | "type">> & {
    accessToken: KvStore["accessToken"];
    authToken: KvStore["authToken"];
}

type TestKvStoreParams = Pick<KvStore, "url" | "type" | "accessToken" | "authToken">

type BrowseRouteOptions = import("@app/bridge-server").BrowsingOptions

type BrowsingParams = {
    prefix: string;
    start: string;
    end: string;
    limit: NonNullable<BrowseRouteOptions["limit"]>;
}

type SavedBrowsingParams = Pick<BrowsingParams, "prefix" | "start" | "end" | "limit">

type SavedBrowsingParamsRecord<T> = {
    id: string;
    kvStoreId: string;
    paramsAsJson: T;
    isDefault: 1 | 0;
    createdAt: number;
    updatedAt: number;
}

type SerializedKvKey = import("@app/bridge-server").SerializedKvKey

type SetKeyOptions = import("@app/bridge-server").SetKeyOptions

type SerializedKvValue = import("@app/bridge-server").SerializedKvValue

type SerializedKvEntry = import("@app/bridge-server").SerializedKvEntry

type KvEntry = SerializedKvEntry

type DownloadUpdateProgressInfo = import("electron-updater").ProgressInfo

type UpdateCheckResult = import("electron-updater").UpdateCheckResult

type Settings = Partial<{
    autoCheckForUpdate: boolean;
}>