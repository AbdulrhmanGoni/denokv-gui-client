type CreateKvStoreInput = Pick<KvStore, "name" | "url" | "type" | "accessToken">

type EditKvStoreInput = Partial<Pick<KvStore, "name" | "url" | "type">>

type TestKvStoreParams = Pick<KvStore, "url" | "type" | "accessToken">
