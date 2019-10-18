let classifier;
let video;

let currentPrediction = "LOADING... \nPlease wait a minute or reload page";

var URI = 'https://cors-anywhere.herokuapp.com/suggestqueries.google.com/complete/search?output=toolbar&hl=dk&q=';
var xml;
var myString = '';
var resultStrings = [];
var children = [];

var filterWords = ["meme", "memes", "lyric", "lyrics", "chord", "chords", "imdb", "movie", "movies", "cast", "qoutes"];
var preWords = ["my", "this", "does", "is my", "does my", "why can", "which", "how does", "why are", "what", "where", "can", "help"];


//Photo booth variables
let pg;
let lastSnapShot;

let timer = 0;
let showLatestPhoto = false;

let shutter;
let font;

let isMobile = false;

let lastPrediction = "nothing";

function preload() {
  font = loadFont('CourierNewBold.ttf');
  shutter = loadSound('shutter.wav');
}


function setup() {
  createCanvas(displayWidth, displayHeight);

  if (isMobileDevice()) {
    console.log("mobile device");
    isMobile = true;
    var constraints = {
      audio: false,
      video: {
        width: height,
        height: width,
        facingMode: {
          exact: "environment"
        }
      }
    };

    video = createCapture(constraints);
  } else {
    console.log("NOT mobile device");
    video = createCapture(VIDEO);
  }
  video.hide();

  classifier = ml5.imageClassifier('MobileNet', video, modelReady);

  noStroke();

  //Photo booth
  pixelDensity(1);
  pg = createGraphics(width, height);
  pg.noStroke();
  pg.textFont(font);
  pg.textSize(16);

  textFont(font);
  textSize(16);
}

function draw() {
  image(video, 0, 0, width, height);

  //Photo booth
  //Show the last image taken for a short period

  if (showLatestPhoto) {
    image(pg, 0, 0, width, height);

    fill(255);
    if (children.length == 0) text("Writing a poem about \n" + lastPrediction + "...", 10, 20);

  } else {
    tint(255);
    //Show current prediction
    fill(255);
    text("I think this is \n" + currentPrediction, 10, 20);
    
    push();
    //textAlign(CENTER);
    text("Tap the screen to take a picture ", 10, 7*height/9);
    pop();
    
  }


  if (!isMobile) {
    //Flash effect
    if (timer < 5) {
      background(timer * 25 + 130);
    } else if (timer < 8) {
      background(255);
    }
    timer++;
  }
}

function isMobileDevice() {
  return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}


function takePictureStart() {
  print("taking picture");
  shutter.play();
  timer = 0;

  pg.image(video, 0, 0, width, height);
  pg.filter(BLUR, 2); //Optional blur
  pg.fill(0, 50);
  pg.rect(0, 0, width, height);
  pg.fill(255);

  showLatestPhoto = true;
}


function addPoem() {
  print("adding poem");

  for (var i = 0; i < min(5, children.length); i++) {

    if (textWidth(resultStrings[i]) > width * 0.90) {
      pg.text(splitter(resultStrings[i]), 10, 50 + ((height - 100) / min(5, children.length)) * i);
    } else {
      pg.text(resultStrings[i], 10, 50 + ((height - 100) / min(5, children.length)) * i);
    }
  }
}

function splitter(s) {
  var middle = Math.floor(5 * s.length / 8); //Split after 5/8 instead of in the middle
  var before = s.lastIndexOf(' ', middle);
  var after = s.indexOf(' ', middle + 1);

  if (before == -1 || (after != -1 && middle - before >= after - middle)) {
    middle = after;
  } else {
    middle = before;
  }

  var s1 = s.substr(0, middle);
  var s2 = s.substr(middle + 1);

  var returnString = s1 + '\n' + s2;

  return returnString;
}



function modelReady() {
  // Change the status of the model once its ready
  //select('#status').html('Guess: ');
  // Call the classifyVideo function to start classifying the video
  classifyVideo();
}

// Get a prediction for the current video frame
function classifyVideo() {
  classifier.predict(gotResult);
}

// When we get a result
function gotResult(err, results) {
  // The results are in an array ordered by probability.
  currentPrediction = results[0].className;
  currentPrediction = currentPrediction.split(',')[0]; //Optionally only use the first part of the prediction, before any commas
  //select('#result').html(currentPrediction);
  //select('#probability').html(nf(results[0].probability, 0, 2));

  classifyVideo();
}


function newPoem() {
  takePictureStart();
  children = [];

  queryString = preWords[floor(random(preWords.length))] + " " + currentPrediction;
  print("first query: " + queryString);
  xml = loadXML(URI + queryString, getTheSuggestions);
}

function getTheSuggestions() {
  children = xml.getChildren("CompleteSuggestion");

  if (children.length == 0) print("NO SUGGESTIONS");

  for (var i = 0; i < children.length; i++) {
    var suggestion = children[i].getChild("suggestion");

    resultStrings[i] = suggestion.getString("data");
    print(resultStrings[i]);

    for (var j = 0; j < filterWords.length; j++) {
      if (resultStrings[i].endsWith(filterWords[j])) {
        resultStrings[i] = resultStrings[i].substring(0, resultStrings[i].indexOf(filterWords[j]));
      }
    }
  }

  if (children.length > 0) {
    addPoem();
  }

  print(children.length);

  let tries = 0;

  if (children.length == 0 && tries < 3) {
    print("try#:" + tries);
    queryString = preWords[floor(random(preWords.length))] + " " + currentPrediction;
    print("new query: " + queryString);
    xml = loadXML(URI + queryString, getTheSuggestions);
    //Potential endless loop?
    tries++;
  } else if (tries >= 3) {
    print("Tried, but no matches...");
  }
}

function keyPressed() {
  showLatestPhoto = false;
}

function touchStarted() {
  //nothing
}

function touchEnded() {

  if (showLatestPhoto) {
    showLatestPhoto = false;
  } else {
    lastPrediction = currentPrediction;
    newPoem();
  }
}

function touchMoved() {
  return false; // otherwise the display will move around with your touch :(
}