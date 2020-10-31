import { PuzzledObject, aliases } from "./objects.js";
import { PuzzledMap, activeMap, setCTX } from "./map.js";
import { PuzzledDispatcher } from "./event.js";
import { PuzzledLayer, backgroundLayer } from "./layers.js";
import { PuzzledRule, rules } from "./rules.js";

let promises = {};
let globalDispatcher = new PuzzledDispatcher();

const puzzled = {
	load: {
		/**
		 * Load in a object from a file.
		 * @param {string} file Path to .obj file.
		 */
		object(file, name) {
			promises[name] = fetch(file)
				.then((responce) => responce.text())
				.then((data) => {
					let object = new PuzzledObject(data);
					return object;
				});
		},

		/**
		 * Load in a map from a file.
		 * @param {string} file Path to .map file.
		 */
		map(file, name) {
			promises[name] = fetch(file)
				.then((responce) => responce.text())
				.then((data) => {
					let object = new PuzzledMap(data);
					return object;
				});
		}
	},

	regester: {
		/**
		 * Regester an object alias.
		 * @param {string} alias The alias name to create
		 * @param {PuzzledObject} obj The object to give the alias.
		 */
		objectAlias(alias, obj) {
			aliases[alias] = obj;
		},

		/**
		 * Regester a layer.
		 * @param {number} index The render index for the layer.
		 * @param  {...PuzzledObject} objs The objects to add to the created layer
		 * @returns {PuzzledLayer}
		 */
		layer(index, ...objs) {
			let layer = new PuzzledLayer(index);
			if (objs != undefined) layer.add(...objs);
			return layer;
		},

		background(obj) {
			if (obj == undefined) {
				console.error("Puzzled.JS: Background object must be defined.");
				return;
			}

			if (backgroundLayer != undefined) {
				console.error("Puzzled.JS: Background layer already defined.");
				return;
			}

			let layer = new PuzzledLayer(-1, true);
			layer.add(obj);
			return layer;
		},

		/**
		 * Regester rule.
		 *
		 * @param {string} trigger
		 * @return {PuzzledRule}
		 */
		rule(critera, callback, late) {
			let rule = new PuzzledRule(critera, callback, late);
			rules.push(rule);
			return rule;
		}
	},

	game: {
		get activeMap() {
			return activeMap;
		}
	},

	get event() {
		return globalDispatcher.target;
	},

	get ctx() {
		return ctx;
	},

	/**
	 * Set canvas for puzzled
	 *
	 * @param {CanvasRenderingContext2D} newCtx New rendering context to use.
	 */
	setCanvas(newCtx) {
		setCTX(newCtx);
	}
};

export default puzzled;

let keys = {
	ArrowRight: "right",
	ArrowLeft: "left",
	ArrowUp: "up",
	ArrowDown: "down",
	x: "action",
	" ": "action"
};

window.onkeydown = (e) => {
	if (Object.keys(keys).includes(e.key) && !e.metaKey && !e.ctrlKey) {
		globalDispatcher.dispatch("input", keys[e.key]);
	}
};

setTimeout(() => {
	Promise.all(Object.values(promises)).then((objs) => {
		let objList = {};
		Object.keys(promises).forEach((obj, i) => {
			objList[obj] = objs[i];
		});

		globalDispatcher.dispatch("loaded", objList);
	});
});

globalDispatcher.target.on("all", (name, data) => {
	if (name == "input") activeMap.update(data);
	else activeMap.update();
});
