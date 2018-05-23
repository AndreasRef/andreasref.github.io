var mic;
var micLevelLerped = 0; 

function setup() {
  createCanvas(400, 400);

  // Create an Audio input
  mic = new p5.AudioIn();

  // start the Audio Input.
  // By default, it does not .connect() (to the computer speakers)
  mic.start();
}

function draw() {
  background(200);

  // Get the overall volume (between 0 and 1.0)
  var vol = mic.getLevel();
    micLevelLerped = lerp(micLevelLerped, vol, 0.15);
    
  ellipse(width/2, height/2, micLevelLerped*400);
}
