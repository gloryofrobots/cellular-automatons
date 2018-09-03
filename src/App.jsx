import React from 'react';

import _ from "underscore";

// Needed for onTouchTap
// // http://stackoverflow.com/a/34015469/988941
import injectTapEventPlugin from 'react-tap-event-plugin';

import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {getTheme} from "./Theme";
// import Drawer from '@material-ui/core/Drawer';
// import Grid from '@material-ui/core/Grid';
// import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import ClippedDrawer from './ClippedDrawer';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';


import Settings from "./Settings";
import SettingsScreen from "./SettingsScreen";
import SimulationScreen from './SimulationScreen';
import AppMenu from "./AppMenu";

import {
  Route,
  withRouter,
  // Link,
  BrowserRouter as Router,
} from 'react-router-dom';

import './App.css';


injectTapEventPlugin();


class App extends React.Component {
    constructor(props){
        super(props);
        this.history = props.history;

        _.bindAll(this,
             "onChangeSettings", "onAction", "onAutomatonChanged"
        )

        this.settings = new Settings(this.onChangeSettings);
        this.sim = React.createRef();
        this.state = {
            currentValue:0,
            settings:this.settings.toObject(),
            updated:this.settings.updatedKeys()
        };
    }

    componentWillMount(){
    }

    componentWillUnmount(){
    }

    onChangeSettings(){
        console.log("CHANGE SETTINGS", this.settings, this.settings.updated, this.settings.updatedKeys());
        this.setState({
            settings:this.settings.toObject(),
            updatedSettings:this.settings.updatedKeys()
        });
    }

    onAction(action) {
        // var sim = docum
        var sim = this.sim.current;
        if(action === "clear") {
            sim.clear();
        } else if(action === "randomize") {
            sim.randomize();
        }
    }

    onAutomatonChanged(automaton){
        this.settings.saveAutomaton(automaton);
    }

                //   <Typography variant="title" color="inherit" className="app-bar" >
                //     Cellular Automatons
                //   </Typography>
    render() {
        return (
          <MuiThemeProvider theme={getTheme()}>
                <Grid 
                    container 
                    spacing={0} 
                    justify="center" 
                    alignItems="center"
                    style={{background:"#333333"}}
                >
                    <AppMenu settings={this.settings} />
                </Grid>
                <Router>
                      <main>
                       <SettingsScreen settings={this.settings} onAction={this.onAction}/>
                        <hr />
                        <SimulationScreen
                          ref={this.sim}
                          onAutomatonChanged={this.onAutomatonChanged}
                          settings={this.state.settings}
                          updatedSettings={this.state.updatedSettings}/>


                        <Route path="/" render={(props)=> (<div></div>)}/>
                    </main>
                </Router>
                <footer className="footer">
                </footer>
         </MuiThemeProvider>
        );
    }
}

export default withRouter(App);
