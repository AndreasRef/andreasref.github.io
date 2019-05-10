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
    if (img) {
        img.position(0, 0);
        img.size(256, 256);
    }
}

function sendStringToRunway() {
    const vector = [];
    for (let i = 0; i < 140; i++) {
        vector.push(random());
    }

    const inputs = {
        "category": input.value(),
        "z": vector
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
        const { generatedOutput } = output;
        // use the outputs in your project
        console.log(output);
        img = createImg(generatedOutput);
    })
}
