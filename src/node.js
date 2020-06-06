import Grid2D from "./grid2d";

export default class TicTacNode {
    constructor(state = '', player = '', parent = null) {
        this.state = state;
        this.player = player;
        this.parent = parent;
    }

    static getWinner(state) {
        let grid = new Grid2D(3, 3, state.split(''));

        let dimOne = [...grid]
            .filter(cell => cell.row == cell.col);
        let dimTwo = [...grid]
            .filter(cell => cell.row == Math.abs(cell.col - (grid.colNum - 1)));

        for (const row of grid.rows()) {
            if (row.every(cell => cell == 'x'))
                return 'x';
            if (row.every(cell => cell == 'o'))
                return 'o';
        }

        for (const col of grid.cols()) {
            if (col.every(cell => cell == 'x'))
                return 'x';
            if (col.every(cell => cell == 'o'))
                return 'o';
        }

        if (dimOne.every(cell => cell.value == 'x') ||
            dimTwo.every(cell => cell.value == 'x')
        ) return 'x';

        if (dimOne.every(cell => cell.value == 'o') ||
            dimTwo.every(cell => cell.value == 'o')
        ) return 'o';

        return null;
    }

    static getRival(player) {
        return player === 'x' ? 'o' : 'x';
    }

    isTerminal() {
        return TicTacNode.getWinner(this.state) !== null || !this.state.split('').includes('0');
    }

    getValue() {
        let winner = TicTacNode.getWinner(this.state);
        if (winner == 'x')
            return 1;
        if (winner == 'o')
            return -1;
        return 0;
    }

    getChilds() {
        let child,
            childs = [],
            currState = this.state.split('');

        currState.forEach((value, index) => {
            if (value === '0') {
                let nextState = currState.slice(0);
                child = new TicTacNode();
                child.parent = this;
                child.player = TicTacNode.getRival(this.player);
                nextState[index] = child.player;
                child.state = nextState.join('');
                childs.push(child);
            }
        });

        return childs;
    }
}