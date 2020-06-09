export default class Player {
    constructor(sign, isBot) {
        this.sign = sign;
        this.isBot = isBot;
    }

    getType() {
        return this.sign === 'x' ? 'max' : 'min';
    }
}