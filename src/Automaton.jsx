import * as Errors from "./Errors";
import Renderer from "./Renderer";

import _ from "underscore";

function randi(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Automaton {
    constructor(renderer, cells, settings) {
        this.setSettings(settings);
        this.renderer = renderer;
        this._cells = cells;
        this._generation = 0;
        console.log("CELLS", cells);
    }

    setSettings(settings) {
        console.log("SET SETT", settings)
        var params = settings.params;
        this.setParams(params);
        this.gridWidth = settings.gridWidth;
        this.gridHeight = settings.gridHeight;
    }

    get cells() {
        return this._cells;
    }

    setCells(cells) {
        this.cells.setCells(cells);
        this._generation = 0;
        this.render();
    }

    setCell(x, y, value) {
        if (!this.acceptValue(value)) {
            return false;
        }
        var result = this.cells.set(x, y, value);
        if (result === true) {
            this.render();
        }
        return result;
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

    clear() {
        if (this.isRunning()) {
            console.error("Still running");
            return;
        }

        this._generation = 0;
        this.cells.clear();
        this.render();
    }

    randomize() {
        if (this.isRunning()) {
            console.error("Still running");
            return;
        }

        this._generation = 0;
        this.cells.randomize(
            () => this.genCell(),
            this.gridWidth,
            this.gridHeight
        );

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
        this.cells.restore();
        this.render();
    }

    judge(cell, count) {
        throw new Error("abstract");
    }

    render() {
        var width = this.gridWidth;
        var height = this.gridHeight;
        // var width = this.cells.width;
        // var height = this.cells.height;
        this
            .renderer
            .begin();
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var cell = this.cells.get(x, y);
                this
                    .renderer
                    .drawCell(x, y, cell);
                // console.log("RNC", x, y, cell);
            }
        }
        this
            .renderer
            .end();
    }

    update() {
        // var width = this.cells.width;
        // var height = this.cells.height;
        var width = this.gridWidth;
        var height = this.gridHeight;
        this
            .renderer
            .begin();

        this.cells.flip();

        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var index = this.cells.index(x, y);
                var cell = this.cells.oldCells[index];
                var newCell = this.calculate(cell, index, x, y);
                this.cells.cells[index] = newCell;
                this
                    .renderer
                    .drawCell(x, y, newCell);
            }
        }

        this._generation += 1;

        this
            .renderer
            .end();
        // this.render();
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
        var cell = this.cells.getOld(x, y, this.gridWidth, this.gridHeight);
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
            throw new Errors.InvalidParamsError("Invalid params");
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


class BriansBrain extends GameOfLife {
    genCell() {
        var cell = randi(0, 2);
        return cell;
    }

    getMaxValue() {
        return 2;
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

function makeAutomaton(type) {
    return TYPES[type];
}

export default makeAutomaton;