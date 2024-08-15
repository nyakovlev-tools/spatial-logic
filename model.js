export default function Space(root=null, prototype=null) {
    const _ = {
        // not sure yet if these will be explicit params, or a computed result of more concrete fields.
        // contains: new Map(),
        // within: new Map(),
        root,
        keys: new Map(),
        // aggregate,
        scope(...path) {
            for (let key of path) {
                if (typeof(key) == 'string') {
                    if (!_.root.keys.has(key)) _.root.keys.set(key, Space(_.root));
                    // TODO: snowball each key into an aggregator as you scope down, since they technically overlap (replacing above line?)
                }
            }
            // return Space([...base, ...path], dimensions);
            return Space();
        },
        parent: null,
        unscope(...path) {
            // TODO: throw err if path mismatch
            return _.parent;
        },
        egress: [],
        ingress: [],
        vector(vector) {
            for (let [key, space] of Object.entries(vector.base)) space.egress.push({ vector, key });
            for (let [key, space] of Object.entries(vector.tip)) space.ingress.push({ vector, key });
        },
        prototype,
        instance: () => Space(_.root, _),
        assigned: false,
        value: null,
        assign(value) {
            _.value = value;
            _.assigned = true;
        },
        resolve(handler) {
            // handler("<TBD>");
        },
        bind(handler) {},
    };
    if (!_.root) _.root = _;
    return _;
}
