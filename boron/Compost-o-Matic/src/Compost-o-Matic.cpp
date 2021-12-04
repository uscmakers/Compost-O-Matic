/******************************************************/
//       THIS IS A GENERATED FILE - DO NOT EDIT       //
/******************************************************/

#line 1 "/Users/adamvonarnim/Desktop/Compost-O-Matic/Compost-o-Matic/src/Compost-o-Matic.ino"
/*
 * Project Compost-o-Matic
 * Description:
 * Author:
 * Date:
 */
#include "Particle.h"
#include "libraries/OneWireLibrary-master/src/DS18.h"
#include <math.h>

void setup();
void loop();
#line 11 "/Users/adamvonarnim/Desktop/Compost-O-Matic/Compost-o-Matic/src/Compost-o-Matic.ino"
float moisture = 0;
float temperature = 0;
float methane = 0;

const unsigned long THIRTY_MINS_PERIOD = 1800000;
const unsigned long ONE_MIN_PERIOD = 60000;
long lastPublish = 5000;
const char *PUBLISH_EVENT_NAME = "updateBody";

DS18 sensor(A4);


void publishData();

void setup() {
  Serial.begin(9600);
}

void loop() {

  if (millis() - lastPublish >= ONE_MIN_PERIOD) {
    lastPublish = millis();
    if (sensor.read()) {
      temperature = sensor.fahrenheit();
    }
    publishData();
  }
}

void publishData() {

  Particle.publish("updateBody", String::format("{\"moisture\":%f,\"temperature\":%f,\"methane\":%f}", moisture, temperature, methane), PRIVATE);
  Serial.printlnf("publishing");
}

