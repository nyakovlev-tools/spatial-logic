import { Path } from "./Tree"
import Space from "./Space"

export default class State<T = any> {
    space: Space
    assigned?: boolean
    value?: T

    constructor(space: Space) {
        this.space = space;
    }

    assign(value: T) {
        this.value = value;
        this.assigned = true;
    }

    scope<IT = any>(...path: Path) {
        return new State<IT>(this.space.scope(...path));
    }
    
    resolve(): T {
        // TODO: come up with some representation of state to map values between vectors.
        // Originally was planning to map keys - but this should only be done at vector invocation - because of space overlap between instances, instances will have to be called out by reference.
        if (this.assigned) return this.value!;
        throw 'No solution found';

        // // f("<TBD>");
        // let state = this.space.tree.root.value!;
        // let depth = 0;
        // console.log("Vectors:", this.space.ingress.length);
        // for (let i=0; i<5; i++) {
        //     let hop = state.hop(this.space);
        //     if (!hop) break;
        //     // TODO: perform hop
        //     depth++;
        // }
        // console.log("Routing depth:", depth);
    }

    // bind(f: (value: T) => Disposable) {}  // live resolver (waiting for resolve() functionality and subscriber-based implementation of rest of logic)
}
