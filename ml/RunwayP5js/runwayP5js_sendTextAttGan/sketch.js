let input, button;

function setup() {
    noCanvas();

    input = createInput();
    input.position(20, 20);

    button = createButton('submit');
    button.position(input.x + input.width, 20);
    button.mousePressed(sendStringToRunway);
}

function draw() {

}

function sendStringToRunway() {
    const inputs = {
        "caption": input.value()
    };

    fetch('http://localhost:8001/query', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs)
    })
    .then(response => response.json())
    .then(output => {
    const { result } = output;
    // use the outputs in your project
  })
}

