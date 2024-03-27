//let wordVecs;

//To do in version 1:
//Make it like the fading text example from Kodning og Poesi med brugerinput

//To do in version 2:
//Press a word to make it the search word
//

let wordVectors;

var currentWords = [];
var currentWord = 0;
var nWords = 10;

function setup() {
  createCanvas(windowWidth-20,windowHeight-75);
  wordVectors = new ml5.Word2Vec('data/wordvecs1000.json');

  frameRate(10);

  for (var i = 0; i<nWords; i++) {
    currentWords[i] = "";
  }

  let loadHide = select("#loadHide");
  loadHide.hide();

  // let nearWordInput = select('#nearword');
  // let nearButton = select('#submit');
  // let nearResults = select('#results');

  loadHide.show();
  //noLoop();
  //noCanvas();

  // nearButton.mousePressed(() => {
  //   let word = nearWordInput.value();
  //   nearResults.html(findNearest(word, 10));
  // });
}

function draw() {
  noStroke();
  fill(0, 25, 50, 15); // adds halo or transparecy
    rect(0, 0, width, height);

    if (currentWord < currentWords.length-1) {
     currentWord++;
    } else {
      currentWord = 0;
    }

    rotate(random(-1,+1)); // rotate text random
    fill(155);
    textSize(random(300));
    textAlign(CENTER, CENTER);
    text(currentWords[currentWord], random(width), random(height));
    console.log(currentWord);



  // for (var i = 0; i<currentWords.length; i++) {
  //   text(currentWords[i], 29 + i*20, 20 + i*20);
  // }
}

function keyReleased(){

  let nearWordInput = select('#nearword');
  let word = nearWordInput.value();
  findNearest(word, nWords)

}

function findNearest(word, n) {
  let nearest = wordVectors.nearest(word, n);
  if (!nearest) {
    for (var i = 0; i<n; i++) {
      currentWords[i] = "";
    }
    return 'No word vector found';

  } else {
    for (var i = 0; i<n; i++) {
      currentWords[i] = nearest[i].vector;
    }
    console.log(currentWords);
  }
  // let output = '';
  // for (let i = 0; i < nearest.length; i++) {
  //   //output += nearest[i].vector + '<br/>';
  // }
  // return output;
}
