import Grid2D from './grid2d';

export default class TicTacToe {
    constructor(
        dimension,
        moveUndoCallback = undefined,
        moveRedoCallback = undefined,
        moveExecuteCallback = undefined
    ) {
        this.playerOne = undefined;
        this.playerTwo = undefined;
        this.playerTurn = undefined;
        this.moveUndoCallback = moveUndoCallback;
        this.moveRedoCallback = moveRedoCallback;
        this.moveExecuteCallback = moveExecuteCallback;

        this.undoList = [];
        this.redoList = [];
        this.dimension = dimension;
        this.board = new Grid2D(this.dimension, this.dimension).fill(0);
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
                return this.playerOne;
            if (row.every(cell => cell === 'o'))
                return this.playerTwo;
        }

        for (const col of this.board.cols()) {
            if (col.every(cell => cell === 'x'))
                return this.playerOne;
            if (col.every(cell => cell === 'o'))
                return this.playerTwo;
        }

        if (diameter1.every(cell => cell.value == 'x') ||
            diameter2.every(cell => cell.value == 'x')
        ) return this.playerOne;

        if (diameter1.every(cell => cell.value == 'o') ||
            diameter2.every(cell => cell.value == 'o')
        ) return this.playerTwo;

        if(!this.board.cells.includes(0))
            return 'draw';

        return null;
    }

    execute(move) {
        this.undoList
            .push(move);
        this.updateCell(move.row, move.col, move.player.sign);
        if (this.moveExecuteCallback)
            this.moveExecuteCallback(move);
        return this;
    }

    undo() {
        let move = this.undoList.pop();
        if (move) {
            this.updateCell(move.row, move.col, 0);
            this.redoList
                .push(move);
            if (this.moveUndoCallback)
                this.moveUndoCallback(move);
        }
        return this;
    }

    redo() {
        let move = this.redoList.pop();
        if (move) {
            this.execute(move.row, move.col, 0);
            this.undoList
                .push(move);
            if (this.moveRedoCallback)
                this.moveRedoCallback(move);
        }
        return this;
    }

    reset() {
        this.playerTurn = this.playerOne;
        this.undoList = [];
        this.redoList = [];
        this.board.fill(0);
        return this;
    }
}