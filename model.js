// TODO: just replace this with array objects.
export function P({ path = [] } = {}) {
    return new Proxy({}, {
        // get: (t, key) => P({ path: [...path, key] }),
        get: (t, key) => P({ path: [] }),
        apply: (t, thisArg, []) => P({ path }),
    });
}
