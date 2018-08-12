import {Component} from 'react'

import MapInstance from './MapInstance'

class MapAdapther extends Component {

    constructor(props) {
        super(props)        
    }

    componentDidMount = () => {
        this.map = new MapInstance();
        this.map.test();
    }

    componentDidUpdate = (prevProps, prevState, snapshot) => {}

    render() {
        return false
    }
}

export default MapAdapther