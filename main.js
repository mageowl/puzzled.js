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

	constructor(obj, x, y) {
		this.mapX = x;
		this.mapY = y;
		this.#parentObject = obj;
	}

	render(ctx) {
		this.#parentObject.render(ctx, this.mapX, this.mapY);
	}
}

class PuzzledMap {
	#charGrid = [];
	#objects = [];

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

let aliases = {};

const puzzled = {
	load: {
		async object(file) {
			let data = await fetch(file).then((responce) => responce.text());
			let object = new PuzzledObject(data);
			return object;
		},

		async map(file) {
			let data = await fetch(file).then((responce) => responce.text());
			let object = new PuzzledMap(data);
			return object;
		}
	},

	regesterObjectAlias(char, obj) {
		aliases[char] = obj;
	}
};

export default puzzled;
