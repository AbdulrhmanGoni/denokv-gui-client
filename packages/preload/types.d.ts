type CreateKvStoreInput = Pick<KvStore, "name" | "url" | "type" | "accessToken">

type EditKvStoreInput = Partial<Pick<KvStore, "name" | "url" | "type">> & { accessToken: KvStore["accessToken"] }

type TestKvStoreParams = Pick<KvStore, "url" | "type" | "accessToken">

type BrowseRouteOptions = import("@denokv-gui-client/bridge-server").BrowsingOptions

type BrowsingParams = {
    prefix: string;
    start: string;
    end: string;
    limit: BrowseRouteOptions["limit"];
    cursors: NonNullable<BrowseRouteOptions["cursor"]>[];
    nextCursorIndex: number;
}

type SerializedKvKey = import("@denokv-gui-client/bridge-server").SerializedKvKey

type SetKeyOptions = import("@denokv-gui-client/bridge-server").SetKeyOptions

type SerializedKvValue = import("@denokv-gui-client/bridge-server").SerializedKvValue

type SerializedKvEntry = import("@denokv-gui-client/bridge-server").SerializedKvEntry

type KvEntry = SerializedKvEntry