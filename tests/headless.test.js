import { test } from 'node:test'
import assert from 'node:assert/strict'
import { run } from '../src/run.js'

test('main() fills the grid', async () => {
	const h = await run({ main : ({ x, y }) => (x + y) % 2 ? '.' : '#' }, { renderer : null, cols : 4, rows : 2 })
	assert.equal(h.text(), '#.#.\n.#.#\n')
	assert.equal(h.state, 'running')
	h.stop()
})

test('autoStart false and step()', async () => {
	const h = await run({ main : (c, { frame }) => frame % 10 }, { renderer : null, cols : 3, rows : 1, autoStart : false })
	assert.equal(h.ctx, null)
	h.step(4)
	assert.equal(h.text(), '333\n')
	assert.equal(h.ctx.frame, 3)
	assert.equal(h.ctx.time, 3 * 1000 / 30)
	h.stop()
})

test('pre writes survive, main can skip cells, objects merge', async () => {
	const program = {
		pre  : ({ buffer }) => buffer.set(0, 0, { char : 'A', color : 'red' }),
		main : ({ x }) => x == 0 ? undefined : { char : x, fontWeight : 700 },
	}
	const h = await run(program, { renderer : null, cols : 3, rows : 1, once : true })
	assert.equal(h.text(), 'A12\n')
	assert.equal(h.buffer.get(0, 0).color, 'red')
	assert.equal(h.buffer.get(2, 0).fontWeight, 700)
	assert.equal(h.state, 'paused')
	h.stop()
})

test('without main the buffer persists', async () => {
	const program = { pre : ({ frame, buffer }) => buffer.set(frame, 0, '*') }
	const h = await run(program, { renderer : null, cols : 3, rows : 1, autoStart : false })
	h.step(3)
	assert.equal(h.text(), '***\n')
	h.stop()
})

test('ctx is frozen, settings precedence', async () => {
	const program = { settings : { fps : 10, cols : 5 }, main : () => 'x' }
	const h = await run(program, { renderer : null, cols : 2, rows : 1, once : true })
	assert.throws(() => { h.ctx.cols = 9 })
	assert.equal(h.ctx.settings.fps, 10)
	assert.equal(h.ctx.cols, 2)
	h.stop()
})

test('errors in the first frame reject', async () => {
	await assert.rejects(run({ main : () => { throw new Error('boom') } }, { renderer : null }), /boom/)
})

test('runtime errors stop the instance and reach onerror', async () => {
	let n = 0
	const h = await run({ main : (c, { frame }) => { if (frame > 0) throw new Error('later'); return n } }, { renderer : null, cols : 1, rows : 1, fps : 60 })
	const err = await new Promise(resolve => h.onerror = resolve)
	assert.match(err.message, /later/)
	assert.equal(h.state, 'stopped')
})

test('txt snapshot', async () => {
	const h = await run({ main : () => 'ab' }, { renderer : null, cols : 1, rows : 2, once : true })
	assert.equal(await (await h.snapshot()).text(), 'ab\nab\n')
	await assert.rejects(h.snapshot('png'), /not supported/)
	h.stop()
})

test('a URL gives each run its own module copy', async () => {
	const url = new URL('./fixtures/counter.js', import.meta.url)
	const opts = { renderer : null, cols : 1, rows : 1, autoStart : false }
	const a = await run(url, opts)
	const b = await run(url, opts)
	a.step(3)
	b.step(1)
	assert.equal(a.text(), '3\n')
	assert.equal(b.text(), '1\n')
	assert.notEqual(a.program, b.program)
	a.stop()
	b.stop()
})

test('relative URL strings resolve against the working directory in Node', async () => {
	const h = await run('tests/fixtures/counter.js', { renderer : null, cols : 1, rows : 1, once : true })
	assert.equal(h.text(), '1\n')
	h.stop()
})

test('a missing module rejects', async () => {
	await assert.rejects(run('tests/fixtures/missing.js', { renderer : null }))
})

test('clear : false keeps the buffer with main()', async () => {
	const program = {
		settings : { clear : false },
		pre  : ({ frame, buffer }) => { if (frame == 0) buffer.set(0, 0, '#') },
		main : (coord, { frame }) => coord.x == 1 ? frame : undefined,
	}
	const h = await run(program, { renderer : null, cols : 2, rows : 1, autoStart : false })
	h.step(3)
	assert.equal(h.text(), '#2\n')
	h.stop()
})
