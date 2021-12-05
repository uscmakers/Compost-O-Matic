import logo from './logo.png';
import './App.css';
import React from 'react';
import { Line, defaults } from 'react-chartjs-2';
import { fetchData } from './Firebase.js';
import Dropdown from './Dropdown';


export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            all_data: [],
            moistureData: [12],
            temperatureData: [22],
            methaneData: [67],
            xLabels: ["12:00PM"],
            timescales: ["Day","Week","Month"],
            data: {
                labels: this.xLabels,
                datasets: [{
                        label: 'Moisture',
                        fill: false,
                        backgroundColor: 'rgb(92, 165, 197)',
                        borderColor: 'rgb(92, 165, 197)',
                        borderWidth: 4,
                        data: this.moistureData,
                        yAxisID: 'A'
                    },
                    {
                        label: 'Temperature',
                        fill: false,
                        backgroundColor: 'rgb(229, 181, 9)',
                        borderColor: 'rgb(229, 181, 9)',
                        borderWidth: 4,
                        data: this.temperatureData,
                        yAxisID: 'B'
                    },
                    {
                        label: 'Methane',
                        fill: false,
                        backgroundColor: 'rgb(65, 154, 79)',
                        borderColor: 'rgb(65, 154, 79)',
                        borderWidth: 4,
                        data: this.methaneData,
                        yAxisID: 'C'
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
                                var tooltipLabel = context.parsed.y;
                                if (metricName === "Moisture") {
                                    tooltipLabel += "%";
                                } else if (metricName === "Temperature") {
                                    tooltipLabel += "°C";
                                } else if (metricName === "Methane") {
                                    tooltipLabel += "ppm";
                                }
                                return tooltipLabel;
                            },
                            labelTextColor: function(context) {
                                const metricName = context.dataset.label;
                                var color = 'rgba(0,0,0,1)';
                                if (metricName === "Moisture") {
                                    color = 'rgba(92,165,197,1)';
                                } else if (metricName === "Temperature") {
                                    color = 'rgba(229,181,9,1)';
                                } else if (metricName === "Methane") {
                                    color = 'rgba(65,154,79,1)';
                                }

                                return color;
                                
                            },
                        }
                    }
                },
                scales: {
                    A: {
                        type: 'linear',
                        display: false,
                        position: 'left',
                        ticks: {
                            beginAtZero: true,
                        },
                    },
                    B: {
                        type: 'linear',
                        display: false,
                        position: 'left',
                        ticks: {
                            beginAtZero: true,
                        },
                    },
                    C: {
                        type: 'linear',
                        display: false,
                        position: 'left',
                        ticks: {
                            beginAtZero: true,
                        },
                    },

                },
            }

        };
        this.handleTimescaleChange = this.handleTimescaleChange.bind(this);
    };

    generateXLabelsAndTimestamps(interval,numPoints) {
        var timestamps = []
        var xLabels = []
        var currMil = new Date().getTime();
        var currRounded = Math.round(currMil / 1000 / 60 / interval) * interval * 60 * 1000;
        if (currRounded > currMil) {
            currRounded -= interval*60000; // decrement by interval mins
        }
        for (var i = 0; i < numPoints; i++) {
            var currDate = new Date(currRounded);
            var formatted = currDate.toLocaleString('en-US', {hour: 'numeric',minute: 'numeric',hour12: true});
            xLabels.unshift(formatted);
            timestamps.push(currRounded);
            currRounded -= interval*60000; // decrement by interval mins
        }
        return {timestamps,xLabels};

    }

    parseData(interval,timestamps) {
        const all_data = this.state.all_data;
        var data = Array(timestamps.length).fill(null)
        if (all_data != []) {
            for (var i = 0; i < all_data.length; i++) {
                var curr = all_data[i];
                var roundedTimestamp = Math.round(Date.parse(curr.timestamp) / 1000 / 60 / interval) * interval * 60 * 1000;
                var foundTimestampIndex = timestamps.findIndex(t => t == roundedTimestamp);
                if (foundTimestampIndex != -1) {
                    data[foundTimestampIndex] = curr;
                }
            }
        }
        return data;
    }

    handleTimescaleChange = (value) => {
        var interval = 15;
        var numPoints = 8;
        switch (value) {
            case "2 Hours":
                interval = 15;
                numPoints = 8;
                break;
            case "5 Hours":
                interval = 15;
                numPoints = 20;
                break;
            case "10 Hours":
                interval = 15;
                numPoints = 40;
                break;
            case "Day":
                interval = 30;
                numPoints = 48;
                break;
            case "All":
                interval = 30;
                numPoints = 48*1;
                break;
        }
        var {timestamps,xLabels} = this.generateXLabelsAndTimestamps(interval,numPoints)
        var new_data = this.parseData(interval,timestamps)
        var moistureData = []
        var temperatureData = []
        var methaneData = []
        for (var i = 0; i < new_data.length; i++) {
            var curr = new_data[i];
            if (curr != null) {
                moistureData.push(curr.moisture)
                temperatureData.push(Math.round(curr.temperature * 10) / 10)
                methaneData.push(curr.methane)
            } else {
                moistureData.push(null)
                temperatureData.push(null)
                methaneData.push(null)
            }
        }
        var data = {...this.state.data}
        data.labels = xLabels;
        data.datasets[0].data = moistureData
        data.datasets[1].data = temperatureData
        data.datasets[2].data = methaneData
        this.setState({
            xLabels: xLabels,
            data: data
        })

    }

    async componentDidMount() {
        this.setState({
            all_data: await fetchData()
        })

        var {timestamps,xLabels} = this.generateXLabelsAndTimestamps(15,8)
        var new_data = this.parseData(15,timestamps)
        var moistureData = []
        var temperatureData = []
        var methaneData = []
        for (var i = 0; i < new_data.length; i++) {
            var curr = new_data[i];
            if (curr != null) {
                moistureData.push(curr.moisture)
                temperatureData.push(Math.round(curr.temperature * 10) / 10)
                methaneData.push(curr.methane)
            } else {
                moistureData.push(null)
                temperatureData.push(null)
                methaneData.push(null)
            }
        }
        var data = {...this.state.data}
        data.labels = xLabels;
        data.datasets[0].data = moistureData
        data.datasets[1].data = temperatureData
        data.datasets[2].data = methaneData
        this.setState({
            xLabels: xLabels,
            data: data
        })

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
                    < /header > 
                </div>

                <div className = "chart" >
                    <Dropdown onChange={this.handleTimescaleChange} />
                    <Line data = { this.state.data }
                        options = { this.state.options }
                        redraw={true} />
                < /div >
            < /div>
        );
    }
}