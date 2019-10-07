import {pieces} from './piece.js'

export default class {
	constructor(context) {
		this.piece = void 0;
		this.context = context;
	}
	draw() {
		clear(this.context);
		if (this.piece === 0 || this.piece === 3) {
			draw(
				pieces[this.piece].tetro,
				pieces[this.piece].x - 3,
				2 + pieces[this.piece].y,
				this.context,
			);
		} else {
			draw(
				pieces[this.piece].tetro,
				pieces[this.piece].x - 2.5,
				2 + pieces[this.piece].y,
				this.context,
			);
		}
	}
}
