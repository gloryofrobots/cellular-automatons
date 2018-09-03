import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import PropTypes from 'prop-types';
import FileSaver from "file-saver";
import Grid from '@material-ui/core/Grid';
import $ from "jquery";

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};


class AppMenu extends React.Component {
    state = {
        anchorEl: null,
    };

    handleClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    exportSettings() {
        var data = this.props.settings.serialize();
        var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(blob, "cellular-vis-settings.json");
    }

    componentDidMount() {
    }

    importSettings() {
        // var file_input = document.getElementById('file-input');
        var file_input = document.createElement('input');
        file_input.type = "file";
        const onUpload = ()=> {
            var file = file_input.files[0];
            const reader = new FileReader();   
            const onRead = (e) => {
                const text = e.srcElement.result;
                // console.log(text);
                if(!this.props.settings.unserialize(text)) {
                    alert("Invalid settings file");
                }
            };
            reader.addEventListener('loadend', onRead);
            reader.readAsText(file);
        };

        file_input.addEventListener("change", onUpload, false);
        file_input.click();
    }

    handleAction(name) {
        return () => {
            var settings = this.props.settings;
            if(name === "defaultSettings") {
                settings.setDefaultValues();
            } else if(name === "exportSettings"){
                this.exportSettings();
            } else if(name === "importSettings"){
                this.importSettings();
            }
            this.handleClose();
        };

    }

    render2() {
        const { anchorEl } = this.state;
        const { classes } = this.props;
        const open = Boolean(anchorEl);
        return (
        <div>

            <Button
              className={classes.menuButton}
              color="inherit"
              variant="outlined"
              aria-label="Menu"
              onClick={this.handleClick}>
              Settings
            </Button>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={this.handleClose}
            >
            <MenuItem onClick={this.handleAction("exportSettings")}>Export</MenuItem>
            <MenuItem onClick={this.handleAction("importSettings")}>Import</MenuItem>
            <MenuItem onClick={this.handleAction("defaultSettings")}>Reset</MenuItem>
            </Menu>
        </div>
        );
    }
    render() {
        const { anchorEl } = this.state;
        const { classes } = this.props;
        const open = Boolean(anchorEl);
        return (
        <div>
            <Grid container spacing={0} justify="center" alignItems="center">
                <Button onClick={this.handleAction("exportSettings")}>Export</Button>
                <Button onClick={this.handleAction("importSettings")}>Import</Button>
                <Button onClick={this.handleAction("defaultSettings")}>Reset</Button>
            </Grid>
        </div>
        );
    }
}

AppMenu.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AppMenu);
