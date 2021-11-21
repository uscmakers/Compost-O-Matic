import logo from './logo.png';
import './App.css';
import React from 'react';
import { Line, defaults } from 'react-chartjs-2';
import Firebase from './Firebase.js';
const data = {
    labels: ['12:00PM', '2:00PM', '4:00PM', '6:00PM', '8:00PM'],
    datasets: [{
            label: 'Moisture',
            fill: false,
            backgroundColor: 'rgb(92, 165, 197)',
            borderColor: 'rgb(92, 165, 197)',
            borderWidth: 4,
            data: [65, 59, 80, 81, 56],
            yAxisID: 'A'
        },
        {
            label: 'Temperature',
            fill: false,
            backgroundColor: 'rgb(229, 181, 9)',
            borderColor: 'rgb(229, 181, 9)',
            borderWidth: 4,
            data: [98, 76, 72, 78, 95],
            yAxisID: 'B'
        },
        {
            label: 'Methane',
            fill: false,
            backgroundColor: 'rgb(65, 154, 79)',
            borderColor: 'rgb(65, 154, 79)',
            borderWidth: 4,
            data: [1500, 1650, 1340, 1450, 1520],
            yAxisID: 'C'
        }
    ]
}

const options = {
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

export default class App extends React.Component {
    render() {
        defaults.font.family = "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
        defaults.font.size = 15
        Firebase.fetchData([])
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
                    <Line data = { data }
                        options = { options } />
                < /div >
            < /div>
        );
    }
}