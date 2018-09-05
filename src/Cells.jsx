
import * as Errors from "./Errors";
import _ from "underscore";

const calcIndex = (x, y, width, height) => {
    if (x < 0 || x >= width || y < 0 || y > height) {
        return -1;
    }
    return y * width + x;
}

class Cells {
    constructor(size, width, height) {
        this.size = size;
        this.width = width;
        this.height = height;
        this.cells = new Array(this.size);
        this.oldCells = new Array(this.size);
        this.initialCells = new Array(this.size);
        this.clear();
    }

    setCells(cells, width, height) {
        width = width || this.width;
        height = height || this.height;

        if (cells.length !== this.size) {
            // console.error("Trying to restore invalid grid", cells);
            throw new Errors.InvalidGridError();
        }

        this.width = width;
        this.height = height;
        this.cells = cells.slice()
        this.store();
        // if(width === this.width && height === this.height) {
        // } else {
        //     this.resize(cells, width, height);
        // }
    }

    resize2(width, height) {
        this.flip();
        this.nullify();

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var index1 = calcIndex(x, y, this.width, this.height);
                var index2 = calcIndex(x, y, width, height);
                if(index1 === -1 || index2 === -1){
                    continue;
                } 
                var old = this.oldCells[index1];
                this.cells[index2] = old;
            }
        }

        this.store();
        this.width = width;
        this.height = height;
        // this.oldCells = this.cells.slice();
    }
    resize(width, height) {
        var oldCells = this.cells
        var oldWidth = this.width;
        var oldHeight = this.height;
        var cells = this.oldCells;
        cells.fill(0, 0, this.size);

        console.log("RESIZE", [oldWidth, oldHeight], [width, height], oldCells,cells  );
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var indexOld = calcIndex(x, y, oldWidth, oldHeight);
                var indexNew = calcIndex(x, y, width, height);
                var val;
                if(indexOld === -1){
                    val = 0;
                    continue;
                } 
                val = oldCells[indexOld];
                cells[indexNew] = val;
            }
        }

        this.width = width;
        this.height = height;
        this.cells = cells;
        this.store();
        // console.log("RESIZE OVER", this.cells); 
        // this.oldCells = this.cells.slice();
    }

    clear() {
        this.cells.fill(0, 0, this.size);
        this.oldCells.fill(0, 0, this.size);
        this.store();
    }

    nullify(){
        for(var i=0; i<this.size; i++){
            this.cells[i] = 0;
        }
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
        this.clear();
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

    store() {
        // this.initialCells = this
        //     .cells
        //     .slice();
        // this.oldCells = this.cells.slice();
        for(var i = 0; i < this.size; i++) {
            this.initialCells[i] = this.cells[i];
        }
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
    }

}

export default Cells;