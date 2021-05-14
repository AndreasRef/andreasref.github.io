/*To do

Make sure the "0"-sounds are empty and 100% quiet

*/

var instruments = [
  'piano', 'keyboard', 'drums', 'guitar', 'saxophone'
];

var pianoCount = 0;
var drumsCount = 0;
var guitarCount = 0;
var saxophoneCount = 0;


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

var nnDisplaySize = NN.IMAGE_W*5;
var nDrawings = 0;
var lastPrediction = "none yet";

var ret; //explain this

function aoran(x){
  if (["a","e","i","o","u"].includes(x[0])){
    return "an"
  }
  return "a"
}

function getSuggestion(){
  var s = NN.CLASSES[Math.floor(Math.random()*NN.CLASSES.length)]
  if (NN.CLASS2OBJECTS){
    s += " such as "+NN.CLASS2OBJECTS[s][Math.floor(Math.random()*NN.CLASS2OBJECTS[s].length)];
  }
  //document.getElementById('guess').innerHTML = `Draw something below! How about ${aoran(s)} ${s}?`;
  document.getElementById('guess').innerHTML = "Tegn noget, fx et piano, drums, guitar eller saxophone (kun de objekter, der virker pt)";
}

getSuggestion();


var in_canvas = document.createElement("canvas");
var in_context = in_canvas.getContext("2d");
//in_canvas.width = NN.IMAGE_W;
in_canvas.width = nnDisplaySize*8;
in_canvas.height = nnDisplaySize;
in_canvas.style.position = "absolute";
//in_canvas.style.left = window.innerWidth-NN.IMAGE_W*5+"px";
in_canvas.style.left = 0+"px";
in_canvas.style.top = window.innerHeight-nnDisplaySize+"px";
in_canvas.style.zIndex = -10;
//in_canvas.style.transform="scale(5)";
in_canvas.style.transformOrigin="0% 0%";
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

var ret_div = document.createElement("div");
ret_div.style.zIndex = -100;
ret_div.style.position = "absolute";
ret_div.style.left = "40px";
ret_div.style.top = "200px";
ret_div.style.opacity = 0.5;
document.body.appendChild(ret_div);


function clearAll(){
  STROKES=[];
  in_context.clearRect(0, 0, in_canvas.width, in_canvas.height);
  nDrawings = 0;
  ret_div.innerHTML = "";
  document.getElementById('guess').innerHTML = "Draw something new...";
  //getSuggestion(); 

  //Lazy
  Tone.Transport.stop()

  pianoCount = 0;
  drumsCount = 0;
  guitarCount = 0;
  saxophoneCount = 0;

  drum.load("sounds/drum_0.wav")
  piano.load("sounds/piano_0.wav")
  bass.load("sounds/bass_0.wav")
  saxophone.load("sounds/sax_0.wav")

}

function clearCanvas() {
  STROKES=[];
  ret_div.innerHTML = "";
  document.getElementById('guess').innerHTML = "Draw something new...";
}

function addInstrument () {
  STROKES=[];
  ret_div.innerHTML = "";
  document.getElementById('guess').innerHTML = "Draw something new...";

  if (instruments.indexOf(lastPrediction) !== -1) { //check if last drawing is one of our instruments
    in_context.drawImage(ret.layer0,nDrawings*(nnDisplaySize+5),0, nnDisplaySize,  nnDisplaySize)
    in_context.font = "12pt Calibri"; 
    in_context.fillStyle = ("red");
    in_context.fillText(lastPrediction, nDrawings*(nnDisplaySize+5) + 5, 15);
  }

  if (lastPrediction === "piano" || lastPrediction === "keyboard") {
    if (pianoCount < 4) pianoCount++;
    piano.load("sounds/piano_" + pianoCount + ".wav")
    Tone.Transport.start()
  } else if (lastPrediction === "drums") {
    if (drumsCount < 4) drumsCount++;
    drum.load("sounds/drum_" + drumsCount + ".wav")
    Tone.Transport.start()
  } else if (lastPrediction === "guitar") {
    if (guitarCount < 4) guitarCount++;
    bass.load("sounds/bass_" + guitarCount + ".wav")
    Tone.Transport.start()
  } else if (lastPrediction === "saxophone") {
    if (saxophoneCount < 4) saxophoneCount++;
    saxophone.load("sounds/sax_" + saxophoneCount + ".wav")
    Tone.Transport.start()
  }
  nDrawings++;
}


function onmousemove(x,y){
  var rect = canvas.getBoundingClientRect();
  mouseX = x - rect.left;
  mouseY = y - rect.top;
  if (mouseX < 0 || mouseX > WIDTH || mouseY < 0 || mouseY > HEIGHT){
    mouseIsDown = false;
  }
  if (mouseIsDown){
    STROKES[STROKES.length-1].push([mouseX,mouseY]);
  }
}
function onmousedown(){
  mouseIsDown = true;
  STROKES.push([])
}
function onmouseup(){
  mouseIsDown = false;
  process();
  
}
  
canvas.onmousemove = function(event){onmousemove(event.clientX,event.clientY);event.preventDefault();}
canvas.onmousedown = function(event){onmousedown();event.preventDefault();}
canvas.onmouseup = function(event){onmouseup();event.preventDefault();}
canvas.ontouchstart =function(event){onmousedown();event.preventDefault();}
canvas.ontouchmove = function(event){onmousemove(event.touches[0].pageX,event.touches[0].pageY);event.preventDefault();}
canvas.ontouchend =  function(event){onmouseup();event.preventDefault();}

function draw_strokes(ctx,strokes){
  for (var i = 0; i < strokes.length; i++){
    ctx.beginPath();
    for (var j = 0; j < strokes[i].length; j++){
      if (j == 0){
        ctx.moveTo(strokes[i][j][0], strokes[i][j][1]);
      }else{
        ctx.lineTo(strokes[i][j][0], strokes[i][j][1]);
      }
    }
    ctx.stroke(); 
  }
}


function main(){
  context.lineWidth = 1;
  // context.fillStyle = "white";
  context.clearRect(0,0,WIDTH,HEIGHT);
  context.strokeStyle="black";
  context.lineWidth="3";
  draw_strokes(context,STROKES);
  //if (STROKES.length){
    // process();
  //}

}

function process(){
  ret = NN.predict(STROKES);
  var dist = ret.probabilityDistribution;
  lastPrediction = dist[0][0];
  console.log(dist[0][0] + " " + Math.round(dist[0][1]*10000)/100);
  
  var res_str = "";
  for (var i = 0; i < ((dist.length > 17) ? 10 : dist.length); i++){
    var pc = Math.round(dist[i][1]*10000)/100;
    res_str += `<div>${dist[i][0]} (${pc}%)</div><progress value="${pc}" max="100"></progress>`
  }
  
  ret_div.innerHTML = res_str;
  var guess_str = "It's "+aoran(ret.prediction)+" "+ret.prediction
  if (dist[0][1] < 0.9){
    guess_str += " (or "+dist[1][0]+")"
  }else{
    guess_str += "!";
  }
  
  document.getElementById("guess").innerHTML = guess_str;
}

document.body.onload = async function (){
  title.innerHTML = 'Loading model...';
  await NN.loadModel('models/tfjs-model-8571367962526639.json');
  title.innerHTML = 'Doodle Tunes online, early demo';
}

window.setInterval(main,10);
