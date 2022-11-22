/* To do
- Better positioning of drawings by category
- Flip bg image
- Julie new bg image
- Process on startup?
*/

/* global describe Okb doodleRig doodleMeta*/

var timeout;

let dots = "";

var WIDTH = 256;
var HEIGHT = 256;

var mouseX = 0;
var mouseY = 0;
var mouseIsDown = false;

var STROKES = [];
var FAT = 15;
var BLEED = 5;

var NODES = [];
var SKIN = []

var drawings = [];

var masterNODES = [];
var masterSKINS = [];

var AUTO_ANIM = true;
var SEL_NODE = 0;

var generator = new Simple1DNoise();
var noiseX = 1;
var noiseY = 0;

var currentPrediction = "";

var currentPredictionDK = "StartTekst DK";

var readyToGuess = false;

var bgImg = new Image();
//bgImg.src = 'bg_test.png';
bgImg.src = 'bg_farve_kiosk.png';

//New master canvas
var master_canvas = document.createElement("canvas");
master_canvas.id = "master_canvas";
document.body.appendChild(master_canvas);

master_canvas.width = window.innerWidth;
master_canvas.height = window.innerHeight;
var master_context = master_canvas.getContext("2d");

//New (drawing) canvas embedded in QuickSettings
//QuickSettings.create(window.innerWidth - 20 - 278, 20, "Dobbeltklik for at åbne/lukke tegnepanel") 
//QuickSettings.create(window.innerWidth/2 - 278/2, 20, "Tegnemaskinen") 
QuickSettings.create(20, 20, "Tegnemaskinen") 
  .setWidth(278)
  .addHTML("Tegn her", '<canvas id="canvas" width="256" height="256" style="border:1px solid #000000;">')
  .addButton("Tryk for at vække tegning til live", function (value) { transfer() })
  .addButton("Tryk for at slette tegning", function (value) { clear() })
  .addButton("Tryk for at slette alt", function (value) { clearAll() })
  // .addButton("Tryk for gemme et billede", function (value) { takeScreenshot() })
  .addHTML("Om Tegnemaskinen", 'Tegnemaskinen er et eksperiment, der vækker tegninger til live gennem kunstig intelligens. </br></br>Maskinen er trænet til at genkende mennesker, fisk, fugle, dyr, skibe, køretøjer og planter.</br></br>Lavet af Andreas Refsgaard for Vejle Bibliotek ved brug af Doodle Rig og Doodle Guess af Lindong Huang.');


var context = canvas.getContext("2d");

function transfer() {
  masterNODES.push(NODES);
  masterSKINS.push(SKIN);
  drawings.push(new drawing(currentPrediction, NODES, SKIN))
  clear();
}

function clear() {
  STROKES = [];
  SEL_NODE = 0;
  SKIN = []; //Needed?
  currentPrediction = "";
  
}

function clearAll() {
  clear();
  masterNODES = [];
  masterSKINS = [];
  drawings = [];
}

// function takeScreenshot() {
//   console.log(master_canvas.toDataURL());
//   const link = document.createElement('a');
//   link.download = 'tegnemaskinen.png';
//   link.href = master_canvas.toDataURL();
//   link.click();
//   link.delete;
// }

//Mouse
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
  currentPrediction = "Analyserer..."
  currentPredictionDK = "";
  clearTimeout(thinkText);
  clearTimeout(timeout);
  //currentPredictionDK = "Tegner..."
  //clearInterval(loadingDots);
}

/*
function onmouseup() {
  mouseIsDown = false;
  SEL_NODE = 0;
  readyToGuess = true;
  process();
}
*/

function onmouseup() {
  mouseIsDown = false;
  SEL_NODE = 0;
  //currentPredictionDK = "Tænker";
  setTimeout(thinkText,1000);
  currentPrediction = "Analyserer..."
  currentPredictionDK = "";
  
  debouncedTrigger();
  //currentPrediction = "Analyserer..."
}

function thinkText() {
  currentPredictionDK = "Tænker";
}


var debouncedTrigger = function(event) {
  clearTimeout(timeout);
  timeout = setTimeout(function() {
    currentPrediction = "Analyserer..."
    currentPredictionDK = "Tænker tænker tænker"

    readyToGuess = true;
    process()
  }, 2000);
}




function loadingDots() {
  setInterval(function(){ 
  	//console.log(dots);
    dots += "."
    if (dots.length > 5) {
    	dots = "...";
    }
  }, 333);
}

canvas.onmousemove = function (event) { onmousemove(event.clientX, event.clientY); event.preventDefault(); }
canvas.onmousedown = function (event) { onmousedown(); event.preventDefault(); }
canvas.onmouseup = function (event) { onmouseup(); event.preventDefault(); }
canvas.ontouchstart = function (event) { onmousedown(); event.preventDefault(); }
canvas.ontouchmove = function (event) { onmousemove(event.touches[0].pageX, event.touches[0].pageY); event.preventDefault(); }
canvas.ontouchend = function (event) { onmouseup(); event.preventDefault(); }

