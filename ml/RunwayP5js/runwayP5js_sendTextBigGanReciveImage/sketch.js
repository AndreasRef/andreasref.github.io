let output;
let img;

let input, button;

function setup() {
    noCanvas();

    input = createInput();
    input.position(20, 265);

    button = createButton('submit');
    button.position(input.x + input.width, 265);
    button.mousePressed(sendStringToRunway);
}

function draw() {
    img.position(0, 0);
    img.size(256, 256);
}

function sendStringToRunway() {
    const inputs = {
        "category": input.value(),
        "truncation": random(1),
        "seed": 1
    };

    fetch('http://localhost:8002/query', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs)
    })
        .then(response => response.json())
        .then(output => {
        const { generatedOutput} = output;
        // use the outputs in your project
        console.log(output);
        img = createImg(output.generatedOutput);
    })
}

