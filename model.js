export function Space(root=null, parent=null, base=[]) {
    const self = {
        root,
        path: base,
        keys: new Map(),
        inverse: null,
        scope(...path) {
            let target = self;
            for (let key of path) {
                if (typeof(key) == 'string') {
                    // TODO: replace path keys with delta(axis, filter) for predictable sizing; then, remove typechecking on self.path
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
            let target = self;
            for (let key of path) {
                if (typeof(key) == 'string') {
                    if (target.path[target.path.length - 1] != key) throw `tried to unscope ${key} at ${target.path[target.path.length - 1]}`;
                    target = target.parent;
                } else {
                    // TODO: handle filters
                }
            }
            return target;
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
            let agg;
            return (agg = inv => [
                ...inv.spaces,
                ...Array.from(inv.keys.values())
                    .map(agg)
                    .reduce((flat, spaces) => [...flat, ...spaces], [])
            ])(self.inverse);
        },
        contains(space) {
            for (let i=0; i<self.path.length; i++) {
                let key = self.path[self.path.length - i];
                let subKey = space.path[space.path.length - i];
                if (typeof(key) == 'string') {
                    if (key != subKey) return false;
                } else {
                    // TODO: handle filters
                }
            }
            return true;
        },
        within: space => space.contains(self),
        instance: () => Instance(self),
        egress: [],
        ingress: [],
        vector(vector) {
            for (let [key, space] of Object.entries(vector.base)) space.egress.push({ vector, key });
            for (let [key, space] of Object.entries(vector.tip)) space.ingress.push({ vector, key });
        },
        edge: [],  // TODO: build on this as you construct the routing table
        // NOTE: the below constructs both directions (walk forward and back) of the routing table.
        // NOTE: lookup is gonna be much more complicated with multiple entities, because entity roles will be a decisive part of the route.
        //  (when routing, possibly check chosen path before performing lookup, so that recalculation is only done when necessary?)
        from: {},  // TODO: figure out lookup structure of routing table
        towards: {},  // TODO: figure out lookup structure of routing table
        step_forward() {},
        step_back() {},
        next_hop(target) {
            // TODO: walk forward with supersets, and walk back with subsets.
            //  for each visited node, go through "visited edge" of opposite end and exit if visited point fits into edge.
            //  "visited edge" is essentially all visited nodes (in order of visit), but you can ignore nodes once you visit something after it (since those will always be closer)
            // TODO: once there is no more target, establish way to determine context name of final handle (probably using the same mechanism as the entity remapper)
        },
    };
    if (!self.root) {
        self.root = self;
        self.inverse = {
            keys: new Map(),
            spaces: []
        };
        self.edge.push(self);
    }
    return self;
}

export function Instance (space) {
    const self = {
        space,
        assigned: false,
        value: null,
        assign(value) {
            self.value = value;
            self.assigned = true;
        },
        scope: (...path) => Instance(space.scope(...path)),
        resolve(handler) {
            // handler("<TBD>");
            let state = self.space.root;
            let depth = 0;
            while (1) {
                let hop = state.next_hop(self.space);
                if (!hop) break;
                depth++;
            }
            console.log("Routing depth:", depth);
        },
        // bind(handler) {},  // live resolver (waiting for resolve() functionality and subscriber-based implementation of rest of logic)
    };
    return self;
}
