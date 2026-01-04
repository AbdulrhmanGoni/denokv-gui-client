import type { Kv, KvKey, KvListOptions, KvListSelector } from "@deno/kv";
import { deserializeKvKey } from "../serialization/main.ts";
import { toNumber } from "../helpers";

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

type ValidateSetRequestParams = {
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
 * @param url URL containing the query parameters validate
 * @returns An object containing the validated key and optional expiration
 */
export function validateSetRequestParams(url: URL): ValidateSetRequestParams {
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
