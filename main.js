function getID(cell) {
	return "[" + cell.split("[")[1].split("]")[0] + "]";
}

Array.equal = (arr1, arr2) => {
	return arr1[0] == arr2[0] && arr1[1] == arr2[1];
};

class PuzzledObject {
	#imageData = [];
	attributes = {
		is: null,
		colorset: null,
		fill: null
	};
	#id;

	/**
	 * A Puzzleduzzled object.
	 * @param {string} data
	 */
	constructor(data) {
		let lines = data.split("\n");

		lines.forEach((line) => {
			if (line == "") return;
			if (line[0] != "@") {
				this.#imageData.push(line.split("").map((v) => parseInt(v)));
			} else {
				this.attributes[line.split(" ")[0].slice(1)] = line
					.split(" ")
					.slice(1)
					.join(" ");
			}
		});

		Object.freeze(this.attributes);

		this.#id = nextObjectID;
		nextObjectID += 1;
	}

	/**
	 * Render the object using provided data.
	 * @param {RenderingContext} ctx The rendering context on which to draw the sprite.
	 * @param {number} spriteX The grid X at which to draw.
	 * @param {number} spriteY The grid Y at which to draw.
	 */
	render(ctx, spriteX, spriteY) {
		if (this.attributes.colorset != null) {
			this.#imageData.forEach((row, y) => {
				row.forEach((pixel, x) => {
					let color = this.attributes.colorset.split(" ")[pixel];
					if (color != "transparent") {
						ctx.fillStyle = color;
						ctx.fillRect(x * 5 + spriteX * 25, y * 5 + spriteY * 25, 5, 5);
					}
				});
			});
		} else {
			ctx.fillStyle = this.attributes.fill;
			ctx.fillRect(spriteX * 25, spriteY * 25, 25, 25);
		}
	}

	toString() {
		return "[" + this.#id + "]";
	}
}

class PuzzledObjectInstance {
	mapX;
	mapY;
	#parentObject;
	#layer;
	map;
	#movement = [0, 0];

	/**
	 * @property {number} layer
	 */
	get layer() {
		return this.#layer;
	}

	/**
	 * @property {PuzzledObject} parentObject
	 */
	get parentObject() {
		return this.#parentObject;
	}

	get movement() {
		return this.#movement;
	}

	get identifier() {
		return this.parentObject.toString();
	}

	/**
	 * Used internally to repersent the objects on the grid.
	 * @param {PuzzledObject} obj The object which to instanate.
	 * @param {number} x The grid X at which thw instance is currenty positioned.
	 * @param {number} y The grid X at which thw instance is currenty positioned.
	 */
	constructor(obj, x, y) {
		this.mapX = x;
		this.mapY = y;
		this.#parentObject = obj;

		layers.forEach((layer) => {
			if (layer.objects.includes(this.#parentObject)) {
				this.#layer = layer;
			}
		});
	}

	/**
	 * Render the instance's parent object at its location.
	 * @param {RenderingContext} ctx The rendering context on which to draw.
	 */
	render(ctx) {
		this.#parentObject.render(ctx, this.mapX, this.mapY);
	}

	left() {
		this.#movement[0]--;
	}

	right() {
		this.#movement[0] += 1;
	}

	up() {
		this.#movement[1]--;
	}

	down() {
		this.#movement[1] += 1;
	}

	move(x, y) {
		this.#movement[0] += x;
		this.#movement[1] += y;
	}

	clearMovement() {
		this.#movement = [0, 0];
	}
}

class PuzzledMap {
	#charGrid = [];
	#objects = [];

