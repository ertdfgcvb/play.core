import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as n from '../src/modules/num.js'

test('GLSL semantics', () => {
	assert.equal(n.mod(-1, 10), 9)
	assert.equal(n.mod(12, 10), 2)
	assert.equal(n.mod(-0.25, 1), 0.75)
	assert.equal(n.fract(-0.25), 0.75)
	assert.equal(n.step(0.5, 0.5), 1)
	assert.equal(n.smoothstep(0, 1, 0.5), 0.5)
	assert.equal(n.atan(1, -1), Math.atan2(1, -1))
	assert.equal(n.atan(1), Math.atan(1))
	assert.equal(n.sign(-3), -1)
})

test('helpers', () => {
	assert.equal(n.map(5, 0, 10, 0, 100), 50)
	assert.equal(n.mapClamped(20, 0, 10, 0, 100), 100)
	assert.equal(n.unmix(10, 20, 15), 0.5)
	assert.equal(n.wrap(1, 2, 5), 4)
	assert.equal(n.wrap(-1, 2, 5), 2)
	assert.equal(n.pingpong(7, 5), 3)
	assert.equal(n.quantize(0.4, 3), 0.5)
	assert.equal(n.lenManhattan(-2, 3), 5)
	assert.equal(n.lenChebyshev(-2, 3), 3)
	assert.equal(n.distEuclidean(0, 0, 3, 4), 5)
})
