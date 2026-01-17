
export function copyEntryVersionStamp(entry: SerializedKvEntry) {
    navigator.clipboard.writeText(entry.versionstamp);
}

export function copyEntryKey(entry: SerializedKvEntry) {
    navigator.clipboard.writeText("[" +
        entry.key.map((keyPart) => {
            if (typeof keyPart == "string") return `"${keyPart}"`;
            if (typeof keyPart == "number" || typeof keyPart == "boolean") return keyPart;
            if (keyPart.type == "Number") return keyPart.value;
            if (keyPart.type == "BigInt") return String(keyPart.value + "n");
            if (keyPart.type == "Uint8Array") return `new Uint8Array(${keyPart.value})`;
            return String(keyPart)
        }).join(", ") + "]");
}

export function copyEntryValue(entry: SerializedKvEntry) {
    if (entry.value.type == "BigInt" || entry.value.type == "KvU64") {
        navigator.clipboard.writeText(String(entry.value.data + "n"));
        return;
    }

    if (entry.value.type == "Date") {
        navigator.clipboard.writeText(`new Date("${entry.value.data}")`);
        return;
    }

    if (entry.value.type == "RegExp") {
        const regExp = JSON.parse(String(entry.value.data))
        navigator.clipboard.writeText(`/${regExp.source}/${regExp.flags}`);
        return;
    }

    navigator.clipboard.writeText(String(entry.value.data));
}