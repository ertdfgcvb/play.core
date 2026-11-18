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

// Frame pacing for an fps cap, as in v1: a frame when a full interval has passed since the
// last due time; the remainder keeps the phase. vsync timestamps are precise, a late frame is late
export function createPacer(interval) {
	// Floating point only (1000 / 60 is not exact), not a tolerance for jitter
	const EPS = 0.1
	let sample = null
	return {
		reset() {
			sample = null
		},
		due(t) {
			if (interval <= 0) return true
			if (sample === null) {
				sample = t
				return true
			}
			const delta = t - sample
			if (delta < interval - EPS) return false
			// The remainder in (-EPS, interval - EPS]: a frame a hair early keeps the phase
			sample = t - ((delta + EPS) % interval - EPS)
			return true
		},
	}
}
