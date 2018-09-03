import React from 'react';
import makeAutomaton from "./Automaton";
import Renderer from "./Renderer";
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import * as Errors from "./Errors";
// var $ = require("jquery");
import Tooltip from '@material-ui/core/Tooltip';
import ShuffleIcon from '@material-ui/icons/Shuffle';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';

import SimulationControls from "./SimulationControls";
import $ from "jquery";
import _ from "underscore";

const styles = {
    generationCounter: {
        fontSize: "15pt"
    }
};

class SimulationScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        console.log("Sim.NEW", this.props.settings);

        this.controls = React.createRef();

        _.bindAll(this, "onRefresh", "onSave", "onRewind", "onStep", "onRun", "onStop", "onClear", "onRandomize");
        this.automaton = undefined;
    }

    onStep() {
        if (this.automaton === undefined) {
            console.log("GAME UNDEF");
            return;
        }
        if (this.automaton.isRunning()) {
            alert("Still running");
            return;
        }
        if (this.automaton.interval) {
            return;
        }
        this
            .automaton
            .update();
    }

    onRun() {
        if (this.automaton === undefined) {
            console.log("GAME UNDEF");
            return;
        }
        if (this.automaton.isRunning()) {
            alert("Still running");
            return;
        }

        this
            .automaton
            .run(this.props.settings.get("interval"));
    }

    onStop() {
        if (this.automaton === undefined) {
            console.log("GAME UNDEF");
            return;
        }
        this
            .automaton
            .stop();
    }

    onRewind() {
        if (this.automaton === undefined) {
            console.log("GAME UNDEF");
            return;
        }
        if (this.automaton.isRunning()) {
            alert("Still running");
            return;
        }
        this
            .automaton
            .rewind();
    }

    onRandomize() {
        if (this.automaton.isRunning()) {
            console.error("GAME IS RUNING", this.automaton);
            alert("STOP SIMULATION FIRST");
            return;
        }
        this
            .automaton
            .randomize();
    }

    onClear() {
        if (this.automaton.isRunning()) {
            console.error("GAME IS RUNING", this.automaton);
            alert("STOP SIMULATION FIRST");
            return;
        }
        this
            .automaton
            .clear();
    }

    onRefresh() {
        if (this.automaton.isRunning()) {
            console.error("GAME IS RUNING", this.automaton);
            alert("STOP SIMULATION FIRST");
            return;
        }

        var grid = this
            .props
            .settings
            .get("grid");

        try {

            this
                .automaton
                .setCells(grid);
        } catch(e) {
            if (e instanceof Errors.InvalidGridError) {
                alert("Incompatible grid data");
            } else {
                throw e;
            }

        }
    }

    onSave() {
        this
            .props
            .settings
            .saveAutomatonGrid(this.automaton);
    }

    componentDidUpdate(prevProps) {
        console.log("SIM DID UPDATE", prevProps, this.props);
        if (_.isEqual(prevProps, this.props)) {
            return;
        }

        console.log("MACKING NEW GAME");
        this.newGame();
        this
            .automaton
            .render();
    }

    componentDidMount() {
        console.log("SIM MOUNT", this.props);
        this.newGame();
    }

    onCanvasClick(canvas, ev) {
        if (this.automaton.generation !== 0) {
            alert("Only first generation can be edited. Rewind simulation before editing board");
            return;
        }
        var rect = canvas.getBoundingClientRect();
        var settings = this.props.settings;
        var cellSize = settings.get("cellSize")
        var cellSide = cellSize + settings.get("cellMargin") - 1;
        var x = ev.clientX - rect.left;
        var y = ev.clientY - rect.top;

        var cellX = Math.floor(x / cellSide);
        var minX = Math.max(cellX - 3, 0);
        var maxX = Math.min(cellX + 3, settings.get("gridWidth"));
        var cellY = Math.floor(y / cellSide);
        var minY = Math.max(cellY - 3, 0);
        var maxY = Math.min(cellY + 3, settings.get("gridHeight"));

        for (var _x = minX; _x < maxX; _x++) {
            for (var _y = minY; _y < maxY; _y++) {
                var cX0 = cellSide * _x;
                var cX1 = cX0 + cellSize;

                var cY0 = cellSide * _y;
                var cY1 = cY0 + cellSize;
                if (x > cX0 && x < cX1 && y > cY0 && y < cY1) {
                    // console.log("Found XY", x, y, _x, _y);
                    this.changeCell(_x, _y);
                    return;
                }
                // console.log("NOT FOUND", _x, _y);
            }
        }
        // console.log("NOT Found XY");
    }

    changeCell(x, y) {
        var val = this
            .props
            .settings
            .get("currentValue");

        if (!this.automaton.setCell(x, y, val)) {
            alert("Invalid value for this type of automaton");
            return;
        }
    }

    newGame() {
        var settings = this
            .props
            .settings
            .toObject();
        console.log("--------------------------SIM NEW GAME", settings);
        var automatonType = makeAutomaton(settings.family);
        if (!automatonType) {
            alert("Error wrong type");
            return;
        }

        var newGame;
        try {
            var canvas = document.getElementById("grid");
            canvas.addEventListener('click', (ev) => this.onCanvasClick(canvas, ev), false);

            var counter = $("#generation-counter");
            const onRender = (automaton) => {
                // counter.html(" GENERATION " + this.automaton.generation + "");
                counter.html("Generation [ " + newGame.generation + " ]");
            };
            var render = new Renderer(canvas, settings, onRender);

            newGame = new automatonType(render, settings.grid, settings.params, settings.gridWidth, settings.gridHeight, onRender);

        } catch (e) {
            if (e instanceof Errors.InvalidParamsError) {
                alert("Invalid automaton params");
                if (this.automaton) {
                    this
                        .automaton
                        .rewind();
                }

                return;
            } else {
                console.error(e);
            }
        }

        if (this.automaton !== undefined) {
            console.log("GAME STOPPED NEW GAME");
            this
                .automaton
                .stop();
            this.automaton = undefined;
        }
        console.log("!!!!!!!!!!!!!!!!!");
        this.automaton = newGame;
        this
            .props
            .settings
            .onAutomatonChanged(this.automaton);
        this
            .automaton
            .render();
    }

    shouldComponentUpdate(nextProps, nextState) {
        var settings = nextProps
            .settings
            .toObject();
        var updated = nextProps.updatedSettings;

        if (_.isUndefined(settings) || _.isUndefined(updated)) {
            return true;
        }

        if (this.automaton && this.automaton.isRunning()) {
            //emulate stop
            this
                .controls
                .current
                .stop();
        }

        console.log("SHOULD", updated);
        if (updated.length !== 1) {
            return true;
        }
        if (_.contains(updated, "palette")) {
            this
                .automaton
                .setPalette(settings.palette);
            return false;
        } else if (_.contains(updated, "cellMargin") || _.contains(updated, "cellSize") || _.contains(updated, "showValues")) {
            this
                .automaton
                .setRenderSettings(settings);
            return false;
        } else if (_.contains(updated, "params")) {
            this
                .automaton
                .setParams(settings.params);
            return false;
        } else if (_.contains(updated, "interval") || _.contains(updated, "currentValue") || _.contains(updated, "activeTab")) {
            return false;
        } else {
            return true;
        }
    }

    render() {
        console.log("SIM RENDER", this.props.settings);
        return (
            <div>
                <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="center"
                    style={{
                    margin: 10
                }}>
                    <span id="generation-counter" style={styles.generationCounter}></span>
                </Grid>
                <SimulationControls
                    ref={this.controls}
                    onRun={this.onRun}
                    onStop={this.onStop}
                    onStep={this.onStep}
                    onRewind={this.onRewind}
                    onSave={this.onSave}
                    onRandomize={this.onRandomize}
                    onRefresh={this.onRefresh}
                    onClear={this.onClear}/>
                <div id="grid-wrapper">
                    <Grid container direction="row" justify="center" alignItems="flex-start">
                        <canvas id="grid" className="grid-view"></canvas>
                    </Grid>
                </div>
            </div>
        );
    }
}

export default SimulationScreen;