class PuzzledObject {
	#imageData = [];
	attributes = {
		is: null,
		colorset: null,
		fill: null
	};

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
}

class PuzzledObjectInstance {
	mapX;
	mapY;
	#parentObject;
	#layer;

	/**
	 * @type {number}
	 */
	get layer() {
		return this.#layer;
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
				this.#objects.push(obj);
			});
		});
	}

	/**
	 * Render all objects on the map.
	 * @param {RenderingContext} ctx The rendering context on which to draw the map.
	 */
	render(ctx) {
		this.#objects.forEach((obj) => {
			obj.render(ctx);
			// row.forEach((tileID, x) => {
			// 	let tile = aliases[tileID];
			// 	if (tile == undefined) {
			// 		throw new Error(`Unkown tile '${tileID}'.`);
			// 	}

			// 	if (tile.attributes.is != "background") {
			// 		Object.values(aliases)
			// 			.filter((object) => object.attributes.is == "background")[0]
			// 			?.render(ctx, x, y);
			// 	}

			// });
		});
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

let aliases = {};
let layers = [];

/**
 * Puzzled interface
 */
const puzzled = {
	load: {
		/**
		 * Load in a object from a file.
		 * @param {string} file Path to .obj file.
		 */
		async object(file) {
			let data = await fetch(file).then((responce) => responce.text());
			let object = new PuzzledObject(data);
			return object;
		},

		/**
		 * Load in a map from a file.
		 * @param {string} file Path to .map file
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
		 */
		layer(index, ...objs) {
			let layer = new PuzzledLayer(index);
			if (objs != undefined) layer.add(...objs);
			layers.push(layer);
			return layer;
		}
	}
};

export default puzzled;
