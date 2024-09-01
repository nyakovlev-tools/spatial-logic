import { Path, Tree } from "./Tree";
import { Slot } from "./Slot";

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
        this.slot = new Slot();
    }

    scope(path: Path, active?: boolean): SymmeTree<T> | undefined {
        let tree = this.tree.scope(path, active);
        if (!tree?.assigned() && active) {
            tree!.assign(new SymmeTree({ tree }));
        }
        let stree = tree?.current();
        if (stree && !stree.inverse) {
            let inverse = this.tree.root.current()!.inverse!.scope(path, true)!;
            stree.inverse = inverse;
            if (!inverse.assigned()) inverse.assign([]);
            inverse.current()!.push(stree);
        }
        return stree;
    }

    subsets() {
        let agg: (inv: Tree<Array<SymmeTree<T>>>) => Array<SymmeTree<T>> = inv => [
            ...(inv.current() || []),
            ...Array.from(inv.keys.values())
                .map(agg)
                .reduce((flat, spaces) => [...flat, ...spaces], [])
        ];
        return this.inverse ? agg(this.inverse) : [];
    }
}
