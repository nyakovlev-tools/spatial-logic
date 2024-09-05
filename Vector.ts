import { SpaceType } from "./Space";
import { State } from "./State";

export type VectorType = {
    base: {[key: string]: SpaceType}
    tip: {[key: string]: SpaceType}
    forward(props: {[key: string]: SpaceType}): Array<{[key: string]: SpaceType}>
    back(props: {[key: string]: SpaceType}): Array<{[key: string]: SpaceType}>
    apply(props: {[key: string]: State}): void
}

export type Flow = {
    key: string
    vector: VectorType
}

export const Vector = {
    create(vector: VectorType) {
        for (let [key, space] of Object.entries(vector.base)) space.egress.push({ vector, key });
        for (let [key, space] of Object.entries(vector.tip)) space.ingress.push({ vector, key });
    },
};
