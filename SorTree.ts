import { Tree, TreeType, TreeProps } from "./Tree"

export type Comparator<T> = (a: T, b: T) => number

export function binaryInsert<T>(array: T[], insertValue: T, comparator: Comparator<T>) {
    // From: https://github.com/bhowell2/binary-insert-js/blob/master/index.ts

    if (array.length === 0 || comparator(array[0], insertValue) >= 0) {
        array.splice(0, 0, insertValue)
        return array;
    } else if (array.length > 0 && comparator(array[array.length - 1], insertValue) <= 0) {
        array.splice(array.length, 0, insertValue);
        return array;
    }
    let left = 0, right = array.length;
    let leftLast = 0, rightLast = right;
    while (left < right) {
        const inPos = Math.floor((right + left) / 2)
        const compared = comparator(array[inPos], insertValue);
        if (compared < 0) left = inPos;
        else if (compared > 0) right = inPos;
        else {
            right = inPos;
            left = inPos;
        }
        // nothing has changed, must have found limits. insert between.
        if (leftLast === left && rightLast === right) break;
        leftLast = left;
        rightLast = right;
    }
    // use right, because Math.floor is used
    array.splice(right, 0, insertValue);
    return array
}

export type SorTreeProps<T> = TreeProps<T> & {
    tree?: SorTreeType<T>
    compare?: Comparator<T>
}

export type SorTreeType<T> = TreeType<T> & {
    root?: SorTreeType<T>
    parent?: SorTreeType<T>
    compare?: (a: SorTreeType<T>, b: SorTreeType<T>) => number
    downstream: Array<SorTreeType<T>>
};

function wrapCompare<T>(compare?: Comparator<T>) {
    // NOTE: anything in a comparison list will always be assigned
    if (compare) return (a: SorTreeType<T>, b: SorTreeType<T>) => compare(a.value!, b.value!);
}

export const SorTree = {
    ...Tree,
    init<T>(self: {}, props?: SorTreeProps<T>): SorTreeType<T> { return {
        ...Tree.init<T>(self, {init: SorTree.init, ...props}),
        root: props?.tree?.root,
        parent: props?.tree,
        compare: wrapCompare<T>(props?.compare),
        downstream: [],
    }},
    assign<T>(self: SorTreeType<T>, value: T) {
        Tree.assign(self, value);
        if (!self.compare) return;
        let tree: SorTreeType<T> | undefined = self;
        while (tree) {
            binaryInsert<SorTreeType<T>>(tree.downstream, self, self.compare!);
            tree = tree.parent;
        }
    },
    clear<T>(self: SorTreeType<T>) {
        Tree.clear(self);
        if (!self.compare) return;
        let tree: SorTreeType<T> | undefined = self;
        while (tree) {
            tree.downstream.splice(tree.downstream.indexOf(self), 1);
            tree = tree.parent;
        }
    },
};
