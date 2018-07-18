const word2Vec = ml5.word2vec('data/wordvecs10000.json', modelLoaded);
let modelReady = false;

var tenthOutput = "";

var outputs = [];

function setup() {
  noLoop();
  noCanvas();

  // Select all the DOM elements
  let nearWordInput = select('#nearword');
  let nearButton = select('#submit');
  let nearResults = select('#results');

  // Finding the nearest words
  nearButton.mousePressed(() => {
    let word = nearWordInput.value();
    nearResults.html(findNearest(word, 10));
  });
}

// Model is ready
function modelLoaded() {
  modelReady = true;
}

// Converts the result of nearest() to html to display
function findNearest(word, n = 10) {
  if (modelReady) {
    let nearest = word2Vec.nearest(word, n);
    if (!nearest) {
      return 'No word vector found';
    }
    let output = '';
    for (let i = 0; i < nearest.length; i++) {
      output += '<p id =' +i+ '>' + i + ': ' + nearest[i].vector + '</p>';
      if (i == 9) tenthOutput = nearest[i].vector;
        outputs[i] = nearest[i].vector;
    }
    return output;
  }
  return 'Model has not loaded yet!';
}


function keyTyped() {
    if (key === '0' || key === '1' || key === '2' || key === '3' || key === '4' || key === '5' || key === '6' || key === '7' || key === '8' || key === '9') {
        document.getElementById("nearword").value = outputs[key];
    }
    else if (keyCode === ENTER || keyCode === RETURN) {
        
          let nearWordInput = select('#nearword');
          let nearButton = select('#submit');
          let nearResults = select('#results');
        
     let word = nearWordInput.value();
     nearResults.html(findNearest(word, 10));
     console.log("enter");
    }
}
