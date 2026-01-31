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