
/***
  @brief: sends data from temperature and soil moisture sensors to particle console: https://console.particle.io/
  @return: {"temperature": <temp>,"moisture": <moisture>}
  @note: to restart device, hold both MODE and RESET on boron and release RESET once LED blinks magenta.
  @note: this program relies on the <DS18B20.h> and "JsonParserGeneratorRK.h" libraries and they must be installed on local device. To install, do command-shift-P and find "Particle: Install Library" and install DS18B20. Repeat steps for JsonParserGeneratorRK.
  @note: SHOWCASE version has no sleep implemented and publishes every 10 seconds
***/

#include <DS18B20.h>
#include "JsonParserGeneratorRK.h"  

const int TEMPERATURE = A4;
const int SOIL = A0;

const int AirValue = 3670;   // our definition of air value
const int WaterValue = 800;  // our definition of water value
DS18B20 temp_sensor(TEMPERATURE, true); // instantiate temperature probe object

// global data points to publish
float fahrenheit;
float soilMoisturePercent;

/***
  @brief: initialize pins and define config for sleep
***/
void setup() {
  pinMode(TEMPERATURE, INPUT);
  pinMode(SOIL, INPUT);
  Serial.begin(9600);
}

/***
  @brief: loops through in stages to publish data every <config> minutes
***/
void loop() {
  getTemp();
  delay(1000);
  getSoil();
  delay(1000);
  publishData();
  delay(10000);  // 10 sec break
}

/***
  @brief: gets temperature data
***/
void getTemp(){
  float _temp = temp_sensor.getTemperature();
  fahrenheit = temp_sensor.convertToFahrenheit(_temp);
  Serial.println("Temperature measure" + String(fahrenheit));
}

/***
  @brief: gets soil moisture data
***/
void getSoil() {
  double val = analogRead(SOIL);  
  soilMoisturePercent = (100 * ( 1 - (double) (val - WaterValue) / (double) AirValue));
  Serial.println("Soil reading measuring" + String(soilMoisturePercent));
}

/***
  @brief: publishes temperature & soil moisture data in JSON format
***/
 void publishData(){
   Serial.println("publishing");
   char temp[]  = { 't', 'e', 'm', 'p', '\0'};
   char moisture[] = {'m', 'o', 'i', 's', 't','u', 'r', 'e', '\0'};
   char reading[] = {'r', 'e', 'a', 'd', 'i', 'n', 'g', '\0'};
  JsonWriterStatic<622> jw;
  jw.init();  // empty buffer for reuse (since jw is static)
  {
    // JsonWriterAutoArray obj(&jw);

    jw.startObject();
    jw.insertKeyValue(temp, fahrenheit);
    jw.insertKeyValue(moisture, soilMoisturePercent);
    jw.finishObjectOrArray();

    jw.finishObjectOrArray();
  }
  // TODO: set endpoint
  Particle.publish(reading, jw.getBuffer());
} 
