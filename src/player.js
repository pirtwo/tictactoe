export default class Player {
    constructor({
        sign,
        isCpuPlayer,
        isMaximization
    }) {
        this.sign = sign;
        this.isCpuPlayer = isCpuPlayer;
        this.isMaximization = isMaximization;
    }

    getType() {
        return this.isMaximization ? 'max' : 'min';
    }
}