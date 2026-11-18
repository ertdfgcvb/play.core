import { test } from 'node:test'
import assert from 'node:assert/strict'
import { run } from '../src/run.js'
import { block } from '../src/modules/block.js'
import { box, panel, info } from '../src/modules/window.js'

async function frame(post, cols = 12, rows = 6) {
	const h = await run({ main : () => '.', post }, { renderer : null, cols, rows, once : true })
	h.stop()
	return h
}

test('box: borders and shadow', async () => {
	const h = await frame(({ buffer }) => {
		box(buffer, 0, 0, 4, 3, { border : 'single', shadow : 'light', shadowX : 1, shadowY : 1 })
	}, 6, 4)
	assert.equal(h.text(), '┌──┐..\n│  │░.\n└──┘░.\n.░░░░.\n')
})

test('panel: auto size, title, padding', async () => {
	const h = await frame(({ buffer }) => {
		const r = panel(buffer, 'hi', 0, 0, { title : 'T', paddingX : 1, paddingY : 0 })
		assert.deepEqual(r.inner, { x : 2, y : 1, width : 3, height : 1 })
	}, 8, 4)
	assert.equal(h.text(), '╭─ T ─╮.\n│ hi  │.\n╰─────╯.\n........\n')
})

test('panel: wrap and clip to fixed size', async () => {
	const h = await frame(({ buffer }) => {
		panel(buffer, 'aaa bbb ccc', 0, 0, { width : 7, height : 4, paddingX : 1, paddingY : 0, border : 'ascii' })
	}, 8, 5)
	assert.equal(h.text(), '+-----+.\n| aaa |.\n| bbb |.\n+-----+.\n........\n')
})

test('panel: block content keeps transparency over the fill', async () => {
	const art = block('x x')
	const h = await frame(({ buffer }) => {
		panel(buffer, art, 0, 0, { paddingX : 0, paddingY : 0, border : 'none' })
	}, 6, 3)
	assert.equal(h.text(), '     .\n x x .\n     .\n')
})

test('info', async () => {
	const h = await frame(ctx => info(ctx, 0, 0), 30, 12)
	assert.match(h.text(), /frame   0/)
	assert.match(h.text(), /size    30×12/)
})
