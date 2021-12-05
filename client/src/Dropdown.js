import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';

class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  static defaultProps = {
    options: ["2 Hours","5 Hours","10 Hours","Day","All"]
  }

  handleChange(event) {
    //logging for testing
    console.log('testing value in Dropdown.js: ', event.target.value);
    this.props.onChange(event.target.value);
  }

  render() {
    let timescaleOptions = this.props.options.map(timescale => {
      return <option key={timescale} value={timescale}>{timescale}</option>
    });
    return (
      <div className="dropdown">
        <label></label><br />
          <select id="soflow" ref="timescale" value={this.props.value} onChange={this.handleChange}>
            {timescaleOptions}
          </select>
      </div>
    );
  }
}

Dropdown.propTypes = {
  onChange: PropTypes.func,
  options: PropTypes.array,
  value: PropTypes.string
};

export default Dropdown;
