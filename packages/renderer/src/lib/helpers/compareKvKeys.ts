export function sameKvKeys(key1: SerializedKvKey, key2: SerializedKvKey) {
    if (key1.length != key2.length) {
        return false
    }

    return key1.every((part, i) => {
        if (typeof part == "object" && typeof key2[i] == "object") {
            return part.type == key2[i].type && part.value == key2[i].value
        }
        return key2[i] === part
    })
}