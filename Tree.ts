import { Slot, SlotType } from "./Slot"

export type Segment = string;
export type Path = Array<Segment>;

export type TreeProps<T> = {
    tree?: TreeType<T>,
    key?: Segment,
    init?: (self: TreeType<T>) => TreeType<T>
}

export type TreeType<T> = SlotType<T> & {
    root?: TreeType<T>
    parent?: TreeType<T>
    path: Path
    keys: Map<string, TreeType<T>>
    size: number
    init<T>(self: TreeType<T>, props?: TreeProps<T>): TreeType<T>
}

export const Tree = {
    init<T>(self: {}, props?: TreeProps<T>): TreeType<T> {
        let _self: TreeType<T> = {
            ...Slot.init(self),
            root: props?.tree?.root,
            parent: props?.tree,
            path: [
                ...(props!.tree!.path ?? []),
                ...(props?.key ?? []),
            ],
            keys: new Map(),
            size: 0,
            init: props?.init || Tree.init,
        };
        if (!_self.root) _self.root = _self;
        return _self;
    },
    assign<T>(self: TreeType<T>, value: T) {
        if (!self.assigned) {
            let tree: TreeType<T> | undefined = self;
            while (tree) {
                tree.size++;
                tree = tree.parent;
            }
        }
        Slot.assign(self, value);
    },
    clear<T>(self: TreeType<T>) {
        if (self.assigned) {
            let tree: TreeType<T> | undefined = self;
            while (tree) {
                tree.size--;
                tree = tree.parent;
            }
        }
        Slot.clear(self);
        if (!self.keys.size) self.parent?.keys.delete(self.path.slice(-1)[0]);
    },
    create<T>(self: TreeType<T>, key: string): TreeType<T> {
        return self.init(self, { tree: self, key, init: self.init });
    },
    map<T, MT>(self: TreeType<T>, f: (value: T) => MT): Array<MT> {
        return Array.from(self.keys.values()).reduce(
            (agg, subTree) => [...agg, ...Tree.map(subTree, f)],
            self.assigned ? [f(self.value!)] : []
        )
    },
    scope<T>(self: TreeType<T>, path: Path, active?: boolean) {
        let tree: TreeType<T> = self;
        while (path.length) {
            let key = path[0];
            // TODO: handle filters
            let subTree = tree.keys.get(key);
            if (!subTree) {
                if (!active) return;
                subTree = Tree.create(self, key);
                tree.keys.set(key, subTree);
            }
            tree = subTree;
            path = path.slice(1)
        }
        return tree;
    },
    unscope<T>(self: TreeType<T>, path: Path) {
        let target: TreeType<T> = self;
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
    contains<T>(self: TreeType<T>, tree: TreeType<T>) {
        for (let i=0; i<self.path.length; i++) {
            let key = self.path[self.path.length - i];
            let subKey = tree.path[tree.path.length - i];
            if (typeof(key) == 'string') {
                if (key != subKey) return false;
            } else {
                // TODO: handle filters
            }
        }
        return true;
    },
    within<T>(self: TreeType<T>, tree: TreeType<T>) {
        return Tree.contains(tree, self);
    },
}
