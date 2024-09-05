import { PanTree, PanTreeType, PanTreeProps } from "./PanTree"

export type Comparator<T> = (a: T, b: T) => number

export type SorTreeProps<T> = PanTreeProps<T> & {
    tree?: SorTreeType<T>
    compare: Comparator<SorTreeType<T>>
}

export type SorTreeType<T> = PanTreeType<T> & {
    root?: SorTreeType<T>
    parent?: SorTreeType<T>
    compare: Comparator<SorTreeType<T>>
    downstream: Array<SorTreeType<T>>
};

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

export const SorTree = {
    ...PanTree,
    init<T>(self: {}, props: SorTreeProps<T>): SorTreeType<T> { return {
        ...PanTree.init<T>(self, {init: SorTree.init, ...props}),
        root: props!.tree?.root,
        parent: props?.tree,
        compare: props!.compare,
        downstream: [],
    }},
    assign<T>(self: SorTreeType<T>, value: T) {
        SorTree.clear(self);
        PanTree.assign(self, value);
        let tree: SorTreeType<T> | undefined = self;
        while (tree) {
            binaryInsert<SorTreeType<T>>(tree.downstream, self, self.compare);
            tree = tree.parent;
        }
    },
    clear<T>(self: SorTreeType<T>) {
        if (self.assigned) {
            PanTree.clear(self);
            let tree: SorTreeType<T> | undefined = self;
            while (tree) {
                if (tree.downstream.includes(self)) tree.downstream.splice(tree.downstream.indexOf(self), 1);
                tree = tree.parent;
            }
        }
    },
};
