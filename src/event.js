class PuzzledEvent {
	constructor(name) {
		this.name = name;
		this.callbacks = [];
	}

	addCallback(callback) {
		this.callbacks.push(callback);
	}

	removeCallback(callback) {
		const index = this.callbacks.indexOf(callback);

		if (index > -1) this.callbacks.splice(index, 1);
	}

	fire(...data) {
		const callbacks = this.callbacks.slice(0);

		callbacks.forEach((func) => {
			func(...data);
		});
	}
}

export class PuzzledDispatcher {
	constructor() {
		this.target = new PuzzledEventTarget(this);
	}

	/**
	 * Dispatch event to target.
	 *
	 * @param {*} eventName Event name to dispatch
	 * @param {*} data Data to dispatch
	 * @memberof PuzzledDispatcher
	 */
	dispatch(eventName, data) {
		this.target._dp(eventName, data, this);
	}
}

class PuzzledEventTarget {
	#dispatcher;
	#events = {};

	/**
	 * Creates an instance of PuzzledEventTarget.
	 * @param {PuzzledDispatcher} dispatcher Dispatcher to attach to.
	 * @memberof PuzzledEventTarget
	 */
	constructor(dispatcher) {
		this.#dispatcher = dispatcher;
	}

	_dp(eventName, data, dispatcher) {
		if (dispatcher != this.#dispatcher) return;

		const event = this.#events[eventName];

		if (event) event.fire(data);
		if (this.#events["all"]) this.#events["all"].fire(eventName, data);
	}

	/**
	 * Add callback to event.
	 *
	 * @param {string} eventName Event name.
	 * @param {Function} callback Callback to add.
	 * @memberof PuzzledEventTarget
	 */
	on(eventName, callback) {
		let event = this.#events[eventName];

		if (!event) {
			event = new PuzzledEvent(eventName);
			this.#events[eventName] = event;
		}

		event.addCallback(callback);
	}

	/**
	 * Remove callback to event.
	 *
	 * @param {string} eventName Event name.
	 * @param {Function} callback Callback to remove.
	 * @memberof PuzzledEventTarget
	 */
	off(eventName, callback) {
		const event = this.#events[eventName];

		if (event && event.callbacks.indexOf(callback) > -1) {
			event.removeCallback(callback);

			if (event.callback.length == 0) {
				delete this.events[eventName];
			}
		}
	}
}
