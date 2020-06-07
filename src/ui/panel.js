import * as PIXI from 'pixi.js';
import Sound from 'pixi-sound';
import PixiUI from './pixiui';

export default class Panel extends PixiUI {
    /**
     * 
     * @param {object} arg
     * @param {number} arg.width
     * @param {number} arg.height
     * @param {boolean} arg.backdrop
     */
    constructor({
        width,
        height,
        frames,
        sounds
    }) {
        super({
            frames,
            sounds
        });

        this.body = new PIXI.Sprite(this.frames.body);
        this.body.width = width;
        this.body.height = height;        
        this.mask = this.getMask();
        this.addChild(this.body, this.mask);
    }

    getMask() {
        let mask = new PIXI.Graphics();
        mask.beginFill(0xFFFFFF);
        mask.drawRect(0, 0, this.body.width, this.body.height);
        mask.endFill();
        return mask;
    }
}