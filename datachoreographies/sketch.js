/* To do

PRIORITY:
Better CSS layout 

MEDIUM PRIORITY:
Better prompt design!
Find out how to avoid them just repeating themselves
Make a loading animation

NICE TO HAVE
Make specific beginnings for the different agents, to shake of the conversations when they get stuck....
Make something work even if there is no internet connection
Wrong names (-) before name - do this by replacing [\n- with \n] - hope I fixed this in line 169: txt.replaceAll("\n-","\n");
Position "continue" button in the middle of the screen textfield OR make the textfield fill out the whole screen
*/

//let loremText = "\n   yes cool and stuff \nall good \n1 great \n2 great \n 3 great \n4 great \n5 great \n6 great \n7 great \n8 great \n9 great yes cool and stuff \nall good \n1 great \n2 great \n 3 great \n4 great \n5 great \n6 great \n7 great \n8 great \n9 great yes cool and stuff \nall good \n1 great \n2 great \n 3 great \n4 great \n5 great \n6 great \n7 great \n8 great \n9 great yes cool and stuff \nall good \n1 great \n2 great \n 3 great \n4 great \n5 great \n6 great \n7 great \n8 great \n9 great"

//long
//let loremText = "Radical Deconstructionist: Cars are a symbol of capitalism and the only way to free ourselves from capitalist values is by destroying it. Life Coach: I'm sorry, but what has cars got to do with capitalism? This doesn't make any sense. \n\n\nRadical Deconstructionist: They're both symbols of power that you can use for your own purposes - look at how many people have been killed in car accidents or burned alive because they jumped into their vehicle on fire! Cars are simply instruments of death! Life Coach: How can you say these terrible things about something as important as cars? That's not going to help anyone improve themselves.\n\n\n\nRadical Deconstructionist: It's not about improving yourself, it's about freeing yourself from values and values are in the mind and cars are in the streets! \n\nLife Coach: But cars are in the streets and you can't ban them from the streets.\n\nRadical Deconstructionist: You can ban them from your streets and in fact, I imagine that in an ideal society, no one would drive cars!\n\nLife Coach: Well, I don't drive a car and I don't like them much. They're noisy and they pollute. But I don't see how banning people from driving cars would help.Radical Deconstructionist: I've told you, you're a capitalist! \n\nLife Coach: I'm not a capitalist! \n\nRadical Deconstructionist: You're a capitalist because you're a consumer. If you want to be a non-capitalist then you have to consume in non-capitalist ways."

//Shorter
let loremText = "Radical Deconstructionist: Cars are a symbol of capitalism and the only way to free ourselves from capitalist values is by destroying it. Life Coach: I'm sorry, but what has cars got to do with capitalism? This doesn't make any sense. \n\n\nRadical Deconstructionist: They're both symbols of power that you can use for your own purposes."

//Sloppy stuff
let i;
let txt = "";
let continueCounter = 0;

let continueTexts = ["I think", "What if", "The funny thing is", "If", "Look at it this way:", "From my perspective", "Let me tell you a personal thing:", "Hmmm...", "Okay", "Will", "Often", "Well", "Can", "So...", "Seems like", "Based on my knowledge", "All things considered", "If only", "I like to believe that", "Aha!", "(Sighs)", "(Takes a deep breath).", "(Thinks for a while).", "Ummm..."];

let agentTexts = [
    ["Computer", " a", "The computer understands the world through facts, numbers and logic and has a positivist point of view"],
    ["Dog", " a", "The dog talks about what being a dog is like, but easily loses focus and likes to chase things, bite and bark"],
    ["Salesperson", " a", "The salesperson sees everything from a monetary point of view and sounds like an advertisement"],
    ["Politician", " a", "The politician tries to make people like him and vote for him"],
    ["Deconstructionist", " a", "The deconstructionist is radically anti-capitalistic, refers to Derrida, Harraway and Foucault and questions traditional assumptions and definitions"]
]

let topicTexts = [
    "luck",
    "yoga",
    "the Internet",
    "pizza",
    "Netflix"
]

let firstAgentIndex = document.getElementById("firstAgent").value;
let secondAgentIndex = document.getElementById("secondAgent").value;

let firstAgent = agentTexts[firstAgentIndex];
let secondAgent = agentTexts[secondAgentIndex];

let theme = document.getElementById("userTheme").value;

let agents = [];

let loadingDots = "";

