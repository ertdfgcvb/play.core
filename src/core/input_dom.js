const MAX_QUEUE = 64

export function domInput(element) {
	const state = { x : 0, y : 0, pressed : false, keys : new Set(), events : [] }
	const ac = new AbortController()
	const opt = { signal : ac.signal }

	function push(type, e) {
		// Bounded: nothing drains the queue while the program is paused
		if (state.events.length >= MAX_QUEUE) state.events.shift()
		state.events.push({ type, x : state.x, y : state.y, key : e.key, code : e.code, button : e.button, repeat : e.repeat })
	}

	function position(e) {
		const rect = element.getBoundingClientRect()
		state.x = e.clientX - rect.left
		state.y = e.clientY - rect.top
	}

	function up(e) {
		position(e)
		state.pressed = false
		push('pointerUp', e)
	}

	element.addEventListener('pointermove', e => {
		position(e)
		push('pointerMove', e)
	}, opt)

	element.addEventListener('pointerdown', e => {
		position(e)
		state.pressed = true
		// Moves and the release keep coming when the pointer leaves the element
		element.setPointerCapture?.(e.pointerId)
		push('pointerDown', e)
	}, opt)

	element.addEventListener('pointerup', up, opt)
	element.addEventListener('pointercancel', up, opt)

	addEventListener('keydown', e => {
		state.keys.add(e.key)
		push('keyDown', e)
	}, opt)

	addEventListener('keyup', e => {
		state.keys.delete(e.key)
		push('keyUp', e)
	}, opt)

	// A key released while the window has no focus never fires keyup
	addEventListener('blur', () => state.keys.clear(), opt)

	return {
		state,
		dispose : () => ac.abort()
	}
}
