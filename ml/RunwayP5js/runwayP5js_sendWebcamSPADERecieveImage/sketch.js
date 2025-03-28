
let pg;
let img;
let drawRecievedImage = false;

function setup() {
    createCanvas(640, 480);
    pixelDensity(1);
    pg = createGraphics(640, 480);
    pg.noStroke();
    frameRate(1);
}

function draw() {
    //pg.image(painting, 0, 0, width, height);
    pg.background(color('#1dc331'));
    pg.fill(color('#003996'));
    pg.ellipse(mouseX, mouseY, 200);
    image(pg, 0, 0);
    sendWebcamToRunway();
}

function sendWebcamToRunway() {

        var data = {
            "semantic_map": pg.canvas.toDataURL('image/jpeg')
        };
        httpPost("http://localhost:8000/query", data, function(response) {

            fetch('http://localhost:8000/data')
                .then(response => response.json())
                .then(outputs => {
                const { output } = outputs;
                console.log(output)
                
                if (drawRecievedImage) {
                //Draw directly on the canvas using tip from julsgud comment https://github.com/processing/p5.js/issues/561
                var c = document.getElementById("defaultCanvas0");
                var ctx = c.getContext("2d");
                var img = new Image();
                img.onload = function() { ctx.drawImage(img, 0, 0, width/2, height/2); };
                img.src = output;
                    }
                                

            })
        })
}
