import { Path } from "./Tree";
import { Vector, Flow } from "./Vector";
import { Route, Router } from "./Router";
import { SymmeTree } from "./SymmeTree";

class EffectRouter extends Router {
    space: Space;

    constructor(space: Space) {
        super(space);
        this.space = space;
    }

    expand(space: Space) {
        let routes: Array<Route> = [];
        for (let ss of space.tree.supersets()) {
            for (let egress of ss.egress) {
                // TODO: support multiple inputs.
                // - effect cannot proceed without all inputs
                // - all spaces that fit within each input should be permuted (lookup route for anything that is a subset of a given space)
                // - if deps missing, skip and work on other routes (reverse routing could provide a solution later, then update upstream to reflect new costs)
                // - what if reverse routing was just immediately performed on each dep? Would that still trigger an upstream update?
                let src = {[egress.key]: space};
                for (let possibility of egress.vector.forward(src)) {
                    for (let [key, dstSpace] of Object.entries(possibility)) {
                        routes.push({src, dst: {key, space: dstSpace}, vector: egress.vector});
                    }
                }
            }
        }
        return routes;
    }
}

class DependencyRouter extends Router {
    space: Space;

    constructor(space: Space) {
        super(space);
        this.space = space;
    }

    expand(space: Space) {
        return [];
        // space.subsets().map(ss => ss.ingress.map(ingress => {
        //     // TODO: support multiple keys from different roots - and add new permutations as you go.
        //     let deps = ingress.vector.back({[ingress.key]: this.space});
        // }));
    }
}

export class Space {
    tree: SymmeTree<Space>
    ingress: Array<Flow>
    egress: Array<Flow>
    from: EffectRouter
    towards: DependencyRouter

    constructor(props?: { tree?: SymmeTree<Space> }) {
        this.tree = props?.tree || new SymmeTree();
        this.ingress = [];
        this.egress = [];
        this.from = new EffectRouter(this);
        this.towards = new DependencyRouter(this);
        this.tree.assign(this);
    }

    scope(...path: Path) { return new Space({ tree: this.tree.scope(path, true)! }); }
    unscope(...path: Path) { return this.tree.unscope(path).current()!; }

    vector(vector: Vector) {
        for (let [key, space] of Object.entries(vector.base)) space.egress.push({ vector, key });
        for (let [key, space] of Object.entries(vector.tip)) space.ingress.push({ vector, key });
    }
}
