import * as PIXI from 'pixi.js';

export default class Scene extends PIXI.Container {
    constructor() {
        super();
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }
}