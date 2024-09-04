export type SlotType<T> = {
    value?: T
    assigned: boolean
}

export const Slot = {
    init<T>(self: {}): SlotType<T> {
        return {...self, assigned: false};
    },
    assign<T>(self: SlotType<T>, value: T) {
        self.value = value;
        self.assigned = true;
    },
    clear<T>(self: SlotType<T>) {
        self.value = undefined;
        self.assigned = false;
    },
    // TODO: add functions to read slot value and read slot status, and give them optional callbacks, bindings, teardown calls, etc.
}
