/* To do:

- Experiment on the playground with good poems
- UI for GPT-3 prompt text
- Perhaps update the subtitles to look like subtitles again instead?

*/

let GPTpromptText;

let danishPrompt = true;


let track = true;
let useGPT = false;

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


//Text
let writtenText = " \n\nLorem ipsum.\n\ndolor sit amet, consectetur adipiscing elit.\nSed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam. \nullamco laboris nisi ut aliquip ex ea commodo consequat.";
let myWords = [];
let wordIndex = 0;


//Colors
let colorIndex = 0;
let palette = [];
let signColors = []; //SLOPPY!!

//Matter
var ground;
var signs = [];

function setup() {
  var canvas = createCanvas(640, 480);
  canvas.parent('sketch-holder');

  //createCanvas(640, 480);



  if (track) { //For easier dev and debugging of non face stuff
    video = createCapture(VIDEO);
    video.size(width, height);

    // Hide the video element, and just show the canvas
    video.hide();

    facemesh = ml5.facemesh(video, modelReady);

    // This sets up an event that fills the global variable "predictions"
    // with an array every time new predictions are made
    facemesh.on("predict", (results) => {
      predictions = results;
    });
  }


  ground = matter.makeBarrier(width / 2, height, width, 50);

  textSize(16);

  palette[0] = color(0,128,0)
  palette[1] = color(0,0,255)
  palette[2] = color(255, 0, 0)
  palette[3] = color("#ff8c00")
  palette[4] = color(255, 0, 255)


  if (useGPT) {

    if (danishPrompt) {
      GPTpromptText = "Skriv et kort, kunstnerisk selvironisk digt fra en dansk teenagepige under husarrest pga en global pandemi, der handler om ikke at måtte mødes med andre og stedet kun være online, se andre gennem videoopkald og at bruge sociale medier."
    } else {
      GPTpromptText = "Write a short and funny poem from the perspective of a quirky teenage girl during lockdown caused by a pandemic. Keywords: Indoor, video calls, social media, self-deprecating humor."
    }

    OpenaiFetchAPI();
  } else {
    cleanAndSplitText();
  }
}


function draw() {

  if (track) {
    image(video, 0, 0, width, height);
    yawnScore();
    //drawKeypoints();
  } else {
    background(220);
  }

  fill(127);
  ground.show();

  //fill(palette[colorIndex]);
  for (i = 0; i < signs.length; i++) {
    fill(0);
    signs[i].showBG();

    //fill(signColors[i]);
    fill(255)
    signs[i].show();
  }
  
  fill(255);
  if (isMouthOpen) {
    text("open", 10, 10);
    textFromMouth();
  } 
}


function modelReady() {
  console.log("Model ready!");
}


function cleanAndSplitText() {
  writtenText = writtenText.replaceAll("\n", " <br/>");
  myWords = writtenText.split(" ");

  //Avoid empty strings and linebreaks at the very beginning
  while (myWords[0] === "<br/>" || myWords[0] === "") {
    myWords.shift();
  }

  //If first entry still begins with a linebreak, remove it
  if (myWords[0].startsWith("<br/>")) {
    myWords[0] = myWords[0].replace("<br/>", "");
  }
  console.log(myWords);
}


function keyPressed() {
  for (i = 0; i < signs.length; i++) {
    matter.forget(signs[i]);
  }
  signs = [];
  signColors = [];
  document.getElementById("poem").innerHTML = "";
  wordIndex = 0;
  colorIndex = 0;
}

function mousePressed() {
  textToMatterJS(mouseX, mouseY);
}

function textToMatterJS(x, y) {
  signs.push(matter.makeSign(myWords[wordIndex].replaceAll("<br/>", "").replace(",","").replace(".",""), x, y, {
    restitution: 0.8,
    density: 0.001
  }));
  signColors.push(palette[colorIndex]);
  //signColors.push = color(255, 0, 255);
  //console.log(signColors[0]);
  //signs[signs.lastIndexOf].col = palette[colorIndex];
  
  document.getElementById("poem").innerHTML+= "<span class=\"color"+colorIndex+"\">"  + myWords[wordIndex] + " </span>";
  
  //CLEAN THIS UP - instead you should stop words comming out alltogether

  if (wordIndex < myWords.length) wordIndex++;
  if (wordIndex == myWords.length) {
    wordIndex = 0;
    colorIndex = 0;
    document.getElementById("poem").innerHTML+= "<br/><br/>"
  } 

  if (myWords[wordIndex].startsWith("<br/>")) {
    colorIndex++;
  }
  if (colorIndex > 4) colorIndex = 0;
  if (wordIndex > myWords.length - 1) wordIndex = 0;
}

function textFromMouth() {
  if (frameCount % 10 == 0) {
    textToMatterJS(mouthUpperInnerLipX/2+mouthLowerInnerLipX/2, mouthUpperInnerLipY/2 + mouthLowerInnerLipY/2);    
  }
}

function drawKeypoints() {
  for (let i = 0; i < predictions.length; i += 1) {
    const keypoints = predictions[i].scaledMesh;

    // Draw facial keypoints.
    for (let j = 0; j < keypoints.length; j += 1) {
      const [x, y] = keypoints[j];

      fill(0, 255, 0);
      ellipse(x, y, 5, 5);
    }
  }

  //Draw debug points
  fill(255, 0, 255);
  ellipse(leftEyeInnerX, leftEyeInnerY, 5, 5);
  ellipse(rightEyeInnerX, rightEyeInnerY, 5, 5);

  ellipse(mouthUpperInnerLipX, mouthUpperInnerLipY, 5, 5);
  ellipse(mouthLowerInnerLipX, mouthLowerInnerLipY, 5, 5);
}

function yawnScore() {
  for (let i = 0; i < predictions.length; i += 1) {
    const keypoints = predictions[i].scaledMesh;

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
    //console.log(eyeDist); 
    
  var mouthOpen = max(mouthLowerInnerLipY - mouthUpperInnerLipY, 0);
  
  var yawnFactor = mouthOpen / eyeDist;
  yawnFactor = constrain(yawnFactor, 0, 1);
  //console.log(yawnFactor);
    
    if (yawnFactor > 0.4) {
      isMouthOpen = true;
    } else {
      isMouthOpen = false;
    } 
  }
}


function OpenaiFetchAPI() {
  console.log("Calling GPT3")
  var url = "https://api.openai.com/v1/engines/davinci-instruct-beta/completions";
  var bearer = 'Bearer ' + "hiddenCODE"
  fetch(url, {
      method: 'POST',
      headers: {
          'Authorization': bearer,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          "prompt": GPTpromptText,
          "max_tokens": 128,
          "temperature": 0.8,
          "top_p": 1,
          "n": 1,
          "stream": false,
          "logprobs": null,
          "stop": ""
      })

  }).then(response => {
      
      return response.json()
     
  }).then(data=>{
      console.log(data)
      console.log(typeof data)
      console.log(Object.keys(data))
      console.log(data['choices'][0].text)

      writtenText = data['choices'][0].text;
      cleanAndSplitText();
      
  })
      .catch(error => {
          console.log('Something bad happened ' + error)
      });
}