function generate() {
    var textarea = document.getElementById('textArea');
    textarea.value = "[Generating...]";

    firstAgentIndex = document.getElementById("firstAgent").value;
    secondAgentIndex = document.getElementById("secondAgent").value;

    agents = [agentTexts[firstAgentIndex][0]+ ":", agentTexts[secondAgentIndex][0]+ ":"];

    firstAgent = agentTexts[firstAgentIndex];
    secondAgent = agentTexts[secondAgentIndex];

    //If else about the topic and whether to use the user input or not
    let topic = document.getElementById("topic").value;

    if (topic == 5) {
        theme = document.getElementById("userTheme").value.trim();
    } else {
        theme = topicTexts[topic];
    }

    //textInput = "A conversation between a " + firstAgentText + " and a " + secondAgentText + " about the topic of " + theme;
    let textInput = "A turn-taking conversation between" + firstAgent[1] + " " + firstAgent[0] + " and" + secondAgent[1] + " " + secondAgent[0] + "who do not agree on the topic of " + theme + ". "
        + firstAgent[2] + ". " + secondAgent[2] + ".\n\n" + firstAgent[0] + ": " + theme.charAt(0).toUpperCase() + theme.slice(1);
    //Send the product description prompt to GPT-3
    console.log("Promt sent to GPT-3 from generate():\n" + textInput);

    //textarea.value = textInput;

    if (topic == 5) {
        OpenaiFetchAPI(textInput, firstAgent[0] + ": " + theme.charAt(0).toUpperCase() + theme.slice(1), false);
    } else {
        //testPremade();
        // txt = "hello";
        // typeWriter();
        generateLoremIpsum();
    }
    
}

function continueConversation() { //This could be improved, by also sending the initial instruction to the GPT-3 //Also think about whether the story is too long? Only allow continue if the story is short enough
    document.getElementById("continueButton").style.display = "none";
    continueCounter++;
    let localContinueText;// = continueTexts[Math.floor(Math.random() * continueTexts.length)] + " " + theme.charAt(0).toUpperCase() + theme.slice(1);
    
    //SWAP THE ORDER OF THE AGENTS OR EVEN BETTER, LET THE AGENT WHO DID NOT SPEAK LAST SPEAK FIRST
    let nextAgent;
    if (document.getElementById("textArea").value.lastIndexOf(firstAgent[0]) > document.getElementById("textArea").value.lastIndexOf(secondAgent[0])) {
        nextAgent = secondAgent;
    } else {
        nextAgent = firstAgent;
    }

    if ((Math.random() * 100) > 20) { //Sometimes include the theme in the continue text
        localContinueText = continueTexts[Math.floor(Math.random() * continueTexts.length)];
    } else {
        localContinueText = continueTexts[Math.floor(Math.random() * continueTexts.length)] + " " + theme;
    }

    //Make a generation text indicator
    var textarea = document.getElementById('textArea');
    


    let textInput = "A turn-taking conversation between" + firstAgent[1] + " " + firstAgent[0] + " and" + secondAgent[1] + " " + secondAgent[0] + "who do not agree on the topic of " + theme + ". "
    + firstAgent[2] + ". " + secondAgent[2] + ".\n\n" + document.getElementById("textArea").value + "\n\n" + nextAgent[0] + ": " + localContinueText;
    console.log("Promt sent to GPT-3 from continueConversation():\n" + textInput); 0

    OpenaiFetchAPI(textInput, "\n\n" + nextAgent[0] + ": " + localContinueText, true); //Actually send to GPT-3
    textarea.value += "\n\n[Generating...]";
}

