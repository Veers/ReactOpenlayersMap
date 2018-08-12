import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

class MapInstance {
    constructor() {
        this.mapInstance = new Map({
            target: 'map',
            layers: [new TileLayer({source: new OSM()})],
            view: new View({
                center: [
                    0, 0
                ],
                zoom: 4
            })
        });
    }

    test() {
        console.log('test');
    }
}

export default MapInstance;
