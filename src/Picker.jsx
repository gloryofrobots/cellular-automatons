import React from 'react';
import reactCSS from 'reactcss';
import { SketchPicker } from 'react-color';
import _ from "underscore";
import Button from '@material-ui/core/Button';
import {IF} from "./Lang";
import {determineTextColor} from "./Utils";

class Picker extends React.Component {
    constructor(props){
        super(props);
        this.onChange = props.onChange;
        this.state = {
            displayColorPicker: false,
            color: props.color || '#fff'
        };
    }


    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker });
    };

    handleClose = () => {
        this.setState({ displayColorPicker: false });
    };

    handleChange = (color) => {
        // console.log("color", color);
        this.setState({ color: color.hex });
        this.onChange(color.hex);
    };

    componentDidUpdate() {
        if(this.state.color=== this.props.color) {
            return;
        }

        this.setState({
            color: this.props.color
        });
    }

    render() {
        console.log("PICKER RENDER", this.state.color);
        const styles = reactCSS({
        'default': {
            button: {
                color: `${determineTextColor(this.state.color)}`,
                backgroundColor: `${this.state.color}`,
                '&:hover': {
                    backgroundColor: "#ccc"
                },
                width:"100%",
                minWidth:36,
                minHeight:36
            },
            color: {
            borderRadius: '2px',
            background: `${this.state.color}`
            },
            swatch: {
            padding: '5px',
            background: '#fff',
            borderRadius: '1px',
            boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
            display: 'inline-block',
            cursor: 'pointer'
            },
            popover: {
            position: 'absolute',
            zIndex: '2'
            },
            cover: {
            position: 'fixed',
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px'
            }
        }
        });

        return (
        <div>
            <Button style={ styles.button } onClick={ this.handleClick } > Change  color</Button>
            <IF isTrue={()=>this.state.displayColorPicker === true}>
            <div style={ styles.popover }>
            <div style={ styles.cover } onClick={ this.handleClose }/>
            <SketchPicker
                    disabledAlpha={true}
                    color={ this.state.color }
                    onChangeComplete={ this.handleChange }
                    />
            </div>
            </IF>
        </div>
        );
    }
}

        // <div style={ styles.swatch } onClick={ this.handleClick }>
        //   <div style={ styles.color } />
        // </div>
export default Picker;