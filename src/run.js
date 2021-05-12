/**
Runner
*/

// Both available renderers are imported
import textRenderer from './core/textrenderer.js'
import canvasRenderer from './core/canvasrenderer.js'
import FPS from './core/fps.js'
import storage from './core/storage.js'
import RUNNER_VERSION from './core/version.js'

export { RUNNER_VERSION }

const renderers = {
	'canvas' : canvasRenderer,
	'text'   : textRenderer
}

// Default settings for the program runner.
// They can be overwritten by the parameters of the runner
// or as a settings object exported by the program (in this order).
const defaultSettings = {
	element         : null,    // target element for output
	cols            : 0,       // number of columns, 0 is equivalent to 'auto'
	rows            : 0,       // number of columns, 0 is equivalent to 'auto'
	once            : false,   // if set to true the renderer will run only once
	fps             : 30,      // fps capping
	renderer        : 'text',  // can be 'canvas', anything else falls back to 'text'
	allowSelect     : false,   // allows selection of the rendered element
	restoreState    : false,   // will store the "state" object in local storage
	                           // this is handy for live-coding situations
}

// CSS styles which can be passed to the container element via settings
const CSSStyles = [
	'backgroundColor',
	'color',
	'fontFamily',
	'fontSize',
	'fontWeight',
	'letterSpacing',
	'lineHeight',
	'textAlign',
]

