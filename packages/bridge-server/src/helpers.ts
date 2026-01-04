export function toNumber(value: string): number | undefined {
    if (!value.trim()) {
        return undefined;
    }

    const num = Number(value);
    return isNaN(num) ? undefined : num;
}