function OpenaiFetchAPI(myPrompt, beginningString, continuation) {

    console.log("Calling GPT3")
    var url = "https://api.openai.com/v1/engines/davinci-instruct-beta/completions";
    var bearer = 'Bearer ' + "APIKEY";
    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': bearer,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "prompt": myPrompt,
            "max_tokens": 240,
            "temperature": 0.7,
            "top_p": 1,
            "n": 1,
            "frequency_penalty": 0.9,
            "presence_penalty": 0.9,
            "stream": false,
            "logprobs": null,
            "stop": ""
        })
    }).then(response => {

        return response.json()

    }).then(data => {
        console.log(data)
        console.log(typeof data)
        console.log(Object.keys(data))
        console.log("Data output from GPT-3:\n" + data['choices'][0].text)


        //Here we should NOT trim if it is a continuation
        if (continuation) {
            //Delete the loading indicator part of the text
            let textArea = document.getElementById("textArea");
            textArea.value = textArea.value.substring(0, textArea.value.lastIndexOf("\n\n[Generating...]"));
            //textArea.value = textArea.value.replaceAll("\n\n[Generating...]", "");
            txt = beginningString + "" + data['choices'][0].text;
        } else {
            txt = beginningString + " " + data['choices'][0].text.trim();
            continueCounter = 0;
        }

        //Here we could make the story continue, if needed?
        console.log("finish-reason: ")
        console.log(data['choices'][0].finish_reason);

        if (data['choices'][0].finish_reason == "length") {
            txt = removeStuffAfterPeriod(txt);
            console.log("text trimmed until last period: " + txt);
        }

        //Random manual replacements
        txt = txt.replaceAll("\n-","\n");
        txt = txt.replaceAll("\nA Computer","\nComputer");
        txt = txt.replaceAll("\nA Dog","\nDog");
        txt = txt.replaceAll("\nThe Computer:","\nComputer:");
        txt = txt.replaceAll("\nThe Dog:","\nDog:");


        txt = insertLineBreak(txt, agents); //This seems to break things...
        txt = replaceWithTwoLinebreaks(txt, "\n");

        //document.getElementById("generatedText").innerHTML = "";
        var textarea = document.getElementById('textArea');
        if (continuation == false) {
            textarea.value = ""; //SUPER IMPORTANT FIX HOW THIS WORKS FOR CLEARING...
            txt = txt.trim();
        }
        i = 0;
        typeWriter();
    })
        .catch(error => {
            console.log('Something bad happened ' + error)
            document.getElementById("continueButton").style.display = "none";
            var textarea = document.getElementById('textArea');
            textarea.value = ""; //SUPER IMPORTANT FIX HOW THIS WORKS FOR CLEARING...
            i = 0;
            
            txt = "No connection... ¯\\_(ツ)_/¯ \n\nThis demo does not connect to the GPT-3 API.\n\nReach out to me if you want to see it live in action.\n\nwww.andreasrefsgaard.dk / mail@andreasrefsgaard.dk / twitter.com/AndreasRef"
            typeWriter();
        });
}

function generateLoremIpsum() {
    console.log("Gonna display loremImpsum after timeout");
    var textarea = document.getElementById('textArea');
    textarea.value = "[Generating...]";
    setTimeout(displayLoremImpsum, 600);
}

function displayLoremImpsum() {
    //txt = loremText.trim();
    //txt = loremText.trim();
    testPremade();
    agents = [agentTexts[firstAgentIndex][0] + ":", agentTexts[secondAgentIndex][0] + ":"];
    txt = insertLineBreak(txt, agents).trim();
    txt = replaceWithTwoLinebreaks(txt, "\n");
    //document.getElementById("generatedText").innerHTML = "";
    i = 0;
    var textarea = document.getElementById('textArea');
    textarea.value = "";
    typeWriter();
}


function typeWriter() {
    var textarea = document.getElementById('textArea');
    document.getElementById("continueButton").style.display = "none";
    let topic = document.getElementById("topic").value;
    if (i < txt.length) {
        textarea.value += txt[i];
        textarea.scrollTop = textarea.scrollHeight;
        i++;
        setTimeout(typeWriter, 20); //speed in ms
    } else {
        console.log("finished with total length of: " + textarea.value.length);
        if (textarea.value.length > 3000 || continueCounter > 3)  {
            console.log("too long or too many continuations, will not continue");
        } else if (topic == 5) {
            console.log("allow continuations");
            document.getElementById("continueButton").style.display = "inline";
        }
        
    }
    //Sloppy
    if (txt == "No connection... ¯\\_(ツ)_/¯ \n\nConnect to the Internet or try another combination of agents and topic.") {
        document.getElementById("continueButton").style.display = "none";
    }
}

function topicChanged() {
    let topic = document.getElementById("topic").value;
    console.log("Topic changed to: " + topic);
    if (topic == 5) {
        console.log("toggle visibility of userInputField");
        document.getElementById("GPT-3Button").disabled = true;
        document.getElementById("userTheme").style.display = "inline";
        document.getElementById("userTheme").focus();
    } else {
        document.getElementById("userTheme").style.display = "none";
        document.getElementById("GPT-3Button").disabled = false;
    }
    testPremade();
    document.getElementById("continueButton").style.display = "none";
}

