import { PanTreeType } from "./PanTree";
import { SorTreeType } from "./SorTree";
import { SpaceType } from "./Space";
import { VectorType } from "./Vector";

export type Expander = (space: SpaceType) => Array<Route>

export type Route = {
    src: {[key: string]: SpaceType}
    vector: VectorType
    dst: {
        key: string
        space: SpaceType
    }
}

export type RouterType = {
    expand: Expander
    pending: SorTreeType<SpaceType>
    visited: SorTreeType<SpaceType>
    cost: PanTreeType<number>
    routes: SorTreeType<Route>
};

export const Router = {
    init(expand: Expander): RouterType {
        return {
            expand,
        };
    },
    advertise(self: RouterType, route: Route, cost: number) {
        let path = route.dst.space.tree.path();
        let costEntry = this.cost.scope(path, true)!;
        if (!costEntry.assigned() || costEntry.current()! > cost) {
            costEntry.assign(cost);
            this.routes.scope(path, true)?.assign(route);
            if (!this.visited.scope(path)?.assigned() && !this.pending.scope(path)?.assigned()) {
                this.pending.scope(path, true)!.assign(route.dst.space);
            }
        }
    },
    solved(self: RouterType) {
        return this.pending.map(f => f).length == 0;
    },
    visit(self: RouterType, space: Space) {
        this.visited.scope(space.tree.path(), true)!.assign(space);
        for (let route of this.expand(space)) {
            this.advertise(route, this.cost.scope(space.tree.path())!.current()! + 1);
        }
    },
    step(self: RouterType) {
        let pending = this.pending.map<Space>(f => f).sort(
            (a, b) => this.cost.scope(a.tree.path())!.current()! - this.cost.scope(b.tree.path())!.current()!
        );
        if (!pending.length) return;
        let next = pending[0];
        this.pending.scope(next.tree.path())!.clear();
        this.visit(next);
    },
};
