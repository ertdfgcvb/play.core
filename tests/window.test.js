import { test } from 'node:test'
import assert from 'node:assert/strict'
import { run } from '../src/run.js'
import { block, write } from '../src/modules/block.js'
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

test('ctx or buffer as target', async () => {
	const h = await frame(ctx => {
		panel(ctx, 'a', 0, 0, { paddingX : 0, paddingY : 0, border : 'ascii' })
		box(ctx.buffer, 4, 0, 3, 3, { border : 'ascii' })
	}, 8, 3)
	assert.equal(h.text(), '+-+.+-+.\n|a|.| |.\n+-+.+-+.\n')
})

test('desktop: draw, drag, front, close', async () => {
	const { Desktop } = await import('../src/modules/window.js')
	const desk = new Desktop({ border : 'ascii', paddingX : 0, paddingY : 0 })
	const a = desk.open({ x : 0, y : 0, width : 8, height : 3, title : 'a', content : 'A' })
	const b = desk.open({ x : 2, y : 1, width : 8, height : 3, content : ctx => 'Bxxxxxxxxx' })

	// Scripted cursor: the program is driven with step()
	let cursor = { x : 0, y : 0, pressed : false }
	const program = { main : () => '.', post : ctx => desk.update({ ...ctx, cursor : { ...cursor, prev : prev } }) }
	let prev = { ...cursor }
	const h = await run(program, { renderer : null, cols : 14, rows : 6, autoStart : false })
	const step = c => { prev = cursor; cursor = c; h.step() }

	step({ x : 0, y : 0, pressed : false })
	assert.equal(h.text(), '+- a ×-+......\n|A+----×-+....\n+-|Bxxxx…|....\n..+------+....\n..............\n..............\n', 'b on top of a, content clipped')

	step({ x : 1, y : 1, pressed : true })
	assert.equal(desk.windows[1], a, 'click brings a to front')

	step({ x : 1, y : 1, pressed : false })
	step({ x : 3, y : 0, pressed : true })
	step({ x : 6, y : 2, pressed : true })
	step({ x : 6, y : 2, pressed : false })
	assert.deepEqual([a.x, a.y], [3, 2], 'dragged by the title bar')

	step({ x : a.x + 5, y : a.y, pressed : true })
	assert.equal(desk.windows.length, 1, 'closed with ×')
	assert.equal(desk.hit(3, 2), b)
	h.stop()
})

test('desktop: style cascades, window style overrides, invert title', async () => {
	const { Desktop } = await import('../src/modules/window.js')
	const desk = new Desktop({ color : 'white', backgroundColor : 'royalblue', titleStyle : 'invert' })
	desk.open({ title : 'a', content : 'x' })
	desk.open({ x : 10, title : 'b', content : 'y', backgroundColor : 'crimson' })
	const h = await frame(ctx => desk.update(ctx), 20, 4)
	assert.deepEqual([h.buffer.get(3, 0).color, h.buffer.get(3, 0).backgroundColor], ['royalblue', 'white'])
	assert.equal(h.buffer.get(11, 1).backgroundColor, 'crimson')
	assert.equal(h.buffer.get(11, 1).color, 'white')
})

test('info defaults', async () => {
	const h = await frame(ctx => info(ctx), 30, 10)
	assert.match(h.text(), /─ info ─/)
	assert.equal(h.buffer.get(3, 2).backgroundColor, 'royalblue')
})

test('desktop: live content fits its text', async () => {
	const { Desktop, infoText } = await import('../src/modules/window.js')
	const desk = new Desktop()
	const w = desk.open({ title : 'info', content : infoText })
	const h = await frame(ctx => desk.update(ctx), 40, 14)
	assert.match(h.text(), /cursor  0,0/)
	assert.equal(w.rect.height, 6 + 2 + 2)
})
