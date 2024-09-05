import { Tree, TreeType, Path } from "./Tree";
import { SorTree, SorTreeType, SorTreeProps, Comparator } from "./SorTree";

export type SymmeTreeType<T> = TreeType<T> & {
    root?: SymmeTreeType<T>
    parent?: SymmeTreeType<T>
    inverse: SorTreeType<SymmeTreeType<T>>
}

export type SymmeTreeProps<T> = SorTreeProps<T> & {
    tree?: SymmeTreeType<T>
    compare?: Comparator<SymmeTreeType<T>>
}

export const SymmeTree = {
    ...Tree,
    init<T>(self: {}, props?: SymmeTreeProps<T>): SymmeTreeType<T> {
        let base: TreeType<T> = Tree.init<T>(self, {init: SymmeTree.init, ...props});
        let tree = {
            ...base,
            root: props?.tree?.root,
            parent: props?.tree,
            inverse: props?.tree
                ? SorTree.scope(props.tree.root!.inverse, base.path.reverse(), true)!
                : SorTree.init({}, {compare: props?.compare})
        };
        SorTree.assign(tree.inverse, tree);
        return tree;
    },
    supersets<T>(self: SymmeTreeType<T>): Array<SymmeTreeType<T>> {
        let supersets: Array<SymmeTreeType<T>> = [];
        let tree: SorTreeType<SymmeTreeType<T>> | undefined = self.inverse;
        while (tree) {
            supersets.push(tree.value!);
            tree = tree.parent;
        }
        return supersets;
    },
    subsets<T>(self: SymmeTreeType<T>): Array<SymmeTreeType<T>> {
        return SorTree.map(self.inverse, stree => stree);
    },
};
