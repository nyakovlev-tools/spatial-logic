import { expect, test } from 'vitest'
import Space from './index';

test('reflexive', () => {
    let instance = new Space().state<number>();
    const sample = 5;
    instance.assign(sample);
    expect(instance.resolve()).toBe(sample);
});

// test('basic vector', () => {

//     // Libraries will essentially export a 'define' function like the one below, so that control (and external context) can be inverted on the provided space.
//     function define(_: Space) {
//         _.vector({
//             base: {i: _},
//             tip: {o: _.scope('half')},
//             forward: ({i}) => [{o: i.scope('half')}],
//             back: ({o}) => [{i: o.unscope('half')}],
//             apply: ({i, o}) => o.assign({
//                 value: i.value / 2,
//                 region: i.scope('half'),
//             }),
//         });
//     }
    
//     let _ = new Space();
//     define(_);

//     let entity = _.instance();
//     entity.assign(8);
//     entity.scope('half').resolve(v => expect(v).toBe(4));

// });