function userThemeChanged() {
    let userTheme = document.getElementById("userTheme").value;
    console.log("User theme changed to: " + userTheme);
    if (userTheme.length > 0) {
        document.getElementById("GPT-3Button").disabled = false;
        console.log("do not disable")
    } else {
        console.log("disable")
        document.getElementById("GPT-3Button").disabled = true;
    }
}

//A function that inserts a linebreak in a string before all words from a given array
function insertLineBreak(str, words) {
    var newStr = str;
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        newStr = newStr.replaceAll(word, '\n' + word); //Potentially you could also check for capital / lowercase letters here?
    }
    return newStr;
}


function replaceWithTwoLinebreaks(str, word) { //Technically the wrong word for this function
    var newStr = str;
    newStr = newStr.replace(new RegExp(word + "{2,}", "g"), word); //First replace all words with two or more occurences of the word
    newStr = newStr.replaceAll(word, word + word); //Then replace all single occurences of the word with two times the word
    return newStr;
}

//A function that removes everything after the last occurence of a period - this should be improved to also cover questions marks and !
function removeStuffAfterPeriod(str) { //rename me! I cover more stuff than just periods ;-)
    var newStr = str;

    let periodIndex = newStr.lastIndexOf(".");
    let questionMarkIndex = newStr.lastIndexOf("?");
    let exclamationMarkIndex = newStr.lastIndexOf("!");

    let whereToCut = max_of_three(periodIndex, questionMarkIndex, exclamationMarkIndex);

    // newStr = newStr.substring(0, newStr.lastIndexOf(".") + 1);
    newStr = newStr.substring(0, whereToCut + 1);
    return newStr;
}



function max_of_three(x, y, z) {
    max_val = 0;
    if (x > y) {
        max_val = x;
    } else {
        max_val = y;
    }
    if (z > max_val) {
        max_val = z;
    }
    return max_val;
}

function clearConversation() {
    document.getElementById("textArea").value = "";
    document.getElementById("continueButton").style.display = "none";
}


function firstAgentChanged() {
    console.log("Agent 1 changed");
    testPremade();
    firstAgentIndex = document.getElementById("firstAgent").value;

    for (var i = 0; i < agentTexts.length; i++) {
        document.getElementById("secondAgent").options[i].disabled = false;
    }
    document.getElementById("secondAgent").options[firstAgentIndex].disabled = true;
    document.getElementById("continueButton").style.display = "none";
}

function secondAgentChanged() {
    console.log("Agent 2 changed");
    testPremade();
    secondAgentIndex = document.getElementById("secondAgent").value;

    for (var i = 0; i < agentTexts.length; i++) {
        document.getElementById("firstAgent").options[i].disabled = false;
    }
    document.getElementById("firstAgent").options[secondAgentIndex].disabled = true;
    document.getElementById("continueButton").style.display = "none";
}


function testPremade() { //This is so messy!
    let currentDict = luck;

    let topic = document.getElementById("topic").value;

    if (topic == 0) {
        currentDict = luck;
    } else if (topic == 1) {
        currentDict = yoga;
    } else if (topic == 2) {
        currentDict = internet;
    } else if (topic == 3) {
        currentDict = pizza;
    } else if (topic == 4) {
        currentDict = netflix;
    } else {
        //Make sure to test for this, since this is where the user can input stuff
    }

    firstAgentIndex = document.getElementById("firstAgent").value;
    secondAgentIndex = document.getElementById("secondAgent").value;

    firstAgent = agentTexts[firstAgentIndex];
    secondAgent = agentTexts[secondAgentIndex];
    
    let key = firstAgent[0].toLowerCase()+"_"+secondAgent[0].toLowerCase();
    
    //flip stuff so it works the other way around... if undefined - OMG it is sloppy!
    if (currentDict[key] == undefined) {
        key = secondAgent[0].toLowerCase()+"_"+firstAgent[0].toLowerCase();
    }

    console.log(key);
    console.log(currentDict);
    console.log(currentDict[key]);

    txt = currentDict[key];

    // var textarea = document.getElementById('textArea');
    // textarea.value = currentDict[key];
}


var elem = document.documentElement;
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
  document.getElementById("fullScreenButton").style.display = "none";

  //console.log(isFullScreen());
}


// function isFullScreen() {
//     console.log(!!(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement))
//     document.getElementById("fullScreenButton").style.display = "inline";
//   }