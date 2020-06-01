import Grid2d from './grid2d';

export default class TicTacNode {
    constructor({
        board = new Grid2d(),
        player,
        parent = null
    }) {
        this.board = board;
        this.player = player;
        this.parent = parent;
    }

    isTerminal() {
        return this.getWinner() !== null || !this.board.cells.includes(0);
    }

    getValue() {
        if (this.getWinner() == 'x')
            return 1;
        if (this.getWinner() == 'o')
            return -1;
        else return 0;
    }

    getSuccessors() {
        let child, successors = [];

        for (const cell of this.board) {
            if (cell.value === 0) {
                child = this.clone();
                child.parent = this;
                child.board.setCell(cell.row, cell.col, this.getRival());
                child.player.sign = this.getRival();
                child.player.isMaximization = !this.player.isMaximization;
                successors.push(child);
            }
        }
        return successors;
    }

    getWinner() {
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

        let diameter1 = [...this.board.cells]
            .filter(cell => cell.row == cell.col);
        let diameter2 = [...this.board.cells]
            .filter(cell => cell.row == Math.abs(cell.col - this.board.colNum - 1));

        if (diameter1.every(cell => cell.value == 'x') ||
            diameter2.every(cell => cell.value == 'x')
        ) return 'x';

        if (diameter1.every(cell => cell.value == 'o') ||
            diameter2.every(cell => cell.value == 'o')
        ) return 'o';

        return null;
    }

    getRival() {
        return this.player.sign == 'x' ? 'o' : 'x';
    }

    clone() {
        return new TicTacNode({
            board: this.board.clone(),
            player: this.player,
            parent: this.parent
        });
    }
}