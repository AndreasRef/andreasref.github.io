
let pg;
let video;
let img;

let painting;

function preload() {
    painting = loadImage("spade.png")
}

function setup() {
    createCanvas(640, 480);
    pixelDensity(1);
    pg = createGraphics(640, 480);
    video = createCapture(VIDEO);
    video.hide();
    frameRate(1);
}


function draw() {
    pg.image(painting, 0, 0, width, height);
    image(pg, 0, 0);
    sendWebcamToRunway();
    //img.position(0,0);
    
}

function sendWebcamToRunway() {
    var data = {
        "semantic_map": pg.canvas.toDataURL('image/jpeg')
    };
    //Pay attention to the localhost port in Runway!
    httpPost("http://localhost:8000/query", data, function(response) {

        fetch('http://localhost:8000/data')
            .then(response => response.json())
            .then(output => {
            const { results } = output;
            console.log(output)
            
            img = createImage(output);

        })
    })
}