function draw_strokes(ctx) {
  for (var i = 0; i < STROKES.length; i++) {
    ctx.beginPath();
    for (var j = 0; j < STROKES[i].length; j++) {
      if (j == 0) {
        ctx.moveTo(STROKES[i][j][0], STROKES[i][j][1]);
      } else {
        ctx.lineTo(STROKES[i][j][0], STROKES[i][j][1]);
      }
    }
    ctx.stroke();
  }
}

//First canvas
function main() {
  context.lineWidth = 1;
  context.fillStyle = "white";
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.strokeStyle = "black";
  draw_strokes(context);
  context.fillStyle = "black";
  context.font = "22px Arial";
  if (currentPrediction !== "Analyserer...") {

    currentPredictionDK = "Er det "
    //Quick'n'dirty translations
    if (currentPrediction == "bird") {
      currentPredictionDK += "en fugl?";
    } else if (currentPrediction == "fish") {
      currentPredictionDK += "en fisk?";
    } else if (currentPrediction == "humanoid") {
      currentPredictionDK += "et menneske?";
    } else if (currentPrediction == "insect") {
      currentPredictionDK += "et insekt?";
    } else if (currentPrediction == "plant") {
      currentPredictionDK += "en plante?";
    } else if (currentPrediction == "quadruped") {
      currentPredictionDK += "et firbenet dyr?";
    } else if (currentPrediction == "ship") {
      currentPredictionDK += "et skib?";
    } else if (currentPrediction == "vehicle") {
      currentPredictionDK += "et køretøj?";
    } else {
      context.fillStyle = "grey";
      //currentPredictionDK = currentPrediction;
      if(readyToGuess) {
        currentPredictionDK = "Jeg er ikke sikker?"

        if (currentPrediction === "") {
          currentPredictionDK = "";
        }

      } else {
        currentPredictionDK = ""
      }
    }
    
  } else {
    //console.log("jeg analyserer")
    if (currentPredictionDK !== "") context.fillText(currentPredictionDK + dots, 10, 30);

  } 
  context.fillText(currentPredictionDK, 10, 30);
}

//Animation attempt for all
function test_animate() {
  //Do the preview (IS THIS NEEDED?)
  if (AUTO_ANIM) {
    for (var i = 0; i < NODES.length; i++) {
      if (NODES[i].parent) {
        var r = Math.min(Math.max(parseFloat(atob(NODES[i].id)), 0.3), 0.7);
        NODES[i].th = NODES[i].th0 + Math.sin((new Date()).getTime() * 0.003 / r + r * Math.PI * 2) * r * 0.5;
      } else {
        NODES[i].th = NODES[i].th0
      }
    }
  }
  doodleMeta.forwardKinematicsNodes(NODES);
  doodleMeta.calculateSkin(SKIN);

  //Do the transfered drawings
  if (AUTO_ANIM) {
    for (let i = 0; i < drawings.length; i++) {
      drawings[i].animate();
    }
  }
  //anim_render();
  master_render();
}

function master_render() {
  master_context.fillStyle = "white";
  master_context.fillRect(0, 0, master_canvas.width, master_canvas.height);

  master_context.drawImage(bgImg, 0, 0, master_canvas.width, master_canvas.height);

  master_context.strokeStyle = "black";
  master_context.fillStyle = "none";
  master_context.lineWidth = 2;
  master_context.lineJoin = "round";
  master_context.lineCap = "round";

  //Move stuff to class instead (works!)
  for (let i = 0; i < drawings.length; i++) {
    drawings[i].show();
  }
}

doodleRig.setup({
  width: WIDTH,
  height: HEIGHT,
  fat: FAT,
  bleed: BLEED,
})


function process() {

  

  var ret = doodleRig.process(STROKES);
  NODES = ret.nodes;
  SKIN = ret.skin;


  var guessRet = NN.predict(STROKES);
  //in_context.drawImage(guessRet.layer0,0,0)
  var dist = guessRet.probabilityDistribution;
  console.log(dist[0][0] + " " + Math.round(dist[0][1] * 10000) / 100);
  currentPrediction = dist[0][0];
}

doodleRig.checkOpenCVReady(function () {
  console.log("OpenCV ready")
  //process();
})


document.body.onload = async function () {
  console.log("Loading guessing model...");
  await NN.loadModel('models/tfjs-model-8571367962526639.json');
  console.log("Guessing model loaded...");
  loadingDots();
  process(); //Hope this does not break stuff!
}

window.setInterval(main, 10);
window.setInterval(test_animate, 10);


function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}