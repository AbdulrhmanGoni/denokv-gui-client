type CreateKvStoreInput = Pick<KvStore, "name" | "url" | "type" | "accessToken">

type EditKvStoreInput = Partial<Pick<KvStore, "name" | "url" | "type">> & { accessToken: KvStore["accessToken"] }

type TestKvStoreParams = Pick<KvStore, "url" | "type" | "accessToken">

type BrowsingOptions = import("@denokv-gui-client/bridge-server").BrowsingOptions

type SerializedKvKey = import("@denokv-gui-client/bridge-server").SerializedKvKey

type SetKeyOptions = import("@denokv-gui-client/bridge-server").SetKeyOptions

type SerializedKvValue = import("@denokv-gui-client/bridge-server").SerializedKvValue

type SerializedKvEntry = import("@denokv-gui-client/bridge-server").SerializedKvEntry

type KvEntry = SerializedKvEntry