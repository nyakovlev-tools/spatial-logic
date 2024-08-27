import { Tree, Path } from "./Tree";
import { Space } from "./Space";

// TODO: consider creating Instance within State, to delineate between two separate entities and two states of the same entity.

export class State {
    assigned?: boolean
    tree: Tree<Array<any>>

    constructor() {
        this.tree = new Tree();
    }

    assign(path: Path, value: any) {
        let tree = this.tree.scope(path, true)!;
        let values = tree.current();
        if (!values) {
            values = [];
            tree.assign(values);
        }
        values.push();
    }

    // scope<IT = any>(...path: Path) {
    //     return new State<IT>(this.space.scope(...path));
    // }
    
    resolve(space: Space) {
        // TODO: come up with some representation of state to map values between vectors.
        // Originally was planning to map keys - but this should only be done at vector invocation - because of space overlap between instances, instances will have to be called out by reference.
        // let start = this.space.tree.root.value!;

        let base = space.tree.root.current()!;
        let depth;
        for (depth=0; depth<10; depth++) {  // TODO: consider setting max routing depth
            console.log("base:", base.from.pending.size, "tip:", space.towards.pending.size);
            let a = base.from.solved();
            let b = space.towards.solved();
            if (a && b) break;
            // if (base.from.solved() && space.towards.solved()) break;
            base.from.step();
            space.towards.step();
        }
        console.log("Routing depth:", depth);
        // TODO: somehow pull up the starting state of the system as a valid reference for this
        //  (it doesn't need to be assigned to route; it can be assumed that the user needs to provide starting values)

        // throw 'No solution found';

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
