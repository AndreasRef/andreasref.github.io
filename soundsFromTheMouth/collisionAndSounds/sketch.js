// from https://b-g.github.io/p5-matter-examples/docs/ 
// slap sound from
// http://soundbible.com/1948-Slap.html
// slap-soundmaster13-49669815.mp3

Matter.use('matter-wrap');
let engine;
let world;
let mouse;
let hitSound;
let ball;
let angle = 0;
let balls = [];
let ground;

let allowSoundOverlap = true;
let mouthImg;


let soundArray = [];

function preload() {
  // load sound
  //hitSound = loadSound('./slap-soundmaster13-49669815.mp3');
  hitSound = loadSound('Yawn2.mp3');
  hitSound.playMode('sustain');

  //push all sounds () into array
  for (let i = 0; i < 11; i++) {
    soundArray.push(loadSound(i + '.mp3'));
  }

  mouthImg = loadImage('mouth100x100.png');
}

function setup() {
  const canvas = createCanvas(800, 600);

  mouthImg.resize(50, 50);
  // create an engine
  engine = Matter.Engine.create();
  world = engine.world;

  // setup ground
  ground = new Block(world, { x: width / 2, y: 450, w: width, h: 30, color: 'grey' }, {
    isStatic: true, angle: PI * 0.0, label: 'ground'
  });

  // ball and propeller
  const wrap = {
    min: { x: 0, y: 0 },
    max: { x: width, y: height }
  };

  // setup hit sound
  Matter.Events.on(engine, 'collisionStart', function (event) {

    let randomNumber = Math.floor(Math.random() * soundArray.length);

    const pairs = event.pairs[0];
    const bodyA = pairs.bodyA;
    const bodyB = pairs.bodyB;
    if (bodyA.label === "ground" || bodyB.label === "ground") {

      if (allowSoundOverlap) {
        soundArray[randomNumber].play();
        //hitSound.play();
      } else {
        if (!hitSound.isPlaying()) {
          soundArray[randomNumber].play();
          //hitSound.play();
        }
      }

      //if hitSounds is not playing, play it

      console.log(bodyA.label + " " + bodyB.label);
    } else if (bodyA.label === "Rectangle Body" && bodyB.label === "Rectangle Body" || bodyA.label === "Circle Body" && bodyB.label ==="Circle Body") { //For whatever reason the label for the rectangle bodies is "Rectangle Body", not the assigned label
      if (allowSoundOverlap) {
        soundArray[randomNumber].play();
        //hitSound.play();
      } else {
        if (!hitSound.isPlaying()) {
          soundArray[randomNumber].play();
        //hitSound.play();
        }
      }
    }
  });

  // setup mouse
  mouse = new Mouse(engine, canvas);

  // run the engine
  Matter.Runner.run(engine);
}

function draw() {
  background('black');

  fill(255);
  textAlign(CENTER, CENTER);
  text('Click: New Body\nRight Click: Remove Body', width / 2, 50);

  noStroke();
  fill(255);
  // visualize collision
  for (const ball of balls) {
    ball.attributes.color = 'white';
    const collided = Matter.Collision.collides(ground.body, ball.body);
    if (collided) {
      ball.attributes.color = 'red';
    } else {
      ball.attributes.color = 'white';
    }
    //ball.draw();
  }

  //Detect if two balls are touching
  for (let i = 0; i < balls.length; i++) {
    //balls[i].attributes.color = 'white';
    for (let j = i + 1; j < balls.length; j++) {
      //balls[j].attributes.color = 'white';
      const collided = Matter.SAT.collides(balls[i].body, balls[j].body);
      if (collided) {
        balls[i].attributes.color = 'green';
        balls[j].attributes.color = 'green';
      } else {
        balls[i].attributes.color = 'white';
        balls[j].attributes.color = 'white';
      }
    }
    balls[i].draw();
  }
  
  fill(128);
  ground.draw();

  mouse.draw();
}


function addBody() {
  const newBall = new Ball(world, { x: mouseX, y: mouseY, r: 29, color: 'white', image: mouthImg });
  //const newBall = new Block(world, { x: mouseX, y: mouseY, w: 50, h: 50, color: 'white', label: 'ball', image: mouthImg }, { density: 0.0001 });
  balls.push(newBall);
}

function removeBody() {
  // search all bodies on current mouse position
  const bodies = Matter.Composite.allBodies(engine.world);
  const found = Matter.Query.point(bodies, { x: mouseX, y: mouseY });
  if (found.length > 0) {
    const clickedBody = found[0];
    Matter.World.remove(world, clickedBody);
    balls = balls.filter(ball => ball.body !== clickedBody);
  }
}

// disable right click context menu
document.oncontextmenu = function () {
  return false;
}

function mouseReleased(event) {
  if (mouseButton === LEFT) {
    addBody();
  }
  if (mouseButton === RIGHT) {
    removeBody();
  }
}