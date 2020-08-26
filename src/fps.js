/**
FPS
Frames-per-second-counter class.
Can exist on mutliple instances of the runner because of inner state.
*/

export default class FPS {
	constructor(){
		this.frames = 0
		this.ptime = 0
		this.fps = 0
	}

	update(time) {
		this.frames++
		if (time >= this.ptime + 1000) {
			this.fps = this.frames * 1000 / (time - this.ptime)
			this.ptime = time
			this.frames = 0
		}
		return this.fps
	}
}
