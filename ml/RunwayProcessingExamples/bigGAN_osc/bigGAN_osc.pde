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

// Import OSC
import oscP5.*;
import netP5.*;

// Runway Host && port
String runwayHost = "127.0.0.1";
int runwayPort = 57100; //Update this number to match the input port in Runway

OscP5 oscP5;
NetAddress myBroadcastLocation;

String words="";
char letter;
boolean send=false;

void setup() {
  size(400, 300);
  oscP5 = new OscP5(this, 57200);
  myBroadcastLocation = new NetAddress(runwayHost, runwayPort);

  connect();

  fill(255);
  stroke(255);
}

void draw() {
  background(0);
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
    
    json.setFloat("truncation", 0.4);
    json.setString("category", "cock");
    json.setInt("seed", int(random(1,1000)));
    myMessage.add(json.toString());
    
    println(json);
    println(myMessage);
    oscP5.send(myMessage, myBroadcastLocation);
    break;
  }
}