export default function Space(base=[]) {
    const _ = {
        path: base,
        vector({ base, tip, forward, back, apply }) {
            for (let o of Object.values(tip)) console.log("Vector to", o.path);
        },
        scope(...path) { return Space([...base, ...path]); },
        unscope(...path) {
            // TODO: throw err if path mismatch
            return Space(spec_base.slice(0, -path.length));
        },
        instance: () => Space(base),
        assign(value) {
            console.log("TODO: assign", value, "to", base);
        },
        resolve(handler) {
            console.log("TODO: resolve", base);
            // handler("<TBD>");
        },
        bind(handler) {},
    };
    return _;
}
