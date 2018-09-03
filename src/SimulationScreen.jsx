
import React from 'react';
import automaton from "./Automaton";
import Renderer from "./Renderer";
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import $ from "jquery";
import * as Errors from "./Errors";
// var $ = require("jquery");
import PaletteEditor from "./PaletteEditor";

import _ from "underscore";

const styles = {
    generationCounter:{
        fontSize:"15pt"
    }
};

class SimControls extends React.Component {
    constructor(props){
        super(props);
        this.state={
            step:true,
            stop:false,
            run:true,
            rewind:true
        };

        this.onRewind = this.onRewind.bind(this);
        this.onStep = this.onStep.bind(this);
        this.onRun = this.onRun.bind(this);
        this.onStop = this.onStop.bind(this);
    }

    stop() {
        this.onStop();
    }

    onStep() {
        this.props.onStep();
    }

    onRun() {
        this.setState({
            step:false,
            stop:true,
            run:false,
            rewind:false
        });
        this.props.onRun();
    }

    onStop() {
        this.setState({
            step:true,
            stop:false,
            run:true,
            rewind:true
        });
        this.props.onStop();
    }

    onRewind() {
        this.setState({
            step:true,
            stop:false,
            run:true,
            rewind:true
        });
        this.props.onRewind();
    }

    render () {
        return (
            <p className="center">
                <span  id="generation-counter" style={styles.generationCounter}>0</span>
                <Button variant="outlined" onClick={this.onRun} disabled={!this.state.run}>Run</Button>
                <Button variant="outlined" onClick={this.onStop} disabled={!this.state.stop}>Stop</Button>
                <Button variant="outlined" onClick={this.onStep} disabled={!this.state.step}>Step</Button>
                <Button variant="outlined" onClick={this.onRewind} disabled={!this.state.rewind} >Rewind</Button>
            </p>
        );
    }
}

class SimulationScreen extends React.Component {
    constructor(props){
        super(props);
        this.state={
        };

        console.log("Sim.NEW", this.props.settings);

        this.controls = React.createRef();
        this.onRewind = this.onRewind.bind(this);
        this.onStep = this.onStep.bind(this);
        this.onRun = this.onRun.bind(this);
        this.onStop = this.onStop.bind(this);
        this.game=undefined;
    }

    onStep() {
        if (this.game === undefined){
            console.log("GAME UNDEF");
            return;
        }
        if (this.game.isRunning()) {
            alert("Still running");
            return;
        }
        if (this.game.interval) {
            return;
        }
        this.game.update();
    }

    onRun() {
        if (this.game === undefined){
            console.log("GAME UNDEF");
            return;
        }
        if (this.game.isRunning()) {
            alert("Still running");
            return;
        }

        this.game.run(this.props.settings.interval);
    }

    onStop() {
        if (this.game === undefined){
            console.log("GAME UNDEF");
            return;
        }
        this.game.stop();
    }

    onRewind() {
        if (this.game === undefined){
            console.log("GAME UNDEF");
            return;
        }
        if (this.game.isRunning()) {
            alert("Still running");
            return;
        }
        this.game.rewind();
    }

    componentDidUpdate(prevProps) {
        console.log("SIM DID UPDATE", prevProps, this.props);
        if (_.isEqual(prevProps, this.props)) {
            return;
        }

        console.log("MACKING NEW GAME");
        this.newGame();
        this.game.render();
    }

    componentDidMount() {
        console.log("SIM MOUNT", this.props);
        this.newGame();
    }

