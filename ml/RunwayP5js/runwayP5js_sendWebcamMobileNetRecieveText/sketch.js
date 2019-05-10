//Original sketch by https://github.com/b2renger, modified by AndreasRef
let pg;

let currentPrediction = "Draw using the mouse, press s to send canvas to Runway, press e to clear canvas";

let video;

function setup() {
    createCanvas(640, 480);
    pixelDensity(1);

    pg = createGraphics(640, 480);
    video = createCapture(VIDEO);
    video.hide();
    textAlign(CENTER);
    textSize(24);
    frameRate(5);
}


function draw() {
    pg.image(video, 0, 0);
    image(pg,0,0);
    fill(0,255,0);
    text(currentPrediction, width/2, height-50);
    sendWebcamToRunway();
}

function sendWebcamToRunway() {
    var data = {
        "image": pg.canvas.toDataURL('image/jpeg')
    };
    //Pay attention to the localhost port in Runway!
    httpPost("http://localhost:8002/query", data, function(response) {

        fetch('http://localhost:8002/data')
            .then(response => response.json())
            .then(output => {
            const { results } = output;

            //console.log(output);

            currentPrediction = output.results[0].className;
        })
    })
}