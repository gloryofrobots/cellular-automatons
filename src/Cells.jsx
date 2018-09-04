
import * as Errors from "./Errors";
import _ from "underscore";

class Cells {
    constructor(size, width, height) {
        this.size = size;
        this.width = width;
        this.height = height;
        this.cells = new Array(this.size);
        this.clear();
    }

    setCells(cells) {
        if (cells.length !== this.size) {
            // console.error("Trying to restore invalid grid", cells);
            throw new Errors.InvalidGridError();
        }

        this.cells = cells.slice()
        this.initialCells = this
            .cells
            .slice();
        this.oldCells = this.cells.slice();
    }

    clear() {
        this.cells = this
            .cells
            .fill(0, 0, this.size);
        this.initialCells = this
            .cells
            .slice();
        this.oldCells = this.cells.slice();
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

    randomize(fn) {
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
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

    rewind() {
        this.cells = this.initialCells.slice();
        for(var i = 0; i < this.size; i++) {
            this.cells[i] = this.initialCells[i];
        }
        // for (var x = 0; x < this.width; x++) {
        //     for (var y = 0; y < this.height; y++) {
        //         var index = this.index(x, y);
        //         this.cells[index] = this.initialCells[index];
        //     }
        // }
    }
    flip() {
        var t = this.oldCells;
        this.oldCells = this.cells;
        this.cells = t;
        // this.cells = new Array(this.size);

        // this.cells = this
        //     .cells
        //     .fill(0, 0, this.size);
        // console.log("Flip", this.oldCells, this.cells);
    }

}

export default Cells;