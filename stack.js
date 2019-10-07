import {finesse} from './piece.js'

export default class {
	constructor(canvas, x, y, statsPiece, statsLines) {
		var cells = new Array(x);
		for (var i = 0; i < x; i++) {
			cells[i] = new Array(y);
		}
		this.grid = cells;
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.statsFinesse = 0;
		this.piecesSet = 0;
		this.lineLimit = 40;
		this.lines = 0;
		this.statsPiece = statsPiece;
		this.statsLines = statsLines;
		this.statsPiece.innerHTML = this.piecesSet;
		this.statsLines.innerHTML = this.lineLimit - this.lines;
		this.column = 0
	}
	/**
	 * Adds tetro to the stack, and clears lines if they fill up.
	 */
	addPiece(piece) {
		var once = false;

		// Add the piece to the stack.
		var range = [];
		var valid = false;
		for (var x = 0; x < piece.tetro.length; x++) {
			for (var y = 0; y < piece.tetro[x].length; y++) {
				if (piece.tetro[x][y]) {
					this.grid[x + piece.x][y + piece.y] = piece.tetro[x][y];
					// Get column for finesse
					if (!once || x + piece.x < this.column) {
						this.column = x + piece.x;
						once = true;
					}
					// Check which lines get modified
					if (range.indexOf(y + piece.y) === -1) {
						range.push(y + piece.y);
						// This checks if any cell is in the play field. If there
						//  isn't any this is called a lock out and the game ends.
						if (y + piece.y > 1) valid = true;
					}
				}
			}
		}

		// Lock out
		if (!valid) {
			return false;
		}

		// Check modified lines for full lines.
		range = range.sort(function(a, b) {
			return a - b;
		});
		for (var row = range[0], len = row + range.length; row < len; row++) {
			var count = 0;
			for (var x = 0; x < 10; x++) {
				if (this.grid[x][row]) count++;
			}
			// Clear the line. This basically just moves down the stack.
			// TODO Ponder during the day and see if there is a more elegant solution.
			if (count === 10) {
				this.lines++; // NOTE stats
				if (window.gametype === 3) {
					if (digLines.indexOf(row) !== -1) {
						digLines.splice(digLines.indexOf(row), 1);
					}
				}
				for (var y = row; y >= -1; y--) {
					for (var x = 0; x < 10; x++) {
						this.grid[x][y] = this.grid[x][y - 1];
					}
				}
			}
		}

		this.statsFinesse += piece.finesse - finesse[piece.index][piece.pos][this.column];
		this.piecesSet++; // NOTE Stats
		// TODO Might not need this (same for in init)
		this.column = 0;

		this.statsPiece.innerHTML = this.piecesSet;

		if (window.gametype !== 3) this.statsLines.innerHTML = this.lineLimit - this.lines;
		else this.statsLines.innerHTML = digLines.length;

		this.draw();
		return true;
	}
	/**
	 * Draws the stack.
	 */
	draw() {
		clear(this.context);
		draw(this.grid, 0, 0, this.context);

		// Darken Stack
		// TODO wrap this with an option.
		this.context.globalCompositeOperation = 'source-atop';
		this.context.fillStyle = 'rgba(0,0,0,0.3)';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.globalCompositeOperation = 'source-over';

		if (settings.Outline) {
			var b = ~~(cellSize / 8);
			var c = cellSize;
			var lineCanvas = document.createElement('canvas');
			lineCanvas.width = this.canvas.width;
			lineCanvas.height = this.canvas.height;
			var lineCtx = lineCanvas.getContext('2d');
			lineCtx.fillStyle = 'rgba(255,255,255,0.5)';
			lineCtx.beginPath();
			for (var x = 0, len = this.grid.length; x < len; x++) {
				for (var y = 0, wid = this.grid[x].length; y < wid; y++) {
					if (this.grid[x][y]) {
						if (x < 9 && !this.grid[x + 1][y]) {
							lineCtx.fillRect(x * c + c - b, y * c - 2 * c, b, c);
						}
						if (x > 0 && !this.grid[x - 1][y]) {
							lineCtx.fillRect(x * c, y * c - 2 * c, b, c);
						}
						if (y < 21 && !this.grid[x][y + 1]) {
							lineCtx.fillRect(x * c, y * c - 2 * c + c - b, c, b);
						}
						if (!this.grid[x][y - 1]) {
							lineCtx.fillRect(x * c, y * c - 2 * c, c, b);
						}
						// Diags
						if (x < 9 && y < 21) {
							if (!this.grid[x + 1][y] && !this.grid[x][y + 1]) {
								lineCtx.clearRect(x * c + c - b, y * c - 2 * c + c - b, b, b);
								lineCtx.fillRect(x * c + c - b, y * c - 2 * c + c - b, b, b);
							} else if (
								!this.grid[x + 1][y + 1] &&
								this.grid[x + 1][y] &&
								this.grid[x][y + 1]
							) {
								lineCtx.moveTo(x * c + c, y * c - 2 * c + c - b);
								lineCtx.lineTo(x * c + c, y * c - 2 * c + c);
								lineCtx.lineTo(x * c + c - b, y * c - 2 * c + c);
								lineCtx.arc(
									x * c + c,
									y * c - 2 * c + c,
									b,
									(3 * Math.PI) / 2,
									Math.PI,
									true,
								);
							}
						}
						if (x < 9) {
							if (!this.grid[x + 1][y] && !this.grid[x][y - 1]) {
								lineCtx.clearRect(x * c + c - b, y * c - 2 * c, b, b);
								lineCtx.fillRect(x * c + c - b, y * c - 2 * c, b, b);
							} else if (
								!this.grid[x + 1][y - 1] &&
								this.grid[x + 1][y] &&
								this.grid[x][y - 1]
							) {
								lineCtx.moveTo(x * c + c - b, y * c - 2 * c);
								lineCtx.lineTo(x * c + c, y * c - 2 * c);
								lineCtx.lineTo(x * c + c, y * c - 2 * c + b);
								lineCtx.arc(
									x * c + c,
									y * c - 2 * c,
									b,
									Math.PI / 2,
									Math.PI,
									false,
								);
							}
						}
						if (x > 0 && y < 21) {
							if (!this.grid[x - 1][y] && !this.grid[x][y + 1]) {
								lineCtx.clearRect(x * c, y * c - 2 * c + c - b, b, b);
								lineCtx.fillRect(x * c, y * c - 2 * c + c - b, b, b);
							} else if (
								!this.grid[x - 1][y + 1] &&
								this.grid[x - 1][y] &&
								this.grid[x][y + 1]
							) {
								lineCtx.moveTo(x * c, y * c - 2 * c + c - b);
								lineCtx.lineTo(x * c, y * c - 2 * c + c);
								lineCtx.lineTo(x * c + b, y * c - 2 * c + c);
								lineCtx.arc(
									x * c,
									y * c - 2 * c + c,
									b,
									Math.PI * 2,
									(3 * Math.PI) / 2,
									true,
								);
							}
						}
						if (x > 0) {
							if (!this.grid[x - 1][y] && !this.grid[x][y - 1]) {
								lineCtx.clearRect(x * c, y * c - 2 * c, b, b);
								lineCtx.fillRect(x * c, y * c - 2 * c, b, b);
							} else if (
								!this.grid[x - 1][y - 1] &&
								this.grid[x - 1][y] &&
								this.grid[x][y - 1]
							) {
								lineCtx.moveTo(x * c + b, y * c - 2 * c);
								lineCtx.lineTo(x * c, y * c - 2 * c);
								lineCtx.lineTo(x * c, y * c - 2 * c + b);
								lineCtx.arc(
									x * c,
									y * c - 2 * c,
									b,
									Math.PI / 2,
									Math.PI * 2,
									true,
								);
							}
						}
					}
				}
			}
			lineCtx.fill();
			this.context.drawImage(lineCanvas, 0, 0);
		}
	}
}
