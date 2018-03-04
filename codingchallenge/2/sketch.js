var words = ["i", "heart", "p", "five"]; // some words
var iptr = 0; // a counter for the words

var myVoice = new p5.Speech(); // new P5.Speech object

var myRec = new p5.SpeechRec(); // new P5.SpeechRec object
	myRec.continuous = true; // do continuous recognition
	myRec.interimResults = true; // allow partial recognition (faster, less accurate)

var mostrecentword = "none";

var listbutton; // button
var inputWord = "";

function setup() {

  noCanvas();

  var lexicon = new RiLexicon();

  // Make a text input field
  input = select('#inputWord');
  var button = select('#rhyme');
  button.mousePressed(rhymeSwap);


  function posSwap() {
    var sentence = input.value();
    var rs = new RiString(sentence);
    var pos = rs.pos();

    var output = '';
    for (var i = 0; i < pos.length; i++) {
      output += lexicon.randomWord(pos[i]);
      output += ' ';
    }
    //createP(output).class('text');
  }

  function rhymeSwap() {

    //var inputWord = input.value();
		myVoice.speak(inputWord);
		var output = inputWord.replace(/\b\w+\b/g, replacer);

		myVoice.speak(output);

    createP(output).class('text');
    function replacer(match) {
      var rhymes = lexicon.rhymes(match);
      if (rhymes.length > 0) {
        return random(rhymes);
      } else {
        return "Sorry, no rhymes found";
      }
    }
  }
		// say hello when to program starts.
	myVoice.speak('Lets get ready to rhyme, baby!!!');


	myRec.onResult = parseResult; // recognition callback
	myRec.start(); // start engine

	function parseResult()
	{
		// recognition system will often append words into phrases.
		// so hack here is to only use the last word:
		mostrecentword = myRec.resultString.split(' ').pop();
		letters = mostrecentword + " ";
		counter = 0;

		// if(mostrecentword.indexOf("left")!==-1) { dx=-1;dy=0; }
		// else if(mostrecentword.indexOf("right")!==-1) { dx=1;dy=0; }
		// else if(mostrecentword.indexOf("up")!==-1) { dx=0;dy=-1; }
		// else if(mostrecentword.indexOf("down")!==-1) { dx=0;dy=1; }
		// else if(mostrecentword.indexOf("clear")!==-1) { background(255); }
		console.log(mostrecentword);
		inputWord = mostrecentword;

		createP(inputWord).class('text');

	}

}
