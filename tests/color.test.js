import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseColor, CSS4, rgb2hex } from '../src/modules/color.js'

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
