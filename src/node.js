import Grid2d from './grid2d';
import Player from './player';

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
        let winner = this.getWinner();
        if(winner == 'x')
            return 1;
        if(winner == 'o')
            return -1;
        return 0;
    }

    getSuccessors() {
        let child, successors = [];

        for (const cell of this.board) {
            if (cell.value === 0) {
                child = this.clone();
                child.parent = this;
                child.player = this.getRival();
                child.board.setCell(cell.row, cell.col, child.player.sign);
                successors.push(child);
            }
        }
        return successors;
    }

    getWinner() {
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

    getRival() {
        return new Player({
            sign: this.player.sign === 'x' ? 'o' : 'x',
            isMaximization: !this.player.isMaximization
        });
    }

    clone() {
        return new TicTacNode({
            board: this.board.clone(),
            player: this.player,
            parent: this.parent
        });
    }
}