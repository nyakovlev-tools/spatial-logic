import { Space } from "./Space";
import { Tree } from "./Tree";

export interface Expand {
    (space: Space): any
}

export abstract class Router {
    edge: Array<Space>
    pending: Tree<Space>
    visited: Tree<Space>
    cost: Tree<number>
    periphery: Array<Space>
    abstract expand(space: Space): void;

    constructor() {
        this.edge = [];  // TODO: replace this array with a Tree - then, use this to provide a reduced form of periphery detection (incremental updates only require incremental detection)
        this.pending = new Tree();
        this.cost = new Tree();
        this.visited = new Tree();
        this.periphery = [];  // TODO: replace this with a Tree, possibly of periphery lists - then, use it to look up closest intersections with a new space.
    }

    advertise(space: Space, cost: number) {
        let path = space.tree.path;
        let costEntry = this.cost.scope(path, true);
        costEntry!.assign(costEntry?.current() ? Math.min(costEntry.current()!, cost) : cost);
        let pending = this.pending.scope(path, true);
        if (!pending!.assigned && !this.visited.scope(path)?.assigned) {
            pending!.assign(space);
        }
    }

    solved() {
        console.log("Check solved:", this.pending.size, this.pending.map(f => f).length);
        return this.pending.map(f => f).length == 0;
    }

    visit(space: Space) {
        this.visited.scope(space.tree.path, true)!.assign(space);
        let cost = this.cost.scope(space.tree.path)!.current()!;
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
        let pending = this.pending.map<Space>(f => f).sort((a, b) => this.cost.scope(a.tree.path)!.current()! - this.cost.scope(b.tree.path)!.current()!);
        if (!pending.length) return;
        let next = pending[0];
        this.pending.scope(next.tree.path)!.clear();
        this.visit(next);
    }

    intersects(space: Space) {}

    edges(space: Space) {}
}
