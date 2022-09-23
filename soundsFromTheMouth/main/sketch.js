// p5 matter based on examples from Bene: https://b-g.github.io/p5-matter-examples/docs/ 
/* To do:

***Freday 23. september***
Fix logik med lyd-arrays
Sæt en tidsramme for dem (linje 219)
*/

let debugMode = false;

//Sound analysis
let amplitude;
let level = 0;

let amplitudes = [];
let levels = [];

let amplitudePropellerSound;
let levelPropellerSound;

let compressor;

let groundColor;

let engine;
let world;
let ball;

let mouths = [];
let balls = [];
let ground;

let grounds = [];
let elevations = [0, 50, 100, 150, 100, 50, 0, 0];

let propeller;
let angle = 0;

let mouthImg;
let mouthImgClosed;

let soundArray = [];
let shuffleArrays = [];
let altSoundArray = [];
let originalSoundArray = [];
let soundArrayCounter = 0;

let facemesh;
let video;
let predictions = [];
let isMouthOpen = false;
let wasMouthOpen = false;

//Face keypoints
var leftEyeInnerX = 0;
var leftEyeInnerY = 0;
var rightEyeInnerX = 0;
var rightEyeInnerY = 0;

var mouthUpperInnerLipX = 0;
var mouthUpperInnerLipY = 0;

var mouthLowerInnerLipX = 0;
var mouthLowerInnerLipY = 0;

//For face graphics 
let mouthKeypoints = [];

let modelLoaded = false;
let mouthPG;

let penaltyCounter = 0;

let openMouthCounter = 0;

let nBlocksAndSounds = 7;
let propellerSound;

function preload() {
  //New array with the sounds in scale
  for (let j = 0; j< 2; j++) {
    shuffleArrays[j] = []; 
    for (let i = 0; i < nBlocksAndSounds; i++) {
      //soundArray.push(loadSound("scaleNumbered/" +i + '.mp3'));
      //soundArray.push(loadSound("OhEbMinor/" +i + '.mp3'));
      
      soundArray.push(loadSound("shortSounds/" +i + '.mp3'));
      //soundArray.push(loadSound("shortScaleNumbered/" +i + '.mp3'));
      soundArray[i].setVolume(0.6)
  
      //Test with alternative soundArray (for shuffling between them)
      //altSoundArray.push(loadSound("scaleNumbered/" +i + '.mp3'));
      //altSoundArray[i].setVolume(0.6)
  
      //shuffleArrays[j].push(loadSound("scaleNumbered/" +i + '.mp3'));
      if (j == 0) {
        shuffleArrays[j][i] = loadSound("scaleNumbered/" +i + '.mp3');
        shuffleArrays[j][i].setVolume(0.6)
      } else if (j == 1) {
        shuffleArrays[j][i] = loadSound("shortSounds/" +i + '.mp3');
        shuffleArrays[j][i].setVolume(0.6)
      }
      
  
      //shuffleArrays[1].push(loadSound("scaleNumbered/" +i + '.mp3'));
      //shuffleArrays[1][i].setVolume(0.6)
    }
  }
  
  originalSoundArray = soundArray;
  propellerSound = loadSound("av_sound.mp3")
  propellerSound.setVolume(0.6);

  mouthImg = loadImage('mouth100x100.png');
  mouthImgClosed = loadImage('closedMouth.jpg');
}