    onCanvasClick(canvas, ev) {
        if(this.game.generation !== 0) {
            alert("Rewind simulation before editing board");
            return;
        }
        var rect = canvas.getBoundingClientRect();
        var settings = this.props.settings;
        var cellSide = settings.cellSize + settings.cellMargin - 1;
        var x = ev.clientX - rect.left;
        var y = ev.clientY - rect.top;
        // x = Math.round(x);
        // y = Math.round(y);

        // var width = canvas.width - settings.cellMargin;
        // var height = canvas.height - settings.cellMargin;
        // cellSide = Math.floor(canvas.width / settings.gridWidth);

        var cellX = Math.floor(x / cellSide);
        var minX = Math.max(cellX - 3, 0);
        var maxX = Math.min(cellX + 3, settings.gridWidth);
        var cellY = Math.floor(y / cellSide);
        var minY = Math.max(cellY - 3, 0);
        var maxY = Math.min(cellY + 3, settings.gridHeight);

        for(var _x = minX; _x < maxX; _x++){
            for(var _y = minY; _y < maxY; _y++){
                var cX0 = cellSide * _x;
                var cX1 = cX0 + settings.cellSize;

                var cY0 = cellSide * _y;
                var cY1 = cY0 + settings.cellSize;
                if(x > cX0 && x < cX1 && y > cY0 && y < cY1) {
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
        var val = this.props.settings.currentValue;
        if(!this.game.setCell(x, y, val)){
            alert("Invalid value for this type of automaton");
            return;
        }
        this.props.onAutomatonChanged(this.game);
    }

    newGame() {
        var settings = this.props.settings;
        console.log("--------------------------SIM NEW GAME", settings);
        var automatonType = automaton(settings.family);
        if (!automatonType){
            alert("Error wrong type");
            return;
        }

        var newGame;
        try {
            var canvas = document.getElementById("grid");
            canvas.addEventListener('click', (ev)=>this.onCanvasClick(canvas, ev), false);

            var counter = $("#generation-counter");
            const onRender = (game) => {
                // counter.html(" GENERATION " + this.game.generation + "");
                counter.html(" [ " + newGame.generation + " ]");
            };
            var render = new Renderer(canvas, settings, onRender);

            newGame = new automatonType(
                render, settings.cells, settings.params, settings.gridWidth,
                settings.gridHeight, onRender,
            );

       } catch(e) {
           if(e instanceof Errors.InvalidParamsError) {
               alert("Invalid automaton params");
               if(this.game) {
                   this.game.rewind();
               }

               return;
           } else {
               console.error(e);
           }
       }

        if (this.game !== undefined) {
            console.log("GAME STOPPED NEW GAME");
            this.game.stop();
            this.game = undefined;
        }
        console.log("!!!!!!!!!!!!!!!!!");
        this.game = newGame;
        this.game.render();
    }

    randomize() {
        if(this.game.isRunning()) {
            console.error("GAME IS RUNING", this.game);
            alert("STOP SIMULATION FIRST");
            return;
        }
        this.game.randomize();
    }

    clear(){
        if(this.game.isRunning()) {
            console.error("GAME IS RUNING", this.game);
            alert("STOP SIMULATION FIRST");
            return;
        }
        this.game.clear();
    }

    load(filename){
        if(this.game.isRunning()) {
            console.error("GAME IS RUNING", this.game);
            alert("STOP SIMULATION FIRST");
            return;
        }
        this.game.load();
    }

    save(filename){
        if(this.game.isRunning()) {
            console.error("GAME IS RUNING", this.game);
            alert("STOP SIMULATION FIRST");
            return;
        }
        this.game.save(filename);
    }

    shouldComponentUpdate(nextProps, nextState) {
        var settings = nextProps.settings;
        var updated = nextProps.updatedSettings;

        if(_.isUndefined(settings) || _.isUndefined(updated)){
            return true;
        }

        if(this.game && this.game.isRunning()) {
            //emulate stop
            this.controls.current.stop();
        }

        console.log("SHOULD", updated);
        if(updated.length !== 1) {
            return true;
        }
        if(_.contains(updated, "palette")) {
            this.game.setPalette(settings.palette);
            return false;
        } else if(_.contains(updated, "cellMargin") ||
                  _.contains(updated, "cellSize") ||
                  _.contains(updated, "showValues")) {
            this.game.setRenderSettings(settings);
            return false;
        } else if(_.contains(updated, "params")) {
            this.game.setParams(settings.params);
            return false;
        } else if (_.contains(updated, "interval") ||
                  _.contains(updated, "currentValue")) {
            return false;
        } else {
            return true;
        }
    }

    render() {
        console.log("SIM RENDER", this.props.settings);
        return (
            <div>
              <SimControls
                ref={this.controls}
                onRun={this.onRun}
                onStop={this.onStop}
                onStep={this.onStep}
                onRewind={this.onRewind}
                />
                 <div id="grid-wrapper"> 
                    <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="flex-start"
                    >
                 <canvas id="grid" className="grid-view"> </canvas>
                 </Grid>
                 </div>
            </div>
        );
    }
}

export default SimulationScreen;