import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseColor, rgb2hex } from '../src/modules/color.js'
import { CSS4 } from '../src/modules/palettes.js'

test('parseColor', () => {
	assert.deepEqual(parseColor('tomato'), { r : 255, g : 99, b : 71, a : 1 })
	assert.deepEqual(parseColor('#f80'), { r : 255, g : 136, b : 0, a : 1 })
	assert.deepEqual(parseColor('#ff880080'), { r : 255, g : 136, b : 0, a : 128 / 255 })
	assert.deepEqual(parseColor('rgb(10, 20, 30)'), { r : 10, g : 20, b : 30, a : 1 })
	assert.deepEqual(parseColor('rgb(10 20 30 / 50%)'), { r : 10, g : 20, b : 30, a : 0.5 })
	assert.deepEqual(parseColor('rgba(100%, 0%, 0%, 0.25)'), { r : 255, g : 0, b : 0, a : 0.25 })
	assert.deepEqual(parseColor('hsl(120, 100%, 50%)'), { r : 0, g : 255, b : 0, a : 1 })
	assert.deepEqual(parseColor('transparent'), { r : 0, g : 0, b : 0, a : 0 })
	assert.equal(parseColor('nope'), null)
	assert.equal(parseColor('#12'), null)
	assert.equal(parseColor('tomato'), parseColor('tomato'))
	assert.ok(Object.isFrozen(parseColor('red')))
})

test('palettes', () => {
	assert.equal(CSS4.red.hex, '#ff0000')
	assert.equal(typeof CSS4.red.gray, 'number')
	assert.equal(rgb2hex({ r : 255, g : 0, b : 0, a : 0.5 }), '#ff000080')
})

test('tables and conversions', async () => {
	const C = { ...await import('../src/modules/color.js'), ...await import('../src/modules/palettes.js') }
	assert.equal(Object.keys(C.CSS4).length, 148)
	assert.equal(Object.keys(C.CSS3).length, 147)
	assert.equal(C.CSS4.cyan.hex, '#00ffff')
	assert.deepEqual(C.parseColor('magenta'), { r : 255, g : 0, b : 255, a : 1 })
	assert.equal(C.rgb2hex({ r : 300, g : -4, b : 12.6 }), '#ff000d')
	assert.equal(C.rgb2gray({ r : 128, g : 128, b : 128 }), 128 / 255)
	assert.equal(C.css(1, 2, 3), 'rgb(1,2,3)')
	assert.equal(C.css(1, 2, 3, 0.5), 'rgba(1,2,3,0.5)')
})

test('mixColor, hsl, nearest, C64', async () => {
	const { mixColor, hsl, nearest } = await import('../src/modules/color.js')
	const { C64, CSS1 } = await import('../src/modules/palettes.js')
	assert.deepEqual(mixColor({ r : 0, g : 0, b : 0 }, { r : 255, g : 100, b : 50, a : 0 }, 0.5), { r : 127.5, g : 50, b : 25, a : 0.5 })
	assert.deepEqual(hsl(240, 1, 0.5), { r : 0, g : 0, b : 255, a : 1 })
	assert.equal(nearest({ r : 250, g : 10, b : 5 }, CSS1).name, 'red')
	assert.equal(nearest({ r : 0, g : 130, b : 250 }, C64).name, 'lightblue')
	assert.equal(C64.length, 16)
	assert.equal(C64[14].hex, '#0088ff')
})

test('EGA', async () => {
	const { EGA, CGA } = await import('../src/modules/palettes.js')
	assert.equal(EGA.length, 64)
	assert.equal(EGA[20].hex, '#aa5500', 'brown')
	assert.equal(EGA[63].hex, '#ffffff')
	assert.equal(EGA[56].hex, '#555555')
	// The default EGA palette selects these 16 of the 64: the CGA colors
	const defaults = [0, 1, 2, 3, 4, 5, 20, 7, 56, 57, 58, 59, 60, 61, 62, 63]
	assert.deepEqual(defaults.map(i => EGA[i].hex), CGA.map(c => c.hex))
})
