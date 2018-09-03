import React from 'react';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';

import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

class Feedback extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            vertical: 'top',
            horizontal: 'center',
            duration: 2000,
            message: props.message || ""
        };
    }

    message(msg, duration) {
        this.setState({
            message: msg || "",
            duration: duration || 2000
        });
    }

    handleClick = state => () => {
        this.setState({
            open: true,
            ...state
        });
    };

    handleClose = () => {
        this.setState({message: ""});
    };

    render() {
        const {vertical, horizontal, message, duration} = this.state;
        const Close = (
            <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={this.handleClose}>
                <CloseIcon/>
            </IconButton>
        )
        return (
            <Snackbar
                anchorOrigin={{
                vertical,
                horizontal
            }}
                open={message !== ""}
                autoHideDuration={duration}
                onClose={this.handleClose}
                action={Close}
                ContentProps={{
                'aria-describedby': 'message-id'
            }}
                message={<span id = "message-id" > {message} </span>}
            />
        );
    }
}

export default Feedback;