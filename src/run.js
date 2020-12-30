/**
Runner
*/

// Both available renderers are imported
import { textRenderer   } from './core/textrenderer.js'
import { canvasRenderer } from './core/canvasrenderer.js'
import FPS from './core/fps.js'
import storage from './core/storage.js'
import VERSION from './core/version.js'

// Default settings for the program runner.
// They can be overwritten by the parameters of the runner
// or as a settings object exported by the program (in this order).
const defaultSettings = {
	cols         : 0,       // number of columns, 0 is equivalent to 'auto'
	rows         : 0,       // number of columns, 0 is equivalent to 'auto'
	once         : false,   // if set to true the renderer will run only once
	fps          : 30,      // fps capping
	renderer     : 'text',  // can be 'canvas', anything else falls back to 'text'
	background   : '',      // default styles of the target element
	color        : '',
	weight       : '',
	allowSelect  : false,   // allows selection of the rendered element
	restoreState : false,   // will store the "state" object in local storage
	                        // this is handy for live-coding situations
}

// Program runner.
// Takes a program object (usually an imported module),
// an Element object (usually a <pre> element) as rendering target
// and some optional settings (see above) as arguments.
// Finally, a precalculated metrics object can be passed,
// otherwise it will be calcualted prior first run.
// The program object should contain at least a main(), pre() or post() function.
export function run(program, element, runSettings) {

	// Everything is wrapped inside a promise;
	// in case of errors in ‘program’ it will reject without reaching the bottom.
	// If the program reaches the bottom of the first frame the promise is resolved.
	return new Promise(function(resolve) {
		// Merge of user- and default settings
		const settings = {...defaultSettings, ...runSettings, ...program.settings}

		// State is stored in local storage and will loaded on program launch
		// if settings.restoreState == true.
		// The purpose of this is to live edit the code without resetting
		// time and the frame counter.
		const state = {
			time  : 0, // The time in ms
			frame : 0, // The frame number (int)
			cycle : 0  // An cycle count for debugging purposes
		}

		// Name of local storage key
		const LOCAL_STORAGE_KEY_STATE = 'currentState'

		if (settings.restoreState) {
			storage.restore(LOCAL_STORAGE_KEY_STATE, state)
			state.cycle++ // Keep track of the cycle count for debugging purposes
		}

		// If element is not provided create a default element based
		// on the renderer settings.
		// Then choose the renderer:
		// If the parent element is a canvas the canvas renderer is selected,
		// for any other type a text node (PRE or any othe text node)
		// is expected and the text renderer is used.
		let renderFn
		if (!element) {
			if (settings.renderer == 'canvas') {
				element = document.createElement('canvas')
				renderFn = canvasRenderer
			} else {
				element = document.createElement('pre')
				renderFn = textRenderer
			}
			document.body.appendChild(element)
		} else {
			if (settings.renderer == 'canvas') {
				if (element.nodeName != 'CANVAS') {
					renderFn = canvasRenderer
				} else {
					console.warn("This renderer expects a CANVAS target element.")
				}
			} else {
				if (element.nodeName != 'CANVAS') {
					renderFn = textRenderer
				} else {
					console.warn("This renderer expects a text target element.")
				}
			}
		}

		// Eventqueue
		// Stores events and pops them at the end of the renderloop
		const eventQueue = []

		// Input pointer updated by DOM evenets
		const pointer = {
			x        : 0,
			y        : 0,
			pressed  : false,
			px       : 0,
			py       : 0,
			ppressed : false,
		}

		element.addEventListener('pointermove', e => {
			const rect = element.getBoundingClientRect()
			pointer.x = e.clientX - rect.left
			pointer.y = e.clientY - rect.top
			eventQueue.push('pointerMove')
		})

		element.addEventListener('pointerdown', e => {
			pointer.pressed = true
			eventQueue.push('pointerDown')
		})

		element.addEventListener('pointerup', e => {
			pointer.pressed = false
			eventQueue.push('pointerUp')
		})

		// const CSSInfo = getCSSInfo(element)

		element.style.fontStrech = 'normal'
		if (settings.allowSelect == false) disableSelect(element)

		// Variable which holds some font metrics informations.
		// It’ll be populated after all the fonts are loaded.
		// See additional notes below.
		// let metrics (<--- passed optionally as arg.)

		// Method to load a font via the FontFace object.
		// The load promise works 100% of the times.
		// But a definition of the font via CSS is preferable and more flexible.
		/*
		var font = new FontFace('Simple Console', 'url(/css/fonts/simple/SimpleConsole-Light.woff)', { style: 'normal', weight: 400 })
		font.load().then(function(f) {
			document.fonts.add(f)
		  	element.style.fontFamily = font.family
		  	element.fontVariantLigatures = 'none'
			const ci = CSSinfo(element)
			console.log(`Using font faimily: ${ci.fontFamily} @ ${ci.fontSize}/${ci.lineHeight}`)

			metrics = calcMetrics(element)
			element.style.lineHeight = Math.ceil(metrics.lineHeightf) + 'px'
			console.log(`Metrics: cellWidth: ${metrics.cellWidth}, lineHeightf: ${metrics.lineHeightf}`)

			requestAnimationFrame(loop)
		})
		*/

		// Metrics need to be calculated
		// Even with the "fonts.ready" the font may STILL not be loaded yet
		// on Safari 13.x and also 14.0.
		// A (shitty) workaround is to wait 2! rAF and execute calcMetrics twice.
		// Submitted: https://bugs.webkit.org/show_bug.cgi?id=217047
		let metrics
		document.fonts.ready.then((e) => {
			// Run this three times
			let count = 3
			;(function __run_thrice__() {
				if (--count > 0) {
					requestAnimationFrame(__run_thrice__)
				} else {
					// element.style.lineHeight = Math.ceil(metrics.lineHeightf) + 'px'
					// console.log(`Using font faimily: ${ci.fontFamily} @ ${ci.fontSize}/${ci.lineHeight}`)
					// console.log(`Metrics: cellWidth: ${metrics.cellWidth}, lineHeightf: ${metrics.lineHeightf}`)
					// Finally Boot!
					metrics = calcMetrics(element)
					requestAnimationFrame(loop)
				}
			})()
			// Ideal mode:
			// metrics = calcMetrics(element)
			// requestAnimationFrame(loop)
		})

		// Time sample to calculate precise offset
		let timeSample = 0
		// Previous time step to increment state.time (with state.time initial offset)
		let ptime = 0
		const interval = 1000 / settings.fps
		const timeOffset = state.time

		// FPS object (keeps some state for precise FPS measure)
		const fps = new FPS()

		// A cell with no value at all is just a space
		const EMPTY_CELL = ' '

		// Buffers needed for the final DOM rendering,
		// each array entry represents a cell.
		// An extra data buffer for ‘user data’ is provided and can be modified
		// in runtime.
		// NOTE: extra size infos will be attached at each frame update.
		const buffers = {
			state  : [],
			data   : [], // user data
			cols   : 0,
			rows   : 0,
			length : 0
		}

		// Main program loop
		function loop(t) {

			// Timing
			const delta = t - timeSample
			if (delta < interval) {
				// Skip the frame
				if (!settings.once) requestAnimationFrame(loop)
				return
			} else {
				timeSample = t - delta % interval // adjust timeSample
				state.time = t + timeOffset       // increment time + initial offs
				state.frame++                     // increment frame counter
				storage.store(LOCAL_STORAGE_KEY_STATE, state) // store state
			}

			// Context data
			const rect = element.getBoundingClientRect()
			const cols = settings.cols || Math.floor(rect.width / metrics.cellWidth)
			const rows = settings.rows || Math.floor(rect.height / metrics.lineHeight)

			const context = Object.freeze({
				// Context info
				frame : state.frame,
				time  : state.time,
				cols,
				rows,
				metrics,
				// Container
				parentInfo : Object.freeze({
					width  : rect.width,
					height : rect.height,
					element
				}),
				// Runtime & debug data
				runtime : Object.freeze({
					cycle : state.cycle,
					fps   : fps.update(t)
					// updatedRowNum
				})
			})

			// Cursor update
			const cursor = Object.freeze({
				x       : pointer.x / metrics.cellWidth,
				y       : pointer.y / metrics.lineHeight,
				pressed : pointer.pressed,
				p : { // state of previous frame
					x       : pointer.px / metrics.cellWidth,
					y       : pointer.py / metrics.lineHeight,
					pressed : pointer.ppressed,
				}
			})

			// Update buffer attributes
			buffers.cols = cols
			buffers.rows = rows
			buffers.length = cols * rows

			// Default cellstyle inserted in case of undefined / null
			const defaultCell = Object.freeze({
				color      : settings.color,
				background : settings.background,
				weight     : settings.weight,
			})

			// 1. --------------------------------------------------------------
			// Call pre(), if defined
			if (typeof program.pre == 'function') {
				program.pre(context, cursor, buffers)
			}

			// 2. --------------------------------------------------------------
			// Call main(), if defined
			if (typeof program.main == 'function') {
				for (let j=0; j<rows; j++) {
					const offs = j * cols
					for (let i=0; i<cols; i++) {
						const idx = i + offs
						buffers.state[idx] = program.main({x:i, y:j, index:idx}, context, cursor, buffers)
					}
				}
			}

			// 3. --------------------------------------------------------------
			// Call post(), if defined
			if (typeof program.post == 'function') {
				program.post(context, cursor, buffers)
			}

			// 4. --------------------------------------------------------------
			// Normalize the buffer
			// (the buffer can contain a single char or a cell object)
			const num = rows * cols
			for (let i=0; i<num; i++) {
				const out = buffers.state[i]
				const cell = typeof out == 'object' ? {...defaultCell, ...out} : {...defaultCell, char : out}
				// Make sure that char is set:
				// undefined, null and '' (empty string) should be rendered as EMPTY_CELL
				// Watch out for special case of 0 (zero).
				if (!Boolean(cell.char) && cell.char !== 0) cell.char = EMPTY_CELL
				// Chop in case of string (+ convert in case of number):
				cell.char = (cell.char + '')[0]
				buffers.state[i] = cell
			}

			// 5. --------------------------------------------------------------
			if (typeof renderFn == 'function') renderFn(context, buffers, settings)

			// 6. --------------------------------------------------------------
			// Queued events
			while (eventQueue.length > 0) {
				const type = eventQueue.shift()
				if (type && typeof program[type] == 'function') {
					program[type](context, cursor, buffers)
				}
			}

			// 7. --------------------------------------------------------------
			// Store pointer .pre
			pointer.px = pointer.x
			pointer.py = pointer.y
			pointer.ppressed = pointer.pressed

			// 8. --------------------------------------------------------------
			// Loop (eventually)
			if (!settings.once) requestAnimationFrame(loop)

			// The end of the first frame is reached without errors
			// the promise can be resolved.
			resolve(true)
		}
	})
}

