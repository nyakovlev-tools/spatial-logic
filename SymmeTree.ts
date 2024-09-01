import { Path, Tree } from "./Tree";
import { Slot } from "./Slot";

function getSymmeTree<T>(tree: Tree<SymmeTree<T>> | undefined, active: boolean | undefined) {
    let stree = tree?.current();
    if (!tree?.assigned() && active) {
        stree = new SymmeTree({ tree });
    }
    if (stree && !stree.inverse) {
        let inverse = tree!.root().current()!.inverse!.scope(stree.tree.path(), true)!;
        stree.inverse = inverse;
        if (!inverse.assigned()) inverse.assign([]);
        inverse.current()!.push(stree);
    }
    return stree;
}

export class SymmeTree<T> {
    tree: Tree<SymmeTree<T>>
    inverse?: Tree<Array<SymmeTree<T>>>
    private slot: Slot<T>

    constructor(props?: { tree?: Tree<SymmeTree<T>> }) {
        if (props?.tree) {
            this.tree = props.tree
        } else {
            this.tree = new Tree();
            this.inverse = new Tree();
            this.inverse.assign([this]);
        }
        this.tree.assign(this);
        this.slot = new Slot();
    }

    path() { return this.tree.path(); }

    assign(value: T) {
        // TODO: If adding a size param to SymmeTree, provide similar counting logic to Tree
        this.slot.assign(value);
    }

    current() {
        return this.slot.current();
    }

    assigned() {
        return this.slot.assigned();
    }

    scope(path: Path, active?: boolean): SymmeTree<T> | undefined {
        let tree = this.tree.scope(path, active);
        return getSymmeTree<T>(tree, active);
    }

    unscope(path: Path) {
        let tree = this.tree.unscope(path);
        return getSymmeTree<T>(tree, true)!;
    }

    supersets() {
        let unpack = (inv: Tree<SymmeTree<T>[]>) =>
            inverse.current()!
                .filter(stree => stree.assigned())
                .map(stree => stree.current()!);

        let inverse = this.tree.root().current()!.inverse!;
        let supersets = inverse?.assigned() ? unpack(inverse) : [];
        for (let key of this.tree.path().reverse()) {
            inverse = inverse.scope([key], false)!;
            if (inverse.assigned()) supersets = [...supersets, ...unpack(inverse)];
        }
        return supersets;
    }

    subsets(): Array<T> {
        return this.inverse!
            .map(symms => symms
                .filter(symm => symm.assigned())
                .map(symm => symm.current()!))
            .reduce((agg, set) => [...agg, ...set], []);
    }
}
