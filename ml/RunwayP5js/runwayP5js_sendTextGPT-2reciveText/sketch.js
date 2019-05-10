let input, button;

let outputText = "";

function setup() {
    createCanvas(600,400);

    input = createInput();
    input.position(10, 10);

    button = createButton('submit');
    button.position(input.x + input.width, 10);
    button.mousePressed(sendStringToRunway);
}

function draw() {
    background(220);
    text(outputText, 10, 30, width-10, height-10);
}

function sendStringToRunway() {
    const inputs = {
        "prompt": input.value()
    };

    fetch('http://localhost:8004/query', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs)
    })
    .then(response => response.json())
    .then(output => {
    const { text } = output;
    // use the outputs in your project
    console.log(output);
    outputText = output.text;
  })
}