function setup() {
  const canvas = createCanvas(1920, 1080);
  if (!debugMode) {
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();  
    facemesh = ml5.facemesh(video, modelReady);
    facemesh.on("predict", (results) => {
      predictions = results;
    });
  }

  mouthPG = createGraphics(50, 50);
  mouthPGclosed = createGraphics(50, 50);

  mouthImgClosed.resize(50, 50);
  mouthImg.resize(50, 50);
  
  engine = Matter.Engine.create();
  world = engine.world;


//Pyramid ground setup
let _x = (640-200)/nBlocksAndSounds;
let extraY = 300;
let curveY = 35;

  const points = [
    { x: 0, y: 0 },
    { x: _x, y: -curveY},
    { x: _x, y: 0 },
    { x: _x, y: extraY },
    { x: 0, y: extraY },
  ];
  
  const points2 = [
    { x: 0, y: 0 },
    { x: -_x, y: -curveY},
    { x: -_x, y: 0 },
    { x: -_x, y: extraY },
    { x: 0, y: extraY },
  ];

  //Redo ground with multiple blocks instead of one
  for (let i = 0; i<nBlocksAndSounds; i++) {
        grounds[i] = new PolygonFromPoints(world, { x: 35*2 + i*_x, y: 410+i*(curveY), points: points2, color: 'grey' }, {
        isStatic: true, angle: PI * 0, label: 'ground' + i, restitution: 1.2
      });
     
    amplitude = new p5.Amplitude(0.5);
    amplitude.toggleNormalize(true);

    amplitudes[i] = new p5.Amplitude(0.5);
    amplitudes[i].setInput(soundArray[i]);
    //amplitude.smooth(1);
    amplitudes[i].toggleNormalize(true);

    amplitudePropellerSound = new p5.Amplitude(0.5);
    amplitudePropellerSound.setInput(propellerSound);
    amplitudePropellerSound.toggleNormalize(true);

    compressor = new p5.Compressor();
  }

  // propeller
  propeller = new Block(world,
    { x: 500, y: 250, w: 150, h: 30, color: 'white' },
    { isStatic: true, angle: angle, label: 'propeller', restitution: 0.5 }
  );

  // setup hit sound
  Matter.Events.on(engine, 'collisionStart', function (event) {
    const pairs = event.pairs[0];
    const bodyA = pairs.bodyA;
    const bodyB = pairs.bodyB;

    let idNumber = bodyB.id % soundArray.length;
    //console.log(idNumber);

    //New specific collision with each block
    for (let i = 0; i<grounds.length; i++) {
      if (bodyA.label == "ground"+i || bodyB.label == "ground"+i) {
        //Perhaps we could check the volume of each sound and only play if not too high?
        if (amplitudes[i].getLevel() < 0.4) soundArray[i].play();
        //We could perhaps also check the overall levels of all that is playing combined, and not play anything if they are too high?
      }
    }

    //Special sound when colliding with propeller
    if (bodyA.label === "propeller" || bodyB.label === "propeller") {
      //soundArray[0].play();
      propellerSound.play();
    }
  });

  // run the engine
  Matter.Runner.run(engine);

  //amplitude = new p5.Amplitude(0.5);
  //amplitude.toggleNormalize(true);

  setInterval(changeScale, 2000);

}

function changeScale() {
  console.log("change the musical scale");

  if (soundArrayCounter%2 == 0) {
    //soundArray = altSoundArray; 
  } else {
    //soundArray = originalSoundArray;
  }


  soundArray = shuffleArrays[soundArrayCounter%shuffleArrays.length];


  for (let i = 0; i<nBlocksAndSounds; i++) {
    amplitudes[i].setInput(soundArray[i]);
  }
  soundArrayCounter++;
}

function modelReady() {
  console.log("Model ready!");
  modelLoaded = true;
}

function draw() {
  background('black');
  push();
  translate(width,0)
  scale(-1920/640, 1080/480)
  
  if (!debugMode) {
    image(video, 0, 0);
    yawnScore();
  } else {
  }
  pop();

  if (debugMode) {
    fill(255);
    textAlign(CENTER, CENTER);
    text('DEBUG MODE\nClick mouse: New Body\nPress SPACE: Delete all\nPress f for full screen', width / 2, 50);
    textAlign(LEFT);
    text("frameRate: " + nf(frameRate(),0,2), 10, 10)
  }

  noStroke();
  fill(255);
  push();
  scale(1920/640, 1080/480)
  for (const mouth of mouths) {
    mouth.draw();
  }
  pop();
  
  push();
  scale(1920/640, 1080/480)
  for (let i = 0; i<grounds.length; i++) {
    colorMode(HSB)
    levels[i] = amplitudes[i].getLevel();
    grounds[i].attributes.color = color(i*(255/(nBlocksAndSounds+1)), levels[i]*255*1.2 + 20, levels[i]*255*0.8 + 40);
    grounds[i].draw();
  }


  // animate angle property of propeller
  Matter.Body.setAngle(propeller.body, angle);
  Matter.Body.setAngularVelocity(propeller.body, 0.25);
  angle -= 0.10;

  levelPropellerSound = amplitudePropellerSound.getLevel();
  propeller.attributes.color = color(7*255/(nBlocksAndSounds+1), levelPropellerSound*255*1.2 + 20, levelPropellerSound*255*0.8 + 40);

  propeller.draw();
  pop();

  //console.log(mouths.length, world.bodies.length); //Keep track of the number of mouths and if they are deleted okay?
  ////Delete offscreen bodies adapted from https://github.com/CodingTrain/website-archive/tree/main/Courses/natureofcode/5.19_matter_delete_bodies
  for (var i = 0; i < mouths.length; i++) {
    if (mouths[i].body.position.y > height + 100) {
      Matter.World.remove(world, mouths[i].body);
      mouths.splice(i, 1);
      i--;
    }
  }
  //console.log(amplitude.getLevel());

  if (!debugMode && !fullscreen()) {
    push();
    fill(0)
    textSize(24);
    text("Click mouse to enter full screen", 10 , 36)
    pop();
  }
}

