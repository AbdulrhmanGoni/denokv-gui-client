type KvStore = {
    id: string,
    name: string,
    url: string,
    type: "local" | "remote" | "bridge" | "default",
    accessToken: string | null,
    createdAt: string,
    updatedAt: string,
}
