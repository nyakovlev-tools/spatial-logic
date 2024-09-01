import { Slot } from "./Slot"

export type Path = Array<string>

export class Tree<T> {
    private _root: Tree<T>
    private parent?: Tree<T>
    private _path: Path
    private keys: Map<string, Tree<T>>
    private _size: number
    private slot: Slot<T>

    constructor(props?: { parent?: Tree<T>, path?: Path }) {
        this._root = props?.parent ? props.parent._root : this;
        this.parent = props?.parent;
        this._path = props?.path || [];
        this.keys = new Map();
        this._size = 0;
        this.slot = new Slot()
    }

    root() { return this._root; }
    path() { return this._path; }
    size() { return this._size; }

    clear() {
        if (this.slot.assigned()) {
            let tree: Tree<T> | undefined = this;
            while (tree) {
                tree._size--;
                tree = tree.parent;
            }
        }
        this.slot.clear();
        if (!this.keys.size) this.parent?.keys.delete(this._path.slice(-1)[0]);
    }

    assign(value: T) {
        if (!this.slot.assigned()) {
            let tree: Tree<T> | undefined = this;
            while (tree) {
                tree._size++;
                tree = tree.parent;
            }
        }
        this.slot.assign(value);
    }

    current() {
        return this.slot.current();
    }

    assigned() {
        return this.slot.assigned();
    }

    create(key: string): Tree<T> {
        return new Tree({ parent: this, path: [...this._path, key] });
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
                if (target._path[target._path.length - 1] != key) throw `tried to unscope ${key} at ${target._path[target._path.length - 1]}`;
                target = target.parent!;
            } else {
                // TODO: handle filters
            }
        }
        return target;
    }

    contains(tree: Tree<T>) {
        for (let i=0; i<this._path.length; i++) {
            let key = this._path[this._path.length - i];
            let subKey = tree._path[tree._path.length - i];
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
}
