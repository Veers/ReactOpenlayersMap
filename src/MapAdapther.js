import {Component} from 'react'
import PropTypes from 'prop-types'

import MapInstance from './MapInstance'

class MapAdapther extends Component {

    static propTypes = {
        projection: PropTypes.string.isRequired,
        layers: PropTypes.object.isRequired,
        features: PropTypes.array.isRequired
    }

    componentDidMount = () => {
        this.map = new MapInstance(this.props.projection);
        this.map.drawFeatures(this.props.features, this.props.featuresData);
    }

    componentDidUpdate = (prevProps, prevState, snapshot) => {
        if (this.props.projection !== prevProps.projection) {
            this.map.changeProjection(this.props.projection)
        }

        if (this.props.layers !== prevProps.layers){
            this.map.updateLayers(this.props.layers)
        }

        if (this.props.features !== prevProps.features) {
            this.map.updateFeatures(this.props.features)
        }
    }

    render() {
        return false
    }
}

export default MapAdapther