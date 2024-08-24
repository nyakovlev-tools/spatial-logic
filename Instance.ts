import { Path } from "./Tree"
import Space from "./Space"

export default class Instance<T = any> {
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
        return new Instance<IT>(this.space.scope(...path));
    }
    
    resolve(f: (value: T) => void) {
        // f("<TBD>");
        let state = this.space.tree!.root!.value!;
        let depth = 0;
        state.hop(this.space);
        // while (1) {
        //     let hop = state.next_hop(self.space);
        //     if (!hop) break;
        //     // TODO: perform hop
        //     depth++;
        // }
        console.log("Routing depth:", depth);
    }

    // bind(f: (value: T) => Disposable) {}  // live resolver (waiting for resolve() functionality and subscriber-based implementation of rest of logic)
}
