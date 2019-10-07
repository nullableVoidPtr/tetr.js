/**
 * Piece data
 */

// NOTE y values are inverted since our matrix counts from top to bottom.
var kickData = [
	[[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
	[[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
	[[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
	[[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
];
var kickDataI = [
	[[0, 0], [-1, 0], [2, 0], [-1, 0], [2, 0]],
	[[-1, 0], [0, 0], [0, 0], [0, -1], [0, 2]],
	[[-1, -1], [1, -1], [-2, -1], [1, 0], [-2, 0]],
	[[0, -1], [0, -1], [0, -1], [0, 1], [0, -2]],
];
// TODO get rid of this lol.
var kickDataO = [[[0, 0]], [[0, 0]], [[0, 0]], [[0, 0]]];

// Define shapes and spawns.
var PieceI = {
	index: 0,
	x: 2,
	y: -1,
	kickData: kickDataI,
	tetro: [
		[0, 0, 0, 0, 0],
		[0, 0, 1, 0, 0],
		[0, 0, 1, 0, 0],
		[0, 0, 1, 0, 0],
		[0, 0, 1, 0, 0],
	],
};
var PieceJ = {
	index: 1,
	x: 3,
	y: 0,
	kickData: kickData,
	tetro: [[2, 2, 0], [0, 2, 0], [0, 2, 0]],
};
var PieceL = {
	index: 2,
	x: 3,
	y: 0,
	kickData: kickData,
	tetro: [[0, 3, 0], [0, 3, 0], [3, 3, 0]],
};
var PieceO = {
	index: 3,
	x: 4,
	y: 0,
	kickData: kickDataO,
	tetro: [[4, 4], [4, 4]],
};
var PieceS = {
	index: 4,
	x: 3,
	y: 0,
	kickData: kickData,
	tetro: [[0, 5, 0], [5, 5, 0], [5, 0, 0]],
};
var PieceT = {
	index: 5,
	x: 3,
	y: 0,
	kickData: kickData,
	tetro: [[0, 6, 0], [6, 6, 0], [0, 6, 0]],
};
var PieceZ = {
	index: 6,
	x: 3,
	y: 0,
	kickData: kickData,
	tetro: [[7, 0, 0], [7, 7, 0], [0, 7, 0]],
};
export var pieces = [PieceI, PieceJ, PieceL, PieceO, PieceS, PieceT, PieceZ];

// Finesse data
// index x orientatio x column = finesse
// finesse[0][0][4] = 1
// TODO double check these.
export var finesse = [
	[
		[1, 2, 1, 0, 1, 2, 1],
		[2, 2, 2, 2, 1, 1, 2, 2, 2, 2],
		[1, 2, 1, 0, 1, 2, 1],
		[2, 2, 2, 2, 1, 1, 2, 2, 2, 2],
	],
	[
		[1, 2, 1, 0, 1, 2, 2, 1],
		[2, 2, 3, 2, 1, 2, 3, 3, 2],
		[2, 3, 2, 1, 2, 3, 3, 2],
		[2, 3, 2, 1, 2, 3, 3, 2, 2],
	],
	[
		[1, 2, 1, 0, 1, 2, 2, 1],
		[2, 2, 3, 2, 1, 2, 3, 3, 2],
		[2, 3, 2, 1, 2, 3, 3, 2],
		[2, 3, 2, 1, 2, 3, 3, 2, 2],
	],
	[
		[1, 2, 2, 1, 0, 1, 2, 2, 1],
		[1, 2, 2, 1, 0, 1, 2, 2, 1],
		[1, 2, 2, 1, 0, 1, 2, 2, 1],
		[1, 2, 2, 1, 0, 1, 2, 2, 1],
	],
	[
		[1, 2, 1, 0, 1, 2, 2, 1],
		[2, 2, 2, 1, 1, 2, 3, 2, 2],
		[1, 2, 1, 0, 1, 2, 2, 1],
		[2, 2, 2, 1, 1, 2, 3, 2, 2],
	],
	[
		[1, 2, 1, 0, 1, 2, 2, 1],
		[2, 2, 3, 2, 1, 2, 3, 3, 2],
		[2, 3, 2, 1, 2, 3, 3, 2],
		[2, 3, 2, 1, 2, 3, 3, 2, 2],
	],
	[
		[1, 2, 1, 0, 1, 2, 2, 1],
		[2, 2, 2, 1, 1, 2, 3, 2, 2],
		[1, 2, 1, 0, 1, 2, 2, 1],
		[2, 2, 2, 1, 1, 2, 3, 2, 2],
	],
];

var gravityArr = (function() {
	var array = [];
	array.push(0);
	for (var i = 1; i < 64; i++) array.push(i / 64);
	for (var i = 1; i <= 20; i++) array.push(i);
	return array;
})();

export default class {
	constructor(canvas, stack) {
		this.x;
		this.y;
		this.pos = 0;
		this.tetro;
		this.index;
		this.kickData;
		this.lockDelay = 0;
		this.shiftDelay = 0;
		this.shiftDir;
		this.shiftReleased;
		this.arrDelay = 0;
		this.held = false;
		this.finesse = 0;
		this.dirty = false;
		this.canvas = canvas
		this.context = canvas.getContext('2d');
		this.stack = stack;
	}
	/**
	 * Removes last active piece, and gets the next active piece from the grab bag.
	 */
	new(index) {
		// TODO if no arguments, get next grabbag piece
		this.pos = 0;
		this.tetro = [];
		this.held = false;
		this.finesse = 0;
		this.dirty = true;
		//TODO change this
		this.landed = false;

		// TODO Do this better. Make clone object func maybe.
		//for property in pieces, this.prop = piece.prop
		this.tetro = pieces[index].tetro;
		this.kickData = pieces[index].kickData;
		this.x = pieces[index].x;
		this.y = pieces[index].y;
		this.index = index;

		// TODO ---------------- snip

		//TODO Do this better. (make grabbag object)
		// Preview.next(); == grabbag.next()
		// Preview.draw();
		//preview.next();

		// Check for blockout.
		return this.moveValid(0, 0, this.tetro);
	}

	rotate(direction) {
		// Rotates tetromino.
		var rotated = [];
		if (direction === -1) {
			for (var i = this.tetro.length - 1; i >= 0; i--) {
				rotated[i] = [];
				for (var row = 0; row < this.tetro.length; row++) {
					rotated[i][this.tetro.length - 1 - row] = this.tetro[row][i];
				}
			}
		} else {
			for (var i = 0; i < this.tetro.length; i++) {
				rotated[i] = [];
				for (var row = this.tetro.length - 1; row >= 0; row--) {
					rotated[i][row] = this.tetro[row][this.tetro.length - 1 - i];
				}
			}
		}

		// Goes thorugh kick data until it finds a valid move.
		var curPos = this.pos % 4;
		var newPos = (this.pos + direction + 4) % 4;

		for (var x = 0, len = this.kickData[0].length; x < len; x++) {
			if (
				this.moveValid(
					this.kickData[curPos][x][0] - this.kickData[newPos][x][0],
					this.kickData[curPos][x][1] - this.kickData[newPos][x][1],
					rotated,
				)
			) {
				this.x += this.kickData[curPos][x][0] - this.kickData[newPos][x][0];
				this.y += this.kickData[curPos][x][1] - this.kickData[newPos][x][1];
				this.tetro = rotated;
				this.pos = newPos;
				// TODO make 180 rotate count as one or just update finess 180s
				//this.finesse++;
				break;
			}
		}
	}
	checkShift(keysDown, lastKeys, flags) {
		// Shift key pressed event.
		if (keysDown & flags.moveLeft && !(lastKeys & flags.moveLeft)) {
			this.shiftDelay = 0;
			this.arrDelay = 0;
			this.shiftReleased = true;
			this.shiftDir = -1;
			this.finesse++;
		} else if (keysDown & flags.moveRight && !(lastKeys & flags.moveRight)) {
			this.shiftDelay = 0;
			this.arrDelay = 0;
			this.shiftReleased = true;
			this.shiftDir = 1;
			this.finesse++;
		}
		// Shift key released event.
		if (
			this.shiftDir === 1 &&
			!(keysDown & flags.moveRight) &&
			lastKeys & flags.moveRight &&
			keysDown & flags.moveLeft
		) {
			this.shiftDelay = 0;
			this.arrDelay = 0;
			this.shiftReleased = true;
			this.shiftDir = -1;
		} else if (
			this.shiftDir === -1 &&
			!(keysDown & flags.moveLeft) &&
			lastKeys & flags.moveLeft &&
			keysDown & flags.moveRight
		) {
			this.shiftDelay = 0;
			this.arrDelay = 0;
			this.shiftReleased = true;
			this.shiftDir = 1;
		} else if (
			!(keysDown & flags.moveRight) &&
			lastKeys & flags.moveRight &&
			keysDown & flags.moveLeft
		) {
			this.shiftDir = -1;
		} else if (
			!(keysDown & flags.moveLeft) &&
			lastKeys & flags.moveLeft &&
			keysDown & flags.moveRight
		) {
			this.shiftDir = 1;
		} else if (
			(!(keysDown & flags.moveLeft) && lastKeys & flags.moveLeft) ||
			(!(keysDown & flags.moveRight) && lastKeys & flags.moveRight)
		) {
			this.shiftDelay = 0;
			this.arrDelay = 0;
			this.shiftReleased = true;
			this.shiftDir = 0;
		}
		// Handle events
		if (this.shiftDir) {
			// 1. When key pressed instantly move over once.
			if (this.shiftReleased) {
				this.shift(this.shiftDir);
				this.shiftDelay++;
				this.shiftReleased = false;
				// 2. Apply DAS delay
			} else if (this.shiftDelay < settings.DAS) {
				this.shiftDelay++;
				// 3. Once the delay is complete, move over once.
				//     Increment delay so this doesn't run again.
			} else if (this.shiftDelay === settings.DAS && settings.DAS !== 0) {
				this.shift(this.shiftDir);
				if (settings.ARR !== 0) this.shiftDelay++;
				// 4. Apply ARR delay
			} else if (this.arrDelay < settings.ARR) {
				this.arrDelay++;
				// 5. If ARR Delay is full, move piece, and reset delay and repeat.
			} else if (this.arrDelay === settings.ARR && settings.ARR !== 0) {
				this.shift(this.shiftDir);
			}
		}
	}
	shift(direction) {
		this.arrDelay = 0;
		if (settings.ARR === 0 && this.shiftDelay === settings.DAS) {
			for (var i = 1; i < 10; i++) {
				if (!this.moveValid(i * direction, 0, this.tetro)) {
					this.x += i * direction - direction;
					break;
				}
			}
		} else if (this.moveValid(direction, 0, this.tetro)) {
			this.x += direction;
		}
	}
	shiftDown() {
		if (this.moveValid(0, 1, this.tetro)) {
			var grav = gravityArr[settings['Soft Drop'] + 1];
			if (grav > 1) this.y += this.getDrop(grav);
			else this.y += grav;
		}
	}
	hardDrop() {
		this.y += this.getDrop(20);
		this.lockDelay = settings['Lock Delay'];
	}
	getDrop(distance) {
		for (var i = 1; i <= distance; i++) {
			if (!this.moveValid(0, i, this.tetro)) return i - 1;
		}
		return i - 1;
	}
	swapHold(hold, preview) {
		var temp = hold.piece;
		if (!this.held) {
			if (hold.piece !== void 0) {
				hold.piece = this.index;
				if (!this.new(temp)) return false;
			} else {
				hold.piece = this.index;
				if (!this.new(preview.next())) return false;
			}
			this.held = true;
			hold.draw();
		}
		return true;
	}
	/**
	 * Checks if position and orientation passed is valid.
	 *  We call it for every action instead of only once a frame in case one
	 *  of the actions is still valid, we don't want to block it.
	 */
	moveValid(cx, cy, tetro) {
		cx = cx + this.x;
		cy = Math.floor(cy + this.y);

		for (var x = 0; x < tetro.length; x++) {
			for (var y = 0; y < tetro[x].length; y++) {
				if (
					tetro[x][y] &&
					(cx + x < 0 ||
						cx + x >= 10 ||
						cy + y >= 22 ||
						this.stack.grid[cx + x][cy + y])
				) {
					return false;
				}
			}
		}
		this.lockDelay = 0;
		return true;
	}
	update(gravity, preview) {
		if (this.moveValid(0, 1, this.tetro)) {
			this.landed = false;
			if (settings.Gravity) {
				var grav = gravityArr[settings.Gravity - 1];
				if (grav > 1) this.y += this.getDrop(grav);
				else this.y += grav;
			} else {
				this.y += gravity;
			}
		} else {
			this.landed = true;
			this.y = Math.floor(this.y);
			if (this.lockDelay >= settings['Lock Delay']) {
				if (!this.stack.addPiece(this)) return false;
				if (!this.new(preview.next())) return false;
			} else {
				var a = 1 / setting['Lock Delay'][settings['Lock Delay']];
				this.context.globalCompositeOperation = 'source-atop';
				this.context.fillStyle = 'rgba(0,0,0,' + a + ')';
				this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
				this.context.globalCompositeOperation = 'source-over';
				this.lockDelay++;
			}
		}
		return true;
	}
	draw() {
		draw(this.tetro, this.x, this.y, this.context);
	}
	drawGhost() {
		if (!settings.Ghost && !this.landed) {
			draw(this.tetro, this.x, this.y + this.getDrop(22), this.context, 0);
		} else if (settings.Ghost === 1 && !landed) {
			this.context.globalAlpha = 0.3;
			draw(this.tetro, this.x, this.y + this.getDrop(22), this.context);
			this.context.globalAlpha = 1;
		}
	}
}