// -- Helpers ------------------------------------------------------------------

// Disables selection for an HTML element
function disableSelect(el) {
	el.style.userSelect = 'none'
	el.style.webkitUserSelect = 'none' // for Safari on mac and iOS
	el.style.mozUserSelect = 'none'    // for mobile FF
	el.dataset.selectionEnabled = 'false'
}

// Enables selection for an HTML element
function enableSelect(el) {
	el.style.userSelect = 'auto'
	el.style.webkitUserSelect = 'auto'
	el.style.mozUserSelect = 'auto'
	el.dataset.selectionEnabled = 'true'
}

// Copies the content of an element to the clipboard
export function copyContent(el) {
	// Store selection default
	const selectionEnabled = !el.dataset.selectionEnabled == 'false'

	// Enable selection if necessary
	if (!selectionEnabled) enableSelect(el)

	// Copy the text block
	const range = document.createRange()
	range.selectNode(el)
	const sel = window.getSelection()
	sel.removeAllRanges()
	sel.addRange(range)
	document.execCommand('copy')

	// Restore default, if necessary
	if (!selectionEnabled) disableSelect(el)
}

// Old method, see updatd version below:
/*
export function calcMetrics(el) {
	const test = document.createElement('span')
	el.appendChild(test) // Must be visible!

	const testChar = 'X'
	const num = 50 // How wide, how high?

	// Metrics H
	let out = ''
	for (let i=0; i<num; i++) out += testChar
	test.innerHTML = out
	const w = test.getBoundingClientRect().width / num

	// Metrics V
	out = ''
	for (let i=0; i<num; i++) out += '<span>' + testChar + '</span><br>'
	test.innerHTML = out
	const h = test.getBoundingClientRect().height / num

	// Clean up
	el.removeChild(test)

	return Object.freeze({
		cellWidth  : w,
		lineHeight : h, // should be the same as CSS
		aspect     : w / h,
	})
}

// Returns some CSS info
function getCSSInfo(el) {
	const style = window.getComputedStyle(el)
	return Object.freeze({
		fontFamily : style.getPropertyValue('font-family'),
		lineHeight : style.getPropertyValue('line-height'),
		fontSize   : style.getPropertyValue('font-size'),
	})
}
*/

// Calcs width (fract), height, aspect of a monospaced char
// assuming that the CSS font-family is a monospaced font.
// Returns an immutable (frozen) object.

export function calcMetrics(el) {
	const style = getComputedStyle(el)

	const fontFamily = style.getPropertyValue('font-family')
	const lineHeight = parseFloat(style.getPropertyValue('line-height'))
	const fontSize   = parseFloat(style.getPropertyValue('font-size'))

	const c = el.nodeName == 'CANVAS' ? el : document.createElement('canvas')
	const ctx = c.getContext("2d")
	ctx.font = fontSize + 'px ' + fontFamily

	const cellWidth = ctx.measureText(''.padEnd(10, 'x')).width / 10

	return Object.freeze({
		aspect : cellWidth / lineHeight,
		cellWidth,
		lineHeight,
		fontFamily,
		fontSize
	})
}



