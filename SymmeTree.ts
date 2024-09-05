import { Tree, TreeType, TreeProps } from "./Tree";
import { SorTree, SorTreeType, Comparator } from "./SorTree";

export type SymmeTreeType = TreeType & {
    root?: SymmeTreeType
    parent?: SymmeTreeType
    inverse: SorTreeType<SymmeTreeType>
}

export type SymmeTreeProps = TreeProps & {
    tree?: SymmeTreeType
    compare?: Comparator<SorTreeType<SymmeTreeType>>
}

export const SymmeTree = {
    ...Tree,
    init(self: {}, props?: SymmeTreeProps): SymmeTreeType {
        let base: TreeType = Tree.init(self, {init: SymmeTree.init, ...props});
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
    supersets(self: SymmeTreeType): Array<SymmeTreeType> {
        let supersets: Array<SymmeTreeType> = [];
        let tree: SorTreeType<SymmeTreeType> | undefined = self.inverse;
        while (tree) {
            supersets.push(tree.value!);
            tree = tree.parent;
        }
        return supersets;
    },
    subsets(self: SymmeTreeType): Array<SymmeTreeType> {
        return Array.from(self.inverse.keys.values()).reduce(
            (agg, subTree) => [...agg, ...SymmeTree.subsets(subTree as SymmeTreeType)],
            self.inverse.assigned ? [self.inverse.value!] : []
        )
    },
};
