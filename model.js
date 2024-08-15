export default function Space(root=null, parent=null, base=[], prototype=null) {
    const self = {
        // not sure yet if these will be explicit params, or a computed result of more concrete fields.
        root,
        path: base,
        keys: new Map(),
        // aggregate,
        scope(...path) {
            let target = self;
            for (let key of path) {
                if (typeof(key) == 'string') {
                    if (!self.keys.has(key)) self.keys.set(key, Space(self.root, self, [...target.path, key]));
                    target = self.keys.get(key);
                } else {
                    // TODO: handle filters
                }
            }
            return target;
        },
        parent: null,
        unscope(...path) {
            // TODO: throw err if path mismatch
            return self.parent;
        },
        supersets() {
            let supersets = [self.root];
            for (let key of self.path) {
                if (typeof(key) == 'string') {
                    supersets = supersets
                        .filter(ss => ss.keys.has(key))
                        .map(ss => ss.keys.get(key))
                        .concat(self.root)
                        .filter((v, i, a) => a.indexOf(v) == i);
                } else {
                    // TODO: handle filters
                }
            }
            return supersets;
        },
        subsets() {
            // TODO: retrieve Space objects contained by this one. Used when walking vectors BACK.
        },
        egress: [],
        ingress: [],
        vector(vector) {
            for (let [key, space] of Object.entries(vector.base)) space.egress.push({ vector, key });
            for (let [key, space] of Object.entries(vector.tip)) space.ingress.push({ vector, key });
        },
        prototype,
        instance: () => Space(self.root, self.parent, self.path, self),
        assigned: false,
        value: null,
        assign(value) {
            self.value = value;
            self.assigned = true;
        },
        resolve(handler) {
            // handler("<TBD>");
            let ss = self.supersets();
            console.log("SUPERSETS:", ss);
        },
        bind(handler) {},
    };
    if (!self.root) self.root = self;
    return self;
}
