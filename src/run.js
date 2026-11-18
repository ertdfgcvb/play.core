import { Buffer } from './core/buffer.js'
import { schedule, unschedule } from './core/scheduler.js'
import { domInput } from './core/input_dom.js'
import VERSION from './core/version.js'

export { VERSION }

// Order of precedence: defaults < program.settings < run() options
const DEFAULTS = {
	element        : null,
	renderer       : 'dom',
	cols           : 0,
	rows           : 0,
	fps            : 30,
	once           : false,
	autoStart      : true,
	pauseOffscreen : true,
	allowSelect    : false,
	clear          : true,
	startTime      : 0,
	startFrame     : 0,
	data           : null,
}

// Tolerance for the fps cap: rAF timestamps jitter around the display rate
const FPS_TOLERANCE = 1

// program: a module object, or the URL of a module (string or URL).
// A URL is imported as a separate copy for each run: module variables are not shared.
export async function run(source, options = {}) {

	const program = await resolveProgram(source)
	const settings = Object.freeze({ ...DEFAULTS, ...program.settings, ...options })
	const factory = await resolveRenderer(settings.renderer)
	const renderer = await factory(settings.element, settings)
	const element = renderer.element || null

	const input = renderer.input || (isDOMElement(element) ? domInput(element) : null)
	const keys = input ? input.state.keys : new Set()

	const buffer = new Buffer(0, 0, settings)
	const data = settings.data || {}
	// fps 0 (or less): uncapped, a frame on every tick of the loop (vsync in the browser)
	const interval = settings.fps > 0 ? 1000 / settings.fps : 0

	let frame = settings.startFrame
	let time = settings.startTime
	let ctx = null
	let cursorPrev = Object.freeze({ x : 0, y : 0, pressed : false })
	let state = 'idle'
	let visible = true
	let lastFrameT = null
	let sampleT = 0
	let fps = 0
	let fpsFrames = 0
	let fpsT = 0

	function renderFrame(dt) {
		const m = renderer.measure()

		if (m.cols != buffer.width || m.rows != buffer.height) buffer.resize(m.cols, m.rows)

		time += dt

		const cw = m.metrics.cellWidth
		const lh = m.metrics.lineHeight
		const p = input ? input.state : { x : 0, y : 0, pressed : false }
		const cursor = Object.freeze({
			// The element can be slightly larger than the grid
			x       : Math.min(m.cols - 1, p.x / cw),
			y       : Math.min(m.rows - 1, p.y / lh),
			pressed : p.pressed,
			prev    : cursorPrev,
		})

		ctx = Object.freeze({
			frame,
			time,
			dt,
			cols     : m.cols,
			rows     : m.rows,
			width    : m.width,
			height   : m.height,
			metrics  : m.metrics,
			cursor,
			keys,
			buffer,
			data,
			settings,
			fps,
		})

		if (input) {
			for (const e of input.state.events) {
				const fn = program[e.type]
				if (typeof fn == 'function') fn(ctx, { ...e, x : e.x / cw, y : e.y / lh })
			}
			input.state.events.length = 0
		}

		const { pre, main, post } = program

		// With main() the buffer is redrawn each frame, without it (or with clear : false) it persists
		if (typeof main == 'function' && settings.clear) buffer.clear()

		if (typeof pre == 'function') pre(ctx)

		if (typeof main == 'function') {
			const cell = { x : 0, y : 0, index : 0 }
			const cells = buffer.data
			let idx = 0
			for (let j=0; j<m.rows; j++) {
				for (let i=0; i<m.cols; i++) {
					cell.x = i
					cell.y = j
					cell.index = idx
					buffer.merge(cells[idx], main(cell, ctx))
					idx++
				}
			}
		}

		if (typeof post == 'function') post(ctx)

		renderer.render(ctx, buffer)

		cursorPrev = Object.freeze({ x : cursor.x, y : cursor.y, pressed : cursor.pressed })
		frame++
	}

	function report(err) {
		if (typeof handle.onerror == 'function') handle.onerror(err)
		else if (typeof reportError == 'function') reportError(err)
		else console.error(err)
	}

	function task(t) {
		if (!visible) {
			lastFrameT = null
			return
		}
		if (lastFrameT === null) {
			lastFrameT = t
			sampleT = t - interval
		}
		if (interval > 0) {
			const delta = t - sampleT
			if (delta < interval - FPS_TOLERANCE) return
			sampleT = t - (delta % interval)
		}

		fpsFrames++
		if (t >= fpsT + 1000) {
			fps = fpsFrames * 1000 / (t - fpsT)
			fpsT = t
			fpsFrames = 0
		}

		const dt = t - lastFrameT
		lastFrameT = t
		try {
			renderFrame(dt)
		} catch (err) {
			handle.stop()
			report(err)
		}
	}

	const cleanup = []

	if (settings.pauseOffscreen && isDOMElement(element) && typeof IntersectionObserver == 'function') {
		const observer = new IntersectionObserver(entries => {
			visible = entries[entries.length - 1].isIntersecting
		})
		observer.observe(element)
		cleanup.push(() => observer.disconnect())
	}

	// A hidden tab stops rAF: the gap must not count as time
	if (typeof document != 'undefined') {
		const onVisibility = () => lastFrameT = null
		document.addEventListener('visibilitychange', onVisibility)
		cleanup.push(() => document.removeEventListener('visibilitychange', onVisibility))
	}

	const handle = {
		program,
		element,
		renderer,
		onerror : null,
		get ctx() { return ctx },
		get buffer() { return buffer },
		get state() { return state },
		start() {
			if (state == 'running' || state == 'stopped') return
			state = 'running'
			lastFrameT = null
			schedule(task)
		},
		pause() {
			if (state != 'running') return
			state = 'paused'
			unschedule(task)
		},
		stop() {
			if (state == 'stopped') return
			state = 'stopped'
			unschedule(task)
			if (input) input.dispose()
			for (const fn of cleanup) fn()
			renderer.dispose()
		},
		// dt: ms per frame, the fps interval by default (60 fps when uncapped)
		step(n = 1, dt = interval || 1000 / 60) {
			for (let i=0; i<n; i++) renderFrame(frame == settings.startFrame ? 0 : dt)
		},
		text() {
			return toText(buffer)
		},
		async snapshot(format = 'txt') {
			if (format == 'txt') return new Blob([toText(buffer)], { type : 'text/plain;charset=utf-8' })
			if (typeof renderer.snapshot == 'function') {
				const blob = await renderer.snapshot(format, ctx, buffer)
				if (blob) return blob
			}
			throw new Error('Snapshot format not supported by this renderer: ' + format)
		},
	}

	if (settings.autoStart) {
		try {
			renderFrame(0)
		} catch (err) {
			handle.stop()
			throw err
		}
		if (settings.once) {
			state = 'paused'
		} else {
			handle.start()
		}
	}

	return handle
}

