import {pieces} from './piece.js'

export default class {
	constructor(context) {
		for (; !([3, 4, 6].indexOf((this.grabBag = this.gen())[0]) === -1); );
		this.grabBag.push.apply(this.grabBag, this.gen());
		this.context = context;
		this.draw();
	}

	next() {
		var next;
		next = this.grabBag.shift();
		if (this.grabBag.length === 7) {
			this.grabBag.push.apply(this.grabBag, this.gen());
		}
		this.draw();
		return next;
		//TODO Maybe return the next piece?
	}

	/**
	 * Creates a "grab bag" of the 7 tetrominos.
	 */
	gen() {
		var pieceList = [0, 1, 2, 3, 4, 5, 6];
		return pieceList.sort(function() {
			return 0.5 - rng.next();
		});
	}

	/**
	 * Draws the piece preview.
	 */
	draw() {
		clear(this.context);
		for (var i = 0; i < 6; i++) {
			if (this.grabBag[i] === 0 || this.grabBag[i] === 3) {
				draw(
					pieces[this.grabBag[i]].tetro,
					pieces[this.grabBag[i]].x - 3,
					pieces[this.grabBag[i]].y + 2 + i * 3,
					this.context,
				);
			} else {
				draw(
					pieces[this.grabBag[i]].tetro,
					pieces[this.grabBag[i]].x - 2.5,
					pieces[this.grabBag[i]].y + 2 + i * 3,
					this.context,
				);
			}
		}
	}
}
