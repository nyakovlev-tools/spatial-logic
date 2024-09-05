import { Slot, SlotType } from "./Slot";
import { Tree, TreeType, TreeProps } from "./Tree"

export type PanTreeProps<T> = TreeProps & {
    tree?: PanTreeType<T>
};

export type PanTreeType<T> = TreeType & SlotType<T> & {
    root?: PanTreeType<T>
    parent?: PanTreeType<T>
    size: number
}

export const PanTree = {
    ...Slot,
    ...Tree,
    init<T>(self: {}, props?: PanTreeProps<T>): PanTreeType<T> { return {
        ...Slot.init<T>(self),
        ...Tree.init(self, {init: PanTree.init, ...props}),
        root: props?.tree?.root,
        parent: props?.tree,
        size: 0,
    }},
    assign<T>(self: PanTreeType<T>, value: T) {
        if (!self.assigned) {
            let tree: PanTreeType<T> | undefined = self;
            while (tree) {
                tree.size++;
                tree = tree.parent;
            }
        }
        Slot.assign(self, value);
    },
    clear<T>(self: PanTreeType<T>) {
        if (self.assigned) {
            let tree: PanTreeType<T> | undefined = self;
            while (tree) {
                tree.size--;
                tree = tree.parent;
            }
        }
        Slot.clear(self);
        if (!self.keys.size) self.parent?.keys.delete(self.path.slice(-1)[0]);
    },
};
