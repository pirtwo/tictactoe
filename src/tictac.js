import Grid2d from './grid2d';

export default class TicTacToe {
    constructor(dimension) {
        this.playerOne = undefined;
        this.playerTwo = undefined;
        this.playerTurn = undefined;

        this.undoList = [];
        this.redoList = [];
        this.dimension = dimension;
        this.board = new Grid2d({
            rowNum: this.dimension,
            colNum: this.dimension
        }).fill(0);
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
        let diameter1 = [...this.board]
            .filter(cell => cell.row == cell.col);
        let diameter2 = [...this.board]
            .filter(cell => cell.row == Math.abs(cell.col - (this.board.colNum - 1)));

        for (const row of this.board.rows()) {
            if (row.every(cell => cell === 'x'))
                return 'x';
            if (row.every(cell => cell === 'o'))
                return 'o';
        }

        for (const col of this.board.cols()) {
            if (col.every(cell => cell === 'x'))
                return 'x';
            if (col.every(cell => cell === 'o'))
                return 'o';
        }

        if (diameter1.every(cell => cell.value == 'x') ||
            diameter2.every(cell => cell.value == 'x')
        ) return 'x';

        if (diameter1.every(cell => cell.value == 'o') ||
            diameter2.every(cell => cell.value == 'o')
        ) return 'o';

        return null;
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
        this.board.fill(0);
        return this;
    }
}