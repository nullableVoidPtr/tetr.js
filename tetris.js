import Hold from './hold.js'
import Piece, {finesse, pieces} from './piece.js'
import Preview from './preview.js'
import Stack from './stack.js'

/*
Author: Simon Laroche
Site: http://simon.lc/
Demo: http://simon.lc/tetr.js

Note: Before looking at this code, it would be wise to do a bit of reading about
the game so you know why some things are done a certain way.
*/
'use strict';

/**
 * Playfield.
 */
var cellSize;

/**
 * Get html elements.
 */
var msg = document.getElementById('msg');
var stats = document.getElementById('stats');
var statsTime = document.getElementById('time');
var statsLines = document.getElementById('line');
var statsPiece = document.getElementById('piece');
var h3 = document.getElementsByTagName('h3');
var set = document.getElementById('settings');

// Get canvases and contexts
var holdCanvas = document.getElementById('hold');
var bgStackCanvas = document.getElementById('bgStack');
var stackCanvas = document.getElementById('stack');
var activeCanvas = document.getElementById('active');
var previewCanvas = document.getElementById('preview');
var spriteCanvas = document.getElementById('sprite');

var holdCtx = holdCanvas.getContext('2d');
var bgStackCtx = bgStackCanvas.getContext('2d');
var stackCtx = stackCanvas.getContext('2d');
var activeCtx = activeCanvas.getContext('2d');
var previewCtx = previewCanvas.getContext('2d');
var spriteCtx = spriteCanvas.getContext('2d');


/**
 * Gameplay specific vars.
 */
var gravityUnit = 0.00390625;
var gravity;

window.settings = {
	DAS: 10,
	ARR: 1,
	Gravity: 0,
	'Soft Drop': 31,
	'Lock Delay': 30,
	Size: 0,
	Sound: 0,
	Volume: 100,
	Block: 0,
	Ghost: 0,
	Grid: 0,
	Outline: 0,
};

window.setting = {
	DAS: range(0, 31),
	ARR: range(0, 11),
	Gravity: (function() {
		var array = [];
		array.push('Auto');
		array.push('0G');
		for (var i = 1; i < 64; i++) array.push(i + '/64G');
		for (var i = 1; i <= 20; i++) array.push(i + 'G');
		return array;
	})(),
	'Soft Drop': (function() {
		var array = [];
		for (var i = 1; i < 64; i++) array.push(i + '/64G');
		for (var i = 1; i <= 20; i++) array.push(i + 'G');
		return array;
	})(),
	'Lock Delay': range(0, 101),
	Size: ['Auto', 'Small', 'Medium', 'Large'],
	Sound: ['Off', 'On'],
	Volume: range(0, 101),
	Block: ['Shaded', 'Solid', 'Glossy', 'Arika', 'World'],
	Ghost: ['Normal', 'Colored', 'Off'],
	Grid: ['Off', 'On'],
	Outline: ['Off', 'On'],
};

var frame;

var hold;
var preview;
var stack;
var piece;

/**
 *Pausing variables
 */

var startPauseTime;
var pauseTime;

/**
 * 0 = Normal
 * 1 = win
 * 2 = countdown
 * 3 = game not played
 * 9 = loss
 */
var gameState = 3;

var paused = false;

var replayKeys;
var watchingReplay = false;
var toGreyRow;
window.gametype;
//TODO Make dirty flags for each canvas, draw them all at once during frame call.
// var dirtyHold, dirtyActive, dirtyStack, dirtyPreview;
var lastX, lastY, lastPos;

// Stats
var startTime;
var digLines;

// Keys
var keysDown;
var lastKeys;
var released;

var binds = {
	pause: 27,
	moveLeft: 37,
	moveRight: 39,
	moveDown: 40,
	hardDrop: 32,
	holdPiece: 67,
	rotRight: 88,
	rotLeft: 90,
	rot180: 16,
	retry: 82,
};
var flags = {
	hardDrop: 1,
	moveRight: 2,
	moveLeft: 4,
	moveDown: 8,
	holdPiece: 16,
	rotRight: 32,
	rotLeft: 64,
	rot180: 128,
};

