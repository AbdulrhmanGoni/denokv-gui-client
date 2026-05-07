import type { SerializedKvKey } from "./serialization/main";

export function toNumber(value: string): number | undefined {
    if (!value.trim()) {
        return undefined;
    }

    const num = Number(value);
    return isNaN(num) ? undefined : num;
}

export function isValidKvKey(key: unknown): boolean {
    return Array.isArray(key) && key.every((keyPart) => (
        typeof keyPart == "bigint" || typeof keyPart == "string" ||
        typeof keyPart == "number" || typeof keyPart == "boolean"
        || keyPart instanceof Uint8Array
    ))
}

export function isSameKey(key1: SerializedKvKey, key2: SerializedKvKey): boolean {
    if (key1.length !== key2.length) {
        return false
    }

    return key1.every((part, i) => {
        if (typeof part === "object" && typeof key2[i] === "object") {
            return part.type === key2[i].type && part.value === key2[i].value
        }
        return key2[i] === part
    })
}