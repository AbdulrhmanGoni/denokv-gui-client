import type { Kv, KvEntry, KvKey } from "@deno/kv";
import sJs from "serialize-javascript";
import { toNumber } from "../helpers";

function serializeJs(jsValue: any) {
    return sJs(jsValue, { ignoreFunction: true })
}

export type SerializedKvKey = (string | number | boolean | {
    type: string;
    value: string;
})[]

export type SerializedKvValue = {
    type: string;
    data: string | number | boolean;
}

export type SerializedKvEntry = {
    key: SerializedKvKey;
    value: SerializedKvValue;
    versionstamp: string;
}

const errorCause = { cause: "SerializationError" }

/**
 * Serialize a Deno Kv Key into a JSON-compatible array.
 *
 * Each key part is preserved if it is a primitive. Special values are wrapped:
 * - `Uint8Array` -> `{ type: "Uint8Array", value: "new Uint8Array([...])" }`
 * - `BigInt` -> `{ type: "BigInt", value: "..." }`
 * - non-finite numbers (`NaN`, `Infinity`, `-Infinity`) -> `{ type: "Number", value: "..." }`
 *
 * @param key Deno Kv Key to serialize
 * @returns A JSON-compatible representation of the Deno KV key
 */
export function serializeKvKey(key: KvKey): SerializedKvKey {
    return key.map((part) => {
        if (part instanceof Uint8Array) {
            return { type: "Uint8Array", value: serializeUint8Array(part) }
        }

        if (typeof part === "bigint") {
            return { type: "BigInt", value: part.toString() }
        }

        if (typeof part === "number") {
            if ([NaN, Infinity, -Infinity].includes(part)) {
                return { type: "Number", value: part.toString() }
            }
        }

        return part
    })
}

/**
 * Deserialize a JSON string into a Deno Kv Key.
 *
 * Throws an Error with cause "SerializationError" when the input is invalid.
 *
 * @param key JSON string representing a serialized Deno Kv Key
 * @param options Optional flags, e.g. `allowEmptyKey` to not throw an error for empty keys
 * @returns A Deno Kv Key that can be used with Deno KV APIs
 */
export function deserializeKvKey(key: string, options?: { allowEmptyKey?: boolean }): KvKey {
    let parsed: unknown;
    try {
        parsed = JSON.parse(key);
    } catch {
        throw new Error("Invalid JSON format for KvKey.", errorCause);
    }

    if (!Array.isArray(parsed)) {
        throw new Error("KvKey must be an array.", errorCause);
    }

    if (!options?.allowEmptyKey && !parsed.length) {
        throw new Error("KvKey must not be empty.", errorCause);
    }

    return parsed.map((part): string | number | bigint | boolean | Uint8Array => {
        if (
            typeof part === "string" ||
            typeof part === "number" ||
            typeof part === "boolean"
        ) {
            return part;
        }

        // Handle custom representation of Uint8Array, Infinity, NaN and BigInt
        if (typeof part == "object" && part !== null && (typeof part.value == "string" || typeof part.value == "number")) {
            if (part.type === "Number") {
                switch (part.value) {
                    case "Infinity": return Infinity;
                    case "-Infinity": return -Infinity;
                    case "NaN": return NaN;
                    default: {
                        const number = toNumber(String(part.value))
                        if (number != undefined) return number
                        throw new Error("Invalid Number value: " + part.value, errorCause);
                    }
                }
            }

            if (part.type === "Uint8Array") {
                const error = new Error("Invalid Uint8Array value: " + part.value, errorCause)
                try {
                    const uint8Array = eval(`(${part.value})`);
                    if (uint8Array instanceof Uint8Array) {
                        return uint8Array
                    } else {
                        throw error
                    }
                } catch {
                    throw error
                }
            }

            if (part.type === "BigInt") {
                try {
                    return BigInt(part.value)
                } catch {
                    throw new Error("Invalid BigInt value: " + part.value, errorCause);
                }
            }
        }

        throw new Error(
            "Invalid JSON representation for a KvKey part.\n" +
            "KvKey part must be String, Number, Boolean, " +
            'Custom number wrapped as { type: "Number", value: ("NaN", "Infinity" or "-Infinity") }, ' +
            'BigInt wrapped as { type: "BigInt", value: "..." }, ' +
            'or Uint8Array wrapped as { type: "Uint8Array", value: "new Uint8Array(...)" }.',
            errorCause
        );
    });
}

/**
 * Serializes a Deno Kv value into a JSON-compatible object.
 *
 * @param value any valid Deno Kv value to serialize
 * @returns A `{ type, data }` JSON object
 */
export function serializeKvValue(value: unknown): SerializedKvValue {
    switch (typeof value) {
        case "string": return { type: "String", data: value };
        case "number": {
            if (value == Infinity || value == -Infinity || isNaN(value)) {
                return { type: "Number", data: value.toString() }
            }
            return { type: "Number", data: value }
        };
        case "boolean": return { type: "Boolean", data: value };
        case "bigint": return { type: "BigInt", data: value.toString() };
        case "undefined": return { type: "Undefined", data: "undefined" };
        case "object": {
            if (value === null) {
                return { type: "Null", data: "null" }
            }

            if (/^_?KvU64$/.test(Object.getPrototypeOf(value).constructor.name)) {
                return {
                    type: "KvU64",
                    data: String((value as { value: bigint }).value)
                };
            }
        }
    }

    if (value instanceof Array) return { type: "Array", data: serializeJs(value) }

    if (value instanceof Date) return { type: "Date", data: value.toISOString() }

    if (value instanceof Map) return { type: "Map", data: serializeJs(value) }

    if (value instanceof Set) return { type: "Set", data: serializeJs(value) }

    if (value instanceof RegExp) {
        return {
            type: "RegExp",
            data: JSON.stringify({ source: value.source, flags: value.flags }),
        }
    }

    if (value instanceof Uint8Array) return { type: "Uint8Array", data: serializeUint8Array(value) }

    return { type: "Object", data: serializeJs(value) };
}

