import { Slot } from "./Slot"

export type Path = Array<string>

export class Tree<T> {
    root: Tree<T>
    parent?: Tree<T>
    path: Path
    keys: Map<string, Tree<T>>
    size: number
    private slot: Slot<T>

    constructor(props?: { parent?: Tree<T>, path?: Path }) {
        this.root = props?.parent ? props.parent.root : this;
        this.parent = props?.parent;
        this.path = props?.path || [];
        this.keys = new Map();
        this.size = 0;
        this.slot = new Slot()
    }

    assign(value: T) {
        if (!this.slot.assigned) {
            let tree: Tree<T> | undefined = this;
            while (tree) {
                tree.size++;
                tree = tree.parent;
            }
        }
        this.slot.assign(value)
    }

    clear() {
        if (this.slot.assigned()) {
            let tree: Tree<T> | undefined = this;
            while (tree) {
                tree.size--;
                tree = tree.parent;
            }
        }
        this.slot.clear();
        if (!this.keys.size) this.parent?.keys.delete(this.path.slice(-1)[0]);
    }

    current() {
        return this.slot.current();
    }

    assigned() {
        return this.slot.assigned();
    }

    create(key: string): Tree<T> {
        return new Tree({ parent: this, path: [...this.path, key] });
    }

    map<MT>(f: (value: T) => MT): Array<MT> {
        return Array.from(this.keys.values()).reduce(
            (agg, subTree) => [...agg, ...subTree.map(f)],
            this.slot.assigned() ? [f(this.slot.current()!)] : []
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

    contains(tree: Tree<T>) {
        for (let i=0; i<this.path.length; i++) {
            let key = this.path[this.path.length - i];
            let subKey = tree.path[tree.path.length - i];
            if (typeof(key) == 'string') {
                if (key != subKey) return false;
            } else {
                // TODO: handle filters
            }
        }
        return true;
    }

    within(tree: Tree<T>) {
        return tree.contains(this);
    }

    supersets() {
        let supersets: Array<Tree<T>> = [this.root];
        for (let key of this.path) {
            if (typeof(key) == 'string') {
                supersets = supersets
                    .filter(ss => ss.keys.has(key))
                    .map(ss => ss.keys.get(key))
                    .concat(this.root)
                    .filter(v => v != undefined);
            } else {
                // TODO: handle filters
            }
        }
        return supersets
            .filter(ss => ss.slot.assigned)
            .map(ss => ss.slot.current()!);
            // .filter((v, i, a) => a.indexOf(v) == i)
    }
}
