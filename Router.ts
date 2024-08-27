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

    constructor() {
        this.pending = new Tree();
        this.cost = new Tree();
        this.visited = new Tree();
        this.routes = new Tree();
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
        return this.pending.map(f => f).length == 0;
    }

    visit(space: Space) {
        this.visited.scope(space.tree.path, true)!.assign(space);
        let cost = this.cost.scope(space.tree.path)!.current()! + 1;
        for (let route of this.expand(space)) {
            let path = route.dst.space.tree.path;
            let costTree = this.cost.scope(path, true)!;
            if (!costTree.assigned || costTree.current()! > cost) {
                costTree.assign(cost);
                this.routes.scope(path, true)?.assign(route);
                if (!this.visited.scope(path)?.assigned && !this.pending.scope(path)?.assigned) {
                    this.pending.scope(path, true)!.assign(route.dst.space);
                }
            }
        }
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
