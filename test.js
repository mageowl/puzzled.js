import puzzled from "./main.js";

let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");
puzzled.setCanvas(ctx);

let promises = [
	puzzled.load.object("./assets/player.obj"),
	puzzled.load.object("./assets/background.obj"),
	puzzled.load.object("./assets/wall.obj"),
	puzzled.load.object("./assets/crate.obj")
];

Promise.all(promises).then((objs) => {
	let player = objs[0],
		background = objs[1],
		wall = objs[2],
		crate = objs[3];

	puzzled.regester.objectAlias("@", player);
	puzzled.regester.objectAlias(" ", background);
	puzzled.regester.objectAlias("#", wall);
	puzzled.regester.objectAlias("*", crate);

	puzzled.regester.layer(0, background);
	puzzled.regester.layer(1, player, wall, crate);

	puzzled.load.map("./assets/lvl1.map").then((map) => {
		map.setActive();
		map.render();

		// Rules
		console.log(crate.toString());
		puzzled.regester
			.rule(`> ${player} | ${crate}`)
			.append((playerObj, crateObj) => {
				crateObj.move(...playerObj.movement);
			});
	});
});
