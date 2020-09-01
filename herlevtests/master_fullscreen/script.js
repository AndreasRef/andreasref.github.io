const video = document.getElementById('video')
//const URL = "/weights"
//online URL
const URL = "https://rawgit.com/justadudewhohacks/face-api.js/master/weights";

let faces = [];

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(URL),
  faceapi.nets.faceLandmark68Net.loadFromUri(URL),
  faceapi.nets.ageGenderNet.loadFromUri(URL)
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {
          frameRate: {
              ideal: 25,
              min: 25
          }
      }
     },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}


video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withAgeAndGender()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    faces = resizedDetections;    
  }, 500)
})

//New layout
//let age = 80;

let noiseOffSet = 100000-0.01;

let suggestions = [
"Popsi og Krelle",
"Baby Shark",
"Joey Moe",
"Ariana Grande",
"Taylor Swift",
"Lady Gaga",
"Nephew",
"Britney Spears",
"Nirvana",
"George Michael",
"Thomas Helmig",
"Abba",
"Gasolin",
"The Bee Gees",
"Keld & The Donkeys",
"Frank Sinatra",
"Otto Brandenburg",
"Raquel Rastenni",
"Liva Weel",
"Gustav Winckler",
"Marguerite Viby"
];

let textSpacing = 0.42;
let rightCircleSpacingCompensation = 1.12;

let sliceFraction = 16;
let outCircleSizeFactor = 1.15;

let videoWidth = 960; //Not used?
let scaleFactor = videoWidth/720;

let age = 0;

let myFont;

let leftBorder = 250;
let rightBorder = 1720;

function preload() {
  myFont = loadFont('VeraMoBd.ttf');
}

function setup() {
  pixelDensity(1);
  createCanvas(1920, 1080);
  textFont(myFont);
}

function draw() {
  //background(220);
  clear();

  //face stuff
  //Only look at and care about the first face...


  /*
  if (faces.length > 0) {
    age = lerp(age, faces[0].age, 0.01);
  } else {
    age = lerp(age, noise(noiseOffSet)*100, 0.01);
    noiseOffSet+=0.0005;
  }
  */

 if (faces.length > 0) {
   //Dont do anything, age lerping with faces happens in the loop
  //age = lerp(age, faces[0].age, 0.01);
} else {
  age = lerp(age, noise(noiseOffSet)*100, 0.01);
  noiseOffSet+=0.0005;
}


  //the loop
  for (let i = 0; i<faces.length; i++) {

    if (faces[i].alignedRect.box.x > leftBorder && faces[i].alignedRect.box.x + faces[i].alignedRect.box.width < rightBorder) {
      age = lerp(age, faces[i].age, 0.01);

    //text("#" + i + ": age : " + round(faces[i].age), 25, 25*i + 50);
    push();
    noFill();
    translate((960-720),0);

    scale(1/scaleFactor, 1);
    strokeWeight(10);
    stroke("#CC1F2E");
    //rect(faces[i].alignedRect.box.x, faces[i].alignedRect.box.y, faces[i].alignedRect.box.width, faces[i].alignedRect.box.height)
    drawCorners(faces[i].alignedRect.box.x, faces[i].alignedRect.box.y, faces[i].alignedRect.box.width, faces[i].alignedRect.box.height, 6);

    //console.log(faces[i].alignedRect.box.x);

    pop();
    }
  }


  //Info bars
  push();
  textAlign(CENTER);
  textSize(32);
  noStroke();
  
  //Top info
  fill(255);
  rect(0,0,width, height/6);
  fill(0);
  text("Lad computeren analysere dit ansigt \nog gætte din alder og yndlingsmusik.", width/2, height/12);
  
  //Bottom info
  fill(255);
  rect(0,height -height/6,width, height/6);
  fill(0);
  text("Rammer den rigtigt? \nBiblioteket har både CD'er, DVD'er,\noder og musikmagasiner på 1. sal.", width/2, height- height/10);
  
  pop();
  
  //Age circle
  push();
  translate(0, height/2);
  circle(0, 0, height);
  push();
  textSize(24*2);
  rotate(-TWO_PI * age / 100);
  for (let i = 0; i < 20; i++) {
    push();
    rotate(TWO_PI * i / 20);
    text(i * 5, textSpacing*height, 0);
    pop();
  }
  pop();
  pop();

  //Suggestions circle
  push();
  translate(width, height/2);
  circle(0, 0, height);
  push();
  textSize(28);
  rotate(-TWO_PI * age / 100);
  for (let i = 0; i < 20; i++) {
    push();
    rotate(TWO_PI * i / 20);
    text(suggestions[i], -textSpacing*height*rightCircleSpacingCompensation, 0);
    pop();
  }
  pop();
  pop();
  
  
  //Left arrow
  push();
  noStroke();
  fill("#CC1F2E");
  triangle(0, height*0.45, 0, height*0.55, height/3, height*0.5);
  pop();
  
  //Left arc
  push();
  fill(0);
  arc(0, height/2, height*outCircleSizeFactor, height*outCircleSizeFactor, TWO_PI/sliceFraction, -TWO_PI/sliceFraction, PIE);
  pop();
  
  
  //Right arrow
  push();
  noStroke();
  fill("#CC1F2E");
  triangle(width, height*0.475, width, height*0.525, width- height/6, height*0.5);
  pop();

  
  //Right arc
  push();
  fill(0);
  arc(width, height/2, height*outCircleSizeFactor, height*outCircleSizeFactor, PI + TWO_PI/sliceFraction, PI - TWO_PI/sliceFraction, PIE);
  pop();
  
  
  
  //reset noiseOffSet if it gets too high
  if (noiseOffSet > 100000) noiseOffSet = 0;
  //age = map(mouseX, 0, width, 0, 100);

  //console.log(age);
}

function drawCorners(x,y,w,h, fraction) {
  line(x, y, x, y + h/fraction);
  line(x, y, x + w/fraction, y);
  
  line(x+w, y, x+w - w/fraction, y);
  line(x+w, y, x+w, y + h/fraction);
  
  line(x, y + h, x, y + h - h/fraction);
  line(x, y+h, x + w/fraction, y+h);
  
  line(x + w, y + h, x + w, y + h - h/fraction);
  line(x + w, y+h, x + w - w/fraction, y+h);
}


function mousePressed() {
  //console.log(faces);
  //let fs = fullscreen();
  fullscreen(true);
}