/**
 * Deserializes back a Kv Entry value serialized using `serializeKvValue` function
 *
 * Throws an Error with cause "SerializationError" when the type/data are invalid.
 *
 * @param body The serialized Kv Entry value using `serializeKvValue` function
 * @returns The deserialized Kv Entry value which can be added into Deno KV Databases
 */
export async function deserializeKvValue(body: Partial<SerializedKvValue>, kv: Kv | Deno.Kv): Promise<unknown> {
    if (!body?.type) {
        throw new Error("No data type provided for the value", errorCause);
    }

    if (body?.data === undefined) {
        throw new Error("No data provided for the value", errorCause);
    }

    switch (body.type) {
        case "Number": {
            if (typeof body.data == "number") return body.data

            const stringNumber = String(body.data)
            const number = toNumber(stringNumber)
            if (number != undefined) return number

            const specialNumbers: Record<string, number> = {
                "Infinity": Infinity,
                "-Infinity": -Infinity,
                "NaN": NaN,
            }

            if (specialNumbers[stringNumber] != undefined) {
                return specialNumbers[stringNumber]
            }

            throw new Error("Invalid Number received", errorCause);
        }

        case "String": {
            if (typeof body.data == "string") return body.data
            throw new Error("Invalid string received", errorCause);
        }

        case "Boolean": {
            if (typeof body.data == "boolean") return body.data
            if (body.data == "true") return true
            if (body.data == "false") return false

            throw new Error("Invalid boolean value received", errorCause);
        }

        case "BigInt": {
            const number = typeof body.data == "number" ? body.data : toNumber(String(body.data))
            if (number != undefined) return BigInt(number)

            throw new Error("Invalid BigInt received", errorCause);
        }

        case "KvU64": {
            const number = typeof body.data == "number" ? body.data : toNumber(String(body.data))
            if (number != undefined) {
                let errorMessage = ""
                try {
                    const randomKey = ["random", crypto.randomUUID()]
                    const result = await kv.atomic().sum(randomKey, BigInt(number)).commit()
                    if (result.ok) {
                        const u64Value = (await kv.get(randomKey)).value
                        kv.delete(randomKey)
                        return u64Value;
                    }
                } catch (error) {
                    errorMessage = (error as Error).message
                }

                throw new Error(
                    "Couldn't construct KvU64 value" + (errorMessage ? `: ${errorMessage}` : ""),
                    errorCause
                );
            }

            throw new Error("Invalid KvU64 number received", errorCause);
        }

        case "Date": {
            if (typeof body.data == "number" || typeof body.data == "string") {
                const date = new Date(body.data)
                if (String(date) != "Invalid Date") return date
            }
            throw new Error("Invalid Date received", errorCause);
        }

        case "Undefined": return undefined;

        case "Null": return null;

        case "RegExp": {
            try {
                const serilizedRegexp = JSON.parse(body.data.toString())
                if (typeof serilizedRegexp.source == "string" && typeof serilizedRegexp.flags == "string") {
                    return new RegExp(serilizedRegexp.source, serilizedRegexp.flags)
                }
            } catch { }

            throw new Error(
                'Invalid serilized RegExp received, it should be in the form {"source":"...", "flags": "..."}'
                , errorCause
            );
        }
    }

    const evaluatedData = eval(`(${body.data})`)

    switch (body.type) {
        case "Object": {
            if (evaluatedData instanceof Object) return evaluatedData
            throw new Error("Invalid Object received", errorCause);
        }

        case "Array": {
            if (evaluatedData instanceof Array) return evaluatedData
            throw new Error("Invalid Array received", errorCause);
        }

        case "Set": {
            if (evaluatedData instanceof Set) return evaluatedData
            throw new Error("Invalid Set received", errorCause);
        }

        case "Map": {
            if (evaluatedData instanceof Map) return evaluatedData
            throw new Error("Invalid Map received", errorCause);
        }

        case "Uint8Array": {
            if (evaluatedData instanceof Uint8Array) return evaluatedData
            throw new Error("Invalid Uint8Array received", errorCause);
        }

        default:
            throw new Error("Unsupported Data Type: " + body.type, errorCause);
    }
}

/**
 * Serializes an array of Deno KV entries to a JSON-compatible array.
 *
 * @param entries Array of Deno KV entries
 * @returns Array of serialized Deno KV entries
 */
export function serializeEntries(entries: KvEntry<unknown>[]): SerializedKvEntry[] {
    return entries.map<SerializedKvEntry>((entry) => {
        return {
            key: serializeKvKey(entry.key),
            value: serializeKvValue(entry.value),
            versionstamp: entry.versionstamp
        }
    })
}

function serializeUint8Array(uint8Array: Uint8Array) {
    return `new Uint8Array(${JSON.stringify(Array.from(uint8Array))})`
}