let runCount = 0

async function resolveProgram(p) {
	if (typeof p != 'string' && !(p instanceof URL)) return p
	// Relative to the page (browser) or the working directory (Node), not to this file
	const base = typeof document != 'undefined' && document.baseURI ? document.baseURI : (await import('node:url')).pathToFileURL(process.cwd() + '/').href
	const url = new URL(p, base)
	// blob: and data: URLs are unique already and take no query
	if (url.protocol != 'blob:' && url.protocol != 'data:') url.searchParams.set('run', ++runCount)
	return import(url.href)
}

async function resolveRenderer(r) {
	if (r === null || r === false) return headless
	if (typeof r == 'function') return r
	if (typeof r == 'string') {
		try {
			return (await import('./renderers/' + r + '.js')).default
		} catch (err) {
			throw new Error('Renderer not found: ' + r, { cause : err })
		}
	}
	throw new Error('Invalid renderer: ' + r)
}

// No output: the buffer is computed and can be read through the handle
function headless(_element, settings) {
	const cols = settings.cols || 80
	const rows = settings.rows || 24
	const metrics = Object.freeze({ cellWidth : 8, lineHeight : 16, aspect : 0.5, fontFamily : '', fontSize : 16 })
	return {
		element : null,
		measure : () => ({ cols, rows, width : cols * 8, height : rows * 16, metrics }),
		render() {},
		dispose() {},
	}
}

function toText(buffer) {
	let out = ''
	const { width, data } = buffer
	for (let i=0; i<data.length; i++) {
		out += data[i].char
		if (i % width == width - 1) out += '\n'
	}
	return out
}

function isDOMElement(el) {
	return typeof Element == 'function' && el instanceof Element
}