function resize() {
	var a = document.getElementById('a');
	var b = document.getElementById('b');
	var c = document.getElementById('c');
	var content = document.getElementById('content');

	// TODO Finalize this.
	// Aspect ratio: 1.024
	var screenHeight = window.innerHeight - 34;
	var screenWidth = ~~(screenHeight * 1.024);
	if (screenWidth > window.innerWidth)
		screenHeight = ~~(window.innerWidth / 1.024);

	if (settings.Size === 1 && screenHeight > 602) cellSize = 15;
	else if (settings.Size === 2 && screenHeight > 602) cellSize = 30;
	else if (settings.Size === 3 && screenHeight > 902) cellSize = 45;
	else cellSize = Math.max(~~(screenHeight / 20), 10);

	var pad = (window.innerHeight - (cellSize * 20 + 2)) / 2 + 'px';
	content.style.padding = pad + ' 0';
	stats.style.bottom = pad;

	// Size elements
	a.style.padding = '0 0.5rem ' + ~~(cellSize / 2) + 'px';

	stackCanvas.width = activeCanvas.width = bgStackCanvas.width = cellSize * 10;
	stackCanvas.height = activeCanvas.height = bgStackCanvas.height =
		cellSize * 20;
	b.style.width = stackCanvas.width + 'px';
	b.style.height = stackCanvas.height + 'px';

	holdCanvas.width = cellSize * 4;
	holdCanvas.height = cellSize * 2;
	a.style.width = holdCanvas.width + 'px';
	a.style.height = holdCanvas.height + 'px';

	previewCanvas.width = cellSize * 4;
	previewCanvas.height = stackCanvas.height;
	c.style.width = previewCanvas.width + 'px';
	c.style.height = b.style.height;

	// Scale the text so it fits in the thing.
	// TODO get rid of extra font sizes here.
	msg.style.lineHeight = b.style.height;
	msg.style.fontSize = ~~(stackCanvas.width / 6) + 'px';
	stats.style.fontSize = ~~(stackCanvas.width / 11) + 'px';
	document.documentElement.style.fontSize = ~~(stackCanvas.width / 16) + 'px';

	stats.style.width = a.style.width;
	for (var i = 0, len = h3.length; i < len; i++) {
		h3[i].style.lineHeight = a.style.height;
		h3[i].style.fontSize = stats.style.fontSize;
	}

	// Redraw graphics
	makeSprite();

	if (settings.Grid === 1) bg(bgStackCtx);

	if (gameState === 0) {
		piece.drawGhost();
		piece.draw();
		stack.draw();
		preview.draw();
		if (hold.piece) {
			hold.draw();
		}
	}
}
addEventListener('resize', resize, false);

/**
 * ========================== Model ===========================================
 */

/**
 * Resets all the settings and starts the game.
 */
