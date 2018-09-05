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
import Cells from "./Cells";
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
            this.notify("Still running");
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
            this.notify("Still running");
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
            this.notify("Still running");
            return;
        }
        this
            .automaton
            .rewind();
    }

    isRunning(){
        return !_.isUndefined(this.automaton) && this.automaton.isRunning();
    }

    onRandomize() {
        if(_.isUndefined(this.automaton)){
            this.notify("Invalid automaton state");
            return;
        }
        if (this.isRunning()) {
            console.error("GAME IS RUNING", this.automaton);
            this.notify("STOP SIMULATION FIRST");
            return;
        }
        this
            .automaton
            .randomize();
    }

    onClear() {
        if(_.isUndefined(this.automaton)){
            this.notify("Invalid automaton state");
            return;
        }
        if (this.isRunning()) {
            console.error("GAME IS RUNING", this.automaton);
            this.notify("STOP SIMULATION FIRST");
            return;
        }
        this
            .automaton
            .clear();
    }

    onRefresh() {
        if(_.isUndefined(this.automaton)){
            this.notify("Invalid automaton state");
            return;
        }
        if (this.isRunning()) {
            console.error("GAME IS RUNING", this.automaton);
            this.notify("STOP SIMULATION FIRST");
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
            this.notify("Loaded", 700)
        } catch(e) {
            if (e instanceof Errors.InvalidGridError) {
                this.notify("Incompatible grid data");
            } else {
                throw e;
            }

        }
    }

    onSave() {
        if(_.isUndefined(this.automaton)){
            this.notify("Invalid automaton state");
            return;
        }
        this
            .props
            .settings
            .saveAutomatonGrid(this.automaton.cells);
        this.notify("Saved", 700)
    }

    componentDidUpdate(){
        var canvas = document.getElementById("grid");
        canvas.addEventListener('click', (ev) => this.onCanvasClick(canvas, ev), false);
    }

    componentDidMount() {
        console.log("SIM MOUNT", this.props);
        var canvas = document.getElementById("grid");
        canvas.addEventListener('click', (ev) => this.onCanvasClick(canvas, ev), false);
        this.createSimulation();
    }

    shouldComponentUpdate(nextProps, nextState) {
        // remaking automaton in some cases;
        // componentDidUpdate not used here because of props === newProps situation
        // and because of the need to update automaton with settings new static methods are not usefull
        if (this._shouldComponentUpdate(nextProps, nextState) === true) {
            this.createSimulation();
        }
        // block canvas from rerendering
        return false;
    }

    _shouldComponentUpdate(nextProps, nextState) {
        if(_.isUndefined(this.automaton)){
            return true;
        }

        var settings = nextProps
            .settings
            .toObject();
        var updated = nextProps.updatedSettings;

        if (_.isUndefined(settings) || _.isUndefined(updated) || _.isUndefined(this.automaton)) {
            console.log("UPDATE REQUIRED");
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
        if (updated.length === 0) {
            return false;
        } else if (updated.length > 1) {
            console.log("UPDATE REQUIRED");
            return true;
        } else if (_.contains(updated, "palette")) {
            this
                .automaton
                .setPalette(settings.palette);
            return false;
        } else if (_.contains(updated, "gridWidth") || _.contains(updated, "gridHeight") ){
            this
                .controls
                .current
                .rewind();
            this.automaton.setSettings(settings);
            this
                .automaton
                .setRenderSettings(settings);
            console.log("RESIZE");
        } else if (_.contains(updated, "cellMargin") || _.contains(updated, "cellSize") || _.contains(updated, "showValues")) {
            this
                .automaton
                .setRenderSettings(settings);
            return false;
        } else if (_.contains(updated, "params")) {
            try{
                this
                    .automaton
                    .setParams(settings.params);
            } catch (e) {
                this.notify("Invalid params");
            }

            this
                .controls
                .current
                .rewind();
            return false;
        } else if (_.contains(updated, "interval") || _.contains(updated, "currentValue") || _.contains(updated, "activeTab")) {
            return false;
        } else {
            console.log("UPDATE REQUIRED");
            return true;
        }
    }
    
    onCanvasClick(canvas, ev) {
        if(!this.automaton) {
            console.log("Click on broken sim");
            return;
        }
        if (this.automaton.generation !== 0) {
            this.notify("Only first generation can be edited. Rewind simulation before editing board");
            return;
        }
        // console.log("CLICK");
        var rect = canvas.getBoundingClientRect();
        var settings = this.props.settings;
        var cellSize = settings.get("cellSize")
        var cellSide = cellSize + settings.get("cellMargin");
        var x = ev.clientX - rect.left;
        var y = ev.clientY - rect.top;

        var cellX = Math.floor(x / cellSide);
        var minX = Math.max(cellX - 10, 0);
        var maxX = Math.min(cellX + 10, settings.get("gridWidth"));
        var cellY = Math.floor(y / cellSide);
        var minY = Math.max(cellY - 10, 0);
        var maxY = Math.min(cellY + 10, settings.get("gridHeight"));

        for (var _x = minX; _x < maxX; _x++) {
            for (var _y = minY; _y < maxY; _y++) {
                var cX0 = cellSide * _x;
                var cX1 = cX0 + cellSize;

                var cY0 = cellSide * _y;
                var cY1 = cY0 + cellSize;
                if (x > cX0 && x < cX1 && y > cY0 && y < cY1) {
                    // console.log("Found XY", x, y, _x, _y);
                    this.changeCell(_x, _y);

                    // this.props.notify("Click " + _x, + " " + _y);
                    return;
                }
                // console.log("NOT FOUND", _x, _y);
            }
        }
        // console.log("NOT Found XY");

    }

    notify(msg, duration) {
        this.props.notify(msg, duration);
    }

    changeCell(x, y) {
        var val = this
            .props
            .settings
            .get("currentValue");

        if (!this.automaton.setCell(x, y, val)) {
            this.notify("Invalid value for this type of automaton");
            return;
        }
    }

    createSimulation() {
        var settings = this
            .props
            .settings
            .toObject();
        console.log("--------------------------SIM NEW GAME", settings);
        var automatonType = makeAutomaton(settings.family);
        if (!automatonType) {
            this.notify("Error wrong type");
            return;
        }

        var automaton;
        try {
            var canvas = document.getElementById("grid");
            var counter = $("#generation-counter");
            const onRender = () => {
                // counter.html(" GENERATION " + this.automaton.generation + "");
                counter.html("Generation [ " + automaton.generation + " ]");
            };
            var render = new Renderer(canvas, settings, onRender);

            if (settings.grid && settings.grid.length > 0){
                try {
                    this.props.cells.setCells(settings.grid);
                } catch(e) {
                    this.notify("Error restoring grid");
                }
            }
            automaton = new automatonType(render, this.props.cells, settings);

        } catch (e) {
            if (e instanceof Errors.InvalidParamsError) {
               this.notify("Invalid automaton params");
                if (this.automaton) {
                    this
                        .automaton
                        .rewind();
                }

                return;
            } else {
                console.error(e);
                alert("Invalid settings, everything will be reverted to default state");
                this.props.settings.setDefaultValues();
                return;
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
        this.automaton = automaton;
        this
            .props
            .settings
            .onAutomatonChanged(this.automaton);
        this
            .automaton
            .render();
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