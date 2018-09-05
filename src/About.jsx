
import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class About extends React.Component {
    handleClose = () => {
        if (this.props.onClose) {
            this
                .props
                .onClose();
        }
    };


    render() {
        return (
            <div>
                <Dialog
                    open={this.props.open}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">Cellular atutomatons visualiser</DialogTitle>
                    <DialogContent>
                            <div>
                                <p>This program is a simple visualisation tool for different types of cellular automatons.</p>
                                <p>All calculations perform in a finite grid with max side of 1000</p>
                                <p>Local browser storage used for saving settings and grids</p>
                                <p>All program state can be exported to file and restored afterwards</p>
                                <p>Most of the information about automatons came from&nbsp;
                                    <a href="http://psoup.math.wisc.edu/mcell">MCell project</a>
                                </p>
                            </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} autoFocus>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default About;