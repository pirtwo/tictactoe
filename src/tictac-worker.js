import Node from './node';
import Move from './move';
import Grid2D from './grid2d';
import minmax from './minmax';

onmessage = (msg) => {
    console.log('worker started.');

    if (msg.data.start) {
        const {
            state,        // current board state
            player,       // current player x or o
            thoughtDepth  // the depth for minmax search
        } = msg.data;

        const
            moves = [],
            currState = state.split(''),
            grid = new Grid2D(3, 3, state.split(''));

        // calc the score of each possible move for current player.
        for (const cell of grid) {
            if (cell.value === '0') {
                const nextState = currState.slice(0);
                nextState[cell.row * 3 + cell.col] = player;
                const node = new Node(nextState.join(''), player);
                const move = new Move({
                    row: cell.row,
                    col: cell.col,
                    state: node.state,
                    player: node.player
                });
                move.score = minmax(
                    node,
                    // we assuming the x is max and o is min,
                    // if current player is a x, the next move will be min,
                    // if current player is a o, the next move will be max.
                    player.sign === 'x' ? 'min' : 'max',
                    thoughtDepth
                );
                moves.push(move);
            }
        }

        let bestMove = moves.find(move => {
            if (player.sign === 'x')
                return move.score === Math.max.apply({}, moves.map(i => i.score));
            else
                return move.score === Math.min.apply({}, moves.map(i => i.score));
        });

        postMessage({
            success: true,
            bestMove: {
                row: bestMove.row,
                col: bestMove.col
            }
        });

        console.log('worker finished.');
    }
}