import { Space } from "./Space";
import { Tree } from "./Tree";
import { Vector } from "./Vector";

export type Route = {
    src: {[key: string]: Space}
    vector: Vector
    dst: {
        key: string
        space: Space
    }
}

export abstract class Router {
    pending: Tree<Space>
    visited: Tree<Space>
    cost: Tree<number>
    routes: Tree<Route>
    abstract expand(space: Space): Array<Route>;

    constructor(root: Space) {
        this.pending = new Tree();
        this.cost = new Tree();
        this.visited = new Tree();
        this.routes = new Tree();

        this.pending.scope(root.tree.path, true)!.assign(root);
    }

    advertise(route: Route, cost: number) {
        let path = route.dst.space.tree.path;
        let costEntry = this.cost.scope(path, true)!;
        if (!costEntry.assigned || costEntry.current()! > cost) {
            costEntry.assign(cost);
            this.routes.scope(path, true)?.assign(route);
            if (!this.visited.scope(path)?.assigned && !this.pending.scope(path)?.assigned) {
                this.pending.scope(path, true)!.assign(route.dst.space);
            }
        }
    }

    solved() {
        return this.pending.map(f => f).length == 0;
    }

    visit(space: Space) {
        this.visited.scope(space.tree.path, true)!.assign(space);
        for (let route of this.expand(space)) {
            this.advertise(route, this.cost.scope(space.tree.path)!.current()! + 1);
        }
    }

    step() {
        let pending = this.pending.map<Space>(f => f).sort((a, b) => this.cost.scope(a.tree.path)!.current()! - this.cost.scope(b.tree.path)!.current()!);
        if (!pending.length) return;
        let next = pending[0];
        this.pending.scope(next.tree.path)!.clear();
        this.visit(next);
    }

}
