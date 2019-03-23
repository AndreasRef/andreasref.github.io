let output;
let img;

let input, button;

let lines;

let categories;


function preload() {
  lines = loadStrings('categories.txt');
  
}

function setup() {
    noCanvas();

    input = createInput();
    input.position(20, 265);

    button = createButton('submit');
    button.position(input.x + input.width, 265);
    button.mousePressed(filterInput);
    
    categories = join(lines);
    categories = categories.split(',');
    
    console.log(categories);
}

function draw() {
    img.position(0, 0);
    img.size(256, 256);
}

function filterInput() {
    
    let inputText = trim(input.value());
    
    var outputText = "";
    var offensiveContent = false;
    
    
    for (var i = 0; i < categories.length; i++) {
      if (inputText.includes(categories[i])) {
        console.log(categories[i]);
        sendStringToRunway(categories[i]);
        //exit or break out?
      }
    }
}


function sendStringToRunway(categoryForBigGAN) {
    const inputs = {
        "category": categoryForBigGAN,
        "truncation": random(1),
        "seed": 1
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
        const { generatedOutput, z } = output;
        // use the outputs in your project
        console.log(output);
        img = createImg(output.generatedOutput);
    })
}

