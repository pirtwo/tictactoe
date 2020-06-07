import * as PIXI from 'pixi.js';
import Sound from 'pixi-sound';
import TicTac from './tictac';
import Player from './player';
import Move from './move';
import Button from './ui/button';
import loadFont from '../lib/webfont';
import scaleWindow from '../lib/scale';
import SettingsScene from './scenes/settings';

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
loadFont(['Baumans', 'Snippet'], init);

function init() {
    app.loader
        .add('tileset', './assets/sprites/atlas.json')
        .load(setup);
}

function setup(loader, resources) {
    // game setup 
    app.stop();

    const
        cellSize = 250,
        tileset = resources.tileset.textures,
        tictac = new TicTac(3),
        worker = new Worker('./js/tictac-worker.js'),
        grid = createGrid(3, 3, cellSize),
        xoCtx = new Graphics(),
        menu = new Container(),
        body = new Container(),
        titleTextStyle = new TextStyle({
            fontFamily: 'Baumans',
            fontSize: 50,
            fontStyle: 'normal',
            fontWeight: 'bold',
            fill: ['#ffffff', '#cbf542'], // gradient
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
        }),
        labelTextStyle = new TextStyle({
            fontFamily: 'Baumans',
            fontSize: 35,
            fill: 'white',
            align: 'left',
        }),
        scoreLabel = new Text('', labelTextStyle),
        stateLabel = new Text('', labelTextStyle),
        settingsScene = new SettingsScene(500, 500),
        score = {
            x: 0,
            o: 0,
            draw: 0
        };

    let isPaused = false,
        isCupThinking = false;

    // assuming the player x is a max
    // and player o is min
    tictac.playerOne = new Player('x', false);
    tictac.playerTwo = new Player('o', true);
    tictac.playerTurn = tictac.playerOne;

    grid.cnt.addChild(xoCtx);
    grid.cnt.position.set(
        app.screen.width / 2 - grid.cnt.width / 2, 100);

    let menuBg = new Graphics();
    menuBg.beginFill(0x5cd672);
    menuBg.drawRect(0, 0, app.screen.width, 100);
    menuBg.endFill();
    menu.addChild(menuBg);

    let gameTitle = new Text('TicTacToe', titleTextStyle);
    gameTitle.position.set(20, 10);
    menu.addChild(gameTitle);

    let creditsBtn = new Button({
        width: 70,
        height: 70,
        frames: {
            button: tileset['button.png']
        },
        pointerTapCallback: () => {
            settingsScene.show();
        }
    });
    creditsBtn.position.set(680, 15);
    menu.addChild(creditsBtn);

    let settingBtn = new Button({
        width: 70,
        height: 70,
        frames: {
            button: tileset['button.png']
        },
        pointerTapCallback: () => {
            settingsScene.show();
        }
    });
    settingBtn.position.set(600, 15);
    menu.addChild(settingBtn);

    let newGameBtn = new Button({
        width: 70,
        height: 70,
        frames: {
            button: tileset['button.png']
        },
        pointerTapCallback: () => {
            tictac.reset();
            isPaused = false;
            stateLabel.text = '';
        }
    });
    newGameBtn.position.set(520, 15);
    menu.addChild(newGameBtn);

    let newGameIcon = new Sprite(tileset['return.png']);
    newGameIcon.anchor.set(0.5);
    newGameIcon.position.set(35, 35);
    newGameBtn.addChild(newGameIcon);

    let settingsIcon = new Sprite(tileset['gear.png']);
    settingsIcon.anchor.set(0.5);
    settingsIcon.position.set(35, 35);
    settingBtn.addChild(settingsIcon);

    let creditsIcon = new Sprite(tileset['information.png']);
    creditsIcon.anchor.set(0.5);
    creditsIcon.position.set(35, 35);
    creditsBtn.addChild(creditsIcon);

    menu.position.set(0, 0);
    stateLabel.position.set(10, 25);
    scoreLabel.text = `X:000 O:000 Draw:000`;
    scoreLabel.position.set(app.screen.width - scoreLabel.width - 10, 25);
    body.addChild(grid.cnt, stateLabel, scoreLabel);
    body.position.set(0, 100);

    settingsScene.hide();

    app.stage.addChild(menu, body, settingsScene);
    scaleWindow(app.view);

    grid.cells.forEach(cell => {
        cell.interactive = true;
        cell.on('pointertap', (e) => {
            console.log(cell.grid);

            if (!isPaused && !tictac.playerTurn.isCpuPlayer) {
                tictac.execute(new Move({
                    row: cell.grid.row,
                    col: cell.grid.col,
                    state: tictac.board.cells.join(''),
                    player: tictac.playerTurn,
                }));
            }
        });
    });

    tictac.moveExecuteCallback = () => {
        let state = tictac.checkWinner();
        if (state !== null) {
            isPaused = true;
            if (state === 'draw') {
                score.draw++;
                stateLabel.text = `Game is draw`;
            } else {
                score[state]++;
                stateLabel.text = `Player ${state.toUpperCase()} wins`;
            }
            scoreLabel.text =
                `X:${pushZero(score.x)} O:${pushZero(score.o)} Draw:${pushZero(score.draw)}`;
        }
    }

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

    window.addEventListener('resize', () => scaleWindow(app.view));

    app.ticker.add(delta => {
        if (!isPaused && !isCupThinking && tictac.playerTurn.isCpuPlayer) {
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
        state: manager.board.cells.join(''),
        player: manager.playerTurn.sign,
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

function pushZero(score) {
    if (score < 10)
        return `00${score}`;
    if (score < 99)
        return `0${score}`;
    return `${score}`;
}

export default app;

// TODO: add new game button
// TODO: add sound and music
// TODO: add settings
// ! fix click on marked cell