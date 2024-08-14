export default function Space() {
    const _ = {
        vector({ base, tip, forward, back, apply }) {},
        scope(...path) { return Space(); },
        unscope(...path) { return Space(); },
        instance() {},
        entity: () => ({
            assign(value) {},
            scope(...path) { return _.entity() },
            resolve(handler) {handler("<TBD>")},  // resolve once
            bind(handler) {},
        }),
    };
    return _;
}
