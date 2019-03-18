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
// along with Runway AI Examples.  If not, see <http://www.gnu.org/licenses/>.
// 
// ===========================================================================

// RUNWAY
// www.runwayapp.ai

// Face Landmarks Demo:
// Receive OSC Data from Runway
// Running Face Landmarks model
// Made by Joel Matthys @jwmatthys - tweaked by @AndreasRef


// Import OSC
import oscP5.*;
import netP5.*;

// Runway Host
String runwayHost = "127.0.0.1";

// Runway Port
int runwayPort = 57102; //Make sure this port number matches the one from Runway

OscP5 oscP5;
NetAddress myBroadcastLocation;

JSONObject data;
JSONArray landmarks;

void setup() {
  size(600, 400);
  noFill();
  stroke(0);

  OscProperties properties = new OscProperties();
  properties.setRemoteAddress("127.0.0.1", 57200);
  properties.setListeningPort(57200);
  properties.setDatagramSize(99999999);
  properties.setSRSP(OscProperties.ON);
  oscP5 = new OscP5(this, properties);

  // Use the localhost and the port that we define in Runway
  myBroadcastLocation = new NetAddress(runwayHost, runwayPort);

  connect();
}

void draw ()
{      
  background(255);
  drawParts();
}

void drawParts() {
  
    // Only if there are any humans detected
  if (data != null) {
    landmarks = data.getJSONArray("landmarks");
    if (landmarks != null)
    {
      int num_people = landmarks.size();
      for (int i = 0; i < num_people; i++)
      {
        JSONObject person = landmarks.getJSONObject(i);
        plotPoints( person.getJSONArray("bottom_lip"), false);
        plotPoints( person.getJSONArray("top_lip"), false);
        plotPoints( person.getJSONArray("chin"), false);
        plotPoints( person.getJSONArray("left_eye"), true);
        plotPoints( person.getJSONArray("left_eyebrow"), false);
        plotPoints( person.getJSONArray("right_eye"), true);
        plotPoints( person.getJSONArray("right_eyebrow"), false);
        plotPoints( person.getJSONArray("nose_tip"), false);
        plotPoints( person.getJSONArray("nose_bridge"), false);
      }
    }
  }
  
}


void connect() {
  OscMessage m = new OscMessage("/server/connect");
  oscP5.send(m, myBroadcastLocation);
}

void plotPoints(JSONArray feature, boolean closeEyeGap)
{
  PVector v0 = new PVector (0, 0); 
  beginShape();
  for (int i = 0; i < feature.size(); i++)
  {
    JSONArray p = feature.getJSONArray(i);
    float x = map(p.getInt(0), 0, width, width, 0);
    float y = map(p.getInt(1), 0, height, 0, height);
    vertex (x, y);
    if (closeEyeGap && i == 0) {
      v0.set(x, y);
    }
  }
  if (closeEyeGap) vertex (v0.x, v0.y); 
  endShape();
}


// OSC Event: listens to data coming from Runway
void oscEvent(OscMessage theOscMessage) {
  // The data is in a JSON string, so first we get the string value
  String dataString = theOscMessage.get(0).stringValue();

  // We then parse it as a JSONObject
  data = parseJSONObject(dataString);

  println(data);
}