let currentPrediction = "";

function setup() {
  createCanvas(600,400);
  textSize(24);
  textAlign(CENTER);
}

function draw() {
 background(220);
 getResults();
 text(currentPrediction, width/2, height/2);
}

function getResults() {
  fetch('http://localhost:8000/data')
  .then(response => response.json())
  .then(outputs => {
    const { caption } = outputs;
      
    console.log(outputs);
  
    currentPrediction = outputs.caption;
  })   
}


