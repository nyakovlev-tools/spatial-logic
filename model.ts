export type IPath = Array<string>;
export type IFlow = {
    key: string
    vector: IVector
}
export type IHop = {};

export type ITree<T> = {
    root?: ITree<T>
    parent?: ITree<T>
    path: IPath
    keys: Map<string, ITree<T>>
    value?: T
    assigned?: boolean
    create: (key: string) => ITree<T>
    assign: (value: T) => any
    map: (f: (value: T) => any) => Array<ReturnType<typeof f>>
    scope: (path: IPath, active?: boolean) => ITree<T> | undefined
    unscope: (path: IPath) => ITree<T>
};

export function Tree<T>(props?: { parent?: ITree<T>, key?: string, value?: T }) {
    const self: ITree<T> = {
        value: props?.value,
        parent: props?.parent,
        path: (props?.parent && props.key) ? [...props.parent.path, props.key] : [],
        keys: new Map(),
        create: key => Tree({ parent: self, key }),
        assign: value => {
            self.value = value;
            self.assigned = true;
        },
        map: f => Array.from(self.keys.values()).reduce(
            (agg, subTree) => [...agg, ...subTree.map(f)],
            (self.assigned && self.value) ? [f(self.value)] : []
        ),
        scope: (path, active) => {
            let tree = self;
            while (path.length) {
                let key = path[0];
                // TODO: handle filters
                let subTree = tree.keys.get(key);
                if (!subTree) {
                    if (!active) return;
                    subTree = self.create(key);
                    tree.keys.set(key, subTree);
                }
                tree = subTree;
                path = path.slice(1)
            }
            return tree;
        },
        unscope: path => {
            let target = self;
            for (let key of path) {
                if (typeof(key) == 'string') {
                    if (target.path[target.path.length - 1] != key) throw `tried to unscope ${key} at ${target.path[target.path.length - 1]}`;
                    target = target.parent!;
                } else {
                    // TODO: handle filters
                }
            }
            return target;
        },
    };
    self.root = props?.parent ? props.parent.root : self;
    return self;
}

export type IVector = {
    base: {[key: string]: ISpace}
    tip: {[key: string]: ISpace}
    forward: (props: {[key: string]: ISpace}) => Array<{[key: string]: ISpace}>
    back: (props: {[key: string]: ISpace}) => Array<{[key: string]: ISpace}>
    apply: (props: {[key: string]: IInstance}) => any
};

export type ISpace = {
    tree?: ITree<ISpace>
    ingress: Array<IFlow>
    egress: Array<IFlow>
    inverse?: ITree<Array<ISpace>>
    from: IRouter,
    towards: IRouter,
    scope: (...path: IPath) => ISpace
    unscope: (...path: IPath) => ISpace
    supersets: () => Array<ISpace>
    subsets: () => Array<ISpace>
    contains: (space: ISpace) => boolean
    within: (space: ISpace) => boolean
    instance<T = any>(): IInstance<T>
    vector: (vector: IVector) => any
    next_hop: (target: ISpace) => IHop
};

