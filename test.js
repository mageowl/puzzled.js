import puzzled from "./main.js";

let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");

let promises = [
	puzzled.load.object("./assets/player.obj"),
	puzzled.load.object("./assets/background.obj"),
	puzzled.load.object("./assets/wall.obj")
];

Promise.all(promises).then((objs) => {
	let player = objs[0],
		background = objs[1],
		wall = objs[2];

	puzzled.regester.objectAlias("@", player);
	puzzled.regester.objectAlias(" ", background);
	puzzled.regester.objectAlias("#", wall);

	puzzled.regester.layer(0, background);
	let playerLayer = puzzled.regester.layer(1);
	playerLayer.add(player, wall);

	puzzled.load.map("./assets/lvl1.map").then((map) => {
		map.render(ctx);
	});
});
