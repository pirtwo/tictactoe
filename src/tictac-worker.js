import Node from './node';
import Move from './move';
import Grid2D from './grid2d';
import Player from './player';
import minmax from './minmax';

onmessage = (msg) => {
    console.log('worker started.');
    console.log(msg.data);
    if (msg.data.start) {
        let {
            state,
            player,
            thoughtDepth
        } = msg.data, moves = [];

        state.filter(cell => cell.value === 0).forEach(cell => {
            let board = new Grid2D({
                rowNum: 3,
                colNum: 3,
                cells: state.map(i => i.value)
            });

            let currPlayer = new Player({
                sign: player.sign,
                isCpuPlayer: player.isCpuPlayer,
                isMaximization: player.isMaximization
            });

            let prePlayer = new Player({
                sign: player.sign == 'x' ? 'o' : 'x',
                isMaximization: !player.isMaximization
            });

            let node = new Node({
                board: board,
                player: prePlayer
            });

            let move = new Move({
                row: cell.row,
                col: cell.col,
                state: state.slice(0),
                player: currPlayer
            });

            move.score = minmax(node, currPlayer.getType(), 2);
            moves.push(move);
        });

        let bestMove = moves.find(move => {
            if (player.isMaximization)
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