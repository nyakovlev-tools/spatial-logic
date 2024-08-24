export type Path = Array<string>

export default class Tree<T> {
    root?: Tree<T>
    parent?: Tree<T>
    path: Path
    keys: Map<string, Tree<T>>
    value?: T
    assigned?: boolean

    constructor(props?: { parent?: Tree<T>, key?: string }) {
        this.root = props?.parent ? props.parent.root : this;
        this.parent = props?.parent;
        this.path = props?.parent ? [...props.parent.path, props.key!] : [];
        this.keys = new Map();
    }

    create(key: string) {
        return new Tree({ parent: this, key });
    }

    assign(value: T) {
        this.value = value;
        this.assigned = true;
    }

    map<MT>(f: (value: T) => MT): Array<MT> {
        return Array.from(this.keys.values()).reduce(
            (agg, subTree) => [...agg, ...subTree.map(f)],
            this.assigned ? [f(this.value!)] : []
        )
    }

    scope(path: Path, active?: boolean) {
        let tree: Tree<T> = this;
        while (path.length) {
            let key = path[0];
            // TODO: handle filters
            let subTree = tree.keys.get(key);
            if (!subTree) {
                if (!active) return;
                subTree = this.create(key);
                tree.keys.set(key, subTree);
            }
            tree = subTree;
            path = path.slice(1)
        }
        return tree;
    }

    unscope(path: Path) {
        let target: Tree<T> = this;
        for (let key of path) {
            if (typeof(key) == 'string') {
                if (target.path[target.path.length - 1] != key) throw `tried to unscope ${key} at ${target.path[target.path.length - 1]}`;
                target = target.parent!;
            } else {
                // TODO: handle filters
            }
        }
        return target;
    }

    pop() {
        return this.parent!.keys.delete(this.path.slice(-1)[0])
    }
}
