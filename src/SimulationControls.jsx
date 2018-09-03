import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import ShuffleIcon from '@material-ui/icons/Shuffle';
import ClearIcon from '@material-ui/icons/Clear';
import RewindIcon from '@material-ui/icons/FastRewind';
import PlayIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import StepIcon from '@material-ui/icons/SkipNext';
import red from '@material-ui/core/colors/red';

import IconButton from '@material-ui/core/IconButton';

import _ from "underscore";

const styles = {
    generationCounter: {
        fontSize: "15pt"
    },
    toolButton: {
        marginLeft: 10
    }
};

class SimulationControls extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            step: true,
            stop: false,
            run: true,
            rewind: true
        };

        _.bindAll(this, "onRewind", "onStep", "onRun", "onStop", "onClear", "onRandomize");
    }

    stop() {
        this.onStop();
    }

    onStep() {
        this
            .props
            .onStep();
    }

    onRun() {
        this.setState({step: false, stop: true, run: false, rewind: false});
        this
            .props
            .onRun();
    }

    onStop() {
        this.setState({step: true, stop: false, run: true, rewind: true});
        this
            .props
            .onStop();
    }

    onClear() {
        this.onStop();
        this
            .props
            .onClear();
    }

    onRandomize() {
        this.onStop();
        this
            .props
            .onRandomize();
    }

    onRewind() {
        this.setState({step: true, stop: false, run: true, rewind: true});
        this
            .props
            .onRewind();
    }

    render() {
        return (
            <Grid container spacing={0} justify="center" alignItems="center">
                <span id="generation-counter" style={styles.generationCounter}>0</span>

                <Tooltip title="Play">
                    <div>
                        <Button variant="outlined" onClick={this.onRun} disabled={!this.state.run}>
                            <PlayIcon/>
                        </Button>
                    </div>
                </Tooltip>
                <Tooltip title="Stop">
                    <div>
                        <Button variant="outlined" onClick={this.onStop} disabled={!this.state.stop}>
                            <StopIcon/>
                        </Button>
                    </div>
                </Tooltip>
                <Tooltip title="Step Forward">
                    <div>
                        <Button variant="outlined" onClick={this.onStep} disabled={!this.state.step}>
                            <StepIcon/>
                        </Button>
                    </div>
                </Tooltip>
                <Tooltip title="Rewind">
                    <div>
                        <Button
                            variant="outlined"
                            onClick={this.onRewind}
                            disabled={!this.state.rewind}>
                            <RewindIcon/>
                        </Button>

                    </div>
                </Tooltip>
                <Tooltip title="Randomize">
                    <div>
                        <Button variant="outlined" style={styles.toolButton} onClick={this.onRandomize}>
                            <ShuffleIcon color="error"/>
                        </Button>
                    </div>
                </Tooltip>
                <Tooltip title="Clear">
                    <div>
                        <Button variant="outlined" style={styles.toolButton} onClick={this.onClear}>
                            <ClearIcon color="error"/>
                        </Button>
                    </div>
                </Tooltip>
            </Grid>
        );
    }
}

export default SimulationControls;