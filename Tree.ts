export type Segment = string;
export type Path = Array<Segment>;

export type TreeProps = {
    tree?: TreeType,
    key?: Segment,
    init?: (self: TreeType) => TreeType
}

export type TreeType = {
    root?: TreeType
    parent?: TreeType
    path: Path
    keys: Map<string, TreeType>
    init<T>(self: TreeType, props?: TreeProps): TreeType
}

export const Tree = {
    init(self: {}, props?: TreeProps): TreeType {
        let _self: TreeType = {
            ...self,
            root: props?.tree?.root,
            parent: props?.tree,
            path: [
                ...(props!.tree!.path ?? []),
                ...(props?.key ?? []),
            ],
            keys: new Map(),
            init: props?.init || Tree.init,
        };
        if (!_self.root) _self.root = _self;
        return _self;
    },
    create(self: TreeType, key: string): TreeType {
        return self.init(self, { tree: self, key, init: self.init });
    },
    scope<Self extends TreeType = TreeType>(self: Self, path: Path, active?: boolean) {
        let tree: Self = self;
        while (path.length) {
            let key = path[0];
            // TODO: handle filters
            let subTree = tree.keys.get(key);
            if (!subTree) {
                if (!active) return;
                subTree = Tree.create(self, key);
                tree.keys.set(key, subTree);
            }
            tree = subTree as Self;
            path = path.slice(1)
        }
        return tree;
    },
    unscope<Self extends TreeType = TreeType>(self: Self, path: Path) {
        let target: Self = self;
        for (let key of path) {
            if (typeof(key) == 'string') {
                if (target.path[target.path.length - 1] != key) throw `tried to unscope ${key} at ${target.path[target.path.length - 1]}`;
                target = target.parent! as Self;
            } else {
                // TODO: handle filters
            }
        }
        return target;
    },
    contains(self: TreeType, tree: TreeType) {
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
    within(self: TreeType, tree: TreeType) {
        return Tree.contains(tree, self);
    },
}