// Program runner.
// Takes a program object (usually an imported module),
// and some optional settings (see above) as arguments.
// Finally, an optional userData object can be passed which will be available
// as last parameter in all the module functions.
// The program object should export at least a main(), pre() or post() function.
export function run(program, runSettings, userData = {}) {

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
		// TODO: better / more generic renderer init
		let renderer
		if (!settings.element) {
			renderer = renderers[settings.renderer] || renderers['text']
			settings.element = document.createElement(renderer.preferredElementNodeName)
			document.body.appendChild(settings.element)
		} else {
			if (settings.renderer == 'canvas') {
				if (settings.element.nodeName == 'CANVAS') {
					renderer = renderers[settings.renderer]
				} else {
					console.warn("This renderer expects a canvas target element.")
				}
			} else {
				if (settings.element.nodeName != 'CANVAS') {
					renderer = renderers[settings.renderer]
				} else {
					console.warn("This renderer expects a text target element.")
				}
			}
		}

		// Apply CSS settings to element
		for (const s of CSSStyles) {
			if (settings[s]) settings.element.style[s] = settings[s]
		}

		// Eventqueue
		// Stores events and pops them at the end of the renderloop
		// TODO: needed?
		const eventQueue = []

		// Input pointer updated by DOM events
		const pointer = {
			x        : 0,
			y        : 0,
			pressed  : false,
			px       : 0,
			py       : 0,
			ppressed : false,
		}

		settings.element.addEventListener('pointermove', e => {
			const rect = settings.element.getBoundingClientRect()
			pointer.x = e.clientX - rect.left
			pointer.y = e.clientY - rect.top
			eventQueue.push('pointerMove')
		})

		settings.element.addEventListener('pointerdown', e => {
			pointer.pressed = true
			eventQueue.push('pointerDown')
		})

		settings.element.addEventListener('pointerup', e => {
			pointer.pressed = false
			eventQueue.push('pointerUp')
		})

		// CSS fix
		settings.element.style.fontStrech = 'normal'

		// Text selection may be annoing in case of interactive programs
		if (!settings.allowSelect) disableSelect(settings.element)

		// Method to load a font via the FontFace object.
		// The load promise works 100% of the times.
		// But a definition of the font via CSS is preferable and more flexible.
		/*
		const CSSInfo = getCSSInfo(settings.element)
		var font = new FontFace('Simple Console', 'url(/css/fonts/simple/SimpleConsole-Light.woff)', { style: 'normal', weight: 400 })
		font.load().then(function(f) {
			...
		})
		*/

		// Metrics needs to be calculated before boot
		// Even with the "fonts.ready" the font may STILL not be loaded yet
		// on Safari 13.x and also 14.0.
		// A (shitty) workaround is to wait 3! rAF.
		// Submitted: https://bugs.webkit.org/show_bug.cgi?id=217047
		document.fonts.ready.then((e) => {
			// Run this three times...
			let count = 3
			;(function __run_thrice__() {
				if (--count > 0) {
					requestAnimationFrame(__run_thrice__)
				} else {
					// settings.element.style.lineHeight = Math.ceil(metrics.lineHeightf) + 'px'
					// console.log(`Using font faimily: ${ci.fontFamily} @ ${ci.fontSize}/${ci.lineHeight}`)
					// console.log(`Metrics: cellWidth: ${metrics.cellWidth}, lineHeightf: ${metrics.lineHeightf}`)
					// Finally Boot!
					boot()
				}
			})()
			// Ideal mode:
			// metrics = calcMetrics(settings.element)
			// etc.
			// requestAnimationFrame(loop)
		})

		// FPS object (keeps some state for precise FPS measure)
		const fps = new FPS()

		// A cell with no value at all is just a space
		const EMPTY_CELL = ' '

		// Default cell style inserted in case of undefined / null
		const DEFAULT_CELL_STYLE = Object.freeze({
			color           : settings.color,
			backgroundColor : settings.backgroundColor,
			fontWeight      : settings.fontWeight
		})

		// Buffer needed for the final DOM rendering,
		// each array entry represents a cell.
		const buffer = []

		// Metrics object, calc once (below)
		let metrics

		function boot() {
			metrics = calcMetrics(settings.element)
			const context = getContext(state, settings, metrics, fps)
			if (typeof program.boot == 'function') {
				program.boot(context, buffer, userData)
			}
			requestAnimationFrame(loop)
		}

		// Time sample to calculate precise offset
		let timeSample = 0
		// Previous time step to increment state.time (with state.time initial offset)
		let ptime = 0
		const interval = 1000 / settings.fps
		const timeOffset = state.time

		// Used to track window resize
		let cols, rows

		// Main program loop
		function loop(t) {

			// Timing
			const delta = t - timeSample
			if (delta < interval) {
				// Skip the frame
				if (!settings.once) requestAnimationFrame(loop)
				return
			}

			// Snapshot of context data
			const context = getContext(state, settings, metrics, fps)

			// FPS update
			fps.update(t)

			// Timing update
			timeSample = t - delta % interval // adjust timeSample
			state.time = t + timeOffset       // increment time + initial offs
			state.frame++                     // increment frame counter
			storage.store(LOCAL_STORAGE_KEY_STATE, state) // store state

			// Cursor update
			const cursor = {
				          // The canvas might be slightly larger than the number
				          // of cols/rows, min is required!
				x       : Math.min(context.cols-1, pointer.x / metrics.cellWidth),
				y       : Math.min(context.rows-1, pointer.y / metrics.lineHeight),
				pressed : pointer.pressed,
				p : { // state of previous frame
					x       : pointer.px / metrics.cellWidth,
					y       : pointer.py / metrics.lineHeight,
					pressed : pointer.ppressed,
				}
			}

			// Pointer: store previous state
			pointer.px = pointer.x
			pointer.py = pointer.y
			pointer.ppressed = pointer.pressed

			// 1. --------------------------------------------------------------
			// In case of resize / init normalize the buffer
			if (cols != context.cols || rows != context.rows) {
				cols = context.cols
				rows = context.rows
				buffer.length = context.cols * context.rows
				for (let i=0; i<buffer.length; i++) {
					buffer[i] = {...DEFAULT_CELL_STYLE, char : EMPTY_CELL}
				}
			}

			// 2. --------------------------------------------------------------
			// Call pre(), if defined
			if (typeof program.pre == 'function') {
				program.pre(context, cursor, buffer, userData)
			}

			// 3. --------------------------------------------------------------
			// Call main(), if defined
			if (typeof program.main == 'function') {
				for (let j=0; j<context.rows; j++) {
					const offs = j * context.cols
					for (let i=0; i<context.cols; i++) {
						const idx = i + offs
						// Override content:
						// buffer[idx] = program.main({x:i, y:j, index:idx}, context, cursor, buffer, userData)
						const out = program.main({x:i, y:j, index:idx}, context, cursor, buffer, userData)
						if (typeof out == 'object' && out !== null) {
							buffer[idx] = {...buffer[idx], ...out}
						} else {
							buffer[idx] = {...buffer[idx], char : out}
						}
						// Fix undefined / null / etc.
						if (!Boolean(buffer[idx].char) && buffer[idx].char !== 0) {
							buffer[idx].char = EMPTY_CELL
						}
					}
				}
			}

			// 4. --------------------------------------------------------------
			// Call post(), if defined
			if (typeof program.post == 'function') {
				program.post(context, cursor, buffer, userData)
			}

			// 5. --------------------------------------------------------------
			renderer.render(context, buffer, settings)

			// 6. --------------------------------------------------------------
			// Queued events
			while (eventQueue.length > 0) {
				const type = eventQueue.shift()
				if (type && typeof program[type] == 'function') {
					program[type](context, cursor, buffer)
				}
			}

			// 7. --------------------------------------------------------------
			// Loop (eventually)
			if (!settings.once) requestAnimationFrame(loop)

			// The end of the first frame is reached without errors
			// the promise can be resolved.
			resolve(context)
		}
	})
}

