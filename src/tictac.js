import Grid2d from './grid2d';

export default class TicTacToe {
    constructor({
        boardDimension
    }) {
        this.playerOne = undefined;
        this.playerTwo = undefined;
        this.playerTurn = undefined;

        this.undoList = [];
        this.redoList = [];
        this.boardDimension = boardDimension;
        this.board = new Grid2d({
            rowNum: this.boardDimension,
            colNum: this.boardDimension
        });
    }

    nextTurn() {
        this.playerTurn = this.playerTurn.sign == this.playerOne.sign ?
            this.playerTwo : this.playerOne;
        return this;
    }

    updateCell(row, col, value) {
        this.board.setCell(row, col, value);
        return this;
    }

    checkWinner() {

    }

    execute(move) {
        this.undoList
            .push(move);
        this.updateCell(move.row, move.col, move.player.sign)
            .nextTurn();
        return this;
    }

    undo() {
        let move = this.undoList.pop();
        if (move) {
            this.updateCell(move.row, move.col, 0)
                .nextTurn();
            this.redoList
                .push(move);
        }
        return this;
    }

    redo() {
        let move = this.redoList.pop();
        if (move) {
            this.execute(move.row, move.col, 0);
            this.undoList
                .push(move);
        }
        return this;
    }

    reset() {
        this.undoList = [];
        this.redoList = [];
        this.board = new Grid2d({
            rowNum: this.boardDimension,
            colNum: this.boardDimension
        });
        return this;
    }
}