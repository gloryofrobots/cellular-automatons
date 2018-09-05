
import * as Errors from "./Errors";
import _ from "underscore";

const calcIndex = (x, y, width, height) => {
    if (x < 0 || x >= width || y < 0 || y > height) {
        return -1;
    }
    return y * width + x;
}

class Cells {
    constructor(width, height) {
        this.size = width * height;
        this.width = width;
        this.height = height;
        this.cells = new Array(this.size);
        this.oldCells = new Array(this.size);
        this.initialCells = new Array(this.size);
        this.clear();
    }

    setCells(cells) {
        if (cells.length !== this.size) {
            // console.error("Trying to restore invalid grid", cells);
            throw new Errors.InvalidGridError();
        }
        this.cells = cells.slice()
        this.store();
    }

    clear() {
        this.cells.fill(0, 0, this.size);
        this.oldCells.fill(0, 0, this.size);
        this.store();
    }

    get(x, y) {
        var index = this.index(x, y);
        if (index === -1) {
            return undefined;
        }

        return this.cells[index];
    }

    getOld(x, y) {
        var index = this.index(x, y);
        if (index === -1) {
            return undefined;
        }

        return this.oldCells[index];
    }

    set(x, y, value) {
        var index = this.index(x, y);
        if (index < 0) {
            return false;
        }
        // if (!this.acceptValue(value)) {
        //     return false;
        // }
        this.cells[index] = value;
        this.initialCells[index] = value;
        return true;
    }

    randomize(fn, width, height) {
        width = width || this.width;
        height = height || this.height;
        this.clear();
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var value = fn();
                var index = this.index(x, y);
                this.cells[index] = value;
                this.initialCells[index] = value;
            }
        }
    }

    index(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y > this.height) {
            return -1;
        }
        return y * this.width + x;
    }

    store() {
        for(var i = 0; i < this.size; i++) {
            this.initialCells[i] = this.cells[i];
        }
    }

    restore() {
        // this.cells = this.initialCells.slice();
        for(var i = 0; i < this.size; i++) {
            this.cells[i] = this.initialCells[i];
        }
    }

    flip() {
        var t = this.oldCells;
        this.oldCells = this.cells;
        this.cells = t;
    }

}

export default Cells;