import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {withStyles} from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import PaletteEditor from "./PaletteEditor";
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import ShuffleIcon from '@material-ui/icons/Shuffle';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';

import {IF} from "./Lang";

import _ from "underscore";

const styles = {
    ruleSelectForm: {
        marginLeft: 10
    },
    settingsTab: {
        minWidth: "50%"
    },
    ruleEdit: {
        marginLeft: 10,
        width: 200
    },
    cellSide: {
        marginLeft: 10,
        width: 120
    },
    defaultInput: {
        marginLeft: 10,
        width: 50
    },
    toolButton: {
        marginLeft: 10
    },
    paletteGrid: {
        marginTop: 10
    },
    boardControls: {
        marginTop: 10
    }

};

class SettingsScreen extends React.Component {
    constructor(props) {
        super(props);
        var settings = props.settings;

        var family = settings.get("family");
        this.state = {
            editEnabled: true,
            settings: settings.toObject(),
            activeTab: settings.get("activeTab"),
            rules: settings.getRules(family),
            rule: settings.getRule(family),
            info: settings.getInfo(family)
        };
        // console.log("SETATE SETTINGS", this.state);
        this.onActionCallback = props.onAction;

        this.onTabChanged = this
            .onTabChanged
            .bind(this);
        this.onSetDefaults = this
            .onSetDefaults
            .bind(this);
        this.onToggleEditor = this
            .onToggleEditor
            .bind(this);
        this.handleChangeRule = this
            .handleChangeRule
            .bind(this);
        this.handleChangeFamily = this
            .handleChangeFamily
            .bind(this);
    }

    onToggleEditor() {
        this.setState({
            editEnabled: !this.state.editEnabled
        });
    }

    handleAction(name) {
        return () => {
            this.onActionCallback(name);
        };
    }

    handleChangeFamily(event) {
        var family = event.target.value;
        var rules = this
            .props
            .settings
            .getRules(family);
        var rule = this
            .props
            .settings
            .getRule(family);
        var info = this
            .props
            .settings
            .getInfo(family);

        this.setState({
            rules: rules,
            rule: rule,
            info: info,
            settings: this.updatedSettings("family", event.target.value)
        });
        this
            .props
            .settings
            .setString("family", event.target.value);
    }

    handleChangeRule(event) {
        this.setState({
            rule: event.target.value,
            settings: this.updatedSettings("params", event.target.value)
        });
        this
            .props
            .settings
            .setString("params", event.target.value);
    }

    updatedSettings(key, val) {
        var settings = _.clone(this.state.settings);
        settings[key] = val;
        // console.log("upfated", settings);
        return settings;
    }

    handleChange(name) {
        return (event) => {
            this
                .props
                .settings
                .setString(name, event.target.value);
            this.setState({
                settings: this.updatedSettings(name, event.target.value)
            });
        };
    }

    handleCheckbox(name) {
        return (event) => {
            console.log("CHB", typeof event.target.checked);
            this
                .props
                .settings
                .set(name, event.target.checked);
            this.setState({
                settings: this.updatedSettings(name, event.target.checked)
            });
        };

    }
    onTabChanged(event, value) {
        console.log("TAB", value);
        this
            .props
            .settings
            .set("activeTab", value);
        this.setState({activeTab: value});
    }

    onSetDefaults() {
        var settings = this.props.settings;
        settings.setDefaultValues();
        var family = settings.get("family");
        this.setState({
            settings: settings.toObject(),
            rules: settings.getRules(family),
            rule: settings.getRule(family),
            info: settings.getInfo(family)
        });
    }

    renderRules() {
        var RuleSelect = (
            <Button disabled>None</Button>
        );
        if (this.state.rule !== undefined) {
            RuleSelect = (
                <FormControl style={styles.ruleSelectForm}>
                    <InputLabel shrink>
                        Rule
                    </InputLabel>
                    <Select value={this.state.rule} onChange={this.handleChangeRule}>
                        {_.map(this.state.rules, (rule) => {
                            return (
                                <MenuItem key={rule.rule} value={rule.rule}>{rule.name}</MenuItem>
                            );
                        })
}
                    </Select>
                </FormControl>
            );
        }

        return RuleSelect;
    }

