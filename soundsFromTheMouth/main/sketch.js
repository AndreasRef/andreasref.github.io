// p5 matter based on examples from Bene: https://b-g.github.io/p5-matter-examples/docs/ 

/* To do:
Clean up

Graphic design soundwave, søg på pinterest

Grundmønster der bevæger sig ved en kollision
Blå = stilhed
Rød = ramme
Måske lav trekanten som fft

Lav toner ligesom et piano

Propellen skal have en særlig lyd / effekt

Big mouth = loud sound

Left = lower notes, right higher notes

Experiment with spring factors, desired length, stiffness, damping etc
Make fullscreen
Make the mouth drops more responsive using a better logic than framecount (use something that )
Delete all bodies that exits the screen - see https://github.com/CodingTrain/website-archive/tree/main/Courses/natureofcode/5.19_matter_delete_bodies
Work on sound stuff

Play a sound when something comes out of the mouth

Go back to the layout from https://andreasref.github.io/soundsFromTheMouth/basicMouthPhysics/ it is a lot more fun and intuitive...
*/

let debugMode = false;

Matter.use('matter-wrap');
let engine;
let world;
//let mouse;
let hitSound;
let ball;

let mouths = [];
let balls = [];
let ground;

let propeller;
let angle = 0;

let mouthImg;
let mouthImgClosed;

let soundArray = [];

let facemesh;
let video;
let predictions = [];
let isMouthOpen = false;

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
//let pgMouths = [];

let modelLoaded = false;
let mouthPG;


//let mouthPGclosed;

function preload() {
  // load sound
  //hitSound = loadSound('./slap-soundmaster13-49669815.mp3');
  hitSound = loadSound('Yawn2.mp3');
  hitSound.playMode('sustain');

  //push all sounds () into array
  for (let i = 0; i < 11; i++) {
    //soundArray.push(loadSound(i + '.mp3'));
  }


  //New array with the sounds in scale
  for (let i = 0; i < 7; i++) {
    soundArray.push(loadSound("scaleNumbered/" +i + '.mp3'));
  }

  mouthImg = loadImage('mouth100x100.png');
  mouthImgClosed = loadImage('closedMouth.jpg');
}

function setup() {
  const canvas = createCanvas(640, 480);
  if (!debugMode) {
    video = createCapture(VIDEO);
    video.size(width, height);
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
  // create an engine
  engine = Matter.Engine.create();
  world = engine.world;

  // setup ground
  /*
  ground = new Block(world, { x: width / 2, y: 500, w: width * 1.2, h: 200, color: 'grey' }, {
    isStatic: true, angle: PI * 0.08, label: 'ground', restitution: 1.4

  });
  */

//Pyramid ground setup
  const points = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width/2, y: -100}
  ];
  ground = new PolygonFromPoints(world,
    { x: width/2, y: height-25, points: points, color: 'white' } , {
      isStatic: true, angle: PI * 0.0, label: 'ground', restitution: 1.4
    }
  );


  // propeller
  propeller = new Block(world,
    { x: 100, y: 250, w: 200, h: 30, color: 'white' },
    { isStatic: true, angle: angle, label: 'propeller', restitution: 0.3 }
  );

  // wrap
  const wrap = {
    min: { x: 0, y: 0 },
    max: { x: width, y: height }
  };

  // setup hit sound
  Matter.Events.on(engine, 'collisionStart', function (event) {

    //let randomNumber = Math.floor(Math.random() * soundArray.length);
    const pairs = event.pairs[0];
    const bodyA = pairs.bodyA;
    const bodyB = pairs.bodyB;

    let idNumber = bodyB.id % soundArray.length;
    console.log(idNumber);

    //Collision with ground
    if (bodyA.label === "ground" || bodyB.label === "ground") {
      soundArray[idNumber].play();
      //soundArray[1].play();
      if (bodyA.label != "ground") {
        //bodyA.attributes.image = mouthImg;
      }
    }


    //Special sound when colliding with propeller
    if (bodyA.label === "propeller" || bodyB.label === "propeller") {
      soundArray[0].play();
    }

    //Collisions between mouths
    //console.log(bodyA.label + " " + bodyB.label);
    else if (bodyA.label === "Rectangle Body" && bodyB.label === "Rectangle Body" || bodyA.label === "Circle Body" && bodyB.label === "Circle Body") { //For whatever reason the label for the rectangle bodies is "Rectangle Body", not the assigned label
      //soundArray[randomNumber].play();
    }
  });

  // setup mouse
  //mouse = new Mouse(engine, canvas);

  // run the engine
  Matter.Runner.run(engine);
}

