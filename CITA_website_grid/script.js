let copenhagenHum = [87,	85,	83,	76,	68,	68,	71,	74,	78,	83,	87,	88];
let odenseHum = [87,	84,	78,	70,	64,	65,	67,	69,	73,	79,	86,	89];
let tonderHum = [91,	90,	87,	79,	71,	71,	72,	73,	76,	83,	88,	92];
let aalborgHum = [87,	82,	76,	66,	60,	62,	65,	67,	71,	78,	86,	89];
let esbjergHum = [89,	89,	87,	83,	78,	76,	78,	79,	82,	86,	90,	94];
let naesgaardHum = [91,	89,	84,	76,	71,	70,	73,	74,	78,	84,	89,	91];
let bornholmHum = [87,	87,	86,	82,	80,	80,	82,	83,	83,	84,	85,	88];
let thuleHum = [64,	63,	63,	62,	63,	69,	71,	72,	69,	69,	66,	67];
let nuukHum = [78,	79,	81,	81,	84,	84,	87,	87,	83,	78,	76,	77];
let torshavnHum = [90,	89,	89,	87,	88,	88,	90,	90,	90,	90,	89,	90];

let copenhagenTemp = [0,0,2,7,12,16,18,17,14,9,5,3]
let odenseTemp = [0,0,2,7,12,15,17,16,13,9,5,2]
let tonderTemp = [0,0,2,7,12,15,17,17,14,9,5,2]
let aalborgTemp = [-1,-1,1,6,11,14,16,16,13,8,4,2]
let esbjergTemp = [1,0,2,7,11,15,17,17,14,10,6,3]
let naesgaardTemp = [0,0,2,6,11,15,17,17,14,9,5,2]
let bornholmTemp = [1,0,1,5,9,14,17,17,14,10,6,3]
let thuleTemp = [-23.3,-24.6,-24.1,-17,-5.6,1.5,4.6,3.8,-1.7,-9.8,-16.6,-21.6]
let nuukTemp = [-7.4,-7.8,-8,-3.9,0.6,3.9,6.5,6.1,3.5,-0.6,-3.6,-6.2]
let torshavnTemp = [3.4,3.6,3.8,4.9,6.9,9,10.3,10.6,9.1,7.5,4.8,3.8]


var copenhagen = {
  temps: [0,0,2,7,12,16,18,17,14,9,5,3],
  hums: [87,	85,	83,	76,	68,	68,	71,	74,	78,	83,	87,	88]
}


let data = [];

data[0] = [ //copenhagen
  [87,	85,	83,	76,	68,	68,	71,	74,	78,	83,	87,	88],
  [0,0,2,7,12,16,18,17,14,9,5,3]
];

data[1] = [ //odense
  [87,	84,	78,	70,	64,	65,	67,	69,	73,	79,	86,	89],
  [0,0,2,7,12,15,17,16,13,9,5,2]
];

data[2] = [ //tonder
  [91,	90,	87,	79,	71,	71,	72,	73,	76,	83,	88,	92],
  [0,0,2,7,12,15,17,17,14,9,5,2]
];

data[3] = [ //aalborg
  [87,	82,	76,	66,	60,	62,	65,	67,	71,	78,	86,	89],
  [-1,-1,1,6,11,14,16,16,13,8,4,2]
];

data[4] = [ //esbjerg
  [89,	89,	87,	83,	78,	76,	78,	79,	82,	86,	90,	94],
  [1,0,2,7,11,15,17,17,14,10,6,3]
];

data[5] = [ //naesgaard
  [91,	89,	84,	76,	71,	70,	73,	74,	78,	84,	89,	91],
  [0,0,2,6,11,15,17,17,14,9,5,2]
];

data[6] = [ //bornholm
  [87,	87,	86,	82,	80,	80,	82,	83,	83,	84,	85,	88],
  [1,0,1,5,9,14,17,17,14,10,6,3]
];

data[7] = [ //thule
  [64,	63,	63,	62,	63,	69,	71,	72,	69,	69,	66,	67],
  [-23.3,-24.6,-24.1,-17,-5.6,1.5,4.6,3.8,-1.7,-9.8,-16.6,-21.6]
];

data[8] = [ //nuuk
  [78,	79,	81,	81,	84,	84,	87,	87,	83,	78,	76,	77],
  [-7.4,-7.8,-8,-3.9,0.6,3.9,6.5,6.1,3.5,-0.6,-3.6,-6.2]
];

data[9] = [ //torshavn
  [90,	89,	89,	87,	88,	88,	90,	90,	90,	90,	89,	90],
  [3.4,3.6,3.8,4.9,6.9,9,10.3,10.6,9.1,7.5,4.8,3.8]
];


let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


function updateMonth1(val) {
  document.getElementById("sliderMonthLabel1").innerHTML = months[Math.floor(val/10)];
  column1Changed(); 
}

function updateMonth2(val) {
  document.getElementById("sliderMonthLabel2").innerHTML = months[val]; 
  column2Changed();
}

function updateMonth3(val) {
  document.getElementById("sliderMonthLabel3").innerHTML = months[val]; 
  column3Changed();
}

function column1Changed() {
  let city = document.getElementById("city1").value;
  //let month = document.getElementById("month1").value;
  //let month = document.getElementById("sliderMonth1").value;
  let monthWithSubdivision = document.getElementById("sliderMonth1").value;
  let month = Math.floor(monthWithSubdivision/10);

  let hum = data[city][0][month];
  let temp = data[city][1][month];
  let co2 = 10;
  let cost = 50;

  document.getElementById("image1").src = "https://via.placeholder.com/226?text=img["+city+"]["+monthWithSubdivision+"]";
  document.getElementById("image1").style.display = "inline";

  document.getElementById("text1").innerHTML = "hum: " + hum + "<br>temp: " + temp + "<br>co2: " + co2 + "<br>cost: " + cost;
  console.log(city + " " + month);
  console.log("hum " + data[city][0][month]);
  console.log("temp " + data[city][1][month]);
}



function column2Changed() {
  let city = document.getElementById("city2").value;
  //let month = document.getElementById("month2").value;
  let month = document.getElementById("sliderMonth2").value;

  let hum = data[city][0][month];
  let temp = data[city][1][month];
  let co2 = 10;
  let cost = 50;

  document.getElementById("image2").src = "https://via.placeholder.com/226?text=img["+city+"]["+month+"]";
  document.getElementById("image2").style.display = "inline";


  document.getElementById("text2").innerHTML = "hum: " + hum + "<br>temp: " + temp + "<br>co2: " + co2 + "<br>cost: " + cost;
  console.log(city + " " + month);
  console.log("hum " + data[city][0][month]);
  console.log("temp " + data[city][1][month]);
}



function column3Changed() {
  let city = document.getElementById("city3").value;
  //let month = document.getElementById("month3").value;
  let month = document.getElementById("sliderMonth3").value;

  let hum = data[city][0][month];
  let temp = data[city][1][month];
  let co2 = 10;
  let cost = 50;

  document.getElementById("image3").src = "https://via.placeholder.com/226?text=img["+city+"]["+month+"]";
  document.getElementById("image3").style.display = "inline";

  document.getElementById("text3").innerHTML = "hum: " + hum + "<br>temp: " + temp + "<br>co2: " + co2 + "<br>cost: " + cost;
  console.log(city + " " + month);
  console.log("hum " + data[city][0][month]);
  console.log("temp " + data[city][1][month]);
}