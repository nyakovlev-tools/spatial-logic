export class Slot<T> {
    private value?: T
    assigned?: boolean

    constructor() {
        this.assigned = false;
    }

    current() {
        if (this.assigned) return this.value!;
    }

    assign(value: T) {
        this.value = value;
        this.assigned = true;
    }

    clear() {
        this.value = undefined;
        this.assigned = false;
    }

}
