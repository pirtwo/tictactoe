import * as PIXI from 'pixi.js';
import Sound from 'pixi-sound';
import TicTac from './tictac';
import Player from './player';
import Move from './move';
import Grid2d from './grid2d';
import Node from './node';

const app = new PIXI.Application({
    antialias: true,
    autoStart: false,
    width: 768,
    height: 1024,
    backgroundColor: 0x1099bb
});

const {
    Text,
    TextStyle,
    Graphics,
    Sprite,
    Container
} = PIXI;

document.body.appendChild(app.view);

//app.loader.add('').load(setup);
setup();

function setup(loader, resources) {
    // game setup 
    app.stop();

    const
        tictac = new TicTac(3),
        worker = new Worker('./js/tictac-worker.js'),
        cellSize = 250,
        grid = createGrid(3, 3, cellSize),
        xoCtx = new Graphics();

    let isCupThinking = false;

    tictac.playerOne = new Player({
        sign: 'x',
        isCpuPlayer: false,
        isMaximization: true
    });

    tictac.playerTwo = new Player({
        sign: 'o',
        isCpuPlayer: true,
        isMaximization: false
    });

    tictac.playerTurn = tictac.playerOne;

    worker.onmessage = msg => {
        console.log(msg.data);
        if (msg.data.success === true) {
            tictac.execute(new Move({
                row: msg.data.bestMove.row,
                col: msg.data.bestMove.col,
                state: tictac.board.cells.slice(0),
                player: tictac.playerTurn
            }));
            isCupThinking = false;
        }
    }

    grid.cnt.addChild(xoCtx);
    grid.cnt.position.set(app.screen.width / 2 - grid.cnt.width / 2, 200);
    grid.cells.forEach(cell => {
        cell.interactive = true;
        cell.on('pointertap', (e) => {
            console.log(cell.grid);

            if (!tictac.playerTurn.isCpuPlayer) {
                tictac.execute(new Move({
                    row: cell.grid.row,
                    col: cell.grid.col,
                    state: tictac.board.cells.slice(0),
                    player: tictac.playerTurn,
                }));
            }
        });
    });

    let node = new Node({
        board: new Grid2d({
            rowNum: 3,
            colNum: 3,
            cells: [0, 0, 'o', 0, 0, 'o', 0, 0, 'o']
        }),
        player: tictac.playerTurn
    });

    console.log(node.isTerminal());

    app.stage.addChild(grid.cnt);

    app.ticker.add(delta => {
        if (tictac.playerTurn.isCpuPlayer && !isCupThinking) {
            isCupThinking = true;
            cpuPlay(tictac, worker, 10);
        }

        xoCtx.clear();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                drawXO(i, j, cellSize, tictac.board.getCell(i, j), xoCtx);
            }
        }
    });

    app.start();
}

function cpuPlay(manager, worker, thoughtDepth) {
    worker.postMessage({
        start: true,
        state: [...manager.board],
        player: manager.playerTurn,
        thoughtDepth: thoughtDepth
    });
}

function createGrid(rowNum, colNum, cellSize) {
    let cells = [],
        cnt = new Container(),
        ctx = new Graphics();

    ctx.lineStyle(5, 0xffffff);
    // x-axies
    for (let i = 0; i <= rowNum; i++) {
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(colNum * cellSize, i * cellSize);
    }
    // y-axies
    for (let i = 0; i <= colNum; i++) {
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, rowNum * cellSize);
    }
    ctx.closePath();
    cnt.addChild(ctx)

    // create interactive cells
    for (let i = 0; i < rowNum; i++) {
        for (let j = 0; j < colNum; j++) {
            ctx = new Graphics();
            ctx.beginFill(0xffffff, 0.01);
            ctx.drawRect(j * cellSize, i * cellSize, cellSize - 5, cellSize - 5);
            ctx.endFill();
            ctx.grid = {
                row: i,
                col: j
            };
            cells.push(ctx);
            cnt.addChild(ctx);
        }
    }
    return {
        cnt,
        cells
    };
}

function drawXO(row, col, cellSize, sign, ctx) {
    let x, y, tickness = 30,
        size = 150;

    if (sign === 'x') {
        x = col * cellSize + cellSize / 2 - size / 2;
        y = row * cellSize + cellSize / 2 - size / 2;
        ctx.lineStyle(tickness, 0xffffff);
        ctx.moveTo(x, y);
        ctx.lineTo(x + size, y + size);
        ctx.moveTo(x, y + size);
        ctx.lineTo(x + size, y);
        ctx.closePath();
    } else if (sign === 'o') {
        x = col * cellSize + cellSize / 2;
        y = row * cellSize + cellSize / 2;
        ctx.lineStyle(tickness, 0xffffff);
        ctx.drawCircle(x, y, size / 2);
        ctx.endFill();
    }
}