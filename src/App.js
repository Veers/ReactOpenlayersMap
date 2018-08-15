import React, { Component } from 'react';
import './App.css';
import MapAdapther from './MapAdapther';

class App extends Component {
  constructor(props) {
  	super(props)
  	this.state = {
  		currentProjection: "EPSG:3857",
  		layers: {'xyz': false, 'wms': false, 'wmts': false}
  	}
  	this.changeProjection = this.changeProjection.bind(this)
  	this.changeLayerVisibility = this.changeLayerVisibility.bind(this)
  }

  // changeProjection = () => {
  // 	(this.state.currentProjection === "EPSG:4326") ? this.setState({currentProjection: "EPSG:3857"}) : this.setState({currentProjection: "EPSG:4326"})
  // }

  changeProjection = (event) => {
    this.setState({currentProjection: event.target.value})
  }

  changeLayerVisibility = (layer, e) => {
    let l = {...this.state.layers}    
    l[layer] = (l[layer] ? false : true)
    this.setState({layers: l})
  }

  render() {
    return (
      <div>
        <div id="map" className="App">
        </div>
        <MapAdapther projection={this.state.currentProjection} layers={this.state.layers}/>
        <br/>
        <label>View projection:</label>
        <select id="view-projection" onChange={this.changeProjection}>
          <option value="EPSG:3857">Spherical Mercator (EPSG:3857)</option>
          <option value="EPSG:4326">WGS 84 (EPSG:4326)</option>
          <option value="EPSG:3413" disabled>NSIDC Polar Stereographic North (EPSG:3413)</option>
        </select>

        <br/><br/>
        <button onClick={(e)=>this.changeLayerVisibility('xyz', e)}>XYZ слой</button>&nbsp;{String(this.state.layers['xyz'])}
        <br/><br/>
        <button onClick={(e)=>this.changeLayerVisibility('wms', e)}>WMS слой</button>&nbsp;{String(this.state.layers['wms'])}
        <br/><br/>
        <button onClick={(e)=>this.changeLayerVisibility('wmts', e)}>WMTS слой</button>&nbsp;{String(this.state.layers['wmts'])}
      </div>
    );
  }
}

export default App;
