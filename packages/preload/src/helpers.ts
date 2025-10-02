export function isGreaterVersion(a: string, b: string) {
    const v1 = a.split('.').map(Number);
    const v2 = b.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
        if (v1[i] > v2[i]) return true;
        if (v1[i] < v2[i]) return false;
    }

    return false;
}