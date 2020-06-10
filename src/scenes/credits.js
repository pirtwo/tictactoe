import * as PIXI from 'pixi.js';
import app from '../index';
import Scene from './scene';
import Button from '../ui/button';

export default class CreditsScene extends Scene {
    constructor(width, height) {
        super();

        const resources = app.loader.resources,
            tileset = resources.tileset.textures;

        let titleTextStyle = new PIXI.TextStyle({
                fontFamily: 'Baumans',
                fontSize: 35,
                fill: 'white',
                align: 'left',
            }),
            labelTextStyle = new PIXI.TextStyle({
                fontFamily: 'Baumans',
                fontSize: 30,
                fill: 'black',
                align: 'left',
                wordWrap: true,
                wordWrapWidth: 470,
            }),
            btnTextStyle = new PIXI.TextStyle({
                fontFamily: 'Baumans',
                fontSize: 25,
                fill: 'white',
                align: 'left',
            });

        this.body = new PIXI.Container();

        // bacdrop
        this.backdrop = new PIXI.Graphics();
        this.backdrop.beginFill(0x000000, 0.5);
        this.backdrop.drawRect(0, 0, app.screen.width, app.screen.height);
        this.backdrop.endFill();
        this.backdrop.interactive = true; // capture tap or clicks
        this.addChild(this.backdrop);

        // panel background
        this.background = new PIXI.Graphics();
        this.background.beginFill(0xe0e0e0);
        this.background.drawRoundedRect(0, 0, width, height, 10);
        this.background.endFill();
        this.body.addChild(this.background);

        // panel header
        this.header = new PIXI.Graphics();
        this.header.beginFill(0xf06292);
        this.header.drawRect(0, 0, width, 60);
        this.header.endFill();
        this.header.position.set(0, 0);
        this.body.addChild(this.header);

        // panel title
        this.title = new PIXI.Text('INFO', titleTextStyle);
        this.title.position.set(20, 10);
        this.body.addChild(this.title);

        let infoText = new PIXI.Text(
            "This game is a PWA web app, you can install it on your chrome web browser or add it to your android device home screen.\n\ncreated by:\nhttps://github.com/ultimatecombo\n\ncredits goes to:\nAssets: https://www.kenney.nl\nmusic: http://dig.ccmixter.org/\npeople/admiralbob77",
            labelTextStyle
        );        
        infoText.position.set(20, 70);
        this.body.addChild(infoText);

        // ok button
        this.closeBtn = new Button({
            width: 100,
            height: 50,
            text: new PIXI.Text('Close', btnTextStyle),
            frames: {
                button: tileset['button.png']
            },
            sounds: {
                pointerdown: resources.click.sound
            },
            pointerTapCallback: () => {
                this.hide();
            }
        });
        this.closeBtn.text.anchor.set(0.5);
        this.closeBtn.text.position.set(50, 25);
        this.closeBtn.position
            .set(this.body.width - this.closeBtn.width - 20, this.body.height - this.closeBtn.height - 20);
        this.body.addChild(this.closeBtn);

        this.addChild(this.body);
        this.body.position.set(
            this.width / 2 - this.body.width / 2,
            this.height / 2 - this.body.height / 2
        );
    }
}