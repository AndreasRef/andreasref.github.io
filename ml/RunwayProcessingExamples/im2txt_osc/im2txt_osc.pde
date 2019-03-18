// Import OSC
import oscP5.*;
import netP5.*;

// Runway Host
String runwayHost = "127.0.0.1";

// Runway Port
int runwayPort = 57108;

JSONObject data;

OscP5 oscP5;
NetAddress myBroadcastLocation;

void setup() {
  //frameRate(2);
  size(600, 400);

  OscProperties properties = new OscProperties();
  properties.setRemoteAddress("127.0.0.1", 57200);
  properties.setListeningPort(57200);
  properties.setDatagramSize(99999999);
  properties.setSRSP(OscProperties.ON);
  oscP5 = new OscP5(this, properties);

  // Use the localhost and the port 57100 that we define in Runway
  myBroadcastLocation = new NetAddress(runwayHost, runwayPort);

  connect();
}

void draw() {
  background(0);

  if (data != null) {

    JSONArray results = data.getJSONArray("results");

    int num_results = results.size();
    for (int i = 0; i < num_results; i++) {
      JSONObject suggestion = results.getJSONObject(i);
      //println(suggestion.get("caption") + " " + suggestion.get("probability"));
    }

    JSONObject bestSuggestion = results.getJSONObject(0);
    String myString = bestSuggestion.getString("caption");

    text(myString, 10, 10);
  }
}

void connect() {
  OscMessage m = new OscMessage("/server/connect");
  oscP5.send(m, myBroadcastLocation);
}

// OSC Event: listens to data coming from Runway
void oscEvent(OscMessage theOscMessage) {
  // The data is in a JSON string, so first we get the string value
  String dataString = theOscMessage.get(0).stringValue();

  // We then parse it as a JSONObject
  data = parseJSONObject(dataString);
  println(data);
}