/*To do

DOG 2 lyd mangler!!!
Find ud af noget med hvordan der tegnes instrumenter hvis folk tegner super mange....


Tablets?

Slet waw-filer?

Tekst om at man godt kan have flere af det samme kategori

Nice to have! Make them dance according to the music, like tegnemaskinen!
*/

document.getElementById("addButton").disabled = true;

var instrumentOnlyMode = true;

//var instructionText = "Draw something! 🎹🥁🎸🎷🚲🪚🐶🐤";
var instructionText = "";

var instruments = [
  'piano', 'drums', 'guitar', 'saxophone', 'bicycle', 'saw', 'dog', 'bird'
];

var emojis = [
  "🎹","🥁","🎸","🎷","🚲","🪚","🐶","🐤"
]

var pianoCount = 0;
var drumsCount = 0;
var guitarCount = 0;
var saxophoneCount = 0;
var bicycleCount = 0;

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var mouseX = 0;
var mouseY = 0;
var mouseIsDown = false;

var STROKES = [];

var title = document.createElement("div");
title.id = "title";
title.innerHTML = "Loading...";
document.body.appendChild(title);

var nnDisplaySize = NN.IMAGE_W * 5/2; //original not divide
var nDrawings = 0;
var lastPrediction = "none yet";

var ret; 

//Attempt to make class / object oriented logic instead
var drawnInstruments = [];
drawnInstruments.push(new instrument("piano", "piano")); //Emojis are not used!!!
drawnInstruments.push(new instrument("drums", "drum"));
drawnInstruments.push(new instrument("guitar", "bass"));
drawnInstruments.push(new instrument("saxophone", "saxophone"));
drawnInstruments.push(new instrument("bicycle", "bicycle"));
drawnInstruments.push(new instrument("saw", "saw"));
drawnInstruments.push(new instrument("bird", "bird"));
drawnInstruments.push(new instrument("dog", "dog"));


function aoran(x) {
  if (["a", "e", "i", "o", "u"].includes(x[0])) {
    return "an"
  }
  return "a"
}

function getSuggestion() {
  var s = NN.CLASSES[Math.floor(Math.random() * NN.CLASSES.length)]
  if (NN.CLASS2OBJECTS) {
    s += " such as " + NN.CLASS2OBJECTS[s][Math.floor(Math.random() * NN.CLASS2OBJECTS[s].length)];
  }
  //document.getElementById('guess').innerHTML = `Draw something below! How about ${aoran(s)} ${s}?`;
  document.getElementById('guess').innerHTML = instructionText;
}
getSuggestion();

var in_canvas = document.createElement("canvas");
var in_context = in_canvas.getContext("2d");
//in_canvas.width = NN.IMAGE_W;
in_canvas.width = nnDisplaySize * 16; // original 8
in_canvas.height = nnDisplaySize;
in_canvas.style.position = "absolute";
//in_canvas.style.left = window.innerWidth-NN.IMAGE_W*5+"px";
in_canvas.style.left = 0 + "px";
in_canvas.style.top = window.innerHeight - nnDisplaySize + "px";
in_canvas.style.zIndex = -10;
//in_canvas.style.transform="scale(5)";
in_canvas.style.transformOrigin = "0% 0%";
in_canvas.style.opacity = 0.8;
document.body.appendChild(in_canvas);

var canvas = document.createElement("canvas");
var context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = "absolute";
canvas.style.left = "0px";
canvas.style.top = "0px";
canvas.style.zIndex = -1;
document.body.appendChild(canvas);

//Lets move the ret_div out into index.html

var ret_div = document.getElementById("ret_div");

//var ret_div = document.createElement("div");
ret_div.style.zIndex = -100;
ret_div.style.position = "absolute";
// ret_div.style.left = "40px";
// ret_div.style.top = "400px";
ret_div.style.opacity = 0.5;
//document.body.appendChild(ret_div);

function clearAll() {
  STROKES = [];
  in_context.clearRect(0, 0, in_canvas.width, in_canvas.height);
  nDrawings = 0;
  ret_div.innerHTML = "";
  document.getElementById('guess').innerHTML = instructionText;

  //OO approach
  for (let i = 0; i < instruments.length; i++) {
    drawnInstruments[i].count = 0;
    drawnInstruments[i].loadTrack();
  }
  Tone.Transport.stop()
}

function clearCanvas() {
  STROKES = [];
  ret_div.innerHTML = "";
  document.getElementById('guess').innerHTML = instructionText;
}

function addInstrument() {
  STROKES = [];
  ret_div.innerHTML = "";
  document.getElementById('guess').innerHTML = instructionText;

    in_context.drawImage(ret.layer0, nDrawings * (nnDisplaySize + 5), 0, nnDisplaySize, nnDisplaySize)
    in_context.font = "36pt Calibri";
    in_context.fillStyle = ("red");
    in_context.textAlign = "center";

    //Lazy and sloppy coding ;-)
    var displayEmoji = "";
    for (var i = 0; i<instruments.length; i++) {
      if (lastPrediction === instruments[i]) {
        displayEmoji = emojis[i]
      }
    }

    in_context.fillText(displayEmoji, nDrawings * (nnDisplaySize + 5) + nnDisplaySize / 2, nnDisplaySize - 15);

  //OO approach
  for (let i = 0; i < drawnInstruments.length; i++) { 
    if (lastPrediction === drawnInstruments[i].name) {
      drawnInstruments[i].increaseCount();
      drawnInstruments[i].loadTrack();
    }
  }
  nDrawings++;
}

