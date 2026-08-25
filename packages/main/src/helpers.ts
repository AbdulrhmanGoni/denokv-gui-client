import type { TrycatchResult } from "./types.ts";

export function isGreaterVersion(a: string, b: string) {
  const v1 = a.split(".").map(Number);
  const v2 = b.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    if (v1[i] > v2[i]) return true;
    if (v1[i] < v2[i]) return false;
  }

  return false;
}

export async function asyncTrycatch<T>(fn: () => Promise<T>): Promise<TrycatchResult<T>> {
  try {
    const result = (await fn()) as T;
    return {
      result,
      error: null,
    };
  } catch (error) {
    return {
      result: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function syncTrycatch<T>(fn: () => T): TrycatchResult<T> {
  try {
    const result = fn() as T;
    return {
      result,
      error: null,
    };
  } catch (error) {
    return {
      result: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
