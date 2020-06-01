import Node from './node';
import minmax from './minmax';

export default class Move {
    constructor({
        row,
        col,
        board,
        player
    }) {
        this.row = row;
        this.col = col;
        this.score = undefined;
        this.board = board;
        this.player = player;
    }

    calcScore() {
        return minmax(new Node({
            board: this.board,
            player: this.player
        }), this.player.getType(), 10);
    }
}