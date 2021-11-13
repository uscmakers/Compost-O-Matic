import logo from './logo.png';
import './App.css';
import React from 'react';
import { Line, defaults } from 'react-chartjs-2';
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
    legend: {
        display: true,
        position: 'right'
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
        defaults.font.family = "'Century Gothic', 'CenturyGothic', 'AppleGothic', sans-serif"
        defaults.font.size = 15
        console.log(defaults)
        return ( 
            <div>
                <div className = "App" >
                    < header className = "App-header" >
                        < img src = { logo }
                            className = "App-logo"
                            alt = "logo" / >
                        <p >Welcome to the Compost - o - matic Dashboard!</p>
                    < /header > 
                </div>

                <div className = "chart" >
                    <Line data = { data }
                        options = { options }
                        height = { 50 }
                        width = { 80 } />
                < /div >
            < /div>
        );
    }
}