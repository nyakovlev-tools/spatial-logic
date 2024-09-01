import { Slot } from "./Slot"

export type Path = Array<string>

export interface ITree<T> extends Slot<T> {
    root: ITree<T>
    parent?: ITree<T>
    path: Path
    keys: Map<string, ITree<T>>
    size: number
    assign(value: T): void
    clear(): void
    create(key: string): unknown
    map<MT>(f: (value: T) => MT): Array<MT>
    scope(path: Path, active?: boolean): ITree<T> | undefined
    unscope(path: Path): ITree<T>
    contains(tree: ITree<T>): boolean
    within(tree: ITree<T>): boolean
    supersets(): Array<T>
}

export class Tree<T> extends Slot<T> {
    root: ITree<T>
    parent?: ITree<T>
    path: Path
    keys: Map<string, ITree<T>>
    size: number

    constructor(props?: { parent?: ITree<T>, path?: Path }) {
        super();
        this.root = props?.parent ? props.parent.root : this;
        this.parent = props?.parent;
        this.path = props?.path || [];
        this.keys = new Map();
        this.size = 0;
    }

    assign(value: T) {
        if (!this.assigned) {
            let tree: ITree<T> | undefined = this;
            while (tree) {
                tree.size++;
                tree = tree.parent;
            }
        }
        super.assign(value)
    }

    clear() {
        if (this.assigned) {
            let tree: ITree<T> | undefined = this;
            while (tree) {
                tree.size--;
                tree = tree.parent;
            }
        }
        super.clear();
        if (!this.keys.size) this.parent?.keys.delete(this.path.slice(-1)[0]);
    }

    create(key: string): ITree<T> {
        return new Tree({ parent: this, path: [...this.path, key] });
    }

    map<MT>(f: (value: T) => MT): Array<MT> {
        return Array.from(this.keys.values()).reduce(
            (agg, subTree) => [...agg, ...subTree.map(f)],
            this.assigned ? [f(this.current()!)] : []
        )
    }

    scope(path: Path, active?: boolean) {
        let tree: ITree<T> = this;
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
        let target: ITree<T> = this;
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

    contains(tree: ITree<T>) {
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

    within(tree: ITree<T>) {
        return tree.contains(this);
    }

    supersets() {
        let supersets: Array<ITree<T>> = [this.root];
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
            .filter(ss => ss.assigned)
            .map(ss => ss.current()!);
            // .filter((v, i, a) => a.indexOf(v) == i)
    }
}
