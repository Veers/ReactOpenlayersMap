import {Component} from 'react'
import PropTypes from 'prop-types'

import MapInstance from './MapInstance'

class MapAdapther extends Component {

    static propTypes = {
        projection: PropTypes.string.isRequired,
        layers: PropTypes.object.isRequired
    }

    componentDidMount = () => {
        this.map = new MapInstance(this.props.projection);
    }

    componentDidUpdate = (prevProps, prevState, snapshot) => {
        if (this.props.projection !== prevProps.projection) {
            this.map.changeProjection(this.props.projection)
        }

        if (this.props.layers !== prevProps.layers){
            this.map.updateLayers(this.props.layers)
        }
    }

    render() {
        return false
    }
}

export default MapAdapther