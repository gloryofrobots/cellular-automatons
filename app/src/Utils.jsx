import Color from "color";

function isArraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }

    return true;
}

function determineTextColor(c) {
    var color = Color(c);
    // var contrast =  color.red*0.299 + color.green*0.587 + color.blue*0.114;
    // if (contrast > 186){
    if(color.isDark()){
        return "#ffffff";
    } else {
        return "#000000";
    }
}

export {determineTextColor, isArraysEqual}; 