// -- Helpers ------------------------------------------------------------------

// Build / update the 'context' object (immutable)
// A bit of spaghetti... but the context object needs to be ready for
// the boot function and also to be updated at each frame.
function getContext(state, settings, metrics, fps) {
	const rect = settings.element.getBoundingClientRect()
	const cols = settings.cols || Math.floor(rect.width / metrics.cellWidth)
	const rows = settings.rows || Math.floor(rect.height / metrics.lineHeight)
	return Object.freeze({
		frame : state.frame,
		time : state.time,
		cols,
		rows,
		metrics,
		width : rect.width,
		height : rect.height,
		settings,
		// Runtime & debug data
		runtime : Object.freeze({
			cycle : state.cycle,
			fps : fps.fps
			// updatedRowNum
		})
	})
}

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
	sel.removeAllRanges()

	// Restore default, if necessary
	if (!selectionEnabled) disableSelect(el)
}

// Calcs width (fract), height, aspect of a monospaced char
// assuming that the CSS font-family is a monospaced font.
// Returns a mutable object.
export function calcMetrics(el) {

	const style = getComputedStyle(el)

	// Extract info from the style: in case of a canvas element
	// the style and font family should be set anyways.
	const fontFamily = style.getPropertyValue('font-family')
	const fontSize   = parseFloat(style.getPropertyValue('font-size'))
	// Can’t rely on computed lineHeight since Safari 14.1
	// See:  https://bugs.webkit.org/show_bug.cgi?id=225695
	const lineHeight = parseFloat(style.getPropertyValue('line-height'))
	let cellWidth

	// If the output element is a canvas 'measureText()' is used
	// else cellWidth is computed 'by hand' (should be the same, in any case)
	if (el.nodeName == 'CANVAS') {
		const ctx = el.getContext('2d')
		ctx.font = fontSize + 'px ' + fontFamily
		cellWidth = ctx.measureText(''.padEnd(50, 'X')).width / 50
	} else {
		const span = document.createElement('span')
		el.appendChild(span)
		span.innerHTML = ''.padEnd(50, 'X')
		cellWidth = span.getBoundingClientRect().width / 50
		el.removeChild(span)
	}

	const metrics = {
		aspect : cellWidth / lineHeight,
		cellWidth,
		lineHeight,
		fontFamily,
		fontSize,
		// Semi-hackish way to allow an update of the metrics object.
		// This may be useful in some situations, for example
		// responsive layouts with baseline or font change.
		// NOTE: It’s not an immutable object anymore
		_update : function() {
			const tmp = calcMetrics(el)
			for(var k in tmp) {
				// NOTE: Object.assign won’t work
				if (typeof tmp[k] == 'number' || typeof tmp[k] == 'string') {
					m[k] = tmp[k]
				}
			}
		}
	}

	return metrics
}