    render() {
        console.log("SET EDIT RENDER", this.state);
        var inputWidth = 50;
        var marginLeft = 10;

        return (
            <div>

                <Tabs fullWidth value={this.state.activeTab} onChange={this.onTabChanged}>
                    <Tab style={styles.settingsTab} label="Automaton"/>
                    <Tab style={styles.settingsTab} label="Editor"/>
                </Tabs>
                <IF isTrue={() => this.state.activeTab === 0}>
                    <Grid container spacing={0} justify="center" alignItems="center">
                        <FormControl>
                            <InputLabel shrink>
                                Family
                            </InputLabel>
                            <Select value={this.state.settings.family} onChange={this.handleChangeFamily}>
                                <MenuItem value={"gl"}>Game Of Life</MenuItem>
                                <MenuItem value={"bb"}>Brians Brain</MenuItem>
                            </Select>
                        </FormControl>
                        {this.renderRules()}
                        <TextField
                            label="Edit rule"
                            value={this.state.settings.params}
                            onChange={this.handleChange("params")}
                            margin="normal"
                            style={styles.ruleEdit}/>
                    </Grid>

                    <Grid
                        container
                        spacing={0}
                        justify="center"
                        style={{
                        marginTop: 10,
                        textAlign: "center",
                        marginLeft: "10%",
                        maxWidth: "80%"
                    }}>
                        <this.state.info/>
                    </Grid>
                    <Grid
                        container
                        spacing={0}
                        justify="center"
                        style={{
                        marginTop: 10
                    }}>
                        <Grid container spacing={0} justify="center"></Grid>
                    </Grid>
                </IF>
                <IF isTrue={() => this.state.activeTab === 1}>
                    <Grid container spacing={0} justify="center" style={styles.paletteGrid}>

                        <Grid container spacing={0} justify="center" alignItems="center">
                            <IconButton
                                variant="outlined"
                                style={styles.toolButton}
                                onClick={this.handleAction("randomize")}>
                                <ShuffleIcon/>
                            </IconButton>
                            <IconButton
                                variant="outlined"
                                style={styles.toolButton}
                                onClick={this.handleAction("clear")}>
                                <ClearIcon/>
                            </IconButton>
                            <TextField
                                label="Cell side"
                                value={this.state.settings.cellSize}
                                onChange={this.handleChange("cellSize")}
                                margin="normal"
                                type="number"
                                style={styles.cellSide}/>
                            <TextField
                                label="Cell margin"
                                value={this.state.settings.cellMargin}
                                onChange={this.handleChange("cellMargin")}
                                margin="normal"
                                type="number"
                                style={styles.cellSide}/>
                            <TextField
                                label="Cols"
                                value={this.state.settings.gridWidth}
                                onChange={this.handleChange("gridWidth")}
                                margin="normal"
                                type="number"
                                style={styles.defaultInput}/>
                            <TextField
                                label="Rows"
                                value={this.state.settings.gridHeight}
                                onChange={this.handleChange("gridHeight")}
                                margin="normal"
                                type="number"
                                style={styles.defaultInput}/>
                            <TextField
                                label="Animation delay (ms)"
                                value={this.state.settings.interval}
                                onChange={this.handleChange("interval")}
                                margin="normal"
                                type="number"
                                style={styles.cellSide}/>
                            <FormControlLabel
                                control={< Checkbox checked = {
                                this.state.settings.showValues === true
                            }
                            onChange = {
                                this.handleCheckbox("showValues")
                            } />}
                                label="Show values"/>

                        </Grid>
                        <PaletteEditor settings={this.props.settings}/>
                    </Grid>
                </IF>
            </div>
        );
    }
}

export default SettingsScreen;
