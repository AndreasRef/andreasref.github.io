let myKey = getApiKeyFromUrl();

function getApiKeyFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("api_key") || ""; // Extract the API key from the URL query string
}

let allConcepts = []; 
let nodes = [];
let springs = [];
let selectedNode = null;
let nodeDiameter = 16;
let nNodesPerClick = 5;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  textAlign(CENTER, CENTER);

  //callAPI("apple"); // Call OpenAI API to generate associations for the concept "apple

  const inputField = select("#inputField");
  inputField.changed(() => {
    const textValue = inputField.value();
    if (textValue !== "") {
      inputField.hide();
      if (nodes.length === 0) {
        let newNode = new Node(width / 2, height / 2);
        Object.assign(newNode, {
          minX: 50,
          minY: 50,
          maxX: width - 50,
          maxY: height - 50,
          radius: 150,
          strength: -5,
          alpha: 1, // Make initial node visible immediately
          concept: textValue.toUpperCase(), // Assign concept from input field
        });
        nodes.push(newNode);
        setTimeout(() => addNewNodes(newNode), 1500);
      }
      inputField.value("");

      //display the reset button
      document.getElementById("replayButton").style.display = "block";
    }
  });

  // const replayButton = createButton('Replay');
  //   replayButton.position(windowWidth - 80, 10);
  //   replayButton.mousePressed(resetSketch);
}

function draw() {
  background(255);

  nodes.forEach((node) => {
    node.attractNodes(nodes);
    node.update();
  });

  springs.forEach((spring) => spring.update());

  stroke(0, 130, 164, 50);
  strokeWeight(2);


  springs.forEach((spring) => {
    // Calculate the direction vector from fromNode to toNode
    let direction = createVector(spring.toNode.x - spring.fromNode.x, spring.toNode.y - spring.fromNode.y);
    // Shorten the vector by 10% for both start and end points
    let shortenedStart = direction.copy().mult(0.05); // Shorten by 5% to start closer to the fromNode
    let shortenedEnd = direction.copy().mult(0.95); // End 5% sooner, total shortening is 10%
    
    // Calculate new start and end points for the line
    let newStartX = spring.fromNode.x + shortenedStart.x;
    let newStartY = spring.fromNode.y + shortenedStart.y;
    let newEndX = spring.fromNode.x + shortenedEnd.x;
    let newEndY = spring.fromNode.y + shortenedEnd.y;
  
    // Draw the line with the new shortened positions
    line(newStartX, newStartY, newEndX, newEndY);
  });
  

  // springs.forEach((spring) => {
  //   line(
  //     spring.fromNode.x,
  //     spring.fromNode.y,
  //     spring.toNode.x,
  //     spring.toNode.y
  //   );
  // });

  noStroke();
  nodes.forEach((node) => {
    if (node.alpha > 0) {
      fill(0, node.alpha);
      node.alpha = min(node.alpha + 2, 255); // Increment alpha for fade-in effect
      text(node.concept, node.x, node.y); // Display the concept of the node
    }
  });
}

function addNewNodes(baseNode) {
  let newNodes = [];
  let angle = random(0, TWO_PI);

  for (let i = 0; i < nNodesPerClick; i++) {
    let newNode = new Node(
      baseNode.x + cos(angle) * 20,
      baseNode.y + sin(angle) * 20
    );
    Object.assign(newNode, {
      minX: 50,
      minY: 10 + random(20),
      maxX: width - 50,
      maxY: height - (10 + random(20)),
      radius: 150,
      strength: -5,
      alpha: 0, // Initially invisible
      concept: "", // Concept to be set after API call
    });

    newNodes.push(newNode);

    let newSpring = new Spring(baseNode, newNode);
    Object.assign(newSpring, { length: 100, stiffness: 0.5 });
    springs.push(newSpring);

    angle += TWO_PI / nNodesPerClick;
  }

  callAPI(baseNode.concept, newNodes).then(apiResponse => {
    newNodes.forEach((node, index) => {
      node.concept = apiResponse[index].toUpperCase(); // Set concept from API
      node.alpha = 1; // Make the node visible
    });
  });

  nodes.push(...newNodes); // Add new nodes to the main array
}

function mousePressed() {
  let maxDist = nodeDiameter;
  for (let i = 0; i < nodes.length; i++) {
    let checkNode = nodes[i];
    let d = dist(mouseX, mouseY, checkNode.x, checkNode.y);
    if (d < maxDist) {
      selectedNode = checkNode;
      addNewNodes(checkNode); // Add new nodes based on the selected node
      break;
    }
  }
}

function callAPI(concept, callback) {
  console.log("API call initiated for: " + concept);

  setTimeout(() => {
    const apiResponse = concept + "1";
    console.log("API response for " + concept + ": " + apiResponse);
    callback(apiResponse);
  }, 2000); // Simulate a delay for the API call
}


let retryCount = 0;
const maxRetries = 5; // Maximum number of retries

function callAPI(concept) {
  if (!allConcepts.includes(concept.toUpperCase())) {
    allConcepts.push(concept.toUpperCase());
  }

  let exclusions = allConcepts.join(", ");

  return new Promise((resolve, reject) => {
    const data = {
      model: "gpt-4o-mini",
      response_format: { "type": "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a concept association generator. Your associations are clever and relevant and contains other concepts, people, brands, events, pop-culture etc far from, but still related to your given concept. Your response must be a valid JSON object containing an array named 'associations' with 5 unique associations related to the given concept. Maximum two words per concept, preferably only one. Do not include any of the following concepts: ${exclusions}. Respond in JSON format.`
        },
        {
          role: "user",
          content: `Generate 5 unique associations for the concept "${concept}", avoiding the following concepts: ${exclusions}.`
        }
      ]
    };

    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + myKey, // Replace myKey with your actual OpenAI API key
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      let associations = JSON.parse(data.choices[0].message.content).associations;
      associations = associations.filter(assoc => !allConcepts.includes(assoc.toUpperCase()));

      associations.forEach(assoc => {
        if (!allConcepts.includes(assoc.toUpperCase())) {
          allConcepts.push(assoc.toUpperCase());
        }
      });

      if (associations.length < 5 && retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying... Attempt ${retryCount}`);
        callAPI(concept).then(resolve).catch(reject);
      } else {
        retryCount = 0; // Reset retry count for future calls
        resolve(associations);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      reject(error);
    });
  });
}

function resetSketch() {
  console.log("Resetting sketch...");
  // Reset all your sketch variables
  allConcepts = [];
  nodes = [];
  springs = [];
  selectedNode = null;

  // Clear the canvas
  clear();
  background(255);

  // Show the input field again if it was hidden
  const inputField = select('#inputField');
  inputField.value(''); // Clear any previous text
  inputField.style('display', 'block'); // Show the input field if it was hidden

  //make the input field selected and active
  inputField.elt.focus();

  document.getElementById("replayButton").style.display = "none";
}

