export class Slot<T> {
    private value?: T
    private _assigned?: boolean

    constructor() {
        this._assigned = false;
    }

    assigned() { return this._assigned; }

    current() {
        if (this._assigned) return this.value!;
    }

    assign(value: T) {
        this.value = value;
        this._assigned = true;
    }

    clear() {
        this.value = undefined;
        this._assigned = false;
    }

}
