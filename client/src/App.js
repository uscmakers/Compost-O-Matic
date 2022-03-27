import logo from './logo.png';
import './App.css';
import React from 'react';
import { Line, defaults } from 'react-chartjs-2';
import { fetchData } from './Firebase.js';
import Dropdown from './Dropdown';

function generateXLabelsAndTimestamps(numDays, data) {
    let timestamps = []
    let xLabels = []
    data = data.reverse();
    let currDay = new Date(data[0]);
    let dayCount = 1;
    let skip = 1;
    if (numDays >= 15) {
        skip = 8;
    } else if (numDays >= 7) {
        skip = 4;
    } else if (numDays >= 3) {
        skip = 2;
    }

    for (let i = 0; i < data.length; i+=skip) {
        let currTime = new Date(data[i]);
        if (i == data.length-1 || new Date(data[i+1]).getDay() != currDay.getDay()) { // the next day is a new day or we're at the end
            if (numDays == 1) {
                break;
            }
            let formatted = currTime.toLocaleString('en-US', { month: 'numeric', day: 'numeric', hour12: true });
            xLabels.unshift(formatted);
            if (i != data.length-1) {
                currDay = new Date(data[i+1]);
                dayCount++;
            }
        } else {
            if (numDays == 1) {
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
    
    return { timestamps, xLabels };
}

function parseData(all_data, interval, timestamps) {
    let data = Array(timestamps.length).fill(null)
    if (all_data != []) {
        for (let i = 0; i < all_data.length; i++) {
            let curr = all_data[i];
            let roundedTimestamp = Math.round(Date.parse(curr.timestamp) / 1000 / 60 / interval) * interval * 60 * 1000;
            let foundTimestampIndex = timestamps.findIndex(t => t == roundedTimestamp);
            if (foundTimestampIndex != -1) {
                data[foundTimestampIndex] = curr;
            }
        }
    }
    return data.reverse();
}


export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
                        backgroundColor: 'rgb(229, 181, 9)',
                        borderColor: 'rgb(229, 181, 9)',
                        borderWidth: 2,
                        data: this.temperatureData,
                        yAxisID: 'B'
                    }
                ]
            },
            options: {
                layout: {
                    padding: 50
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
                                let tooltipLabel = context.parsed.y;
                                console.log("label index " + context.parsed.x)
                                if (metricName === "Moisture") {
                                    tooltipLabel += "%";
                                } else if (metricName === "Temperature") {
                                    tooltipLabel += "°C";
                                }
                                return tooltipLabel;
                            },
                            labelTextColor: function(context) {
                                const metricName = context.dataset.label;
                                let color = 'rgba(0,0,0,1)';
                                if (metricName === "Moisture") {
                                    color = 'rgba(92,165,197,1)';
                                } else if (metricName === "Temperature") {
                                    color = 'rgba(229,181,9,1)';
                                }

                                return color;

                            },
                        }
                    }
                },
                scales: {
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
                        min: 50,
                        max: 120,
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
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
        // Convert the JSON string into JS objects
        let resultsJS = JSON.parse(resultsString);

        let data = {...this.state.data }
        data.labels = resultsJS.dateTimeData;
        data.datasets[0].data = resultsJS.moistureData
        data.datasets[1].data = resultsJS.temperatureData
        let { timestamps, xLabels } = generateXLabelsAndTimestamps(numDays, resultsJS.dateTimeData)
        data.labels = xLabels;
        this.setState({
            xLabels: xLabels,
            data: data
        })
    };

    make_request(fn) {
        // Make a HTTP request via AJAX to Node server 
        let httpRequest = new XMLHttpRequest();
        httpRequest.open("GET", "https://compost-o-matic.herokuapp.com/getData");
        httpRequest.send();
        httpRequest.onreadystatechange = async function() {
            console.log(httpRequest.readyState);
            if (httpRequest.readyState == 4) {
                if (httpRequest.status == 200) {
                    console.log("response" + httpRequest.responseText);
                    fn(httpRequest.responseText);
                } else {
                    alert("AJAX error!!!");
                    console.log(httpRequest.status);
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
        this.make_request(function(returnVal){
            console.log("returnval"+returnVal);
            this.displayResults(returnVal, numDays);
        }.bind(this));
    }

    async componentDidMount() {
        this.setState({
            all_data: await fetchData()
        })
        this.make_request(function(returnVal){
            console.log("returnval"+returnVal);
            this.displayResults(returnVal, 1);
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

            <div className = "chart" >
                <Dropdown onChange={this.handleTimescaleChange} />
                <Line data = { this.state.data }
                    options = { this.state.options }
                    redraw={true} />
            </div>
        </div>

        );
    }
}