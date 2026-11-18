import { test } from 'node:test'
import assert from 'node:assert/strict'
import { run } from '../src/run.js'
import { Grid } from '../src/modules/grid.js'
import { block, draw } from '../src/modules/draw.js'
import { dedent, measure, wrap, align, truncate } from '../src/modules/text.js'

const art = `
	╭──╮
	│ab│ ✦
	╰──╯
`

test('text', () => {
	assert.equal(dedent(art), '╭──╮\n│ab│ ✦\n╰──╯')
	assert.deepEqual(measure(dedent(art)), { width : 6, height : 3 })
	assert.equal(wrap('the quick brown fox', 9), 'the quick\nbrown fox')
	assert.equal(align('ab', 6, 'center'), '  ab  ')
	assert.equal(align('ab', 4, 'right'), '  ab')
	assert.equal(truncate('abcdef', 4), 'abc…')
})

test('block: transparent and styles', () => {
	const b = block(art, { styles : { '✦' : { color : 'gold' } } })
	assert.equal(b.width, 6)
	assert.equal(b.get(0, 0), '╭')
	assert.equal(b.get(4, 1), null)
	assert.deepEqual(b.get(5, 1), { char : '✦', color : 'gold' })
	assert.equal(b.get(9, 9), null)
	assert.equal(b.get(5, 0), null)
})

test('block in main, draw in post', async () => {
	const logo = block('AB\nC')
	const program = {
		main : ({ x, y }) => logo.get(x - 1, y) ?? '.',
		post : ({ buffer }) => draw(buffer, 'xy', 3, 2, { color : 'red' }),
	}
	const h = await run(program, { renderer : null, cols : 5, rows : 3, once : true })
	assert.equal(h.text(), '.AB..\n.C...\n...xy\n')
	assert.equal(h.buffer.get(4, 2).color, 'red')
	h.stop()
})

test('draw: centered, clipped, opaque strings', async () => {
	const h = await run({
		main : () => '.',
		post : ({ buffer }) => {
			draw(buffer, 'a b', 2, 1, { align : 'center' })
			draw(buffer, 'zzzz', 3, 0)
			buffer.set(-0.5, 0.7, 'never')
		},
	}, { renderer : null, cols : 5, rows : 2, once : true })
	assert.equal(h.text(), '...zz\n.a b.\n')
	h.stop()
})

test('grid sampler', () => {
	const g = new Grid(2, 1)
	g.setArray([0, 10])
	assert.equal(g.sample(0.5, 0.5), 5)
	assert.equal(g.sample(0, 0.5), 0)
	assert.equal(g.sampler({ filter : 'nearest', wrap : 'repeat' })(1.2, 0), 0)
	assert.equal(g.sampler({ lerp : (a, b, t) => Math.max(a, b) })(0.5, 0.5), 10)
})
