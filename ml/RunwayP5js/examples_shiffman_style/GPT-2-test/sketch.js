let outputText;
let input;

let paragraph;

function setup() {
    noCanvas();
    input = createInput();
    createButton('generateText').mousePressed(do_http_post);
    paragraph = document.getElementById("myText");
}

function do_http_post() {
    paragraph.innerHTML = "thinking...";
    const path = "http://localhost:8000/query";
    const data = {
        prompt: input.value(),
        seed: 0
    };
    // httpPost(path, [datatype], [data], [callback], [errorCallback])
    httpPost(path, 'json', data, gotResult, gotError); 
}

function gotError(error) {
    console.error(error);
}

function gotResult(result) {
    paragraph.innerHTML = result.text;
}