window.init = function (gt) {
	if (gt === 'replay') {
		watchingReplay = true;
	} else {
		watchingReplay = false;
		replayKeys = {};
		// TODO Make new seed and rng method.
		replayKeys.seed = ~~(Math.random() * 2147483645) + 1;
		window.gametype = gt;
	}


	//Reset
	keysDown = 0;
	lastKeys = 0;
	released = 255;

	startPauseTime = 0;
	pauseTime = 0;
	paused = false;

	rng.seed = replayKeys.seed;
	toGreyRow = 21;
	frame = 0;
	lastPos = 'reset';
	stack = new Stack(stackCanvas, 10, 22, statsPiece, statsLines);
	piece = new Piece(activeCanvas, stack);
	hold = new Hold(holdCtx);
	if (settings.Gravity === 0) gravity = gravityUnit * 4;
	startTime = Date.now();
	preview = new Preview(previewCtx);
	//preview.draw();

	statistics();
	clear(stackCtx);
	clear(activeCtx);
	clear(holdCtx);

	if (window.gametype === 3) {
		// Dig Race
		// make ten random numbers, make sure next isn't the same as last?
		//TODO make into function or own file.

		digLines = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

		stack.statsLines.innerHTML = 10;
		stack.statsLines.innerHTML = 10;
		var randomNums = [];
		for (var i = 0; i < 10; i++) {
			var random = ~~(rng.next() * 10);
			if (random !== randomNums[i - 1]) randomNums.push(random);
			else i--;
		}
		for (var y = 21; y > 11; y--) {
			for (var x = 0; x < 10; x++) {
				if (randomNums[y - 12] !== x) stack.grid[x][y] = 8;
			}
		}
		stack.draw();
	}

	menu();

	// Only start a loop if one is not running already.
	if (gameState === 3) {
		gameState = 2;
		gameLoop();
	} else {
		gameState = 2;
	}
}

function range(start, end, inc) {
	inc = inc || 1;
	var array = [];
	for (var i = start; i < end; i += inc) {
		array.push(i);
	}
	return array;
}

/**
 * Shim.
 */
window.requestAnimFrame = (function() {
	return (
		window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		}
	);
})();

function pause() {
	if (gameState === 0) {
		paused = true;
		startPauseTime = Date.now();
		msg.innerHTML = 'Paused';
		menu(4);
	}
}

function unpause() {
	paused = false;
	pauseTime += Date.now() - startPauseTime;
	msg.innerHTML = '';
	menu();
}

/**
 * Park Miller "Minimal Standard" PRNG.
 */
//TODO put random seed method in here.
window.rng = new function() {
	this.seed = 1;
	this.next = function() {
		// Returns a float between 0.0, and 1.0
		return this.gen() / 2147483647;
	};
	this.gen = function() {
		return (this.seed = (this.seed * 16807) % 2147483647);
	};
}();

/**
 * Draws the stats next to the tetrion.
 */
function statistics() {
	var time = Date.now() - startTime - pauseTime;
	var seconds = ((time / 1000) % 60).toFixed(2);
	var minutes = ~~(time / 60000);
	statsTime.innerHTML =
		(minutes < 10 ? '0' : '') + minutes + (seconds < 10 ? ':0' : ':') + seconds;
}

// ========================== View ============================================

/**
 * Draws grid in background.
 */
function bg(ctx) {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.fillStyle = '#1c1c1c';
	for (var x = -1; x < ctx.canvas.width + 1; x += cellSize) {
		ctx.fillRect(x, 0, 2, ctx.canvas.height);
	}
	for (var y = -1; y < ctx.canvas.height + 1; y += cellSize) {
		ctx.fillRect(0, y, ctx.canvas.width, 2);
	}
}

/**
 * Draws a pre-rendered mino.
 */
function drawCell(x, y, color, ctx) {
	x = x * cellSize;
	x = ~~x;
	y = ~~y * cellSize - 2 * cellSize;
	ctx.drawImage(
		spriteCanvas,
		color * cellSize,
		0,
		cellSize,
		cellSize,
		x,
		y,
		cellSize,
		cellSize,
	);
}

/**
 * Pre-renders all mino types in all colors.
 */
