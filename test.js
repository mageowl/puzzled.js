import puzzled from "./src/main.js";

let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");
puzzled.setCanvas(ctx);

puzzled.load.object("./assets/player.obj", "player");
puzzled.load.object("./assets/background.obj", "background");
puzzled.load.object("./assets/wall.obj", "wall");
puzzled.load.object("./assets/pumpkin.obj", "pumpkin");
puzzled.load.map("./assets/lvl1.map", "map");

puzzled.event.on("loaded", (obj) => {
	puzzled.regester.objectAlias("@", obj.player);
	puzzled.regester.objectAlias(" ", obj.background);
	puzzled.regester.objectAlias("#", obj.wall);
	puzzled.regester.objectAlias("*", obj.pumpkin);

	puzzled.regester.background(obj.background);
	puzzled.regester.layer(1, obj.player, obj.wall, obj.pumpkin);

	obj.map.setActive();
	obj.map.render();

	puzzled.regester.rule(
		{
			type: obj.player,
			isMoving: true,
			target: { type: obj.pumpkin }
		},
		(player, pumpkin) => {
			pumpkin.move(...player.movement);
		}
	);
});