function keyReleased() {
  if (key == ' ') {
    //Delete all bodies
    console.log("Delete all mouths");
    const bodies = Matter.Composite.allBodies(engine.world);
    Matter.World.clear(engine.world, bodies);

    //Delete all mouths
    mouths = []; 
  } else if (key == 'f') {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}

function addBody(_x, _y, _w, _h) {
  //Scale stuff
  if (debugMode) {
    const newMouth = new Block(world, { x: mouseX/(1920/640), y: mouseY/(1080/480), w: 50, h: 50, color: 'white', label: 'ball', image: mouthImgClosed }, { density: 0.0001 });
    mouths.push(newMouth);
  } else {
    //mouthPG = video.get(mouthKeypoints[0], mouthKeypoints[1], _w, _h);    
    mouthPG = get((640-_w-mouthKeypoints[0])/(640/1920), mouthKeypoints[1]/(480/1080), _w/(640/1920), _h/(480/1080));
    mouthPG.resize(_w, _h);
    //const newMouth = new Block(world, { x: _x, y: _y, w: _w, h: _h, image: mouthPG });
    const newMouth = new Block(world, { x: 640- _x, y: _y, w: _w, h: _h, image: mouthPG });
    mouths.push(newMouth);
  }
}

// disable right click context menu
document.oncontextmenu = function () {
  return false;
}

function mouseReleased(event) {
  if (mouseButton === LEFT && debugMode) {
    addBody(mouseX, mouseY, 50, 50);
  } else if (mouseButton === RIGHT) {
    //location.reload(true);
  } else if (mouseButton === LEFT && !debugMode) {//full screen
    let fs = fullscreen();
    fullscreen(!fs);
  }
}


function yawnScore() {
  //console.log(predictions.length);
  for (let i = 0; i < predictions.length; i += 1) {
    //const keypoints = predictions[i].scaledMesh;
    const keypoints = predictions[0].scaledMesh; //Perhaps we can avoid mistakes if we only use the first person?

    //save the mouth keypoints (164, 57, 18 & 287) in an array (x, y, w, h)
    mouthKeypoints = [keypoints[57][0], keypoints[164][1], keypoints[287][0] - keypoints[57][0], keypoints[18][1] - keypoints[164][1]];

    for (let j = 0; j < keypoints.length; j += 1) {
      const [x, y] = keypoints[j];

      if (j == 133) {
        //left inner Eye
        leftEyeInnerX = x;
        leftEyeInnerY = y;
      } else if (j == 362) {
        //right inner Eye
        rightEyeInnerX = x;
        rightEyeInnerY = y;
      } else if (j == 13) {
        //mouth upper inner lip 
        mouthUpperInnerLipX = x;
        mouthUpperInnerLipY = y;
      } else if (j == 14) {
        //mouth lower inner lip 
        mouthLowerInnerLipX = x;
        mouthLowerInnerLipY = y;
      }
    }

    var eyeDist = dist(
      leftEyeInnerX,
      leftEyeInnerY,
      rightEyeInnerX,
      rightEyeInnerY
    );

    var mouthOpen = max(mouthLowerInnerLipY - mouthUpperInnerLipY, 0);

    var yawnFactor = mouthOpen / eyeDist;
    yawnFactor = constrain(yawnFactor, 0, 1);

    if (yawnFactor > 0.5) {
      isMouthOpen = true;
      openMouthCounter ++;
      if (openMouthCounter > 25) openMouthCounter = 0;
    } else {
      isMouthOpen = false;
      openMouthCounter = 0;
    } 
    if (wasMouthOpen != isMouthOpen && isMouthOpen && penaltyCounter == 0) {
      console.log("TRIGG");
      penaltyCounter = 30;
      addBody(mouthKeypoints[0] + mouthKeypoints[2] / 2, mouthKeypoints[1] + mouthKeypoints[3] / 2, mouthKeypoints[2], mouthKeypoints[3]);
    } 
    
  }
  penaltyCounter--;
  penaltyCounter = constrain(penaltyCounter,0,30);
  wasMouthOpen = isMouthOpen;
  //console.log(openMouthCounter);
}