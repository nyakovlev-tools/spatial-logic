import Tree, { Path } from "./Tree";
import Vector, { Flow, Hop } from "./Vector";
import Router from "./Router";
import State from "./State";

class EffectRouter extends Router {
    space: Space;

    constructor(space: Space) {
        super();
        this.space = space;
    }

    expand(space: Space): void {
        space.supersets().map(ss => ss.egress.map(egress => {
            // TODO: support multiple keys from different roots - and add new permutations as you go.
            let outputs = egress.vector.forward({[egress.key]: this.space});
        }));
    }
}

class DependencyRouter extends Router {
    space: Space;

    constructor(space: Space) {
        super();
        this.space = space;
    }

    expand(space: Space): void {
        space.subsets().map(ss => ss.ingress.map(ingress => {
            // TODO: support multiple keys from different roots - and add new permutations as you go.
            let deps = ingress.vector.back({[ingress.key]: this.space});
        }));
    }
}

export default class Space {
    tree: Tree<Space>
    ingress: Array<Flow>
    egress: Array<Flow>
    inverse?: Tree<Array<Space>>
    from: EffectRouter
    towards: DependencyRouter

    constructor(props?: { tree?: Tree<Space> }) {
        this.ingress = [];
        this.egress = [];
        this.from = new EffectRouter(this);
        this.towards = new DependencyRouter(this);
        if (!props?.tree) {
            this.tree = new Tree();
            this.tree.assign(this);
            this.inverse = new Tree();
            this.inverse.assign([this]);
        } else {
            this.tree = props.tree;
        }
    }

    scope(...path: Path) {
        let tree = this.tree.scope(path, true)!;
        let space = tree.value;
        if (!space) {
            space = new Space({ tree });
            tree.value = space;
        }
        if (!space.inverse) {
            space.inverse = this.tree.root.value!.inverse;
            let inverse = space.inverse!.scope(tree.path, true);
            if (!inverse!.value) inverse!.value = [];
            inverse!.value.push(space);
        }
        return space;
    }

    unscope(...path: Path) {
        return this.tree.unscope(path).value!;
    }

    supersets() {
        let root = this.tree.root.value!;
        let supersets: Array<Space> = [root];
        for (let key of this.tree.path) {
            if (typeof(key) == 'string') {
                supersets = supersets
                    .filter(ss => ss.tree.keys.has(key))
                    .map(ss => ss.tree.keys.get(key)?.value)
                    .concat(root)
                    .filter((v, i, a) => a.indexOf(v) == i)
                    .filter(v => v != undefined);
            } else {
                // TODO: handle filters
            }
        }
        return supersets;
    }

    subsets() {
        let agg: (inv: Tree<Array<Space>>) => Array<Space> = inv => [
            ...(inv.value || []),
            ...Array.from(inv.keys.values())
                .map(agg)
                .reduce((flat, spaces) => [...flat, ...spaces], [])
        ];
        return this.inverse ? agg(this.inverse) : [];
    }

    state<T = any>() {
        return new State<T>(this)
    }

    vector(vector: Vector) {
        for (let [key, space] of Object.entries(vector.base)) space.egress.push({ vector, key });
        for (let [key, space] of Object.entries(vector.tip)) space.ingress.push({ vector, key });
    }

    hop(target: Space) {
        return {};
        //  for each visited node, go through "visited edge" of opposite end and exit if visited point fits into edge.
        //  "visited edge" is essentially all visited nodes (in order of visit), but you can ignore nodes once you visit something after it (since those will always be closer)
        // TODO: once there is no more target, establish way to determine context name of final handle (probably using the same mechanism as the entity remapper)
    }
}
