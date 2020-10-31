export let layers = [];
export let backgroundLayer;

export class PuzzledLayer {
	#objs = [];
	#i;
	#background = false;

	get objects() {
		return this.#objs;
	}

	get index() {
		return this.#i;
	}

	get isBackground() {
		return this.background;
	}

	constructor(index, background = false) {
		this.#i = index;
		this.#background = background;
		if (this.#background) {
			backgroundLayer = this;
		}

		layers.push(this);
	}

	add(...objs) {
		objs.forEach((obj) => (obj.layer = this));
		this.#objs.push(...objs);
	}
}
