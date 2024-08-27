import { expect, test } from 'vitest';
import { Space, State } from "./index";

// test('reflexive', () => {
//     let _ = new Space();
//     let state = new State();
//     const samplePath = ['key'];
//     const sampleValue = 5;
//     state.assign(samplePath, sampleValue);
//     expect(state.resolve(_.scope(...samplePath))).toBe(sampleValue);
// });

test('vector', () => {
    // Libraries will essentially export a 'define' function like the one below, so that control (and external context) can be inverted on the provided space.
    function define(_: Space) {
        _.vector({
            base: {i: _},
            tip: {o: _.scope('half')},
            forward: ({i}) => [{o: i.scope('half')}],
            back: ({o}) => [{i: o.unscope('half')}],
            apply: ({i, o}) => o.assign({
                value: i.value / 2,
                region: i.scope('half'),
            }),
        });
    }
    
    let _ = new Space();
    define(_);

    for (let i=0; i<3; i++) {
        if (_.from.solved()) {
            console.log("SOLVED");
            break;
        }
        console.log("pending:", _.from.pending.size);
        _.from.step();
    }

    // let state = new State();
    // state.assign([], 8);

    // expect(state.resolve(_.scope('half'))).toBe(4);
    // state.resolve(_.scope('half'));
});
