import type { Kv, KvKey, KvListOptions, KvListSelector } from "@deno/kv";
import {
    deserializeKvKey,
    deserializeKvValue,
    type SerializedKvValue
} from "../serialization/main.ts";
import { isValidKvKey, toNumber } from "../helpers";

const errorCause = { cause: "ValidationError" }

type ValidBrowseRequestParams = {
    listSelector: KvListSelector;
    options?: KvListOptions;
}
/**
 * Parse and validate query parameters of `/browse` endpoint.
 *
 * - `prefix`, `start`, and `end` selectors: parsed using `deserializeKvKey`.
 * - `limit` and `batchSize`: optional positive integers.
 * - `consistency`, `cursor`: passed through as-is.
 * - `reverse`: boolean flag. (set to "true" for `true`, otherwise `false`).
 *
 * Throws an Error with cause "ValidationError" on invalid inputs.
 *
 * @param url URL containing the query parameters to validate
 * @returns An object containing the validated query parameters
 */
export function validateBrowseRequestParams(url: URL): ValidBrowseRequestParams {
    const limitOption = url.searchParams.get("limit");
    const batchSizeOption = url.searchParams.get("batchSize");
    const consistency = url.searchParams.get("consistency")?.toString() as KvListOptions["consistency"];
    const reverseOption = url.searchParams.get("reverse");
    const cursor = url.searchParams.get("cursor")?.toString();

    const defaultLimit = 40;
    const limit = limitOption ? toNumber(limitOption) : defaultLimit;
    if (limitOption && (limit === undefined || limit <= 0)) {
        throw new Error(`Invalid limit option: must be positive integer. Got: ${limitOption}`, errorCause);
    }

    const batchSize = batchSizeOption ? toNumber(batchSizeOption) : undefined;
    if (batchSizeOption && (batchSize === undefined || batchSize <= 0)) {
        throw new Error(`Invalid batchSize option: must be positive integer. Got: ${batchSizeOption}`, errorCause);
    }

    const options: ValidBrowseRequestParams["options"] = {
        cursor,
        limit,
        batchSize,
        consistency,
        reverse: reverseOption === "true",
    };

    const listSelector = {} as ValidBrowseRequestParams["listSelector"];

    const prefixOption = url.searchParams.get("prefix")
    const prefix = prefixOption ? deserializeKvKey(prefixOption, { allowEmptyKey: true }) : undefined;
    if (prefix) {
        Object.assign(listSelector, { prefix })
    }

    const startOption = url.searchParams.get("start")
    const start = startOption ? deserializeKvKey(startOption) : undefined;
    if (start) {
        Object.assign(listSelector, { start })
    }

    const endOption = url.searchParams.get("end")
    const end = endOption ? deserializeKvKey(endOption) : undefined;
    if (end) {
        Object.assign(listSelector, { end })
    }

    if (Object.keys(listSelector).length == 0) {
        Object.assign(listSelector, { prefix: [] })
    }

    return {
        listSelector,
        options,
    };
}

type ValidSetRequestParams = {
    key: KvKey;
    expires?: number;
}
/**
 * Parse and validate query parameters of `/set` endpoint which are:
 *
 * - `key`: required parameter (will be parsed using `deserializeKvKey`)
 * - `expires`: optional parameter which must be a number in milliseconds when provided.
 *
 * Throws an Error with cause "ValidationError" on invalid inputs.
 *
 * @param url URL containing the query parameters to validate
 * @returns An object containing the validated key and optional expiration
 */
export function validateSetRequestParams(url: URL): ValidSetRequestParams {
    const targetKey = url.searchParams.get("key")
    const key = targetKey ? deserializeKvKey(targetKey) : undefined;

    if (!key) {
        throw new Error("No target key to set.", errorCause);
    }

    const expiresOption = url.searchParams.get("expires");

    const expires = expiresOption ? Number(expiresOption) : undefined;
    if (expiresOption && isNaN(expires!)) {
        throw new Error(
            `Invalid expiration time option: It must be a number in milliseconds. Got: ${expiresOption}`,
            errorCause
        );
    }

    return { key, expires };
}

export type EnqueueRequestInput = {
    value: unknown,
    options?: {
        backoffSchedule?: number[],
        delay?: number,
        keysIfUndelivered?: string,
    }
}

type ValidEnqueueRequestBody = {
    value: unknown,
    options?: {
        backoffSchedule?: number[],
        delay?: number,
        keysIfUndelivered?: KvKey[],
    }
}

function validateEnqueueOptions(options: unknown): ValidEnqueueRequestBody["options"] | undefined {
    if (!options) return;

    if (!(options instanceof Object)) {
        throw new Error("'options' of 'enqueue' operation should be an object when set");
    }

    const ops: ValidEnqueueRequestBody["options"] = {}

    if ("backoffSchedule" in options) {
        if (!(options.backoffSchedule instanceof Array)) {
            throw new Error("'backoffSchedule' option of 'enqueue' operation should be an array of numbers");
        }

        ops.backoffSchedule = options.backoffSchedule
    }

    if ("delay" in options) {
        if (typeof options.delay != "number") {
            throw new Error("'delay' option of 'enqueue' operation should be a number");
        }

        ops.delay = options.delay
    }

    if ("keysIfUndelivered" in options) {
        let parsedKeysIfUndeliveredOption = null
        try { parsedKeysIfUndeliveredOption = eval(String(options.keysIfUndelivered)) }
        catch { }

        if (!(parsedKeysIfUndeliveredOption instanceof Array)) {
            throw new Error(
                "'keysIfUndelivered' option of 'enqueue' operation should be an array of valid Kv Keys in the serialized form as string"
            );
        }

        if (parsedKeysIfUndeliveredOption.every(isValidKvKey)) {
            ops.keysIfUndelivered = parsedKeysIfUndeliveredOption
        } else {
            throw new Error(
                "'keysIfUndelivered' option of 'enqueue' operation contains at least one invalid Kv Key"
            );
        }
    }

    return ops
}

/**
 * Parse and validate the body of `/enqueue` endpoint which should be an object containing:
 *
 * - `value`: The actual value to enqueue. Should be in `SerializedKvValue` type (will be deserialized by `deserializeKvValue` fn)
 * - `options`: An optional object containing the following optional properties:
 *   - `backoffSchedule`: An optional array of numbers representing the backoff schedule in milliseconds
 *   - `delay`: An optional number representing the delay in milliseconds
 *   - `keysIfUndelivered`: An optional array of keys to be used if the message is undelivered
 *
 * Throws an Error with cause "ValidationError" on invalid inputs.
 *
 * @param body The request body containing the value to enqueue and optional options
 * @param kv The Deno KV instance
 * @returns An object containing the validated value and optional options
 */
export async function validateEnqueueRequest(body: unknown, kv: Deno.Kv | Kv): Promise<ValidEnqueueRequestBody> {
    if (!(body instanceof Object)) {
        throw new Error("Invalid enqueue request body", errorCause);
    }

    if (!("value" in body)) {
        throw new Error("Invalid enqueue request body: must have a value", errorCause);
    }

    return {
        value: await deserializeKvValue(body.value, kv),
        options: "options" in body ? validateEnqueueOptions(body.options) : undefined,
    }
}
