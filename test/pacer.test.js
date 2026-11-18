import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createPacer } from '../src/core/scheduler.js'

// Frames rendered by a pacer for display ticks at hz
function simulate(hz, fps, ms) {
	const pacer = createPacer(1000 / fps)
	const times = []
	for (let i=0; i * 1000 / hz < ms; i++) {
		const t = i * 1000 / hz
		if (pacer.due(t)) times.push(t)
	}
	return times
}

for (const [hz, fps, frames] of [[60, 30, 300], [120, 30, 300], [120, 60, 600]]) {
	test(fps + ' fps on ' + hz + ' Hz: every ' + (hz / fps) + ' ticks', () => {
		const t = simulate(hz, fps, 10000)
		assert.ok(Math.abs(t.length - frames) <= 2, 'frames: ' + t.length)
	})
}


test('uncapped: every tick', () => {
	const pacer = createPacer(0)
	assert.equal(pacer.due(0) && pacer.due(1) && pacer.due(2), true)
})
