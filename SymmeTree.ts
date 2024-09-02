import { Path, Tree } from "./Tree";
import { Slot } from "./Slot";
import { SorTree } from "./SorTree";

export class SymmeTree<T> {
    tree: Tree<SymmeTree<T>>
    inverse?: SorTree<SymmeTree<T>>
    private slot: Slot<T>

    constructor(props?: { tree?: Tree<SymmeTree<T>> }) {
        if (props?.tree) {
            this.tree = props.tree
        } else {
            this.tree = new Tree();
            this.inverse = new SorTree();
            this.inverse.assign(this);
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
        let tree: Tree<SymmeTree<T>> | undefined = this.tree;
        let stree;
        for (let key of path) {
            tree = tree!.scope([key], active);
            if (!tree) return;
            if (!tree.assigned() && active) tree.assign(new SymmeTree({ tree }));
            stree = tree.current();
            if (stree && !stree.inverse) {
                let inverse = tree!.root().current()!.inverse!.scope(stree.tree.path(), true)!;
                stree.inverse = inverse;
            }
        }
        return stree;
    }

    unscope(path: Path) { return this.tree.unscope(path).current()!; }

    supersets(): Array<T> {
        let inverse = this.tree.root().current()!.inverse!;
        let supersets = inverse?.assigned() ? [inverse.current()!] : [];
        for (let key of this.tree.path().reverse()) {
            inverse = inverse.scope([key], false)!;
            if (inverse.assigned()) supersets.push(inverse.current()!);
        }
        return supersets
            .filter(stree => stree.assigned())
            .map(stree => stree.current()!);
    }

    subsets(): Array<T> {
        return this.inverse!
            .map(stree => stree)
            .filter(stree => stree.assigned())
            .map(stree => stree.current()!);
    }
}
