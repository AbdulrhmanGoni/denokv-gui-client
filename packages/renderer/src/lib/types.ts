import type { SerializedKvEntry } from "@app/bridge-server";
import type { CodeJar } from "codejar";

export type KvValueCodeEditor = CodeJar & {
  toKvValue: () => SerializedKvEntry["value"];
};

export type KvKeyCodeEditor = CodeJar;