function switchMode() {
  //To do
  instrumentOnlyMode = !instrumentOnlyMode;
  process();
  if (instrumentOnlyMode) {
    document.getElementById('instrumentModeButton').innerHTML = "switch to hard mode"
  } else {
    document.getElementById('instrumentModeButton').innerHTML = "switch to easy mode"
  }
}


function onmousemove(x, y) {
  var rect = canvas.getBoundingClientRect();
  mouseX = x - rect.left;
  mouseY = y - rect.top;
  if (mouseX < 0 || mouseX > WIDTH || mouseY < 0 || mouseY > HEIGHT) {
    mouseIsDown = false;
  }
  if (mouseIsDown) {
    STROKES[STROKES.length - 1].push([mouseX, mouseY]);
  }
}

function onmousedown() {
  mouseIsDown = true;
  STROKES.push([])
}
function onmouseup() {
  mouseIsDown = false;
  process();
}

canvas.onmousemove = function (event) { onmousemove(event.clientX, event.clientY); event.preventDefault(); }
canvas.onmousedown = function (event) { onmousedown(); event.preventDefault(); }
canvas.onmouseup = function (event) { onmouseup(); event.preventDefault(); }
canvas.ontouchstart = function (event) { onmousedown(); event.preventDefault(); }
canvas.ontouchmove = function (event) { onmousemove(event.touches[0].pageX, event.touches[0].pageY); event.preventDefault(); }
canvas.ontouchend = function (event) { onmouseup(); event.preventDefault(); }

function draw_strokes(ctx, strokes) {
  for (var i = 0; i < strokes.length; i++) {
    ctx.beginPath();
    for (var j = 0; j < strokes[i].length; j++) {
      if (j == 0) {
        ctx.moveTo(strokes[i][j][0], strokes[i][j][1]);
      } else {
        ctx.lineTo(strokes[i][j][0], strokes[i][j][1]);
      }
    }
    ctx.stroke();
  }
}

function main() {
  context.lineWidth = 1;
  // context.fillStyle = "white";
  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.strokeStyle = "black";
  context.lineWidth = "3";
  draw_strokes(context, STROKES);
  //if (STROKES.length){
  // process();
  //}

}

function process() {
  if (STROKES.length > 0) {
    ret = NN.predict(STROKES);
    var dist = ret.probabilityDistribution;
    lastPrediction = dist[0][0];

    if (instrumentOnlyMode) { //Easy mode where it only tries to recognise instruments (and piano & keyboard are the same)
      var filteredDist = [];
      var firstKeyOrPiano = true;

      for (var i = 0; i < dist.length; i++) {
        for (var j = 0; j < instruments.length; j++) {
          if (dist[i][0] === instruments[j]) {
            filteredDist.push(dist[i]);
          }
        }
      }

      var res_str = "";
      for (var i = 0; i < filteredDist.length; i++) {
        var pc = Math.round(filteredDist[i][1] * 10000) / 100;
        res_str += `<div>${filteredDist[i][0]} (${pc}%)</div><progress value="${pc}" max="100"></progress>`
      }

        //Lazy and sloppy coding ;-)
      var displayEmoji = "";
      for (var i = 0; i<instruments.length; i++) {
        if (filteredDist[0][0] === instruments[i]) {
          displayEmoji = emojis[i]
        }
      }

      ret_div.innerHTML = res_str;
      lastPrediction = filteredDist[0][0];
      var guess_str = "Did you draw " + filteredDist[0][0]+"?";

    } else { //Original hard mode
      var res_str = "";
      for (var i = 0; i < ((dist.length > 17) ? 10 : dist.length); i++) {
        var pc = Math.round(dist[i][1] * 10000) / 100;
        res_str += `<div>${dist[i][0]} (${pc}%)</div><progress value="${pc}" max="100"></progress>`
      }

        //Lazy and sloppy coding ;-)
        var displayEmoji = "";
        for (var i = 0; i<instruments.length; i++) {
          if (lastPrediction === instruments[i]) {
            displayEmoji = emojis[i]
          }
        }

      ret_div.innerHTML = res_str;
      var guess_str = "Did you draw " + ret.prediction + "?"
      // if (dist[0][1] < 0.9) {
      //   guess_str += " (or " + dist[1][0] + ")"
      // } else {
      //   guess_str += "!";
      // }
    }

    console.log("lastPrediction: " + lastPrediction)

    //Disable / enable button
    if (instruments.includes(lastPrediction)) {
      document.getElementById("addButton").disabled = false;
    } else {
      document.getElementById("addButton").disabled = true;
    }
    document.getElementById("guess").innerHTML = "<h3>" + guess_str + "</h3>";
  }
}

document.body.onload = async function () {
  title.innerHTML = 'Loading model...';
  await NN.loadModel('models/tfjs-model-8571367962526639.json');
  title.innerHTML = '';
}

window.setInterval(main, 10);