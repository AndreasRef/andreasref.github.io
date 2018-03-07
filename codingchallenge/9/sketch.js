//let wordVecs;

//To do:
//Press enter instead of button
//Press a word to make it the search word
//

let wordVectors;

function setup() {
  createCanvas(100, 100);
  wordVectors = new ml5.Word2Vec('data/wordvecs10000.json');

  let loadHide = select("#loadHide");
  loadHide.hide();

  // let nearWordInput = select('#nearword');
  // let nearButton = select('#submit');
  // let nearResults = select('#results');

  loadHide.show();
  noLoop();
  noCanvas();

  // nearButton.mousePressed(() => {
  //   let word = nearWordInput.value();
  //   nearResults.html(findNearest(word, 10));
  // });
}

function draw() {
  background(0);
  stroke(255);
  strokeWeight(4);
  translate(width/2,height/2);
  rotate(frameCount * 0.5);
  line(0,0,width/2,0);
}

function keyReleased(){
  console.log("key!");

  let nearWordInput = select('#nearword');
  let nearButton = select('#submit');
  let nearResults = select('#results');

  let word = nearWordInput.value();
  nearResults.html(findNearest(word, 10));
}

function findNearest(word, n=10) {
  let nearest = wordVectors.nearest(word, n);
  console.log('nearest', nearest);
  if (!nearest) {
    return 'No word vector found';
  }
  let output = '';
  for (let i = 0; i < nearest.length; i++) {
    output += nearest[i].vector + '<br/>';
  }
  return output;
}
