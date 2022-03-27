#include <DS18B20.h>

// define our pins
const int TEMPERATURE = A4;
const int SOIL = A0;
DS18B20 temp_sensor(TEMPERATURE, true); // initialize temperature probe
double celsius;
double   fahrenheit;
uint32_t msLastSample;
const int      MAXRETRY          = 4;
const uint32_t msSAMPLE_INTERVAL = 2500;
// define publish rate (10s)
const uint32_t msMETRIC_PUBLISH  = 10000;
// define sleep time
const unsigned long SLEEP_TIME = 60000 * 0;

double soilMoisturePercent;

const int AirValue = 3670;   // our definition of air value
const int WaterValue = 800;  // our definition of water value

unsigned long prevSleepTimer = 0;

void setup() {
  pinMode(TEMPERATURE, INPUT);
  pinMode(SOIL, INPUT);
  Serial.begin(9600);
  sleepConfigNormal.mode(SystemSleepMode::ULTRA_LOW_POWER)
                   .duration(sleepTimeNormal);

  sleepConfigShort.mode(SystemSleepMode::ULTRA_LOW_POWER)
                   .duration(sleepTimeShort);

}

void loop() {
  unsigned long currSleep = millis();
  // get sample every msSAMPLE_INTERVAL seconds
  if (millis() - msLastSample >= msSAMPLE_INTERVAL){
    getTemp();
    getSoil();
    publishData();
  }
  // if (millis() - prevSleepTimer >= SLEEP_INTERVAL) {
  //   // put boron to sleep!
  // }
}

// read data from soil sensor
void getSoil() {
  double val = analogRead(SOIL);  
  soilMoisturePercent = (100 * ( 1 - (double) (val - WaterValue) / (double) AirValue));
}

// read data from temperature sensor
void getTemp(){
  float _temp;
  int i = 0;
  do {
    _temp = temp_sensor.getTemperature();
  } while (!temp_sensor.crcCheck() && MAXRETRY > i++);

  if (i < MAXRETRY) {
    celsius = _temp;
    fahrenheit = temp_sensor.convertToFahrenheit(_temp);
    Serial.println(fahrenheit);
  }
  else {
    celsius = fahrenheit = NAN;
    Serial.println("Invalid reading");
  }
  msLastSample = millis();
}

// publish data in JSON format
void publishData(){
  String data = String::format(
    "{ \"temperatureData\": %s,  \"moistureData\": %s}",
    fahrenheit, soilMoisturePercent);
  Particle.publish("testAdd", data, PRIVATE);  
}