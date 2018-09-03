import React from 'react';

function rule(name, rule) {
    return {name: name, rule: rule};
}

const EmptyInfo = () => (<div> </div>);

const GLInfo = () => {
    return (
        <div>
            {
                `Type: outer totalistic, 1 bit
                "Life" rules family allows to play the widest-known Cellular Automata, including the mythical Conway's Life.
                MCell contains many built-in "Life" rules. Many of them come from an excellent 32-bit Windows Life program - Life32 by Johan Bontes. They were collected and described by Alan Hensel, an author of the fastest Java applet running Conway's Life patterns.
                Note that the count of colors (states) has no influence on next generations, because Life is a one-bit family of rules.
                Life rules notation
                Life rules are defined in the "S/B" form, where:
                S - defines counts of alive neighbors necessary for a cell to survive,
                B - defines counts of alive neighbors necessary for a cell to be born.`
            }
        </div>
    );
}

const ATTRS = {
    "bb": {
        info: EmptyInfo,
        rules: []
    },
    "gl": {
        info: GLInfo,
        rules: [
            rule("Conway's Life", "23/3"),
            rule("2x2", "125/36"),
            rule("34Life", "34/34"),
            rule("Amoeba", "1358/357"),
            rule("Assimilaion", "4567/345"),
            rule("Coagulations", "23567/378"),
            rule("Coral", "45678/3"),
            rule("Day&Night", "34678/3678"),
            rule("Seeds", "/2"),
            rule("Serviettes", "/234"),
            rule("WalledCities", "2345/45678")
        ]
    }
};

export default ATTRS;