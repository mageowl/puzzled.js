class PObject {
	#imageData = [];
	attributes = {
		is: null,
		colorset: null,
		fill: null
	};

	/**
	 * A Puzzled object.
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

class PMap {
	#charGrid = [];

	constructor(data) {
		let lines = data.split("\n");

		lines.forEach((line) => {
			this.#charGrid.push(line.split(""));
		});
	}

	render(ctx) {
		this.grid.forEach((row, y) => {
			row.forEach((tileID, x) => {
				let tile = tiles[tileID];
				if (tile == undefined) {
					throw new Error(`Unkown tile '${tileID}'.`);
				}

				if (tile.attributes.is != "background") {
					Object.values(tiles)
						.filter((object) => object.attributes.is == "background")[0]
						?.render(ctx, x, y);
				}
				tile.render(ctx, x, y);
			});
		});
	}
}

let tiles = {};

const puzzled = {
	load: {
		async object(file) {
			let data = await fetch(file).then((responce) => responce.text());
			let object = new PObject(data);
			return object;
		},

		async map(file) {
			let data = await fetch(file).then((responce) => responce.text());
			let object = new PMap(data);
			return object;
		}
	},

	regesterObjectAlias(char, obj) {
		tiles[char] = obj;
	}
};

export default puzzled;
