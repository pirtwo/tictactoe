export default class Grid2d {
    constructor({
        rowNum,
        colNum,
        cells = undefined
    }) {
        this.rowNum = rowNum;
        this.colNum = colNum;
        this.cells = cells || new Array(rowNum * colNum);
    }

    *[Symbol.iterator]() {
        let count = 0;
        for (let i = 0; i < this.cells.length; i++) {
            count++;
            yield {
                row: i % this.rowNum,
                col: i % this.colNum,
                value: this.cells[i]
            };
        }
        return count;
    }

    * rows() {
        let count = 0;
        for (let i = 0; i < this.rowNum; i++) {
            count++;
            yield this.cells.slice(i * this.colNum, i * this.colNum + this.colNum);
        }
        return count;
    }

    * cols() {
        let count = 0;
        for (let i = 0; i < this.colNum; i++) {
            count++;
            yield this.cells.filter((value, index) => (index - i) % this.colNum === 0);
        }
        return count;
    }

    fill(value) {
        if (Array.isArray(value))
            value.forEach((item, index) => this.cells[index] = item);
        else
            this.cells.fill(value);
        return this;
    }

    swap(aRow, aCol, bRow, bCol) {
        [
            this.cells[aRow * this.colNum + aCol],
            this.cells[bRow * this.colNum + bCol]
        ] = [
            this.cells[bRow * this.colNum + bCol],
            this.cells[aRow * this.colNum + aCol]
        ];
        return this;
    }

    clone() {
        return new Grid2d({
            rowNum: this.rowNum,
            colNum: this.colNum,
            cells: this.cells.slice(0)
        });
    }

    getCell(row, col) {
        return this.cells[row * this.colNum + col];
    }

    setCell(row, col, value) {
        this.cells[row * this.colNum + col] = value;
        return this;
    }
}