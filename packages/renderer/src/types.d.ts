type KvValueCodeEditor = (import("codejar").CodeJar & { toKvValue: () => KvEntry["value"] })
type KvKeyCodeEditor = import("codejar").CodeJar