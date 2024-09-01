import { ITree, Path, Tree } from "./Tree";

export class SymmeTree<T> extends Tree<T> {
    inverse?: ITree<Array<SymmeTree<T>>>

    constructor(props?: { parent?: ITree<T>, path?: Path }) {
        super(props);
        if (!props?.parent) {
            this.inverse = new Tree();
            this.inverse.assign([this]);
        }

        this.create("")
    }

    create(key: string) {
        return new SymmeTree({ parent: this, path: [...this.path, key] });
    }

    scope(path: Path, active?: boolean): SymmeTree<T> | undefined {
        let tree = <SymmeTree<T> | undefined>super.scope(path, active);
        if (tree && tree.inverse) {
            let inverse = (<SymmeTree<T>>this.root).inverse!.scope(tree.path, true);
            tree.inverse = inverse;
            if (!inverse!.current()) inverse!.assign([]);
            inverse!.current()!.push(this);
        }
        return tree;
    }

    subsets() {
        let agg: (inv: ITree<Array<SymmeTree<T>>>) => Array<SymmeTree<T>> = inv => [
            ...(inv.current() || []),
            ...Array.from(inv.keys.values())
                .map(agg)
                .reduce((flat, spaces) => [...flat, ...spaces], [])
        ];
        return this.inverse ? agg(this.inverse) : [];
    }
}
