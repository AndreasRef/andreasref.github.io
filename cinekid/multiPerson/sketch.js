//See this alternative as well by Sabrina for loading blazepose from mediaPipe instead of from tensorflow: https://glitch.com/~p5js-mediapipe-blazepose

/* Holde styr på ansigterne...

Gør det noget? 
Kan du ikke bare starte forfra hver gang der er et skift i antal ansigter? 
Og så ikke tegne noget i det øjeblik skiftet sker + i det øjeblik skitsen starter?
*/

let capture
let blazeFaceModel;
let predictions;

let noses = new Array(100);
let pNoses = new Array(100);

let pg;

//create an array with a color pallete for the brush colors
let colors = [];

let numberOfNoses = 0;
let prevNumberOfNoses = 0;

// make preload function asynchronous to await the blazeface.load()
async function preload() {
  blazeFaceModel = await blazeface.load();
}

function setup() {
  createCanvas(640, 480);
  
  capture = createCapture(VIDEO);
  capture.hide();  

  pg = createGraphics(width, height);
  //resetNoses();

  colors = [
    color("#cc282d"),
    color("#cca15d"),
    color("#bd5aa2"),
    color("#5fa2c4"),
    color("#cc1f2e")
  ];
}


//make all pNoses equal to 0, 0
function resetNoses() {
    for (let i = 0; i < pNoses.length; i++) {
        pNoses[i] = [0, 0];
 }
}

// asynchronous function to load the predictions
async function loadPredictions() {
  if(capture.loadedmetadata) {
    predictions = await blazeFaceModel.estimateFaces(capture.elt);
  }
}

function draw() {
  background(255);
  
  image(capture, 0, 0);
  image(pg, 0, 0, width, height);
  pg.stroke(230, 80, 0);
  pg.fill(230, 80, 0);
  pg.strokeWeight(5);
  
  text(frameRate(), 10, 10)
  
  loadPredictions(); // =>loads the predictions into the predictions array
  
  /*
  issues: 
  it does not remember the faces from the previous frame
  possible solution: https://github.com/shiffman/Face-It/blob/master/OpenCV/FaceDetectMemory/FaceDetectMemory.pde
  */

  if (predictions != null && predictions.length > 0) {
    numberOfNoses = predictions.length;
    if (numberOfNoses != prevNumberOfNoses) {
      console.log("number of noses: " + numberOfNoses); // this works, but not for 0 noses
      //clear the array of noses
      //noses = [];
      //pNoses = [];
      
    } else {
      //timeOut++;
    for (let i = 0; i < predictions.length; i++) {
      const keypoints = predictions[i].landmarks;
      noses[i] = keypoints[2];
      
      //const lerpedNoseX = lerp(pNoses[i][0], noses[i][0], 0.1);
      //const lerpedNoseY = lerp(pNoses[i][1], noses[i][1], 0.1);
      if (noses[i] && pNoses[i]) {
        //Lerping the nose position
        //noses[i][0] = lerp(pNoses[i][0], noses[i][0], 0.4);
        //noses[i][1] = lerp(pNoses[i][1], noses[i][1], 0.4);

        if (noses[i][0] > 0 && noses[i][1] > 0 && pNoses[i][0] > 0 && pNoses[i][1] > 0 && dist(noses[i][0], noses[i][1], pNoses[i][0], pNoses[i][1]) < 60) {
          pg.line(noses[i][0], noses[i][1], pNoses[i][0], pNoses[i][1]);
        }
      }
      
      //pg.ellipse(noses[i][0], noses[i][1], 20, 20);
      pNoses[i] = noses[i];
    }
  }
}
  prevNumberOfNoses = numberOfNoses;
}


function mousePressed() {
    pg.clear();
}