function modelReady() {
  console.log("Model ready!");
  modelLoaded = true;
}

function draw() {
  background('black');
  if (!debugMode) {
    image(video, 0, 0);
    yawnScore();
    if (isMouthOpen && frameCount % 25 == 0) {
      //text("open", 10, 10);
      addBody(mouthKeypoints[0] + mouthKeypoints[2] / 2, mouthKeypoints[1] + mouthKeypoints[3] / 2, mouthKeypoints[2], mouthKeypoints[3]);
    }
  }

  fill(255);
  textAlign(CENTER, CENTER);
  text('Click: New Body\nRight Click: Remove Body\nPress SPACE: Delete all', width / 2, 50);

  noStroke();
  fill(255);

  //THIS IS SUPER MESSY, PERHAPS DELETE IT and start over?
  // visualize collision
  
  if (frameCount % 10  == 0) {
    ground.attributes.color = 'grey';
    propeller.attributes.color = 'grey';
  } 

  for (const mouth of mouths) {    
    let collided = Matter.Collision.collides(ground.body, mouth.body);
    let collidedPropeller = Matter.Collision.collides(propeller.body, mouth.body);
    //console.log(collided);

     // visualize collision
    if (collided) {
      ground.attributes.color = 'red';
    } else {
      
    }

    if (collidedPropeller) {
      propeller.attributes.color = 'green';
    }
    mouth.draw();
  }

  fill(128);
  ground.draw();

  // animate angle property of propeller
  Matter.Body.setAngle(propeller.body, angle);
  Matter.Body.setAngularVelocity(propeller.body, 0.15);
  angle += 0.07;

  propeller.draw();
  //console.log(mouths.length, world.bodies.length); //Keep track of the number of mouths and if they are deleted okay?

 //Delete offscreen bodies
  //Adapted from https://github.com/CodingTrain/website-archive/tree/main/Courses/natureofcode/5.19_matter_delete_bodies
  for (var i = 0; i < mouths.length; i++) {
    if (mouths[i].body.position.y > height + 100) {
      Matter.World.remove(world, mouths[i].body);
      mouths.splice(i, 1);
      i--;
    }
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
  }
}

function changeMouthBack(mouth) {
  mouth.label = "collidedWithGround";
  mouth.attributes.color = 'red';
  console.log("a collision has ended")
}

function addBody(_x, _y, _w, _h) {
  if (debugMode) {
    const newMouth = new Block(world, { x: mouseX, y: mouseY, w: 50, h: 50, color: 'white', label: 'ball', image: mouthImgClosed }, { density: 0.0001 });
    mouths.push(newMouth);
  } else {
    mouthPG = get(mouthKeypoints[0], mouthKeypoints[1], _w, _h);
    const newMouth = new Block(world, { x: _x, y: _y, w: _w, h: _h, image: mouthPG });
    mouths.push(newMouth);
  }
}

function removeBody() {
  // search all bodies on current mouse position
  const bodies = Matter.Composite.allBodies(engine.world);
  const found = Matter.Query.point(bodies, { x: mouseX, y: mouseY });
  if (found.length > 0) {
    const clickedBody = found[0];
    Matter.World.remove(world, clickedBody);
    mouths = mouths.filter(mouth => mouth.body !== clickedBody);
  }
}

// disable right click context menu
document.oncontextmenu = function () {
  return false;
}

function mouseReleased(event) {
  if (mouseButton === LEFT) {
    addBody(mouseX, mouseY, 50, 50);
  }
  if (mouseButton === RIGHT) {
    removeBody();
  }
}


function yawnScore() {
  for (let i = 0; i < predictions.length; i += 1) {
    const keypoints = predictions[i].scaledMesh;

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

    if (yawnFactor > 0.4) {
      isMouthOpen = true;
    } else {
      isMouthOpen = false;
    } 
  }
}