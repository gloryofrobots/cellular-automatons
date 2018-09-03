
let CONF = {};
CONF.GRID_WIDTH = 10;
CONF.GRID_HEIGHT= 10;
CONF.CANVAS_WIDTH = 600;
CONF.CANVAS_HEIGHT = 600;
CONF.INTERVAL = 100;
CONF.COUNT_STEPS = -1;
// CONF.cell_width = 30;
// CONF.cell_height = 30;
CONF.CELL_MARGIN = 5;
CONF.FAMILY = "gl";
CONF.PARAMS = "23/3";
CONF.PALETTE = [
    '#4D4D4D', '#999999', '#FFFFFF', '#F44E3B',
    '#FE9200', '#FCDC00', '#DBDF00', '#A4DD00',
    '#68CCCA', '#73D8FF', '#AEA1FF', '#FDA1FF',
    '#333333', '#808080', '#cccccc', '#D33115',
    '#E27300', '#FCC400', '#B0BC00', '#68BC00',
    '#16A5A5', '#009CE0', '#7B64FF', '#FA28FF',
    '#000000', '#666666', '#B3B3B3', '#9F0500',
    '#C45100', '#FB9E00', '#808900', '#194D33',
    '#0C797D', '#0062B1', '#653294', '#AB149E'
]

function rule(name, rule) {
    return {name:name, rule:rule};
}
CONF.RULES = {
    "bb":[],
    "gl": [
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
        rule("WalledCities", "2345/45678"),
    ]
}

Object.freeze(CONF);

export default CONF;


