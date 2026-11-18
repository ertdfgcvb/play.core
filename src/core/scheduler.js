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
