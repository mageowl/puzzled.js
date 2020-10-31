/** @type {PuzzledRule[]} */
export let rules = [];

export class PuzzledRule {
	#critera;
	#callback;

	/**
	 * @type {string}
	 */
	get critera() {
		return this.#critera;
	}

	#callbacks = [];

	late;

	constructor(critera, callback, late = false) {
		this.#critera = critera;
		this.#callback = callback;
		this.late = late;
	}

	fire(...attr) {
		this.#callback(...attr);
	}
}
