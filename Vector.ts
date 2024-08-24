import Space from "./Space"
import Instance from "./Instance"

export type Flow = {
    key: string
    vector: Vector
}

export type Hop = {}

export default interface Vector {
    base: {[key: string]: Space}
    tip: {[key: string]: Space}
    forward(props: {[key: string]: Space}): Array<{[key: string]: Space}>
    back(props: {[key: string]: Space}): Array<{[key: string]: Space}>
    apply(props: {[key: string]: Instance}): void
}
