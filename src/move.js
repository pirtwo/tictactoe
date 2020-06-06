export default class Move {
    constructor({
        row,
        col,
        state,
        player
    }) {
        this.row = row;
        this.col = col;
        this.player = player;
        this.state = state;
        this.score = undefined;        
    }
}