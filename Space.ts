import { Tree,  Path } from "./Tree";
import { Vector, Flow } from "./Vector";
import { Route, Router } from "./Router";
import { State } from "./State";

class EffectRouter extends Router {
    space: Space;

    constructor(space: Space) {
        super(space);
        this.space = space;
    }

    expand(space: Space) {
        let routes: Array<Route> = [];
        for (let ss of space.supersets()) {
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
        // return space.supersets().map(ss => ss.egress.map(egress =>
        //     // TODO: support multiple keys from different roots - and add new permutations as you go.
        //     Object.entries(egress.vector.forward({[egress.key]: this.space})).map(([k, v]) => {key, vector})
        // )).reduce((agg, outputs) => [...agg, ...outputs], []);
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
    tree: Tree<Space>
    ingress: Array<Flow>
    egress: Array<Flow>
    inverse?: Tree<Array<Space>>
    from: EffectRouter
    towards: DependencyRouter

    constructor(props?: { tree?: Tree<Space> }) {
        this.ingress = [];
        this.egress = [];
        if (!props?.tree) {
            this.tree = new Tree();
            this.tree.assign(this);
            this.inverse = new Tree();
            this.inverse.assign([this]);
        } else {
            this.tree = props.tree;
        }
        this.from = new EffectRouter(this);
        this.towards = new DependencyRouter(this);
    }

    scope(...path: Path) {
        let tree = this.tree.scope(path, true)!;
        let space = tree.current();
        if (!space) {
            space = new Space({ tree });
            tree.assign(space);
        }
        if (!space.inverse) {
            space.inverse = this.tree.root.current()!.inverse;
            let inverse = space.inverse!.scope(tree.path, true);
            if (!inverse!.current()) inverse!.assign([]);
            inverse!.current()!.push(space);
        }
        return space;
    }

    unscope(...path: Path) {
        return this.tree.unscope(path).current()!;
    }

    vector(vector: Vector) {
        for (let [key, space] of Object.entries(vector.base)) space.egress.push({ vector, key });
        for (let [key, space] of Object.entries(vector.tip)) space.ingress.push({ vector, key });
    }

    // hop(target: Space) {
    //     return {};
    //     //  for each visited node, go through "visited edge" of opposite end and exit if visited point fits into edge.
    //     //  "visited edge" is essentially all visited nodes (in order of visit), but you can ignore nodes once you visit something after it (since those will always be closer)
    //     // TODO: once there is no more target, establish way to determine context name of final handle (probably using the same mechanism as the entity remapper)
    // }
}
