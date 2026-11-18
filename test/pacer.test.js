import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createPacer } from '../src/core/scheduler.js'

// Display ticks with jitter: frames rendered by a pacer over a duration
function simulate({ hz, fps, jitter, ms, seed = 1 }) {
	let r = seed
	const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647
	const pacer = createPacer(1000 / fps)
	const times = []
	for (let t=0; t<ms; t+=1000 / hz) {
		const tj = t + (rnd() * 2 - 1) * jitter
		if (pacer.due(tj)) times.push(tj)
	}
	return times
}

function steady(t, interval) {
	const gaps = t.slice(1).map((v, i) => v - t[i])
	return gaps.every(g => Math.abs(g - interval) < interval / 2)
}

for (const [hz, jitter] of [[60, 1], [60, 3], [120, 1], [120, 3], [144, 2]]) {
	test('30 fps on ' + hz + ' Hz, jitter ±' + jitter + ' ms: steady, never doubled', () => {
		const t = simulate({ hz, fps : 30, jitter, ms : 10000 })
		assert.ok(Math.abs(t.length - 300) <= 3, 'frames: ' + t.length)
		assert.ok(steady(t, 1000 / 30), 'uneven gaps')
	})
}

test('60 fps on 60 Hz, jitter ±2 ms: every tick', () => {
	const t = simulate({ hz : 60, fps : 60, jitter : 2, ms : 10000 })
	assert.ok(Math.abs(t.length - 600) <= 3, 'frames: ' + t.length)
})

test('after a stall no burst of frames', () => {
	const pacer = createPacer(1000 / 30)
	assert.equal(pacer.due(0), true)
	assert.equal(pacer.due(500), true)
	assert.equal(pacer.due(516), false)
	assert.equal(pacer.due(533.4), true)
})

test('uncapped: every tick', () => {
	const pacer = createPacer(0)
	assert.equal(pacer.due(0) && pacer.due(1) && pacer.due(2), true)
})
