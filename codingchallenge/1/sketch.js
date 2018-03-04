var words = ["i", "heart", "p", "five"]; // some words
var iptr = 0; // a counter for the words

var myVoice = new p5.Speech(); // new P5.Speech object

var listbutton; // button

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
    createP(output).class('text');
  }

  function rhymeSwap() {

    var inputWord = input.value();
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
}
