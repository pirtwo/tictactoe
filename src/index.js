import * as PIXI from 'pixi.js';
import Sound from 'pixi-sound';
import TicTac from './tictac';
import Player from './player';
import Move from './move';
import Button from './ui/button';
import loadFont from '../lib/webfont';
import scaleWindow from '../lib/scale';
import CreditsScene from './scenes/credits';
import SettingsScene from './scenes/settings';
import SplashScreen from './scenes/splash';

const app = new PIXI.Application({
    antialias: true,
    autoStart: false,
    width: 768,
    height: 1024,
    backgroundColor: 0x9c27b0
});

const {
    Text,
    TextStyle,
    Graphics,
    Sprite,
    Container
} = PIXI;

let splash = undefined;

loadFont(['Baumans', 'Snippet'], init);

function init() {
    document.body.appendChild(app.view);
    scaleWindow(app.view);

    // create splash screen
    splash = new SplashScreen({
        width: app.screen.width,
        height: app.screen.height
    });
    app.stage.addChild(splash);

    // load game assets
    app.loader
        .add('tileset', './assets/sprites/atlas.json')
        .add('music', './assets/sounds/music.mp3')
        .add('click', './assets/sounds/click.ogg')
        .add('switch', './assets/sounds/switch.ogg')
        .add('win', './assets/sounds/win.ogg')
        .add('lose', './assets/sounds/lose.ogg')
        .load(setup);

    // update loading progress
    app.loader.on('progress', loader => {
        splash.progress.text = `loading ${loader.progress.toFixed(0)}% ...`;
    });
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
            fill: ['#ffffff', '#f9e104'], // gradient
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
            fontStyle: 'bold',
            fontSize: 40,
            fill: 'white',
            align: 'left',
        }),
        stateLabel = new Text('', labelTextStyle),
        botThinkingLabel = new Text('let me think ...', labelTextStyle),
        score = {
            x: 0,
            o: 0,
            draw: 0
        };

    const clickSound = resources.click.sound,
        winSound = resources.win.sound,
        loseSound = resources.lose.sound;

    let isPaused = false,
        isCupThinking = false;

    // assuming the player x is a max
    // and player o is min
    tictac.playerOne = new Player('x', false);
    tictac.playerTwo = new Player('o', true);
    tictac.playerTurn = tictac.playerOne;

    const creditsScene = new CreditsScene(500, 600);
    const settingsScene = new SettingsScene(500, 500, tictac);

    xoCtx.zIndex = 1;
    grid.cnt.sortableChildren = true;
    grid.cnt.addChild(xoCtx);
    grid.cnt.sortChildren();
    grid.cnt.position.set(
        app.screen.width / 2 - grid.cnt.width / 2, 50);

    let menuBg = new Graphics();
    menuBg.beginFill(0xf06292);
    menuBg.drawRect(0, 0, app.screen.width, 100);
    menuBg.endFill();
    menu.addChild(menuBg);
    menu.position.set(0, 0);

    let gameTitle = new Text('TicTacToe', titleTextStyle);
    gameTitle.position.set(20, 10);
    menu.addChild(gameTitle);

    let creditsBtn = new Button({
        width: 70,
        height: 70,
        frames: {
            button: tileset['button.png']
        },
        sounds: {
            pointerdown: clickSound
        },
        pointerTapCallback: () => {
            creditsScene.show();
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
        sounds: {
            pointerdown: clickSound
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
        sounds: {
            pointerdown: clickSound
        },
        pointerTapCallback: () => {
            tictac.reset();
            isPaused = false;
            stateLabel.text = '';
            // remove combo line
            Object.keys(grid.combos)
                .forEach(key => grid.combos[key].visible = false);
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

    stateLabel.position.set(app.screen.width / 2 - stateLabel.width / 2, 850);
    botThinkingLabel.position.set(app.screen.width / 2 - botThinkingLabel.width / 2, 850);
    botThinkingLabel.visible = false;
    body.addChild(grid.cnt, stateLabel, botThinkingLabel);
    body.position.set(0, 100);
    creditsScene.hide();
    settingsScene.hide();
    app.stage.addChild(menu, body, creditsScene, settingsScene);

    splash.ticker.destroy();
    app.stage.removeChild(splash);

    window.addEventListener('resize', () => scaleWindow(app.view));

    grid.cells.forEach(cell => {
        cell.interactive = true;
        cell.on('pointertap', (e) => {
            if (!isPaused && !tictac.playerTurn.isBot) {
                // check the cell to see if it is marked before.
                if (tictac.board.getCell(cell.grid.row, cell.grid.col) !== 0)
                    return;
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
        let winner = tictac.checkWinner();
        tictac.nextTurn();
        if (winner !== null) {
            isPaused = true;
            if (winner === 'draw') {
                score.draw++;
                stateLabel.text = `Game is draw`;
            } else {
                let combo = findCombo(tictac.board);
                if (combo !== null)
                    grid.combos[combo].visible = true;
                if (winner.isBot)
                    loseSound.play();
                else
                    winSound.play();
                stateLabel.text = `Player ${winner.sign.toUpperCase()} wins`;
            }
            stateLabel.position.set(app.screen.width / 2 - stateLabel.width / 2, 850);
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

    app.ticker.add(delta => {
        if (tictac.playerTurn.isBot && !isPaused && !isCupThinking) {
            isCupThinking = true;
            cpuPlay(
                tictac,
                worker,
                settingsScene.settings.difficulty === 'easy' ? 2 : 10
            );
        }

        if (isCupThinking)
            botThinkingLabel.visible = true;
        else
            botThinkingLabel.visible = false;

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
        combos = {},
        cnt = new Container(),
        ctx = new Graphics();

    ctx.lineStyle(5, 0xffffff);
    // x-axies
    for (let i = 1; i < rowNum; i++) {
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(colNum * cellSize, i * cellSize);
    }
    // y-axies
    for (let i = 1; i < colNum; i++) {
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, rowNum * cellSize);
    }
    ctx.closePath();
    ctx.zIndex = 0;
    cnt.addChild(ctx);

    let comboColor = 0xf06292;
    // combos x-axies
    for (let i = 0; i < rowNum; i++) {
        ctx = new Graphics();
        ctx.lineStyle(10, comboColor);
        ctx.moveTo(cellSize / 2, (i * cellSize) + (cellSize / 2));
        ctx.lineTo((colNum * cellSize) - (cellSize / 2), (i * cellSize) + (cellSize / 2));
        ctx.closePath();
        ctx.visible = false;
        cnt.addChild(ctx);
        combos[`r${i}`] = ctx;
    }
    // combos y-axies
    for (let i = 0; i < colNum; i++) {
        ctx = new Graphics();
        ctx.lineStyle(10, comboColor);
        ctx.moveTo((i * cellSize) + (cellSize / 2), cellSize / 2);
        ctx.lineTo((i * cellSize) + (cellSize / 2), (rowNum * cellSize) - (cellSize / 2));
        ctx.closePath();
        ctx.visible = false;
        cnt.addChild(ctx);
        combos[`c${i}`] = ctx;
    }

    // combos diameter 1
    ctx = new Graphics();
    ctx.lineStyle(10, comboColor);
    ctx.moveTo(cellSize / 2, cellSize / 2);
    ctx.lineTo((colNum * cellSize) - (cellSize / 2), (rowNum * cellSize) - (cellSize / 2));
    ctx.closePath();
    ctx.visible = false;
    cnt.addChild(ctx);
    combos[`d0`] = ctx;

    // combos diameter 2
    ctx = new Graphics();
    ctx.lineStyle(10, comboColor);
    ctx.moveTo((colNum * cellSize) - (cellSize / 2), cellSize / 2);
    ctx.lineTo(cellSize / 2, (rowNum * cellSize) - (cellSize / 2));
    ctx.closePath();
    ctx.visible = false;
    cnt.addChild(ctx);
    combos[`d1`] = ctx;
    Object.keys(combos).forEach(key => combos[key].zIndex = 2);

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
        cells,
        combos
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

function findCombo(board) {
    let diameter1 = [...board]
        .filter(cell => cell.row == cell.col);
    let diameter2 = [...board]
        .filter(cell => cell.row == Math.abs(cell.col - (board.colNum - 1)));

    for (const [index, row] of [...board.rows()].entries()) {
        if (row.every(cell => cell === 'x') || row.every(cell => cell === 'o'))
            return `r${index}`;
    }

    for (const [index, col] of [...board.cols()].entries()) {
        if (col.every(cell => cell === 'x') || col.every(cell => cell === 'o'))
            return `c${index}`;
    }

    if (diameter1.every(cell => cell.value == 'x') ||
        diameter1.every(cell => cell.value == 'o')
    ) return "d0";

    if (diameter2.every(cell => cell.value == 'x') ||
        diameter2.every(cell => cell.value == 'o')
    ) return "d1";

    return null;
}

export default app;

// TODO: add PWA install