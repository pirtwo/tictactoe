export default class Move {
    constructor({
        row,
        col,
        state,
        player
    }) {
        this.row = row;
        this.col = col;
        this.score = undefined;
        this.state = state;
        this.player = player;
    }
}