import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import PropTypes from 'prop-types';
import FileSaver from "file-saver";
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import Confirm from "./Confirm";
import About from "./About";

const styles = {
    root: {
        flexGrow: 1
    },
    flex: {
        flexGrow: 1
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20
    }
};

class AppMenu extends React.Component {
    state = {
        anchorEl: null,
        openResetConfirm: false,
        openAbout: false
    };

    handleClick = event => {
        this.setState({anchorEl: event.currentTarget});
    };

    handleClose = () => {
        this.setState({anchorEl: null});
    };

    exportSettings() {
        var data = this
            .props
            .settings
            .serialize(this.props.cells);
        var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        var filename = `${this
            .props
            .settings
            .get("name")}.json`;
        FileSaver.saveAs(blob, filename);
    }

    componentDidMount() {}

    importSettings() {
        // var file_input = document.getElementById('file-input');
        var file_input = document.createElement('input');
        file_input.type = "file";
        const onUpload = () => {
            var file = file_input.files[0];
            const reader = new FileReader();
            const onRead = (e) => {
                const text = e.srcElement.result;
                // console.log(text);
                if (!this.props.settings.unserialize(text)) {
                    alert("Invalid settings file");
                }
            };
            reader.addEventListener('loadend', onRead);
            reader.readAsText(file);
        };

        file_input.addEventListener("change", onUpload, false);
        file_input.click();
    }

    resetSettings = () => {
        this
            .props
            .settings
            .setDefaultValues();
        this.setState({openResetConfirm: false});
        window
            .location
            .reload();
    }

    handleAction(name) {
        return () => {
            var settings = this.props.settings;
            if (name === "defaultSettings") {
                this.setState({openResetConfirm: true})
            } else if (name === "exportSettings") {
                this.exportSettings();
            } else if (name === "importSettings") {
                this.importSettings();
            } else if (name === "openAbout") {
                this.setState({openAbout: true});
            }
            this.handleClose();
        };

    }

    render() {
        const {anchorEl} = this.state;
        const {classes} = this.props;
        const open = Boolean(anchorEl);
        return (
            <div>
                <Grid container spacing={0} justify="center" alignItems="center">
                    <Tooltip title="Save settings and grid data to file">
                        <Button onClick={this.handleAction("exportSettings")}>Export</Button>
                    </Tooltip>
                    <Tooltip title="Load settings and grid data from file">
                        <Button onClick={this.handleAction("importSettings")}>Import</Button>
                    </Tooltip>
                    <Tooltip title="Reset all data to default values">
                        <Button onClick={this.handleAction("defaultSettings")}>Reset</Button>
                    </Tooltip>
                    <Tooltip title="Information about this program">
                        <Button onClick={this.handleAction("openAbout")}>About</Button>
                    </Tooltip>
                </Grid>
                <About
                    onClose={() => {
                    this.setState({openAbout: false})
                }}
                    open={this.state.openAbout}/>
                <Confirm
                    onAccept={this.resetSettings}
                    onCancel={() => {
                    this.setState({openResetConfirm: false})
                }}
                    title="Please confirm!"
                    message="This action will reset all settings and clear the grid."
                    open={this.state.openResetConfirm}/>

            </div>
        );
    }
}

AppMenu.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AppMenu);
