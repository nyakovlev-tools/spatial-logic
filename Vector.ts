import { Space } from "./Space";
import { State } from "./State";

export type Flow = {
    key: string
    vector: Vector
}

export interface Vector {
    base: {[key: string]: Space}
    tip: {[key: string]: Space}
    forward(props: {[key: string]: Space}): Array<{[key: string]: Space}>
    back(props: {[key: string]: Space}): Array<{[key: string]: Space}>
    apply(props: {[key: string]: State}): void
}
