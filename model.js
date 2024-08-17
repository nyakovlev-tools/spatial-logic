export function Space(root=null, parent=null, base=[], prototype=null) {
    const self = {
        root,
        path: base,
        keys: new Map(),
        inverse: null,
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
            if (!target.inverse) {
                target.inverse = self.root.inverse;
                for (let key of target.path.reverse()) {
                    if (typeof(key) == 'string') {
                        if (!target.inverse.keys.has(key)) target.inverse.keys.set(key, {
                            keys: new Map(),
                            spaces: []
                        });
                        target.inverse = target.inverse.keys.get(key);
                    } else {
                        // TODO: handle filters
                    }
                }
                if (!target.inverse.spaces.includes(target)) target.inverse.spaces.push(target);
            }
            return target;
        },
        parent,
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
            let inverse = self.root.inverse;
            for (let key of self.path.reverse()) {
                if (typeof(key) == 'string') {
                    inverse = inverse.keys.get(key);
                } else {
                    // TODO: handle filters
                }
            }
            let agg;
            return (agg = inv => [
                ...inv.spaces,
                ...Array.from(inv.keys.values())
                    .map(agg)
                    .reduce((flat, spaces) => [...flat, ...spaces], [])
            ])(inverse);
        },
        egress: [],
        ingress: [],
        vector(vector) {
            for (let [key, space] of Object.entries(vector.base)) space.egress.push({ vector, key });
            for (let [key, space] of Object.entries(vector.tip)) space.ingress.push({ vector, key });
        },
        prototype,
        instance: () => Instance(self),
    };
    if (!self.root) {
        self.root = self;
        self.inverse = {
            keys: new Map(),
            spaces: []
        };
    }
    return self;
}

export function Instance (space) {
    const self = {
        space,
        assigned: false,
        value: null,
        // TODO: probably add a scoping function that says "a scoped entity of this same instance".
        //  (may need some kind of entity identifier)
        //  (or, always pass inputs to outputs, and only mutate during transform)
        assign(value) {
            self.value = value;
            self.assigned = true;
        },
        scope: (...path) => Instance(space.scope(...path)),
        resolve(handler) {
            // handler("<TBD>");
            console.log("-- supersets --");
            for (let ss of self.space.root.supersets()) console.log(ss.path);
            console.log("-- subsets --");
            let sss = self.space.subsets();
            for (let ss of sss) {
                console.log(ss.path, sss.indexOf(ss));
            }
            // TODO: walk forward with supersets, and walk back with subsets.
            //  for each visited node, go through "visited edge" of opposite end and exit if visited point fits into edge.
            //  "visited edge" is essentially all visited nodes (in order of visit), but you can ignore nodes once you visit something after it (since those will always be closer)
        },
        bind(handler) {},
    };
    return self;
}
