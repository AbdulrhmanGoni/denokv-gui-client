import vm from "node:vm";

export function toNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

export function evalWithTimeout(code: string, timeout = 5000): unknown {
  return structuredClone(
    vm.runInNewContext(
      code,
      {},
      {
        timeout,
        microtaskMode: "afterEvaluate",
      },
    ),
  );
}
