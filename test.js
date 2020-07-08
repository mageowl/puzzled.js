import puzzled from "./main.js";

let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");

let promises = [
	puzzled.load.object("./assets/player.obj"),
	puzzled.load.object("./assets/background.obj"),
	puzzled.load.object("./assets/wall.obj"),
	puzzled.load.map("./assets/lvl1.map")
];

Promise.all(promises).then((objs) => {
	let map = objs[3],
		player = objs[0],
		background = objs[1],
		wall = objs[2];

	puzzled.regesterObjectAlias("@", player);
	puzzled.regesterObjectAlias(" ", background);
	puzzled.regesterObjectAlias("#", wall);
	map.render(ctx);
});
