import { expect, test } from 'vitest'
import { P } from './model';

test('paths scope', () => {
    P().a.b.c
    console.log("Scoped!");
});
