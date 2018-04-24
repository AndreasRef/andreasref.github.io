var capture;

var k = 3; //k can be any integer
var machine = new kNear(k);

var currentClass = 0;
var pixelColors = [];
var nSamples = 0;
showCapture = false;

var trainingLabels = ["Down", "Up"];

//PONG
var ballX = 400,
  ballY = 240,
  ballSpeedX = 10,
  ballSpeedY = 6;

var ballSize = 50;

var player1Score = 0,
  player2Score = 0;
const WINNING_SCORE = 3;

var showingWinScreen = false;

var paddle1Y,
  paddle2Y;
const PADDLE_HEIGHT = 200;
const PADDLE_THICKNESS = 25;

const pongWidth = 800;

var playGame = false;
var test = -1;

function setup() {
  createCanvas(640 + 800, 480);
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();
  paddle1Y = height / 2 - PADDLE_HEIGHT / 2;
  paddle2Y = height / 2 - PADDLE_HEIGHT / 2;

}

function draw() {
  background("#E4C000");
  
  //Mirror the image
  push();
  translate(640,0);
  scale(-1,1);
  
  capture.loadPixels();

  var boxWidth = 64;
  var boxHeight = 48

  var tot = boxWidth * boxHeight;

  pixelColors = [];

  for (var y = 0; y < capture.height; y += boxHeight) {
    for (var x = 0; x < capture.width; x += boxWidth) {
      var r = 0,
        g = 0,
        b = 0;

      for (var i = 0; i < boxWidth; i++) {
        for (var j = 0; j < boxHeight; j++) {
          var index = (x + i) + (y + j) * 640;
          r += capture.pixels[index * 4];
          g += capture.pixels[index * 4 + 1];
          b += capture.pixels[index * 4 + 2];
        }
      }

      r = r / tot;
      g = g / tot;
      b = b / tot;

      noStroke();
      fill(r, g, b);
      pixelColors.push(r + g + b);
      rect(x, y, boxWidth, boxHeight);
    }
  }
  image(capture, capture.width - 160, capture.height - 120, 160, 120);
  pop();

  if (mouseIsPressed) {
    machine.learn(pixelColors, currentClass);
    nSamples++;
    fill(255, 0, 0);
    ellipse(width - 25, 25, 25, 25);
  } else if (nSamples > 0) {
    fill("#00B552");
    test = machine.classify(pixelColors);
    textSize(56);
    text(trainingLabels[test], capture.width / 2, capture.height / 2);

  }
  
  noStroke();
  fill(255,219,0,150);
  rect(0,0,capture.width, 100);
  
  fill("#00B552");
  textSize(12);
  text("press [0-1] to change current class --- hold mouse to record samples --- press [9] to start the game", 10, 25);
  textSize(24);
  text("trainingClass: " + trainingLabels[currentClass], 10, 75);
  text(" nSamples: " + nSamples, capture.width - 175, 75);


  //PONG
  push();
  noStroke();
  translate(640, 0);
  if(playGame) moveEverything();
  drawEverything();
  pop();

}


function moveEverything() {

  if (showingWinScreen) return;

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  var paddleSpeed = 5;

  if (test>-1) {
    //if (keyIsPressed) {
    if (test == 0) {
      paddle1Y += paddleSpeed;
      //} else if (mouseIsPressed) {
    } else if (test == 1) {
      paddle1Y -= paddleSpeed;
    }
  }

  paddle1Y = constrain(paddle1Y, 0, height - PADDLE_HEIGHT);


  computerMovement();

  var damp = 0.2;

  if (ballX < (0 + ballSize / 2 + PADDLE_THICKNESS)) {
    if (ballY > paddle1Y && ballY < paddle1Y + PADDLE_HEIGHT) {
      ballSpeedX *= -1;
      var deltaY = ballY - (paddle1Y + PADDLE_HEIGHT / 2);
      ballSpeedY = deltaY * damp;
    } else {
      player2Score++; // must be BEFORE ballReset()
      ballReset();
    }
  }

  if (ballX > (pongWidth - ballSize / 2 - PADDLE_THICKNESS)) {
    if (ballY > paddle2Y && ballY < paddle2Y + PADDLE_HEIGHT) {
      ballSpeedX *= -1;
      var deltaY = ballY - (paddle2Y + PADDLE_HEIGHT / 2);
      ballSpeedY = deltaY * damp;
    } else {
      player1Score++; // must be BEFORE ballReset()
      ballReset();
    }
  }

  if (ballY > height) {
    ballY = height;
    ballSpeedY *= -1;
  }

  if (ballY < 0) {
    ballY = 0;
    ballSpeedY *= -1;
  }
  ballSpeedY = constrain (ballSpeedY, -5,5);
}

function computerMovement() {
  var paddle2YCenter = paddle2Y + PADDLE_HEIGHT / 2;
  if (paddle2YCenter < ballY - PADDLE_HEIGHT / 3) {
    paddle2Y += 6;
  } else if (paddle2YCenter > ballY + PADDLE_HEIGHT / 3) {
    paddle2Y -= 6;
  }
}

function ballReset() {

  if (player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE) {
    showingWinScreen = true;
  }

  ballSpeedX *= -1;
  ballX = pongWidth / 2;
  ballY = height / 2;

}

function drawEverything() {
  fill(255,219,0);
  rect(0,0,PADDLE_THICKNESS,height);
  
  fill(255);
  noStroke();

  if (showingWinScreen) {
    textSize(20);
    if (player1Score >= WINNING_SCORE) {
      text("left player won!", 200, 200);
    } else if (player2Score >= WINNING_SCORE) {
      text("right player won!", pongWidth - 200, 200);
    }
    textSize(14);
    text("click to continue", pongWidth / 2, height - 200);
    return;
  }

  fill("#00B552");

  for (var i = 0; i < height; i += 40) {
    rect(pongWidth / 2 - 1, i, 2, 20);
  }

  rect(0, paddle1Y, PADDLE_THICKNESS, PADDLE_HEIGHT); // left paddle
  rect(pongWidth - PADDLE_THICKNESS, paddle2Y, PADDLE_THICKNESS, PADDLE_HEIGHT); // right paddle

  fill("FAFBDF");
  ellipse(ballX, ballY, ballSize, ballSize); // ball //15 

  textSize(20);
  text(player1Score, 200, 100);
  text(player2Score, pongWidth - 200, 100);
}

function mouseReleased() {
  if (showingWinScreen) {
    player1Score = 0;
    player2Score = 0;
    showingWinScreen = false;
  }
}

function keyPressed() {
  if (key == '0') {
    currentClass = 0;
  } else if (key == '1') {
    currentClass = 1;
  } else if (key == '2') {
    currentClass = 2;
  } else if (key == '9') {
    playGame = true;
  }
}