export function Space(props?: { tree?: ITree<ISpace> }) {
    const self: ISpace = {
        tree: props?.tree,
        ingress: [],
        egress: [],
        from: Router(s => {
            s.supersets().map(ss => ss.egress.map(egress => {
                // TODO: support multiple keys from different roots - and add new permutations as you go.
                let outputs = egress.vector.forward({[egress.key]: self});
            }))
        }),
        towards: Router(s => {
            s.subsets().map(ss => ss.ingress.map(ingress => {
                // TODO: support multiple keys from different roots - and add new permutations as you go.
                let deps = ingress.vector.back({[ingress.key]: self});
            }))
        }),
        scope: (...path) => {
            let tree = self.tree!.scope(path, true);
            let space = tree!.value;
            if (!space) {
                space = Space({ tree });
                tree!.value = space;
            }
            if (!space.inverse) {
                space.inverse = self.tree!.root!.value!.inverse;
                let inverse = space.inverse!.scope(tree!.path, true);
                if (!inverse!.value) inverse!.value = [];
                inverse!.value.push(space);
            }
            return space;
        },
        unscope: (...path) => self.tree?.unscope(path).value!,
        supersets() {
            let root = self.tree!.root!.value!;
            let supersets: Array<ISpace> = [root];
            for (let key of self.tree!.path) {
                if (typeof(key) == 'string') {
                    supersets = supersets
                        .filter(ss => ss.tree!.keys.has(key))
                        .map(ss => ss.tree!.keys.get(key)?.value)
                        .concat(root)
                        .filter((v, i, a) => a.indexOf(v) == i)
                        .filter(v => v != undefined);
                } else {
                    // TODO: handle filters
                }
            }
            return supersets;
        },
        subsets() {
            let agg: (inv: ITree<Array<ISpace>>) => Array<ISpace> = inv => [
                ...(inv.value || []),
                ...Array.from(inv.keys.values())
                    .map(agg)
                    .reduce((flat, spaces) => [...flat, ...spaces], [])
            ];
            return self.inverse ? agg(self.inverse) : [];
        },
        contains: space => {
            for (let i=0; i<self.tree!.path.length; i++) {
                let key = self.tree!.path[self.tree!.path.length - i];
                let subKey = space.tree!.path[space.tree!.path.length - i];
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
        vector(vector) {
            for (let [key, space] of Object.entries(vector.base)) space.egress.push({ vector, key });
            for (let [key, space] of Object.entries(vector.tip)) space.ingress.push({ vector, key });
        },
        next_hop: target => {
            return {};
            //  for each visited node, go through "visited edge" of opposite end and exit if visited point fits into edge.
            //  "visited edge" is essentially all visited nodes (in order of visit), but you can ignore nodes once you visit something after it (since those will always be closer)
            // TODO: once there is no more target, establish way to determine context name of final handle (probably using the same mechanism as the entity remapper)
        },
    };
    if (!props?.tree) {
        self.tree = Tree({ value: self });
        self.inverse = Tree();
    }
    return self;
}

export type IRouter = {
    edge: Array<ISpace>
    pending: ITree<ISpace>
    visited: ITree<ISpace>
    cost: ITree<number>
    periphery: Array<ISpace>
    step: () => any
};

export function Router(expand: (s: ISpace) => any) {
    const self: IRouter = {
        edge: [],
        pending: Tree({}),
        cost: Tree({}),
        visited: Tree({}),
        periphery: [],  // A list of visited nodes - by appending upon visit, this list will be sorted by closeness. It is used for initial intersection lookup. 
        step() {
            // let nextEdge = [];
            // let nextSpace;
            // let nextCost;
            // self.pending.forEach(s => {
            //     let c = self.cost.lookup(s.path);
            //     if (!nextSpace || c < nextCost) {
            //         nextSpace = s;
            //         nextCost = c;
            //     }
            // });
            // // let {space, distance} = self.edge.reduce((h1, h2) => h1.distance < h2.distance ? h1 : h2);
            // for (let s of self.edge) {  // TODO: replace this with picking the closest next edge, tehn adding it to periphery and whatnot
            //     let supersets = self.supersets();
            //     if (!supersets.length) {
            //         nextEdge.push(s);
            //         continue;
            //     }
            //     for (let ss of supersets) {
            //         for (let egress of ss.egress) {
            //             // TODO: support multiple keys from different roots - and add new permutations as you go.
            //             let outputs = egress.vector.forward({[egress.key]: self});
            //             console.log(outputs[0].o.path);
            //         }
            //     }
            // }
        },
    };
    return self;
}

export type IInstance<T = any> = {
    space: ISpace
    assigned?: boolean
    value?: T
    assign: (value: T) => any
    scope<SubT>(...path: IPath): IInstance<SubT>
    resolve: (f: (value: T) => any) => any
};

export function Instance<T>(space: ISpace) {
    const self: IInstance<T> = {
        space,
        assign: value => {
            self.value = value;
            self.assigned = true;
        },
        scope: (...path) => Instance(space.scope(...path)),
        resolve(handler) {
            // handler("<TBD>");
            let state = self.space.tree!.root!.value!;
            let depth = 0;
            state.next_hop(self.space);
            // while (1) {
            //     let hop = state.next_hop(self.space);
            //     if (!hop) break;
            //     // TODO: perform hop
            //     depth++;
            // }
            console.log("Routing depth:", depth);
        },
        // bind(handler) {},  // live resolver (waiting for resolve() functionality and subscriber-based implementation of rest of logic)
    };
    return self;
}
