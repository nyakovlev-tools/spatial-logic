import Space from "./Space"
import Tree from "./Tree"

export interface Expand {
    (space: Space): any
}

export default abstract class Router {
    edge: Array<Space>
    pending: Tree<Space>
    visited: Tree<Space>
    cost: Tree<number>
    periphery: Array<Space>
    abstract expand(space: Space): void;

    constructor() {
        this.edge = [];  // TODO: replace this array with a Tree - then, provide tree functions to do indexed edge detection
        this.pending = new Tree();
        this.cost = new Tree();
        this.visited = new Tree();
        this.periphery = [];
    }


    advertise(space: Space, cost: number) {
        let path = space.tree!.path;
        let costEntry = this.cost.scope(path, true);
        costEntry!.value = costEntry?.value ? Math.min(costEntry.value, cost) : cost;
        if (!this.pending.scope(path) && !this.visited.scope(path)) {
            this.pending.scope(path, true)!.value = space;
        }
    }

    solved() {
        return this.pending.map(f => f).length > 0;
    }

    visit(space: Space) {
        let cost = this.cost.scope(space.tree!.path)!.value!;
        // let nextEdge = [];
        // let nextSpace;
        // let nextCost;
        // self.pending.forEach(s => {
        //     let c = self.cost.lookup(s.path);
        //     if (!nextSpace || c < nextCost) {
        //         nextSpace = s;
        //         nextCost = c;
        //     }
        // });
        // // let {space, distance} = self.edge.reduce((h1, h2) => h1.distance < h2.distance ? h1 : h2);
        // for (let s of self.edge) {  // TODO: replace this with picking the closest next edge, tehn adding it to periphery and whatnot
        //     let supersets = self.supersets();
        //     if (!supersets.length) {
        //         nextEdge.push(s);
        //         continue;
        //     }
        //     for (let ss of supersets) {
        //         for (let egress of ss.egress) {
        //             // TODO: support multiple keys from different roots - and add new permutations as you go.
        //             let outputs = egress.vector.forward({[egress.key]: self});
        //             console.log(outputs[0].o.path);
        //         }
        //     }
        // }
    }

    step() {
        let pending = this.pending.map<Space>(f => f).sort((a, b) => this.cost.scope(a.tree!.path)!.value! - this.cost.scope(b.tree!.path)!.value!);
        if (!pending.length) return;
        this.visit(pending[0]);
    }

    intersects(space: Space) {}

    edges(space: Space) {}
}
