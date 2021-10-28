/* To do

Better prompt design!
Make linebreaks before qoutes
Wrong names (-) before name
Continue the conversation if it gets stuck very fast, based on: console.log(data['choices'][0].finish_reason) == "stop"; 

Potentially pre - pick the stories? Make 5 x 5 x 5 good stories? And then also make an experimental mode, where you can decide things yourself...

*/

let loremText = "Radical Deconstructionist: Cars are a symbol of capitalism and the only way to free ourselves from capitalist values is by destroying it\n\nLife Coach: I'm sorry, but what has cars got to do with capitalism? This doesn't make any sense. \n\nRadical Deconstructionist: They're both symbols of power that you can use for your own purposes - look at how many people have been killed in car accidents or burned alive because they jumped into their vehicle on fire! Cars are simply instruments of death! \n\nLife Coach: How can you say these terrible things about something as important as cars? That's not going to help anyone improve themselves.\n\nRadical Deconstructionist: It's not about improving yourself, it's about freeing yourself from values and values are in the mind and cars are in the streets! \n\nLife Coach: But cars are in the streets and you can't ban them from the streets.\n\nRadical Deconstructionist: You can ban them from your streets and in fact, I imagine that in an ideal society, no one would drive cars!\n\nLife Coach: Well, I don't drive a car and I don't like them much. They're noisy and they pollute. But I don't see how banning people from driving cars would help.\n\nRadical Deconstructionist: I've told you, you're a capitalist! \n\nLife Coach: I'm not a capitalist! \n\nRadical Deconstructionist: You're a capitalist because you're a consumer. If you want to be a non-capitalist then you have to consume in non-capitalist ways."

//Sloppy stuff
let i;
let txt = "";

// let agentTexts = [
//     "lifecoach",
//     "dog",
//     "jar of honey",
//     "God",
//     "radical deconstructionist"
// ]


let agentTexts = [
    ["Life Coach", " a", "The life coach is positive"],
    ["Dog", " a", "The dog likes to bark"],
    ["Jar of Honey", " a", "The jar of honey mainly talks about itself"],
    ["God", " a", "God is very sweet and wise"],
    ["Radical Deconstructionist", " a", "The radical deconstructionist is anti-capitalistic and likes to refer to Agamben and Haraway"]
]

function generate() {
    var textarea = document.getElementById('textArea');
    textarea.value = "generating";

    let firstAgentIndex = document.getElementById("firstAgent").value;
    let secondAgentIndex = document.getElementById("secondAgent").value;

    let firstAgent = agentTexts[firstAgentIndex];
    let secondAgent = agentTexts[secondAgentIndex];

    //let firstAgentDescription = agentTexts[firstAgentIndex][1];
    //let secondAgentDescription = agentTexts[firstAgentIndex][1];

    let theme = document.getElementById("userTheme").value;

    //textInput = "A conversation between a " + firstAgentText + " and a " + secondAgentText + " about the topic of " + theme;
    textInput = "A turn-taking conversation between" + firstAgent[1] + " " + firstAgent[0] + " and" + secondAgent[1] + " " + secondAgent[0] + " about the topic of " + theme + ". " 
                + firstAgent[2] + ". " + secondAgent[2] +".\n\n" +firstAgent[0] + ": " + theme.charAt(0).toUpperCase() + theme.slice(1);
    //Send the product description prompt to GPT-3
    console.log("Promt sent to GPT-3:\n" + textInput);

    //textarea.value = textInput;
    OpenaiFetchAPI(textInput, firstAgent[0] + ": " + theme.charAt(0).toUpperCase() + theme.slice(1));
}

function OpenaiFetchAPI(myPrompt, beginningString) { //Deactivated
    console.log("Calling GPT3")
    var url = "https://api.openai.com/v1/engines/davinci-instruct-beta/completions";
    var bearer = 'Bearer ' + "hidden_key"
    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': bearer,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "prompt": myPrompt,
            "max_tokens": 564,
            "temperature": 0.7,
            "top_p": 1,
            "n": 1,
            "frequency_penalty": 1.84,
            "presence_penalty": 1.5,
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
        console.log(data['choices'][0].text)

        //Here we could make the story continue, if needed?
        console.log("finish-reason: ")
        console.log(data['choices'][0].finish_reason);

        txt = beginningString + " " + data['choices'][0].text.trim();
        //document.getElementById("generatedText").innerHTML = "";
        var textarea = document.getElementById('textArea');
        textarea.value = "";
        i = 0;
        typeWriter();

    })
        .catch(error => {
            console.log('Something bad happened ' + error)
        });
}

function generateLoremIpsum() {
    console.log("Gonna display loremImpsum after timeout");
    var textarea = document.getElementById('textArea');
    textarea.value = "generating";
    setTimeout(displayLoremImpsum, 600);
}

function displayLoremImpsum() {
    txt = loremText.trim();
    //document.getElementById("generatedText").innerHTML = "";
    i = 0;
    var textarea = document.getElementById('textArea');
    textarea.value = "";
    typeWriter();
}


function typeWriter() { //Fix missing linebreaks! 
    var textarea = document.getElementById('textArea');
    if (i < txt.length) {
        textarea.value += txt[i];
        textarea.scrollTop = textarea.scrollHeight;
        i++;
        setTimeout(typeWriter, 30); //speed in ms
    }
}