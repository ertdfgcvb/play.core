const tasks = new Set()
let running = false

const raf = typeof requestAnimationFrame == 'function'
	? requestAnimationFrame
	: fn => setTimeout(() => fn(performance.now()), 1000 / 60)

function tick(t) {
	for (const task of tasks) task(t)
	if (tasks.size > 0) {
		raf(tick)
	} else {
		running = false
	}
}

export function schedule(task) {
	tasks.add(task)
	if (!running) {
		running = true
		raf(tick)
	}
}

export function unschedule(task) {
	tasks.delete(task)
}

// Frame pacing for an fps cap: due(t) is true when a frame is due at time t.
// Due times stay on a grid of the interval, a frame may come up to tolerance ms early
// (rAF timestamps jitter, less than a display tick at 120 Hz); after a slow frame or a pause the grid restarts: no catch-up burst
export function createPacer(interval, tolerance = 4) {
	let next = null
	return {
		reset() {
			next = null
		},
		due(t) {
			if (interval <= 0) return true
			if (next === null) {
				next = t + interval
				return true
			}
			if (t < next - tolerance) return false
			// A frame much later than due (a skipped tick) moves the grid: no short gap after it
			next = t - next > interval / 2 ? t + interval : next + interval
			if (next <= t) next = t + interval
			return true
		},
	}
}
