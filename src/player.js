export default class Player {
    constructor(sign, isCpuPlayer) {
        this.sign = sign;
        this.isCpuPlayer = isCpuPlayer;
    }

    getType() {
        return this.sign === 'x' ? 'max' : 'min';
    }
}