	/**
	 * A grid repersenting the level.
	 * @param {string} data Data from the imported file.
	 */
	constructor(data) {
		let lines = data.split("\n");

		lines.forEach((line) => {
			this.#charGrid.push(line.split(""));
		});

		this.#charGrid.forEach((row, y) => {
			row.forEach((char, x) => {
				let obj = new PuzzledObjectInstance(aliases[char], x, y);
				obj.map = this;
				this.#objects.push(obj);
			});
		});
	}

	/**
	 * Render all objects on the map.
	 */
	render() {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		this.#objects
			.sort((a, b) => a.layer.index - b.layer.index)
			.forEach((obj) => {
				obj.render(ctx);
			});
	}

	setActive() {
		activeMap = this;
	}

	getAt(x, y) {
		return this.#objects.filter((obj) => {
			return obj.mapX == x && obj.mapY == y;
		});
	}

	update() {
		// Mark the player as moving
		if (keyPresses.ArrowRight == true) {
			this.#objects.forEach((obj) => {
				if (obj.parentObject.attributes.is == "player") obj.right();
			});
		}

		if (keyPresses.ArrowLeft == true) {
			this.#objects.forEach((obj) => {
				if (obj.parentObject.attributes.is == "player") obj.left();
			});
		}

		if (keyPresses.ArrowUp == true) {
			this.#objects.forEach((obj) => {
				if (obj.parentObject.attributes.is == "player") obj.up();
			});
		}

		if (keyPresses.ArrowDown == true) {
			this.#objects.forEach((obj) => {
				if (obj.parentObject.attributes.is == "player") obj.down();
			});
		}

		// Apply rules
		const checkCell = function (obj, dir, cells, returnValue = []) {
			let nxtObj = this.getAt(obj.mapX + dir[0], obj.mapY + dir[1]).filter(
				(target) => target.identifier == getID(cells[0])
			);

			if (cells.length > 1 && nxtObj.length != 0)
				return checkCell(nxtObj[0], cells.slice(1), [
					...returnValue,
					nxtObj[0]
				]);
			else if (nxtObj.length == 0) return false;
			else return [...returnValue, nxtObj[0]];
		}.bind(this);

		rules
			.filter((rule) => !rule.late)
			.forEach((rule) => {
				let cells = rule.trigger.split("|").map((v) => v.trim());
				this.#objects
					.filter((obj) => obj.identifier == getID(cells[0]))
					.forEach((obj) => {
						let test;
						if (cells[0][0] != ">" || Array.equal(obj.movement, [0, 1])) {
							test = checkCell(obj, [0, 1], cells.slice(1));
							if (test != false) {
								rule.apply(obj, ...test);
								return;
							}
						}

						if (cells[0][0] != ">" || Array.equal(obj.movement, [1, 0])) {
							test = checkCell(obj, [1, 0], cells.slice(1));
							if (test != false) {
								rule.apply(obj, ...test);
								return;
							}
						}

						if (cells[0][0] != ">" || Array.equal(obj.movement, [0, -1])) {
							test = checkCell(obj, [0, -1], cells.slice(1));
							if (test != false) {
								rule.apply(obj, ...test);
								return;
							}
						}

						if (cells[0][0] != ">" || Array.equal(obj.movement, [-1, 0])) {
							test = checkCell(obj, [-1, 0], cells.slice(1));
							if (test != false) {
								rule.apply(obj, ...test);
								return;
							}
						}
					});
			});

		// Move objects
		this.#objects.forEach((object) => {
			if (object.movement != [0, 0]) {
				let newPos = [
					object.mapX + object.movement[0],
					object.mapY + object.movement[1]
				];
				if (
					this.getAt(...newPos).filter(
						(obj) => obj.layer.index == object.layer.index
					).length == 0
				) {
					object.mapX += object.movement[0];
					object.mapY += object.movement[1];
				}

				object.clearMovement();
			}
		});

		// Apply late rules
		rules
			.filter((rule) => rule.late)
			.forEach((rule) => rule.func(this.#objects));

		// Render
		this.render();
	}
}

class PuzzledLayer {
	#objs = [];
	#i;

	get objects() {
		return this.#objs;
	}

	get index() {
		return this.#i;
	}

	constructor(index) {
		this.#i = index;
	}

	add(...objs) {
		this.#objs.push(...objs);
	}
}

class PuzzledRule {
	#trigger;

	/**
	 * @type {string}
	 */
	get trigger() {
		return this.#trigger;
	}

	#callbacks = [];

	late;

	constructor(trigger, late = false) {
		this.#trigger = trigger;
		this.late = late;
	}

	append(func) {
		this.#callbacks.push(func);
	}

	apply(...objs) {
		this.#callbacks.forEach((callback) => {
			callback(...objs);
		});
	}
}

let aliases = {};
let layers = [];
let activeMap = null;
let ctx;
/**
 * @type {PuzzledRule[]}
 */
let rules = [];
let nextObjectID = 0;

const puzzled = {
	load: {
		/**
		 * Load in a object from a file.
		 * @param {string} file Path to .obj file.
		 * @returns {Promise<PuzzledObject>}
		 */
		async object(file) {
			let data = await fetch(file).then((responce) => responce.text());
			let object = new PuzzledObject(data);
			return object;
		},

		/**
		 * Load in a map from a file.
		 * @param {string} file Path to .map file.
		 * @returns {Promise<PuzzledMap>}
		 */
		async map(file) {
			let data = await fetch(file).then((responce) => responce.text());
			let object = new PuzzledMap(data);
			return object;
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
			layers.push(layer);
			return layer;
		},

		rule(trigger) {
			let rule = new PuzzledRule(trigger);
			rules.push(rule);
			return rule;
		}
	},

	game: {
		get activeMap() {
			return activeMap;
		}
	},

	get ctx() {
		return ctx;
	},

	setCanvas(newCtx) {
		ctx = newCtx;
	}
};

export default puzzled;

let keyPresses = {
	ArrowRight: false,
	ArrowLeft: false,
	ArrowUp: false,
	ArrowDown: false,
	x: false
};
window.onkeydown = (e) => {
	if (Object.keys(keyPresses).includes(e.key)) {
		keyPresses[e.key] = true;
		activeMap.update();
	}
};

window.onkeyup = (e) => {
	if (Object.keys(keyPresses).includes(e.key)) {
		keyPresses[e.key] = false;
	}
};
