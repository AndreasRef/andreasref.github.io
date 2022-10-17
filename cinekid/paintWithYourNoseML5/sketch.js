let video;
let poseNet;
let poses = [];
let skeletons = [];

let pg;
let noseX;
let noseY;

let pNoseX = 0;
let pNoseY = 0;

let lerpStability = 0.1;

let clearCounter = 0;

function setup() {
  createCanvas(1920, 1080);
  video = createCapture(VIDEO);
  video.size(640, 480);

  pixelDensity(1);
  pg = createGraphics(width, height);

  //change the options to make model run faster
  var options = {
    architecture: 'MobileNetV1',
    imageScaleFactor: 0.3,
    outputStride: 16,
    flipHorizontal: false,
    minConfidence: 0.5,
    scoreThreshold: 0.5,
    nmsRadius: 20,
    detectionType: 'single',
    inputResolution: 161,
    multiplier: 0.5,
    quantBytes: 2,
  };

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, options, modelReady);

  poseNet.on('pose', function (results) {
    poses = results;
  });

  // Hide the video element, and just show the canvas
  video.hide();
}

function draw() {
  const flippedVideo = ml5.flipImage(video);
  image(flippedVideo, 0, 0, width, height);
  //image(video, 0, 0, width, height);

  image(pg, 0, 0);

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  //drawSkeleton();
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < min(poses.length, 1); i++) {
    // For each pose detected, loop through all the keypoints
    for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = poses[i].pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        if (j == 0) {
          noseX = keypoint.position.x * (width / video.width);
          noseY = keypoint.position.y * (height / video.height);

          //cut from here
          pg.stroke(230, 80, 0);
          pg.strokeWeight(20);

          //Attempt at HSB color
          pg.colorMode(HSB, 1000);
          pg.stroke(frameCount % 1000, 1000, 1000);


          if (pNoseX != 0 && pNoseY != 0) {
            noseX = lerp(pNoseX, noseX, lerpStability);
            noseY = lerp(pNoseY, noseY, lerpStability);
            pg.line(width - noseX, noseY, width - pNoseX, pNoseY); //flipped
          }

          if (dist(pNoseX, pNoseY, noseX, noseY) > 5) {
            clearCounter = 0;
          }
          pNoseX = noseX;
          pNoseY = noseY;
        }
      }
    }
  }




  //console.log("n poses: " + poses.length) 
  clearCounter++;
  if (clearCounter > 500) {
    pg.clear();
    clearCounter = 0;
  }
  //console.log(clearCounter)

}

// The callback that gets called every time there's an update from the model
function gotPoses(results) {
  poses = results;
}

function keyPressed() {
  pg.clear();
}
function mousePressed() {
  pg.clear();
  let fs = fullscreen();
  fullscreen(!fs);
}

function modelReady() {
  //select('#status').html('model Loaded');
  console.log("modelReady");
}