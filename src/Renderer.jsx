
class Renderer {
    constructor(canvas, settings, onRender){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ctx.strokeStyle = "rgb(0, 0, 0)";
        this.onRender = onRender;

        this.setSettings(settings);
    }

    setSettings(settings) {
        this.showValues = settings.showValues;
        this.cellSize = settings.cellSize;
        this.cellSizeFull = settings.cellSize + settings.cellMargin;

        this.ctx.canvas.width = this.cellSizeFull * settings.gridWidth - settings.cellMargin;
        this.ctx.canvas.height = this.cellSizeFull * settings.gridHeight - settings.cellMargin;
        this.colors = settings.palette;
        console.log("CANVAS", this.ctx.canvas);
    }

    setPalette(c){
        this.colors = c;
    }

    begin(){
        this.ctx.beginPath();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // this.ctx.fillStyle = "#0c0";
        // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    end() {
        this.ctx.stroke();
        this.onRender();
    }

    drawText(x, y, txt) {
        var xp = x * this.cellSizeFull + this.cellSize/3;
        var yp = y * this.cellSizeFull + this.cellSize/1.5;
        this.ctx.fillStyle = "#000";
        this.ctx.font = `${this.cellSize/2}px Arial`;
        this.ctx.fillText(txt, xp, yp);
    }

    drawCell(x, y, cell) {
        var color = this.colors[cell];

        var xp = x * this.cellSizeFull;
        var yp = y * this.cellSizeFull;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(xp, yp, this.cellSize,this.cellSize);
        if(this.showValues) {
            this.drawText(x, y, cell);
        }
    }
}    

export default Renderer;