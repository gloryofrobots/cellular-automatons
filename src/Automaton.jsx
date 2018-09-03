import * as Errors from "./Errors";
import Renderer from "./Renderer";

import _ from "underscore";

function randi(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Automaton {
    constructor(renderer, cells, params, width, height) {
        this.setParams(params);
        this.renderer = renderer;

        this.width = width;
        this.height = height;
        this.size = this.width * this.height;
        this._generation = 0;
        console.log("CELLS", cells);

        if (!_.isArray(cells) || cells.length === 0) {
            console.log("CLEAR");
            this._clear();
        } else {
            if (cells.length !== this.size) {
                console.error("Trying to restore invalid grid", cells);
                this._clear();
                return;
            }
            this._restore(cells);
        }
    }

    setCell(x, y, value) {
        var index = this.index(x, y);
        if (index < 0) {
            return false;
        }
        if (!this.acceptValue(value)) {
            return false;
        }
        this.cells[index] = value;
        this.initialCells[index] = value;
        this.render();
        return true;
    }

    acceptValue(val) {
        return (val >= 0 && val <= this.getMaxValue());
    }

    getMaxValue() {
        throw new Error("Abstract");
    }

    setParams(params) {
        this.params = this.parseParams(params);
        this.validate();
    }

    setRenderSettings(settings) {
        this
            .renderer
            .setSettings(settings);
        this.render();
    }

    setPalette(c) {
        this
            .renderer
            .setPalette(c);
        this.render();
    }

    _clear() {
        this._generation = 0;
        this.cells = new Array(this.size);
        this.cells = this
            .cells
            .fill(0, 0, this.size);
        this.initialCells = this
            .cells
            .slice();
    }

    _restore(cells) {
        this._generation = 0;
        this.cells = cells.slice()
        this.initialCells = this
            .cells
            .slice();
    }

    clear() {
        if (this.isRunning()) {
            console.error("Still running");
            return;
        }

        this._clear();
        this.render();
    }

    randomize() {
        if (this.isRunning()) {
            console.error("Still running");
            return;
        }
        this._generation = 0;
        this.cells = this
            .cells
            .map((val, index, arr) => {
                return this.genCell();
            });

        this.initialCells = this
            .cells
            .slice();
        this.render();
    }

    validate() {
        throw new Error("abstract");
    }

    parseParams(params) {
        var result = [];
        return _.map(params.split("/"), function (_param) {
            var param = _param.trim();
            if (param === "") {
                return [0];
            }
            var res = _.map(Array.from(param), (val) => {
                var intVal = parseInt(val, 10);
                if (isNaN(intVal)) {
                    throw new Errors.InvalidParamsError();
                }
                return intVal;
            });
            return res;
            // console.log("P", param, Array.from(param), _.map(Array.from(param), (val) =>
            // parseInt(val, 10)));
        });
    }

    get generation() {
        return this._generation;
    }

    genCell() {
        return Math.round(Math.random());
    }

    rewind() {
        this._generation = 0;
        this.cells = this
            .initialCells
            .slice();
        this.render();
    }

    index(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y > this.height) {
            return -1;
        }
        return y * this.width + x;
    }

    get(x, y) {
        var index = this.index(x, y);
        if (index === -1) {
            return undefined;
        }

        return this.cells[index];
    }

    judge(cell, count) {
        throw new Error("abstract");
    }

    render() {
        this
            .renderer
            .begin();
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var index = this.index(x, y);
                var cell = this.cells[index];
                this
                    .renderer
                    .drawCell(x, y, cell);
            }
        }
        this
            .renderer
            .end();
    }

    update() {
        var newCells = new Array(this.size);
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var index = this.index(x, y);
                var cell = this.cells[index];
                var newCell = this.calculate(cell, index, x, y);
                newCells[index] = newCell;
            }
        }
        this._generation += 1;
        this.cells = newCells;
        this.render();
    }

    calculate(cell, index, x, y) {
        throw new Error("abstract!");
    }

    isRunning() {
        return this.interval !== undefined;
    }

    stop() {
        if (!this.isRunning()) {
            console.log("NOT RUNNING");
            return;
        }
        console.log("STOPPING");

        clearInterval(this.interval);
        this.interval = undefined;
    }

    run(interval) {
        if (this.isRunning()) {
            console.log("ALREADY RUNNING");
            return;
        }

        this.interval = setInterval(() => {
            this.update();
        }, interval);
    }
}

class GameOfLife extends Automaton {
    countNeighbors(x, y) {
        var cell = this.get(x, y);
        if (cell === 1) {
            return 1;
        }
        return 0;
    }

    getMaxValue() {
        return 1;
    }

    validate() {
        if (this.params.length != 2) {
            console.error("INVALID params", this.params);
            throw new Error("Invalid params");
        }
    }

    calculate(cell, index, x, y) {
        var count = 0;
        count += this.countNeighbors(x, y + 1);
        count += this.countNeighbors(x, y - 1);

        count += this.countNeighbors(x + 1, y);
        count += this.countNeighbors(x - 1, y);

        count += this.countNeighbors(x - 1, y + 1);
        count += this.countNeighbors(x - 1, y - 1);

        count += this.countNeighbors(x + 1, y - 1);
        count += this.countNeighbors(x + 1, y + 1);

        return this.judge(cell, count);
    }

    judge(cell, count) {
        if (cell == 1) {
            if (this.params[0].includes(count)) {
                return 1;
            }
            return 0;
        } else {
            if (this.params[1].includes(count)) {
                return 1;
            }
            return 0;
        }
    }
}

// class Seeds extends GameOfLife {     judge(cell, count) {         if(cell ===
// 1) {             return 0;         }         if (count === 2) {
// return 1;         }         return 0;     } }

class BriansBrain extends GameOfLife {
    genCell() {
        var cell = randi(0, 2);
        return cell;
    }

    getMaxValue() {
        return 3;
    }

    judge(cell, count) {
        if (cell === 1) {
            // Dying
            return 2;
        }
        if (cell === 2) {
            return 0;
        }
        if (count === 2) {
            return 1
        }
        return 0;
    }
}

class Cyclic2D extends Automaton {
    genCell() {
        var maxValue = 2;
        var cell = randi(0, maxValue);
        return cell;
    }

    calculate(cell, index, x, y) {
        // var threshold = this.props.threshold; var maxValue = this.props.maxValue;
        var threshold = 1;
        var maxValue = 2;
        var next;
        if (cell === maxValue) {
            next = 0;
        } else {
            next = cell + 1;
        }

        for (var x1 = x - 1; x1 < x + 1; x1++) {
            for (var y1 = y - 1; y1 < y + 1; y1++) {
                if (x1 === x && y1 === y) {
                    continue;
                }

                var neighbor = this.get(x1, y1);
                if (neighbor === next) {
                    threshold--;
                    if (threshold === 0) {
                        return next;
                    }
                }
            }
        }
        return cell;
    }
}

const TYPES = {
    "gl": GameOfLife,
    "bb": BriansBrain
};

function automaton(type) {
    return TYPES[type];
}

export default automaton;