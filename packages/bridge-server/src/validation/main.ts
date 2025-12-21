import type { KvKey, KvListSelector } from "@deno/kv";
import { deserializeKvKey } from "../serialization/main.ts";

const errorCause = { cause: "ValidationError" }

type ValidBrowseRequestParams = {
    limit?: number;
    listSelector: KvListSelector;
    cursor?: string;
}
/**
 * Parse and validate query parameters of `/browse` endpoint.
 *
 * - `prefix`, `start`, and `end` parameters which will be parsed using `deserializeKvKey`.
 * - `limit` optional parameter must be a positive integer when provided.
 * - `cursor` is passed through as-is when present.
 *
 * Throws an Error with cause "ValidationError" on invalid inputs.
 *
 * @param url URL containing the query parameters to validate
 * @returns An object containing the validated query parameters
 */
export function validateBrowseRequestParams(url: URL): ValidBrowseRequestParams {
    const limitOption = url.searchParams.get("limit")?.toString();
    let limit: number | undefined = undefined;
    if (limitOption) {
        limit = Number(limitOption);
        if (isNaN(limit) || limit <= 0) {
            throw new Error(`Invalid limit option: must be positive integer. Got: ${limitOption}`);
        }
    }

    const cursor = url.searchParams.get("cursor") ?? undefined;

    const listSelector = {} as KvListSelector

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
        limit,
        listSelector,
        cursor,
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
