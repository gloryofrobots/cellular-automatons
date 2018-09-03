import { createMuiTheme } from '@material-ui/core/styles';

function getTheme() {
    let theme = {
        "palette": {
            "type":"dark",
            "primary1Color": "#37474f",
            "canvasColor": "#212121",
            "primary2Color": "#546e7a",
            "accent2Color": "#c5cae9",
            "accent1Color": "#7986cb",
            "textColor": "#ffffff",
            "secondaryTextColor": "#ffffff",
            "alternateTextColor": "#90a4ae",
            "accent3Color": "#8c9eff"
        }
    };
    return createMuiTheme(theme);
}

export {getTheme};
