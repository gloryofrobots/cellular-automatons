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
import Typography from '@material-ui/core/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Conf from "./Conf";
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
    nameEdit: {
        width: "50%"
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
        _.bindAll(this, "onTabChanged", "onSetDefaults", "onToggleEditor", "handleChangeRule", "handleChangeFamily");
    }

    static getDerivedStateFromProps(props, state) {
        var settings = props.settings;
        var family = settings.get("family");
        return {
            settings: settings.toObject(),
            rules: settings.getRules(family),
            rule: settings.getRule(family),
            info: settings.getInfo(family)
        };
    }

    onToggleEditor() {
        this.setState({
            editEnabled: !this.state.editEnabled
        });
    }

    handleChangeFamily(event) {
        var family = event.target.value;
        var settings = this.props.settings;
        var rules = settings.getRules(family);
        var rule = settings.getRule(family);
        var info = settings.getInfo(family);

        settings.setString("family", family);
        settings.setMany({
            grid: [],
            currentValue: 0
        });
        this.setState({
            rules: rules,
            rule: rule,
            info: info,
            settings: settings.toObject()
        });
    }
    handleChangeRule(event) {
        this.setState({
            rule: event.target.value,
            settings: this.cloneSettings({"params": event.target.value})
        });
        this
            .props
            .settings
            .setString("params", event.target.value);
    }

    cloneSettings(data) {
        var settings = _.clone(this.state.settings);
        _.each(data, (val, key) => {
            settings[key] = val;
        })
        // console.log("upfated", settings);
        return settings;
    }

    handleChangeNumber(name, minValue, maxValue) {
        return (event) => {
            var val = event.target.value;
            var val = parseInt(val, 10);
            if (val > maxValue) {
                val = maxValue;
            } else if(val < minValue) {
                val = minValue;
            }
            this
                .props
                .settings
                .set(name, val);
            this.setState({
                settings: this.cloneSettings({[name]: val})
            });
        };
    }
    handleChange(name) {
        return (event) => {
            this
                .props
                .settings
                .setString(name, event.target.value);
            this.setState({
                settings: this.cloneSettings({[name]: event.target.value})
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
                settings: this.cloneSettings({[name]: event.target.checked})
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
                        Preset
                    </InputLabel>
                    <Select value={this.state.rule} onChange={this.handleChangeRule}>
                        {_.map(this.state.rules, (rule) => {
                            return (
                                <MenuItem key={rule.rule} value={rule.rule}>{`${rule.rule} (${rule.name})`}</MenuItem>
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
                        <TextField
                            label="Name"
                            value={this.state.settings.name}
                            onChange={this.handleChange("name")}
                            margin="normal"
                            style={styles.nameEdit}/>
                    </Grid>
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
                        <TextField
                            label="Params"
                            value={this.state.settings.params}
                            onChange={this.handleChange("params")}
                            margin="normal"
                            style={styles.ruleEdit}/>
                        {this.renderRules()}
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
                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={< ExpandMoreIcon />}>
                                <Typography>Description</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                    <this.state.info/>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
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

                            <TextField
                                label="Cell side"
                                value={this.state.settings.cellSize}
                                onChange={this.handleChangeNumber("cellSize", 0, Conf.maxCellSize)}
                                margin="normal"
                                type="number"
                                style={styles.cellSide}/>
                            <TextField
                                label="Cell margin"
                                value={this.state.settings.cellMargin}
                                onChange={this.handleChangeNumber("cellMargin", 0, Conf.maxCellSize)}
                                margin="normal"
                                type="number"
                                style={styles.cellSide}/>
                            <TextField
                                label="Cols"
                                value={this.state.settings.gridWidth}
                                onChange={this.handleChangeNumber("gridWidth",0, Conf.maxGridSide)}
                                margin="normal"
                                type="number"
                                style={styles.defaultInput}/>
                            <TextField
                                label="Rows"
                                value={this.state.settings.gridHeight}
                                onChange={this.handleChangeNumber("gridHeight", 0, Conf.maxGridSide)}
                                margin="normal"
                                type="number"
                                style={styles.defaultInput}/>
                            <TextField
                                label="Animation delay (ms)"
                                value={this.state.settings.interval}
                                onChange={this.handleChangeNumber("interval",0, Conf.maxDelay)}
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
