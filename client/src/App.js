import logo from './logo.png';
import './App.css';
import React from 'react';
import { Line, defaults } from 'react-chartjs-2';
import Dropdown from './Dropdown';
import FusionCharts from 'fusioncharts';
import Widgets from 'fusioncharts/fusioncharts.widgets';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import ReactFC from 'react-fusioncharts';

ReactFC.fcRoot(FusionCharts, Widgets, FusionTheme);


function generateXLabelsAndTimestamps(numDays, data, skip) {
    let timestamps = []
    let xLabels = []
    let currDay = new Date(data[0]);
    let dayCount = 1;
    let dayCounter = 0;
    
    for (let i = 0; i < data.length; i+=skip) {
        let currTime = new Date(data[i]);
        dayCounter++;
        if (i == data.length-1 || new Date(data[i+1]).getDay() != currDay.getDay()) { // the next day is a new day or we're at the end
            console.log("A NEW DAY!!!!!!!!")
            if (numDays == 1) {
                break;
            }
            let formatted = currTime.toLocaleString('en-US', { month: 'numeric', day: 'numeric', hour12: true });
            xLabels.unshift(formatted);
            console.log(formatted)
            if (i != data.length-1) {
                currDay = new Date(data[i+1]);
                dayCount++;
            }
        } else {
            if (numDays == 1 && dayCounter % 4 == 0) {
                let formatted = currTime.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
                xLabels.unshift(formatted);
            } else {
                xLabels.unshift("");
            }
        }
        timestamps.push(currTime);
        if (dayCount > numDays) {
            break;
        }
    }
    
    // console.log(timestamps);
    // console.log(xLabels);
    // xLabels = xLabels.reverse();
    return { timestamps, xLabels };
}

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curr_temp: {},
            curr_moisture: {},
            temp_good: true,
            moisture_good: true,
            temp_msg: "",
            moisture_msg: "",
            just_right_msg: "",
            trending_msg: "",
            all_data: [],
            moistureData: [],
            temperatureData: [],
            xLabels: [],
            data: {
                labels: this.xLabels,
                datasets: [{
                        label: 'Moisture',
                        fill: false,
                        backgroundColor: 'rgb(92, 165, 197)',
                        borderColor: 'rgb(92, 165, 197)',
                        borderWidth: 2,
                        data: this.moistureData,
                        yAxisID: 'A'
                    },
                    {
                        label: 'Temperature',
                        fill: false,
                        backgroundColor: 'rgb(189, 32, 49)',
                        borderColor: 'rgb(189, 32, 49)',
                        borderWidth: 2,
                        data: this.temperatureData,
                        yAxisID: 'B'
                    }
                ]
            },
            options: {
                layout: {
                    padding: 20
                },
                plugins: {
                    legend: {
                        position: 'right',
                        align: 'start',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            boxWidth: 6
                        }
                    },
                    tooltip: {
                        displayColors: false,
                        yAlign: 'bottom',
                        xAlign: 'center',
                        backgroundColor: 'rgba(248,248,255,0.9)',
                        bodyColor: 'rgba(0,0,0,0.8)',
                        callbacks: {
                            title: function(tooltipItems, data) {
                                return '';
                            },
                            label: function(context) {
                                const metricName = context.dataset.label;
                                let tooltipLabel = Math.round(context.parsed.y * 100) / 100;
                                // console.log("label index " + context.parsed.x)
                                if (metricName === "Moisture") {
                                    tooltipLabel += "%";
                                } else if (metricName === "Temperature") {
                                    tooltipLabel += "°F";
                                }
                                return tooltipLabel;
                            },
                            labelTextColor: function(context) {
                                const metricName = context.dataset.label;
                                let color = 'rgba(0,0,0,1)';
                                if (metricName === "Moisture") {
                                    color = 'rgb(92, 165, 197)';
                                } else if (metricName === "Temperature") {
                                    color = 'rgb(189, 32, 49)';
                                }

                                return color;

                            },
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            autoSkip: false
                        }
                      },
                    A: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        min: 0,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Moisture (%)'
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            beginAtZero: true,
                            stepSize: 10
                        },
                    },
                    B: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        min: 40,
                        max: 110,
                        title: {
                            display: true,
                            text: 'Temperature (°F)'
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            beginAtZero: true,
                            precision: 1
                        },
                    }
                },
            }

        };
        this.handleTimescaleChange = this.handleTimescaleChange.bind(this);
        this.make_request = this.make_request.bind(this);
    };

    displayResults(resultsString, numDays) {
        let resultsJS = JSON.parse(resultsString);
        // console.log("RESULT SJS " + resultsJS.temperatureData)
        let data = {...this.state.data }
        let skip = 1;
        if (numDays >= 15) {
            skip = 8;
        } else if (numDays >= 7) {
            skip = 4;
        } else if (numDays >= 3) {
            skip = 2;
        }
        let { timestamps, xLabels } = generateXLabelsAndTimestamps(numDays, resultsJS.dateTimeData.reverse(), skip)
        data.labels = xLabels;
        data.datasets[0].data = resultsJS.moistureData.filter((element, index) => {
            return index % skip === 0;
          }).reverse().slice(0, xLabels.length).reverse()
        data.datasets[1].data = resultsJS.temperatureData.filter((element, index) => {
            return index % skip === 0;
          }).reverse().slice(0, xLabels.length).reverse()
        // console.log("skip " + data.datasets[1].data)
        this.setState({
            xLabels: xLabels,
            data: data
        })
    };

    make_request(url, data, fn, method="GET") {
        // Make a HTTP request via AJAX to Node server 
        let httpRequest = new XMLHttpRequest();
        httpRequest.open(method, url);
        httpRequest.setRequestHeader("Access-Control-Allow-Headers", "*");
        if (data == "") {
            httpRequest.send();
        } else {
            httpRequest.send("points=20");
        }
        httpRequest.onreadystatechange = async function() {
            // console.log(httpRequest.readyState);
            if (httpRequest.readyState == 4) {
                if (httpRequest.status == 200) {
                    // console.log("response" + httpRequest.responseText);
                    fn(httpRequest.responseText);
                } else {
                    alert("AJAX error!!!");
                    // console.log(httpRequest.status);
                }
            }
        }
    }


    handleTimescaleChange = (value) => {
        let numDays = 1;
        switch (value) {
            case "Day":
                numDays = 1;
                break;
            case "Week":
                numDays = 7;
                break;
            case "Month":
                numDays = 30;
                break;
        }
        this.make_request("https://compost-o-matic.herokuapp.com/getData", "",
            function(returnVal){
                // console.log("returnval"+returnVal);
                this.displayResults(returnVal, numDays);
        }.bind(this));
    }

    async componentDidMount() {
        this.make_request("https://compost-o-matic.herokuapp.com/getData", "",
            function(returnVal){
                // console.log("returnval"+returnVal);
                this.displayResults(returnVal, 1);
        }.bind(this));

        // this.make_request("https://compost-o-matic.herokuapp.com/linearRegression", "points=20",
        // function(returnVal){
        //     // console.log("POINTS RETURN VAL"+returnVal);
        // }.bind(this), "POST");

        this.make_request("https://compost-o-matic.herokuapp.com/goodData", "",
        function(returnVal){
            // console.log("returnval"+returnVal);
            var temperature = ""
            var moisture = ""
            var just_right = ""
            if (JSON.parse(returnVal).temperatureGood == "Low") {
                temperature = "Temperature is too low -- try adding green material and turning the compost."
            } else if (JSON.parse(returnVal).temperatureGood == "High") {
                temperature = "Temperature is too high -- try opening the lid."
            }
            if (JSON.parse(returnVal).moistureGood == "Low") {
                moisture = "Moisture is too low -- try adding water."
            } else if (JSON.parse(returnVal).moistureGood == "High") {
                moisture = "Moisture is too high -- try adding dry material."
            }

            if (moisture == "" && temperature == "") {
                just_right = "Your compost looks great!"
            }
            this.setState({
                temp_msg: temperature,
                moisture_msg: moisture,
                just_right_msg: just_right,
                curr_temp: {
                    chart: {
                        upperlimit: "120",
                        numbersuffix: "°F",
                        thmfillcolor: "#bd2031",
                        showgaugeborder: "1",
                        gaugebordercolor: "#bd2031",
                        gaugeborderthickness: "2",
                        plottooltext: "Current Compost Temperature: <b>$datavalue</b> ",
                        theme: "fusion",
                    },
                    value: JSON.parse(returnVal).temperatureData
                },
                curr_moisture: {
                    chart: {
                        upperlimit: "100",
                        numbersuffix: "%",
                        thmfillcolor: "#5ca5c5",
                        showgaugeborder: "1",
                        gaugebordercolor: "#5ca5c5",
                        gaugeborderthickness: "2",
                        plottooltext: "Current Compost Moisture: <b>$datavalue</b> ",
                        theme: "fusion",
                    },
                    value: JSON.parse(returnVal).moistureData
                },
            })
    }.bind(this));


    }

    


    render() {
        defaults.font.family = "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
        defaults.font.size = 15

        return (
            <div>
            <div className = "App" >
                < header className = "App-header" >
                    < img src = { logo }
                        className = "App-logo"
                        alt = "logo" / >
                    <p >Welcome to the Compost-O-Matic Dashboard!</p>
                </header> 
            </div>

            <div className = "outer">
                <div className = "col">
                    <div className = "chart" >
                        <Dropdown onChange={this.handleTimescaleChange} />
                        <Line data = { this.state.data }
                            options = { this.state.options }
                            redraw={true} />
                    </div>
                    <div className = "recommendations">
                        {/* <p style={this.state.temp_good ? { color: 'green'} : { color: 'red' }}>{this.state.temp_msg}</p>
                        <p style={this.state.moisture_good ? { color: 'green'} : { color: 'red' }}>{this.state.moisture_msg}</p> */}
                        <p style={{ color: 'red' }}>{this.state.temp_msg}</p>
                        <p style={{ color: 'red' }}>{this.state.moisture_msg}</p>
                        <p style={{ color: 'green' }}>{this.state.just_right_msg}</p>
                        <p style={{ color: 'black' }}>{this.state.trending_msg}</p>
                    </div>
                </div>

                <div className = "col">
                    <div>
                        <h2>Compost At-a-Glance</h2>
                    </div>
                    <div className = "graphic">
                        <ReactFC
                            type="thermometer"
                            width="100%"
                            height="55%"
                            dataFormat="JSON"
                            dataSource={this.state.curr_temp}
                        />
                    </div>
                    <div className = "graphic">
                        <ReactFC
                            type="cylinder"
                            width="100%"
                            height="55%"
                            dataFormat="JSON"
                            dataSource={this.state.curr_moisture}
                        />
                    </div>
                </div>




            </div>

        </div>

        );
    }
}