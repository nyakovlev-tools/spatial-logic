import { Route, Router, RouterType } from "./Router";
import { SymmeTree, SymmeTreeProps, SymmeTreeType } from "./SymmeTree";
import { Flow } from "./Vector";

export type SpaceType = SymmeTreeType & {
    root?: SpaceType
    parent?: SpaceType
    ingress: Array<Flow>
    egress: Array<Flow>
    forward: RouterType
    back: RouterType
}

export type SpaceProps = SymmeTreeProps & {
    tree?: SpaceType
};

export const EffectRouter = Router.init((space: SpaceType) => {
    let routes: Array<Route> = [];
    for (let ss of Space.supersets(space)) {
        for (let egress of (ss as SpaceType).egress) {
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
});

export const DependencyRouter = Router.init((space: SpaceType) => {
    return [];
    // space.subsets().map(ss => ss.ingress.map(ingress => {
    //     // TODO: support multiple keys from different roots - and add new permutations as you go.
    //     let deps = ingress.vector.back({[ingress.key]: this.space});
    // }));
});

export const Space = {
    ...SymmeTree,
    init(self: {}, props?: SpaceProps): SpaceType { return {
        ...SymmeTree.init(self, props),
        root: props?.tree?.root,
        parent: props?.tree,
        ingress: [],
        egress: [],
        forward: EffectRouter,
        back: DependencyRouter,
    }},
};
