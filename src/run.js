/**
Runner
*/

import FPS from './fps.js'
import storage from './storage.js'

// Default settings for the program runner.
// They can be overwritten by the parameters of the runner
// or as a settings object exported by the program (in this order).
const defaultSettings = {
	restoreState : false, // will store the "state" object in local storage
	                      // this is handy for live-coding situations
	cols         : 0,     // number of columns, 0 is equivalent to 'auto'
	rows         : 0,     // number of columns, 0 is equivalent to 'auto'
	once         : false, // if set to true the renderer will run only once
	fps          : 30,    // fps capping
	background   : '',
	color        : '',
	weight       : '',
}

// Program runner.
// Takes a program object (usually an imported module),
// an Element object (usually a <pre> element) as rendering target
// and some settings (see above) as arguments.
// The program object should contain at least a main(), pre() or post() function.
export function run(program, element, runSettings = {}) {

	// Everything is wrapped inside a promise which will reject
	// in case of some errors (try / catch).
	// If the program reaches the bottom of the first frame the promise is resolved.
	return new Promise(function(resolve, reject) {
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

		// Input pointer updated by DOM evenets
		const pointer = {
			x       : 0,
			y       : 0,
			px      : 0, // NOTE: px and py are unused for now
			py      : 0,
			pressed : false
		}

		element.addEventListener('pointermove', e => {
			const rect = element.getBoundingClientRect()
			pointer.px = pointer.x
			pointer.py = pointer.y
			pointer.x = e.clientX - rect.left
			pointer.y = e.clientY - rect.top
		})

		element.addEventListener('pointerdown', e => {
			pointer.pressed = true
		})

		element.addEventListener('pointerup', e => {
			pointer.pressed = false
		})

		// A few CSS fixes
		element.style.fontVariantLigatures = 'none'
		element.style.fontOpticalSizing = 'none'
		element.style.fontSynthesis = 'none'
		element.style.fontStrech = 'normal'
		disableSelect(element)

		// Variable which holds some font metrics informations.
		// It’ll be populated after all the fonts are loaded.
		// See additional notes below.
		let metrics

		// Method to load a font via the FontFace object.
		// The load promise works 100% of the times.
		// But a definition of the font via CSS is preferable and more flexible.
		/*
		var font = new FontFace('Simple Console', 'url(/css/fonts/simple/SimpleConsole-Light.woff)', { style: 'normal', weight: 400 })
		font.load().then(function(f){
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

		// Even with the "fonts.ready" the font may STILL not be loaded yet
		// on Safari 13.x and also 14.0.
		// A (shitty) workaround is to wait 2! rAF and execute calcMetrics twice.
		// See: https://bugs.webkit.org/show_bug.cgi?id=174030
		document.fonts.ready.then((e) => {
			let count = 2
			function __run_twice__(){
				if (count-- > 0) {
					metrics = calcMetrics(element)
					requestAnimationFrame(__run_twice__)
				} else {
					// element.style.lineHeight = Math.ceil(metrics.lineHeightf) + 'px'
					// console.log(`Using font faimily: ${ci.fontFamily} @ ${ci.fontSize}/${ci.lineHeight}`)
					// console.log(`Metrics: cellWidth: ${metrics.cellWidth}, lineHeightf: ${metrics.lineHeightf}`)
					// Finally Boot!
					requestAnimationFrame(loop)
				}
			}
			requestAnimationFrame(__run_twice__)


		})


		// Time sample to calculate precise offset
		let timeSample = 0
		// Previous time step to increment state.time (with state.time initial offset)
		let ptime = 0
		const interval = 1000 / settings.fps
		const timeOffset = state.time

		// FPS object (keeps some state for a precise FPS measure)
		const fps = new FPS()

		// A cell with no value at all is just a space
		const EMPTY_CELL = ' '

		// Buffers needed for the final DOM rendering,
		// each array entry represents a cell.
		// An extra data buffer for ‘user data’ is provided and can be modified
		// in runtime.
		// NOTE: extra size infos will be attached at each frame update.
		const buffers = {
			state : [],
			data  : []  // user data
		}

		// Main program loop
		function loop(t) {

			// Run once or many times depending on settings.once
			const af = settings.once ? null : requestAnimationFrame(loop)

			// Timing
			const delta = t - timeSample
			if (delta > interval) {
				timeSample = t - delta % interval   // adjust timeSample
				state.time = t + timeOffset         // increment time + initial offs
				state.frame++                       // increment frame counter
				storage.store(LOCAL_STORAGE_KEY_STATE, state)  // store state
			} else {
				return
			}

			// Context data
			const rect  = element.getBoundingClientRect()
			const cols = settings.cols || Math.floor(rect.width / metrics.cellWidth)
			const rows = settings.rows || Math.floor(rect.height / metrics.lineHeight)
			const context = Object.freeze({
				cycle  : state.cycle,
				frame  : state.frame,
				time   : state.time,
				fps    : fps.update(t),
				cols   : cols,
				rows   : rows,
				width  : rect.width,
				height : rect.height,
				aspect : metrics.aspect
			})

			// Cursor update
			const cursor = Object.freeze({
				x       : pointer.x / metrics.cellWidth,  // Not floored,
				y       : pointer.y / metrics.lineHeight, // for better precision.
				pressed : pointer.pressed,
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
			try {
				if (typeof program.pre == 'function') {
					program.pre(context, cursor, buffers)
				}
			} catch (error){
				cancelAnimationFrame(af)
				reject({ message : '---- Error in pre()', error })
			}

			// 2. --------------------------------------------------------------
			// Call main(), if defined
			try {
				if (typeof program.main == 'function') {
					for (let j=0; j<rows; j++) {
						const offs = j * cols
						for (let i=0; i<cols; i++) {
							const idx = i + offs
							const out = program.main({x:i, y:j, index:idx}, context, cursor, buffers)
							const cell = typeof out == 'object' ? {...defaultCell, ...out} : {...defaultCell, char : out}
							// Make sure that char is set:
							// undefined, null and '' (empty string) should be rendered as EMPTY_CELL
							// Watch out for special case of 0 (zero).
							if (!Boolean(cell.char) && cell.char !== 0) cell.char = EMPTY_CELL
							// Chop in case of string (+ convert in case of number):
							cell.char = (cell.char + '')[0]
							buffers.state[idx] = cell
						}
					}
				}
			} catch (error){
				cancelAnimationFrame(af)
				reject({ message : '---- Error in main()', error })
			}

			// 3. --------------------------------------------------------------
			// Call post(), if defined
			try {
				if (typeof program.post == 'function') {
					program.post(context, cursor, buffers)
				}
			} catch (error){
				cancelAnimationFrame(af)
				reject({ message : '---- Error in post()', error })
			}

			// 4. --------------------------------------------------------------
			// Renderloop

			// DOM rows update: expand lines if necessary
			// TODO: also benchmark a complete 'innerHTML' rewrite, could be faster?
			while(element.childElementCount < rows) {
				const span = document.createElement('span')
				span.style.display = 'block'
				element.appendChild(span)
			}

			// DOM rows update: shorten lines if necessary
			// https://jsperf.com/innerhtml-vs-removechild/15
			while(element.childElementCount > rows) {
				element.removeChild(element.lastChild)
			}

			// Set the most used styles to the container
			element.style.backgroundColor = settings.background
			element.style.color = settings.color
			element.style.fontWeight = settings.weight

			// A bit of a cumbersome render-loop…
			// A few notes: the fastest way I found to render the image
			// is by manually write the markup into the parent node via .innerHTML;
			// creating a node via .createElement and then popluate it resulted
			// remarkably slower (even if more elegant for the CSS handling below).
			try {
				for (let j=0; j<rows; j++) {
					let html = '' // Accumulates the markup
					let prevCell = defaultCell
					let tagIsOpen = false
					const offs = j * cols
					for (let i=0; i<cols; i++) {
						const currCell = buffers.state[i + offs] || {...defaultCell, char : EMPTY_CELL}

						// If there is a change in style a new span has to be inserted
						if (!isSameCellStyle(currCell, prevCell)) {
							// Close the previous tag
							if (tagIsOpen) html += '</span>'

							const c = currCell.color === settings.color ? null : currCell.color
							const b = currCell.background === settings.background ? null : currCell.background
							const w = currCell.weight === settings.weight ? null : currCell.weight

							// Accumulate the CSS inline attribute.
							// Beginning space and double quotes are important (for string compare below):
							let css = ''
							if (c) css += 'color:' + c + ';'
							if (b) css += 'background:' + b + ';'
							if (w) css += 'font-weight:' + w + ';'
							if (css) css = ' style="' + css + '"'
							html += '<span' + css + '>'
							tagIsOpen = true
						}
						html += currCell.char
						prevCell = currCell
					}
					if (tagIsOpen) html += '</span>'
					// String comparison: faster than a DOM reflow
					// in case of small changes in the doc or a static image.
					// NOTE: Check at buffer level? Probably faster & more accurate,
					//       but difficult to perform because user can manipulate it
					//       oustide the main loop? Maybe try double buffering + compare?
					if (html != element.childNodes[j].innerHTML) {
						element.childNodes[j].innerHTML = html
					}
				}
			} catch (error){
				cancelAnimationFrame(af)
				reject({ message : '---- Error in renderloop', error })
			}

			// The end of the first frame is reached: the promise can be resolved
			resolve(true)
		}
	})
}

// -- Helpers ------------------------------------------------------------------

// Compares two cells for style
function isSameCellStyle(cellA, cellB) {
	if (cellA.weight !== cellB.weight) return false
	if (cellA.color !== cellB.color) return false
	if (cellA.background !== cellB.background) return false
	return true
}

// Disables selection for an HTML element
function disableSelect(el){
	el.style.userSelect = 'none'
	el.style.webkitUserSelect = 'none' // for Safari on mac and iOS
	el.style.mozUserSelect = 'none'    // for mobile FF
}

// Enables selection for an HTML element
function enableSelect(el) {
	el.style.userSelect = 'auto'
	el.style.webkitUserSelect = 'auto'
	el.style.mozUserSelect = 'auto'
}

// Copies the content of an element to the clipboard
export function copyContent(el){
	enableSelect(el)
	const range = document.createRange()
	range.selectNode(el)
	const sel = window.getSelection()
	sel.removeAllRanges()
	sel.addRange(range)
	document.execCommand('copy')
	disableSelect(el)
}

// Calcs width (fract), height, aspect of a monospaced char
// supposes CSS font-family is monospace.
// Returns an immutable (frozen) object.
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
		cellWidth   : w,
		lineHeightf : h,
		lineHeight  : Math.round(h), // should be the same as CSS
		aspect      : w / Math.round(h),
	})
}

// Returns some CSS info
function CSSinfo(el){
	const style = window.getComputedStyle(el)
	return Object.freeze({
		fontFamily : style.getPropertyValue('font-family'),
		lineHeight : style.getPropertyValue('line-height'),
		fontSize   : style.getPropertyValue('font-size'),
	})
}

