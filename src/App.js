import React, { Component } from 'react';
import './App.css';
import MapAdapther from './MapAdapther';

class App extends Component {
  render() {
    return (
      <div>
        <div id="map" className="App">        
        </div>
        <MapAdapther/>
      </div>
    );
  }
}

export default App;
