import { PuzzledObjectInstance, aliases } from "./objects.js";
import { backgroundLayer } from "./layers.js";

export let activeMap = null;
export let ctx;

export function setCTX(context) {
	ctx = context;
}

export class PuzzledMap {
	#charGrid = [];
	#objects = [];
	#data = null;

	/**
	 * A grid repersenting the level.
	 * @param {string} data Data from the imported file.
	 */
	constructor(data) {
		this.#data = data;
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
		let lines = this.#data.split("\n");

		lines.forEach((line) => {
			this.#charGrid.push(line.split(""));
		});

		this.#charGrid.forEach((row, y) => {
			row.forEach((char, x) => {
				let obj = new PuzzledObjectInstance(aliases[char], x, y);
				obj.map = this;
				this.#objects.push(obj);

				if (aliases[char] != backgroundLayer.objects[0]) {
					let bgTile = new PuzzledObjectInstance(
						backgroundLayer.objects[0],
						x,
						y
					);
					bgTile.map = this;
					this.#objects.push(bgTile);
				}
			});
		});
	}

	getAt(x, y, layer) {
		return this.#objects.filter((obj) => {
			return obj.mapX == x && obj.mapY == y && obj.layer.index == layer;
		});
	}

	update(keypress) {
		// Mark the player as moving
		if (keypress) {
			if (keypress == "right") {
				this.#objects.forEach((obj) => {
					if (obj.parentObject.attributes.is == "player") obj.move(1, 0);
				});
			}

			if (keypress == "left") {
				this.#objects.forEach((obj) => {
					if (obj.parentObject.attributes.is == "player") obj.move(-1, 0);
				});
			}

			if (keypress == "up") {
				this.#objects.forEach((obj) => {
					if (obj.parentObject.attributes.is == "player") obj.move(0, -1);
				});
			}

			if (keypress == "down") {
				this.#objects.forEach((obj) => {
					if (obj.parentObject.attributes.is == "player") obj.move(0, 1);
				});
			}
		}

		// Apply rules
		// const checkCell = function (obj, dir, cells, returnValue = []) {
		// 	if (cells.length == 0) return returnValue;
		// 	let nxtObj = this.getAt(obj.mapX + dir[0], obj.mapY + dir[1]).filter(
		// 		(target) => target.identifier == getID(cells[0])
		// 	);

		// 	if (cells.length > 1 && nxtObj.length != 0)
		// 		return checkCell(nxtObj[0], cells.slice(1), [
		// 			...returnValue,
		// 			nxtObj[0]
		// 		]);
		// 	else if (nxtObj.length == 0) return false;
		// 	else return [...returnValue, nxtObj[0]];
		// }.bind(this);

		// rules.filter((rule) => !rule.late).forEach((rule) => {});

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
		// rules
		// 	.filter((rule) => rule.late)
		// 	.forEach((rule) => rule.func(this.#objects));

		// Render
		this.render();
	}
}
