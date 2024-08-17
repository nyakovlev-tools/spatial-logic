import { expect, test } from 'vitest'
import { Space, Instance } from './model';

test('basic vector', () => {

    // Libraries will essentially export a 'define' function like the one below, so that control (and external context) can be inverted on the provided space.
    function define(_) {
        _.vector({
            base: {i: _},
            tip: {o: _.scope('half')},
            forward: ({i}) => [{o: i.region.scope('half')}],
            back: ({o}) => [{i: o.region.unscope('half')}],
            apply: ({i, o}) => o.assign({
                value: i.value / 2,
                region: i.region.scope('half'),
            }),
        });
    }
    
    let _ = Space();
    define(_);

    let entity = _.instance();
    entity.assign(8);
    entity.scope('half').resolve(v => expect(v).toBe(4));

});
