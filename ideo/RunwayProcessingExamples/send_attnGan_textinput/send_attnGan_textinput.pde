// Copyright (C) 2018 Runway AI Examples
// 
// This file is part of Runway AI Examples.
// 
// Runway-Examples is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// Runway-Examples is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with RunwayML.  If not, see <http://www.gnu.org/licenses/>.
// 
// ===========================================================================

// RUNWAY
// www.runwayapp.ai

// AttnGan demo
// Send a string and Receive OSC base64 images from Runway

//this Example is taken from https://github.com/b2renger/workshop_ml_PCD2019
//and adapted from key typed input. 


// Import OSC
import oscP5.*;
import netP5.*;

// Runway Host && port
String runwayHost = "127.0.0.1";
int runwayPort = 57104;

OscP5 oscP5;
NetAddress myBroadcastLocation;

String words="";
char letter;
boolean send=false;

void setup() {
  size(600, 600);
  oscP5 = new OscP5(this, 57200);
  myBroadcastLocation = new NetAddress(runwayHost, runwayPort);

  connect();

  fill(255);
  stroke(255);
}

void draw() {
  background(0);
  fill(255);

  // Draw the letter to the center of the screen
  textSize(14);
  text("Click on the program, then type to add to the string. Press 3 to send the query to Runway", 50, 50);
  text("The String is " + words.length(), 50, 90);

  //display your typed text
  textSize(36);
  text(words, 50, 120, 540, 300);
}


void connect() {
  OscMessage m = new OscMessage("/server/connect");
  oscP5.send(m, myBroadcastLocation);
}

void disconnect() {
  OscMessage m = new OscMessage("/server/disconnect");
  oscP5.send(m, myBroadcastLocation);
}

void keyTyped() {
  // The variable "key" always contains the value 
  // of the most recent key pressed.
  if ((key >= 'A' && key <= 'z') || key == ' ') {
    letter = key;
    words = words + key;
    // Write the letter to the console
    println(key);
  } else if (key == BACKSPACE) {
      words = words.substring(0, max(0, words.length()-1)); 
  }
}
void keyPressed() {
  switch(key) {
    case('1'):
    /* connect to Runway */
    connect();
    println("connect");
    break;
    case('2'):
    /* disconnect from Runway */
    disconnect();
    println("disconnect");
    break;
/*send the string to Runway*/
    case('3'):
    OscMessage myMessage = new OscMessage("/query");
    JSONObject  json = new JSONObject();
    json.setString("caption", words);
    myMessage.add(json.toString());
    println(json);
    oscP5.send(myMessage, myBroadcastLocation);
    break;
  }
}