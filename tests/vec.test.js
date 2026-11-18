import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as v2 from '../src/modules/vec2.js'
import * as v3 from '../src/modules/vec3.js'

test('vec2', () => {
	const a = v2.vec2(3, 4)
	assert.deepEqual(v2.vec2(1), { x : 1, y : 1 })
	assert.equal(v2.length(a), 5)
	assert.deepEqual(v2.mul(a, 2), { x : 6, y : 8 })
	assert.deepEqual(v2.sub(a, v2.vec2(1, 2)), { x : 2, y : 2 })
	assert.deepEqual(v2.neg(a), { x : -3, y : -4 })
	assert.deepEqual(v2.mod(v2.vec2(-1, 5), 4), { x : 3, y : 1 })
	assert.deepEqual(v2.step(4, a), { x : 0, y : 1 })
	assert.deepEqual(v2.clamp(a, 0, 3.5), { x : 3, y : 3.5 })
	assert.deepEqual(v2.mix(v2.vec2(0), a, 0.5), { x : 1.5, y : 2 })
	assert.deepEqual(v2.normalize(v2.vec2(0)), { x : 0, y : 0 })
	assert.equal(v2.distance(a, v2.vec2(0)), 5)
	const r = v2.rot(v2.vec2(1, 0), Math.PI / 2)
	assert.ok(Math.abs(r.x) < 1e-9 && Math.abs(r.y - 1) < 1e-9)
	const b = v2.vec2(1, 0)
	v2.rot(b, Math.PI / 2, b)
	assert.ok(Math.abs(b.x) < 1e-9 && Math.abs(b.y - 1) < 1e-9)
	assert.deepEqual(v2.reflect(v2.vec2(1, -1), v2.vec2(0, 1)), { x : 1, y : 1 })
})

test('vec3', () => {
	const x = v3.vec3(1, 0, 0)
	const y = v3.vec3(0, 1, 0)
	assert.deepEqual(v3.cross(x, y), { x : 0, y : 0, z : 1 })
	const r = v3.rotZ(x, Math.PI / 2)
	assert.ok(Math.abs(r.x) < 1e-9 && Math.abs(r.y - 1) < 1e-9 && r.z == 0)
	const ry = v3.rotY(v3.vec3(0, 0, 1), Math.PI / 2)
	assert.ok(Math.abs(ry.x - 1) < 1e-9 && Math.abs(ry.z) < 1e-9)
	assert.equal(v3.dot(v3.vec3(1, 2, 3), v3.vec3(1)), 6)
})
