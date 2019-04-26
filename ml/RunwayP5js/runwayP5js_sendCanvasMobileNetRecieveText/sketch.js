//Original sketch by https://github.com/b2renger, modified by AndreasRef
let pg;

let currentPrediction = "Draw using the mouse, press s to send canvas to Runway, press e to clear canvas";

function setup() {
    createCanvas(800, 600);
    pixelDensity(1);
    
    pg = createGraphics(800, 600);
    pg.pixelDensity(1);
    pg.background(255);
    pg.fill(0, 255, 0);
    
    imageMode(CENTER);
    textAlign(CENTER);
}


function draw() {
    background(0);
    image(pg, width/2, height/2);
    text(currentPrediction, width/2, height-50);
}

function mouseDragged() {
    let x = map(mouseX, 0, width, 0, pg.width);
    let y = map(mouseY, 0, height, 0, pg.height);

    pg.push();
    pg.ellipse(x, y, 25, 25);
    pg.pop();
}

function keyTyped() {
    if (key === 's') {
        console.log(pg.canvas.toDataURL('image/jpeg'));

        var data = {
            "image": pg.canvas.toDataURL('image/jpeg')
        };
        //Pay attention to the localhost port in Runway!
        httpPost("http://localhost:8001/query", data, function(response) {
            
            fetch('http://localhost:8001/data')
                .then(response => response.json())
                .then(output => {
                const { results } = output;

                //console.log(output);

                currentPrediction = output.results[0].className;
            })
        })
    }
    if (key === 'e') {
        pg.background(255);
    }
}