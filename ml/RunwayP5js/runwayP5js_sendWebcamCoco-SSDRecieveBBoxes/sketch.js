let pgCam;
let pgOutputs;
let video;

function setup() {
    createCanvas(640, 480);
    pixelDensity(1);

    pgCam = createGraphics(640, 480);
    video = createCapture(VIDEO);
    video.hide();
    
    pgOutputs = createGraphics(640, 480);
    
    textAlign(CENTER);
    textSize(24);
    frameRate(5);
}


function draw() {
    pgCam.image(video, 0, 0);
    image(pgCam,0,0);
    image(pgOutputs, 0, 0);
    sendWebcamToRunway();
}

function sendWebcamToRunway() {
    var data = {
        "image": pgCam.canvas.toDataURL('image/jpeg')
    };
    //Pay attention to the localhost port in Runway!
    httpPost("http://localhost:8000/query", data, function(response) {

        fetch('http://localhost:8000/data')
            .then(response => response.json())
            .then(output => {
            const { results } = output;

            //console.log(output);
            
            pgOutputs.clear();
            
            pgOutputs.noFill();
            
            for (let i = 0; i<output.results.length; i++) {
                console.log(output.results[i].class);
                
                let x = output.results[i].bbox[0];
                let y = output.results[i].bbox[1];
                let w = output.results[i].bbox[2];
                let h = output.results[i].bbox[3];
                let className = output.results[i].class;
                let score = output.results[i].score;
                
                pgOutputs.stroke(0,255,0);
                pgOutputs.strokeWeight(score*10-5);
                pgOutputs.rect(x,y,w,h);
                
                pgOutputs.strokeWeight(1);
                pgOutputs.stroke(255);
                pgOutputs.text(className, x+7, y+15);
            }
        })
    })
}