function makeSprite() {
	var shaded = [
		// 0         +10        -10        -20
		['#c1c1c1', '#dddddd', '#a6a6a6', '#8b8b8b'],
		['#25bb9b', '#4cd7b6', '#009f81', '#008568'],
		['#3397d9', '#57b1f6', '#007dbd', '#0064a2'],
		['#e67e23', '#ff993f', '#c86400', '#a94b00'],
		['#efc30f', '#ffdf3a', '#d1a800', '#b38e00'],
		['#9ccd38', '#b9e955', '#81b214', '#659700'],
		['#9c5ab8', '#b873d4', '#81409d', '#672782'],
		['#e64b3c', '#ff6853', '#c62c25', '#a70010'],
		['#898989', '#a3a3a3', '#6f6f6f', '#575757'],
	];
	var glossy = [
		//25         37         52         -21        -45
		['#ffffff', '#ffffff', '#ffffff', '#888888', '#4d4d4d'],
		['#7bffdf', '#9fffff', '#ccffff', '#008165', '#00442e'],
		['#6cdcff', '#93feff', '#c2ffff', '#00629f', '#002c60'],
		['#ffc166', '#ffe386', '#ffffb0', '#aa4800', '#650500'],
		['#ffff6a', '#ffff8c', '#ffffb8', '#b68a00', '#714f00'],
		['#efff81', '#ffffa2', '#ffffcd', '#6b9200', '#2c5600'],
		['#dc9dfe', '#ffbeff', '#ffe9ff', '#5d287e', '#210043'],
		['#ff9277', '#ffb497', '#ffe0bf', '#a7000a', '#600000'],
		['#cbcbcb', '#ededed', '#ffffff', '#545454', '#1f1f1f'],
	];
	var tgm = [
		['#7b7b7b', '#303030', '#6b6b6b', '#363636'],
		['#f08000', '#a00000', '#e86008', '#b00000'],
		['#00a8f8', '#0000b0', '#0090e8', '#0020c0'],
		['#f8a800', '#b84000', '#e89800', '#c85800'],
		['#e8e000', '#886800', '#d8c800', '#907800'],
		['#f828f8', '#780078', '#e020e0', '#880088'],
		['#00e8f0', '#0070a0', '#00d0e0', '#0080a8'],
		['#78f800', '#007800', '#58e000', '#008800'],
		['#7b7b7b', '#303030', '#6b6b6b', '#363636'],
	];
	var world = [];
	world[0] = tgm[0];
	world[1] = tgm[6];
	world[2] = tgm[2];
	world[3] = tgm[3];
	world[4] = tgm[4];
	world[5] = tgm[7];
	world[6] = tgm[5];
	world[7] = tgm[1];
	world[8] = tgm[8];

	spriteCanvas.width = cellSize * 9;
	spriteCanvas.height = cellSize;
	for (var i = 0; i < 9; i++) {
		var x = i * cellSize;
		if (settings.Block === 0) {
			// Shaded
			spriteCtx.fillStyle = shaded[i][1];
			spriteCtx.fillRect(x, 0, cellSize, cellSize);

			spriteCtx.fillStyle = shaded[i][3];
			spriteCtx.fillRect(x, cellSize / 2, cellSize, cellSize / 2);

			spriteCtx.fillStyle = shaded[i][0];
			spriteCtx.beginPath();
			spriteCtx.moveTo(x, 0);
			spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
			spriteCtx.lineTo(x, cellSize);
			spriteCtx.fill();

			spriteCtx.fillStyle = shaded[i][2];
			spriteCtx.beginPath();
			spriteCtx.moveTo(x + cellSize, 0);
			spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
			spriteCtx.lineTo(x + cellSize, cellSize);
			spriteCtx.fill();
		} else if (settings.Block === 1) {
			// Flat
			spriteCtx.fillStyle = shaded[i][0];
			spriteCtx.fillRect(x, 0, cellSize, cellSize);
		} else if (settings.Block === 2) {
			// Glossy
			var k = Math.max(~~(cellSize * 0.083), 1);

			var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
			grad.addColorStop(0.5, glossy[i][3]);
			grad.addColorStop(1, glossy[i][4]);
			spriteCtx.fillStyle = grad;
			spriteCtx.fillRect(x, 0, cellSize, cellSize);

			var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
			grad.addColorStop(0, glossy[i][2]);
			grad.addColorStop(0.5, glossy[i][1]);
			spriteCtx.fillStyle = grad;
			spriteCtx.fillRect(x, 0, cellSize - k, cellSize - k);

			var grad = spriteCtx.createLinearGradient(
				x + k,
				k,
				x + cellSize - k,
				cellSize - k,
			);
			grad.addColorStop(0, shaded[i][0]);
			grad.addColorStop(0.5, glossy[i][0]);
			grad.addColorStop(0.5, shaded[i][0]);
			grad.addColorStop(1, glossy[i][0]);
			spriteCtx.fillStyle = grad;
			spriteCtx.fillRect(x + k, k, cellSize - k * 2, cellSize - k * 2);
		} else if (settings.Block === 3 || settings.Block === 4) {
			// Arika
			if (settings.Block === 4) tgm = world;
			var k = Math.max(~~(cellSize * 0.125), 1);

			spriteCtx.fillStyle = tgm[i][1];
			spriteCtx.fillRect(x, 0, cellSize, cellSize);
			spriteCtx.fillStyle = tgm[i][0];
			spriteCtx.fillRect(x, 0, cellSize, ~~(cellSize / 2));

			var grad = spriteCtx.createLinearGradient(x, k, x, cellSize - k);
			grad.addColorStop(0, tgm[i][2]);
			grad.addColorStop(1, tgm[i][3]);
			spriteCtx.fillStyle = grad;
			spriteCtx.fillRect(x + k, k, cellSize - k * 2, cellSize - k * 2);

			var grad = spriteCtx.createLinearGradient(x, k, x, cellSize);
			grad.addColorStop(0, tgm[i][0]);
			grad.addColorStop(1, tgm[i][3]);
			spriteCtx.fillStyle = grad;
			spriteCtx.fillRect(x, k, k, cellSize - k);

			var grad = spriteCtx.createLinearGradient(x, 0, x, cellSize - k);
			grad.addColorStop(0, tgm[i][2]);
			grad.addColorStop(1, tgm[i][1]);
			spriteCtx.fillStyle = grad;
			spriteCtx.fillRect(x + cellSize - k, 0, k, cellSize - k);
		}
	}
}

