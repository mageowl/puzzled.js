import { layers, PuzzledLayer } from "./layers.js";

export let aliases = {};
let nextObjectID = 0;

export class PuzzledObject {
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

export class PuzzledObjectInstance {
	mapX;
	mapY;
	#parentObject;
	/**
	 * @type {PuzzledLayer}
	 */
	#layer;
	map;
	#movement = [0, 0];

	/**
	 * @type {PuzzledLayer}
	 */
	get layer() {
		return this.#layer;
	}

	/**
	 * Object that instance childs.
	 *
	 * @readonly
	 * @memberof PuzzledObjectInstance
	 * @type {PuzzledObject}
	 */
	get parentObject() {
		return this.#parentObject;
	}

	/**
	 *
	 *
	 * @readonly
	 * @memberof PuzzledObjectInstance
	 * @type {number[]}
	 */
	get movement() {
		return this.#movement;
	}

	get identifier() {
		return this.parentObject.toString();
	}

	get pos() {
		return;
	}

	get target() {
		let target = this.map.getAt(
			this.mapX + this.movement[0],
			this.mapY + this.movement[1],
			this.#layer.index
		);

		if (target != this && target) return target;
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

	move(x, y) {
		this.#movement[0] += x;
		this.#movement[1] += y;
	}

	clearMovement() {
		this.#movement = [0, 0];
	}

	match(data) {
		let objs = [this];

		for (const check in data) {
			if (data.hasOwnProperty(check)) {
				const value = data[check];

				switch (check) {
					case "type":
						if (this.parentObject != value) return false;
						break;

					case "isMoving":
						if (
							(this.movement == [0, 0] && value) ||
							(this.movement != [0, 0] && !value)
						)
							return false;

					case "target":
						const targetMatches = this.target?.match?.(value);

						if (Array.isArray(targetMatches)) objs.push(...targetMatches);
						else return false;

					default:
						break;
				}
			}
		}

		return true;
	}
}
