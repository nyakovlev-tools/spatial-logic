import { Slot } from "./Slot"
import { Path, Tree } from "./Tree"

// NOTE: sorting is currently only useful for the inverse tree, since the origin of overlapping spaces is at the path tip.
// Thus, a sorted tree object may be bet implemented as a SymmeTree, but the inverted tree is a sorted tree.
// Perhaps SymmeTree will depend on this type, and this type will just wrap a plain tree?

type CompareFunction<T> = {
    (a: T, b: T): number
}

export class SorTree<T> {
    tree: Tree<SorTree<T>>
    private slot: Slot<T>
    compare?: CompareFunction<T>

    constructor(props?: { compare?: CompareFunction<T>, tree?: Tree<SorTree<T>> }) {
        this.tree = props?.tree || new Tree();
        this.tree.assign(this);
        this.compare = props?.compare;
        this.slot = new Slot();
        // TODO: add ranking attributes
    }

    assign(value: T) {
        // TODO: for recurse parent until lower cost found
        this.slot.assign(value);
    }

    current() {
        return this.slot.current();
    }

    assigned() {
        return this.slot.assigned();
    }

    scope(path: Path, active?: boolean): SorTree<T> | undefined {
        return this.tree.scope(path, active)?.current();
    }

    map<MT>(f: (value: T) => MT): Array<MT> {
        return this.tree.map(o => o)
            .filter(stree => stree.assigned())
            .map(stree => stree.current()!)
            .map(v => f(v));
    }
}