/**
 * Clear canvas.
 */
window.clear = function (ctx) {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * Draws a 2d array of minos.
 */
window.draw = function (tetro, cx, cy, ctx, color) {
	for (var x = 0, len = tetro.length; x < len; x++) {
		for (var y = 0, wid = tetro[x].length; y < wid; y++) {
			if (tetro[x][y])
				drawCell(x + cx, y + cy, color !== void 0 ? color : tetro[x][y], ctx);
		}
	}
}

// ========================== Controller ======================================

addEventListener(
	'keydown',
	function(e) {
		// TODO send to menu or game depending on context.
		if ([32, 37, 38, 39, 40].indexOf(e.keyCode) !== -1) e.preventDefault();
		//TODO if active, prevent default for binded keys
		//if (bindsArr.indexOf(e.keyCode) !== -1)
		//  e.preventDefault();
		if (e.keyCode === binds.pause) {
			if (paused) {
				unpause();
			} else {
				pause();
			}
		}
		if (e.keyCode === binds.retry) {
			init(window.gametype);
		}
		if (!watchingReplay) {
			if (e.keyCode === binds.moveLeft) {
				keysDown |= flags.moveLeft;
				//piece.finesse++
			} else if (e.keyCode === binds.moveRight) {
				keysDown |= flags.moveRight;
			} else if (e.keyCode === binds.moveDown) {
				keysDown |= flags.moveDown;
			} else if (e.keyCode === binds.hardDrop) {
				keysDown |= flags.hardDrop;
			} else if (e.keyCode === binds.rotRight) {
				keysDown |= flags.rotRight;
			} else if (e.keyCode === binds.rotLeft) {
				keysDown |= flags.rotLeft;
			} else if (e.keyCode === binds.rot180) {
				keysDown |= flags.rot180;
			} else if (e.keyCode === binds.holdPiece) {
				keysDown |= flags.holdPiece;
			}
		}
	},
	false,
);
addEventListener(
	'keyup',
	function(e) {
		if (!watchingReplay) {
			if (e.keyCode === binds.moveLeft && keysDown & flags.moveLeft) {
				keysDown ^= flags.moveLeft;
			} else if (e.keyCode === binds.moveRight && keysDown & flags.moveRight) {
				keysDown ^= flags.moveRight;
			} else if (e.keyCode === binds.moveDown && keysDown & flags.moveDown) {
				keysDown ^= flags.moveDown;
			} else if (e.keyCode === binds.hardDrop && keysDown & flags.hardDrop) {
				keysDown ^= flags.hardDrop;
			} else if (e.keyCode === binds.rotRight && keysDown & flags.rotRight) {
				keysDown ^= flags.rotRight;
			} else if (e.keyCode === binds.rotLeft && keysDown & flags.rotLeft) {
				keysDown ^= flags.rotLeft;
			} else if (e.keyCode === binds.rot180 && keysDown & flags.rot180) {
				keysDown ^= flags.rot180;
			} else if (e.keyCode === binds.holdPiece && keysDown & flags.holdPiece) {
				keysDown ^= flags.holdPiece;
			}
		}
	},
	false,
);

// ========================== Loop ============================================

//TODO Cleanup gameloop and update.
/**
 * Runs every frame.
 */
function update() {
	//TODO Das preservation broken.
	if (lastKeys !== keysDown && !watchingReplay) {
		replayKeys[frame] = keysDown;
	} else if (frame in replayKeys) {
		keysDown = replayKeys[frame];
	}

	if (!(lastKeys & flags.holdPiece) && flags.holdPiece & keysDown) {
		if (!piece.swapHold(hold, preview)) {
			gameState = 9;
			msg.innerHTML = 'BLOCK OUT!';
			menu(3);
		}
	}

	if (flags.rotLeft & keysDown && !(lastKeys & flags.rotLeft)) {
		piece.rotate(-1);
		piece.finesse++;
	} else if (flags.rotRight & keysDown && !(lastKeys & flags.rotRight)) {
		piece.rotate(1);
		piece.finesse++;
	} else if (flags.rot180 & keysDown && !(lastKeys & flags.rot180)) {
		piece.rotate(1);
		piece.rotate(1);
		piece.finesse++;
	}

	piece.checkShift(keysDown, lastKeys, flags);

	if (flags.moveDown & keysDown) {
		piece.shiftDown();
		//piece.finesse++;
	}
	if (!(lastKeys & flags.hardDrop) && flags.hardDrop & keysDown) {
		piece.hardDrop();
	}

	if (!piece.update(gravity, preview)) {
		gameState = 9;
		msg.innerHTML = 'LOCK OUT!';
		menu(3);
	}

	// Win
	// TODO
	if (window.gametype !== 3) {
		if (stack.lines >= stack.lineLimit) {
			gameState = 1;
			msg.innerHTML = 'GREAT!';
			menu(3);
		}
	} else {
		if (digLines.length === 0) {
			gameState = 1;
			msg.innerHTML = 'GREAT!';
			menu(3);
		}
	}

	statistics();

	if (lastKeys !== keysDown) {
		lastKeys = keysDown;
	}
}

function gameLoop() {
	requestAnimFrame(gameLoop);

	//TODO check to see how pause works in replays.
	frame++;

	if (gameState === 0) {
		// Playing

		if (!paused) {
			update();
		}

		// TODO improve this with 'dirty' flags.
		if (
			piece.x !== lastX ||
			Math.floor(piece.y) !== lastY ||
			piece.pos !== lastPos ||
			piece.dirty
		) {
			clear(activeCtx);
			piece.drawGhost();
			piece.draw();
		}
		lastX = piece.x;
		lastY = Math.floor(piece.y);
		lastPos = piece.pos;
		piece.dirty = false;
	} else if (gameState === 2) {
		// Count Down
		if (frame < 50) {
			if (msg.innerHTML !== 'READY') msg.innerHTML = 'READY';
		} else if (frame < 100) {
			if (msg.innerHTML !== 'GO!') msg.innerHTML = 'GO!';
		} else {
			msg.innerHTML = '';
			gameState = 0;
			startTime = Date.now();
			if (!piece.new(preview.next())) {
				gameState = 9;
				msg.innerHTML = 'BLOCK OUT!';
				menu(3);
			}
		}
		// DAS Preload
		if (lastKeys !== keysDown && !watchingReplay) {
			replayKeys[frame] = keysDown;
		} else if (frame in replayKeys) {
			keysDown = replayKeys[frame];
		}
		if (keysDown & flags.moveLeft) {
			lastKeys = keysDown;
			piece.shiftDelay = settings.DAS;
			piece.shiftReleased = false;
			piece.shiftDir = -1;
		} else if (keysDown & flags.moveRight) {
			lastKeys = keysDown;
			piece.shiftDelay = settings.DAS;
			piece.shiftReleased = false;
			piece.shiftDir = 1;
		}
	} else if (toGreyRow >= 2) {
		/**
		 * Fade to grey animation played when player loses.
		 */
		if (toGreyRow === 21) clear(activeCtx);
		if (frame % 2) {
			for (var x = 0; x < 10; x++) {
				if (stack.grid[x][toGreyRow]) stack.grid[x][toGreyRow] = gameState - 1;
			}
			stack.draw();
			toGreyRow--;
		}
	}
}

/**
 * Menu
 */

var version = '0.1.8';
var setLoop;
var arrowReleased = true;
var arrowDelay = 0;

var key = {
	8: 'Backspace',
	9: 'Tab',
	13: 'Enter',
	16: 'Shift',
	17: 'Ctrl',
	18: 'Alt',
	19: 'Pause',
	20: 'Caps Lock',
	27: 'Esc',
	32: 'Space',
	33: 'PgUp',
	34: 'PgDn',
	35: 'End',
	36: 'Home',
	37: '←',
	38: '↑',
	39: '→',
	40: '↓',
	45: 'Insert',
	46: 'Delete',
	48: '0',
	49: '1',
	50: '2',
	51: '3',
	52: '4',
	53: '5',
	54: '6',
	55: '7',
	56: '8',
	57: '9',
	59: ';',
	61: '=',
	65: 'A',
	66: 'B',
	67: 'C',
	68: 'D',
	69: 'E',
	70: 'F',
	71: 'G',
	72: 'H',
	73: 'I',
	74: 'J',
	75: 'K',
	76: 'L',
	77: 'M',
	78: 'N',
	79: 'O',
	80: 'P',
	81: 'Q',
	82: 'R',
	83: 'S',
	84: 'T',
	85: 'U',
	86: 'V',
	87: 'W',
	88: 'X',
	89: 'Y',
	90: 'Z',
	96: '0kpad',
	97: '1kpad',
	98: '2kpad',
	99: '3kpad',
	100: '4kpad',
	101: '5kpad',
	102: '6kpad',
	103: '7kpad',
	104: '8kpad',
	105: '9kpad',
	106: '*',
	107: '+',
	109: '-',
	110: '.',
	111: '/',
	112: 'F1',
	113: 'F2',
	114: 'F3',
	115: 'F4',
	116: 'F5',
	117: 'F6',
	118: 'F7',
	119: 'F8',
	120: 'F9',
	121: 'F10',
	122: 'F11',
	123: 'F12',
	173: '-',
	187: '=',
	188: ',',
	190: '.',
	191: '/',
	192: '`',
	219: '[',
	220: '\\',
	221: ']',
	222: "'",
};

/**
 * Show and hide menus.
 */
var menus = document.getElementsByClassName('menu');
window.menu = function (menuIndex) {
	for (var i = 0, len = menus.length; i < len; i++) {
		menus[i].classList.remove('on');
	}
	if (menuIndex !== void 0) menus[menuIndex].classList.add('on');
}

/**
 * Controls Menu
 */
var newKey,
	currCell,
	tempKey,
	controls = document.getElementById('controls'),
	controlCells = controls.getElementsByTagName('td');
// Give controls an event listener.
for (var i = 0, len = controlCells.length; i < len; i++) {
	controlCells[i].onclick = function() {
		// First check if we're already waiting for an input.
		if (currCell) {
			// TODO DRY
			// Make this into a function and call it when we press Esc.
			binds[currCell.id] = tempKey;
			currCell.innerHTML = key[tempKey];
		}
		tempKey = binds[this.id];
		this.innerHTML = 'Press key';
		currCell = this;
	};
}
// Listen for key input if a control has been clicked on.
addEventListener(
	'keyup',
	function(e) {
		// if click outside of cell or press esc clear currCell
		// reset binds button.
		if (currCell) {
			// Checks if key already in use, and unbinds it.
			for (var i in binds) {
				if (e.keyCode === binds[i]) {
					binds[i] = void 0;
					document.getElementById(i).innerHTML = binds[i];
				}
			}
			// Binds the key and saves the data.
			binds[currCell.id] = e.keyCode;
			currCell.innerHTML = key[e.keyCode];
			localStorage.setItem('binds', JSON.stringify(binds));
			currCell = 0;
		}
	},
	false,
);

/**
 * Settings Menu
 */
function settingsLoop() {
	if (arrowReleased || arrowDelay >= 6) {
		if (settingsArrow)
			settings[s] = settings[s] === 0 ? setting[s].length - 1 : settings[s] - 1;
		else
			settings[s] = settings[s] === setting[s].length - 1 ? 0 : settings[s] + 1;
		saveSetting(s);
		arrowReleased = false;
	} else {
		arrowDelay++;
	}
	setLoop = setTimeout(settingsLoop, 50);
}
var s;
var settingsArrow;
// TODO DRY this.
function arrowRelease() {
	resize();
	arrowReleased = true;
	arrowDelay = 0;
	clearTimeout(setLoop);
}
function left() {
	settingsArrow = 1;
	s = this.parentNode.id;
	this.onmouseup = arrowRelease;
	this.onmouseout = arrowRelease;
	settingsLoop();
}
function right() {
	settingsArrow = 0;
	s = this.parentNode.id;
	this.onmouseup = arrowRelease;
	this.onmouseout = arrowRelease;
	settingsLoop();
}

/**
 * LocalStorage functions
 */
function saveSetting(s) {
	localStorage['version'] = version;

	document.getElementById(s).getElementsByTagName('span')[0].innerHTML =
		setting[s][settings[s]];

	localStorage['settings'] = JSON.stringify(settings);
}
function loadLocalData() {
	if (localStorage['binds']) {
		binds = JSON.parse(localStorage.getItem('binds'));
		for (var i = 0, len = controlCells.length; i < len; i++) {
			controlCells[i].innerHTML = key[binds[controlCells[i].id]];
		}
	}
	// TODO When new version just update with new stuff, rest stays unchanged.
	if (localStorage['version'] !== version) {
		localStorage.removeItem('settings');
		localStorage.removeItem('binds');
	}
	if (localStorage['settings']) {
		settings = JSON.parse(localStorage.getItem('settings'));
	}
}

loadLocalData();
for (var s in settings) {
	var div = document.createElement('div');
	var b = document.createElement('b');
	var iLeft = document.createElement('i');
	var span = document.createElement('span');
	var iRight = document.createElement('i');

	div.id = s;
	b.innerHTML = s + ':';
	span.innerHTML = setting[s][settings[s]];
	iLeft.className = 'left';
	iRight.className = 'right';
	iLeft.onmousedown = left;
	iRight.onmousedown = right;

	set.appendChild(div);
	div.appendChild(b);
	div.appendChild(iLeft);
	div.appendChild(span);
	div.appendChild(iRight);
}
resize();
