import _ from "underscore";
import ATTRS from "./Attrs"
import Conf from "./Conf"


var DEFAULT = {
    gridWidth:10,
    gridHeight:10,
    cellSize:50,
    cellMargin:1,
    interval:100,
    family:"gl",
    params:"23/3",
    currentValue:0,
    showValues:false,
    activeTab:0,
    name:"new-automaton",
    palette: [
        "#cccccc", "#669999", "#9c27b0", "#673ab7",
        "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4",
        "#009688", "#4caf50", "#ff0000", "#00ffff", 
        '#4D4D4D', '#999999', '#FFFFFF', '#F44E3B',
        '#FE9200', '#FCDC00', '#DBDF00', '#A4DD00',
        '#68CCCA', '#73D8FF', '#AEA1FF', '#FDA1FF',
        '#333333', '#808080', '#cccccc', '#D33115',
        '#E27300', '#FCC400', '#B0BC00', '#68BC00',
    ],
    grid: []
};

// default cellular automaton attributes

class Settings {
    constructor(onUpdate){
        this.default = _.clone(DEFAULT);
        this.settings = undefined;
        this._onUpdate = onUpdate;
        this.onUpdate = this.onUpdate.bind(this);
        this.updated = new Set();
        this.maxValue = 0;
        this.load();
    }

    getDefaultName() {
        var re = /\//gi;
        var family = this.get("family")
        var params = this.get("params").replace(re, "_");
        return `${family}_${params}`;
    }

    onAutomatonChanged(automaton) {
        this.maxValue = automaton.getMaxValue();
        this.updated.clear();
        this._onUpdate();
    } 

    getMaxValue() {
        return this.maxValue;
    }

    onUpdate() {
        console.log("ON UPDATE", this.updated);
        this._onUpdate();
        this.updated.clear();
    }

    updatedKeys() {
        var arr = [];
        for (let item of this.updated){
            arr.push(item);
        }

        console.log("UPDATED KEYS", arr);
        return arr;
        // return _.toArray(this.updated.values());
    }

    serialize(cells) {
        this.settings["grid"] = cells.cells; 
        return JSON.stringify(this.settings);
    }

    unserialize(data) {
        var obj;
        try {
            obj = JSON.parse(data);
            _.each(this.default, (val, key) => {
                var newVal = obj[key];
                if(typeof newVal !== typeof val) {
                    throw new Error();
                }
            });
        } catch (e) {
            return false;
        }


        this.settings = obj;
        console.log("UNSERIALIZE", this.settings);
        this.updated.clear();
        this.updated.add("*")
        this.save();
        this.onUpdate();
        return true;
    }

    setDefaultValues() {
        localStorage.clear();
        this.load();
        this.save();
        this.updated.clear();
        this.updated.add("*")
        this.onUpdate();
    }

    strToBool(val) {
        if(val === "true") {
            return true;
        } else if (val === "false") {
            return false;
        }

        console.error("Invalid Boolean in storage");
        return undefined;
    }

    load() {
        // localStorage.clear();
        this.settings =
            _.mapObject(this.default, (val, key) => {
                var cache = localStorage.getItem(key);
                // console.log("<<", key, val, cache);
                if(_.isUndefined(cache) || _.isNull(cache)) {
                    return val;
                }


                if (_.isNumber(val)){
                    cache = parseInt(cache, 10);
                    if (_.isNaN(cache)) {
                        console.error("Invalid number in storage");
                        return 0;
                    }
                    return cache;
                } else if(_.isBoolean(val)) {
                    return this.strToBool(cache);
                } else if(_.isArray(val)) {
                    cache = JSON.parse(cache);
                    if (_.isUndefined(cache)) {
                        console.error("Invalid array in storage");
                        return [];
                    }
                    return cache;
                } else {
                    return cache;
                }
        });
        // console.log("LOAD SETTINGS", this.settings);
    }

    toObject() {
        return _.clone(this.settings);
    }

    isArray(key) {
        var old = this.default[key];
        if (_.isUndefined(old)){
            console.error("Invalid key");
            return false;
        }
        return _.isArray(old);

    }


    isBoolean(key) {
        var old = this.default[key];
        if (_.isUndefined(old)){
            console.error("Invalid key");
            return false;
        }
        return _.isBoolean(old);
    }

    isNumber(key) {
        var old = this.default[key];
        if (_.isUndefined(old)){
            console.error("Invalid key");
            return false;
        }
        return _.isNumber(old);
    }

    setColor(id, val) {
        this.settings.palette[id] = val;
        this.updated.add("palette");
        this.triggerSave();
    }
    
    setString(key, val) {
        var newVal = val;
        if (this.isNumber(key)) {
            newVal = parseInt(newVal, 10);
            if (_.isNaN(newVal)) {
                console.error("Invalid settings number", val);
                return;
            }
        } else if(this.isBoolean(key)) {
            newVal = this.strToBool(newVal);
        }
        this.set(key, newVal);
    }

    setMany(data) {
        _.each(data, (value, key)=>{
            this._set(key, value);
        });
    }

    _set(key, val) {
        this.settings[key] = val;
        this.updated.add(key);
        console.log("SET", key, val, this.updated);
    }

    set(key, val) {
        this._set(key, val);
        this.triggerSave();
    }

    setStrings(settings) {
        this.settings = _.mapObject(this.default, (val, key) => {
            var newVal = settings[key];
            if (_.isUndefined(newVal)){
                console.error("Missing setting", key);
                return val;
            }
            if (this.isNumber(key)) {
                newVal = parseInt(newVal, 10);
                if (_.isNaN(newVal)) {
                    console.error("Invalid settings number");
                    return val;
                }
            } else if(this.isBoolean(key)) {
                return this.strToBool(newVal);
            }
            return newVal;
        });
        this.save();
        //TODO REMOVE AFTER TESTING 
        this.load();
        this.onUpdate();
    }

    getRules(family) {
        return ATTRS[family].rules;
    }

    getRule(family) {
        var rules = this.getRules(family);
        if (rules.length === 0){
            return undefined;
        }
        return rules[0].rule;
    }
   
    getInfo(family) {
        return ATTRS[family].info;
    }

    get(key) {
        return this.settings[key];
    }

    triggerSave() {
        if(!_.isUndefined(this.saveInterval)) {
            clearTimeout(this.saveInterval);
        }
        this.saveInterval = setTimeout(
            () => {
                this.save();
                this.load();
                this.onUpdate();
            },
            Conf.saveSettingsTimeout
        );
    }

    saveAutomatonGrid(cells){
        this.settings["grid"] = cells.cells; 
        //saving directly only one value to speed things up
        var data = JSON.stringify(this.settings.grid);
        localStorage.setItem("grid", data);
    }

    save() {
        localStorage.clear();
        _.each(this.settings, (val, key) => {
            // console.log("!!",key, val);
            if(this.isArray(key)) {
                val = JSON.stringify(val);
            }
            localStorage.setItem(key, val);
        });
    }
}

export default Settings;