import * as PIXI from 'pixi.js';
import app from '../index';
import Panel from '../ui/panel';
import Slider from '../ui/slider';
import Button from '../ui/button';
import Raido from '../ui/raido';

export default class SettingsScene extends PIXI.Container {
    constructor(width, height, ) {
        super();

        let atlas = app.loader.resources.atlas.textures;
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
        this.header.beginFill(0x5cd672);
        this.header.drawRect(0, 0, width, 60);
        this.header.endFill();
        this.header.position.set(0, 0);
        this.body.addChild(this.header);

        // panel title
        this.title = new PIXI.Text('SETTINGS', titleTextStyle);
        this.title.position.set(20, 10);
        this.body.addChild(this.title);

        // Player settings
        let palyerLabel = new PIXI.Text('Play as', labelTextStyle);
        palyerLabel.position.set(20, 100);
        this.body.addChild(palyerLabel);

        let palyerXLabel = new PIXI.Text('X', labelTextStyle);
        palyerXLabel.position.set(200, 100);
        this.body.addChild(palyerXLabel);

        this.playAsX = new Raido({
            width: 40,
            height: 40,
            value: true,
            frames: {
                box: atlas['grey_circle.png'],
                checkmark: atlas['blue_tick.png']
            },
            pointerTapCallback: () => {
                this.playAsX.setValue(true);
                this.playAsO.setValue(false);
            }
        });
        this.playAsX.position.set(230, 100);
        this.body.addChild(this.playAsX);

        let playerOLabel = new PIXI.Text('O', labelTextStyle);
        playerOLabel.position.set(300, 100);
        this.body.addChild(playerOLabel);

        this.playAsO = new Raido({
            width: 40,
            height: 40,
            value: false,
            frames: {
                box: atlas['grey_circle.png'],
                checkmark: atlas['blue_tick.png']
            },
            pointerTapCallback: () => {
                this.playAsX.setValue(false);
                this.playAsO.setValue(true);
            }
        });
        this.playAsO.position.set(330, 100);
        this.body.addChild(this.playAsO);

        // sound settings
        let soundLabel = new PIXI.Text('Sound', labelTextStyle);
        soundLabel.position.set(20, 170);
        this.body.addChild(soundLabel);

        this.soundVol = new Slider({
            value: 1,
            width: 200,
            min: 0,
            max: 1,
            frames: {
                rail: atlas['track.png'],
                grip: atlas['blue_circle.png']
            }
        });
        this.soundVol.position.set(200, 200);
        this.body.addChild(this.soundVol);

        // music settings
        let musicLabel = new PIXI.Text('Music', labelTextStyle);
        musicLabel.position.set(20, 240);
        this.body.addChild(musicLabel);

        this.musicVol = new Slider({
            value: 1,
            width: 200,
            min: 0,
            max: 1,
            frames: {
                rail: atlas['track.png'],
                grip: atlas['blue_circle.png']
            }
        });
        this.musicVol.position.set(200, 270);
        this.body.addChild(this.musicVol);

        // ok button
        this.okBtn = new Button({
            width: 100,
            height: 50,
            text: new PIXI.Text('OK', btnTextStyle),
            frames: {
                button: atlas['button.png']
            },
            pointerTapCallback: () => {
                this.hide();
            }
        });
        this.okBtn.text.anchor.set(0.5);
        this.okBtn.text.position.set(50, 25);
        this.okBtn.position
            .set(this.body.width - this.okBtn.width - 20, this.body.height - this.okBtn.height - 20);
        this.body.addChild(this.okBtn);

        // cancel button
        this.cancelBtn = new Button({
            width: 100,
            height: 50,
            text: new PIXI.Text('Cancel', btnTextStyle),
            frames: {
                button: atlas['button.png']
            },
            pointerTapCallback: () => {
                this.hide();
            }
        });
        this.cancelBtn.text.anchor.set(0.5);
        this.cancelBtn.text.position.set(50, 25);
        this.cancelBtn.position
            .set(this.body.width - this.cancelBtn.width - 140, this.body.height - this.cancelBtn.height - 20);
        this.body.addChild(this.cancelBtn);

        this.addChild(this.body);
        this.body.position.set(
            this.width / 2 - this.body.width / 2,
            this.height / 2 - this.body.height / 2
        );
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }
}