import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import {get as getProjection} from 'ol/proj';
import {getWidth, getTopLeft} from 'ol/extent';

import {polygons} from './Polygons'

class MapInstance {
    constructor(mapProjection) {
        var osmLayer = new TileLayer({
            source: new OSM(),
            name: 'osmLayer'
        })
        var xyzLayer = this.createXYZLayer()
        var wmsLayer = this.createWMSLayer();
        var wmtsLayer = this.createWMTSLayer();
        this.mapInstance = new Map({
            target: 'map',
            layers: [osmLayer, xyzLayer, wmsLayer, wmtsLayer],
            view: new View({
                projection: mapProjection,
                center: [0, 0],
                zoom: 4
            })
        });
        this.addPolygon(1)
    }

    changeProjection(newProjection) {        
        this.mapInstance.setView(new View({
            projection: newProjection,
            center: [0, 0],
            zoom: 4
        }))
    }

    updateLayers(layers) {
        this.switchLayerVisibility(layers)
    }

    switchLayerVisibility(layers) {
        for (var layer in layers) {
            if (layers.hasOwnProperty(layer)) {
                switch(layer) {
                    case 'xyz':
                        this.switchLayerXYZ(layers[layer])
                        break
                    case 'wms':
                        this.switchLayerWMS(layers[layer])
                        break
                    case 'wmts':
                        this.switchLayerWMTS(layers[layer])
                        break
                    default:
                        break
                }
            }
        }
    }

    switchLayerXYZ(visibility){
        var layers = this.mapInstance.getLayers();
        layers.forEach(function(layer){
            if (layer.get('name') === 'xyzLayer') {
                layer.set('visible', visibility)
            }
        })
    }

    switchLayerWMS(visibility) {
        var layers = this.mapInstance.getLayers();
        layers.forEach(function(layer){
            if (layer.get('name') === 'wmsLayer') {
                console.log(layer)
                layer.set('visible', visibility)
            }
        })
    }

    switchLayerWMTS(visibility) {
        var layers = this.mapInstance.getLayers();
        layers.forEach(function(layer){
            if (layer.get('name') === 'wmtsLayer') {
                layer.set('visible', visibility)
            }
        })
    }

    createOSMLayer() {
        return new TileLayer({
            source: new OSM()
        })
    }

    createXYZLayer() {
        let source = new XYZ({
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
                  'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
        })
        return new TileLayer({
            source: source,
            name: 'xyzLayer',
            visible: false
        })
    }

    createWMSLayer() {
        var wmsSource = new TileWMS({
            url: 'https://ahocevar.com/geoserver/wms',
            params: {'LAYERS': 'ne:ne', 'TILED': true},
            serverType: 'geoserver',
            crossOrigin: 'anonymous'
        });

        return new TileLayer({
            source: wmsSource,
            name: 'wmsLayer'
        });
    }

    createWMTSLayer() {
        var projection = getProjection('EPSG:3857');
        var projectionExtent = projection.getExtent();
        var size = getWidth(projectionExtent) / 256;
        var resolutions = new Array(14);
        var matrixIds = new Array(14);
        for (var z = 0; z < 14; ++z) {
            resolutions[z] = size / Math.pow(2, z);
            matrixIds[z] = z;
        }


        return new TileLayer({
            opacity: 0.7,
            source: new WMTS({
                attributions: 'Tiles © <a href="https://services.arcgisonline.com/arcgis/rest/' +
                  'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</a>',
                url: 'https://services.arcgisonline.com/arcgis/rest/' +
                  'services/Demographics/USA_Population_Density/MapServer/WMTS/',
                layer: '0',
                matrixSet: 'EPSG:3857',
                format: 'image/png',
                projection: projection,
                tileGrid: new WMTSTileGrid({
                    origin: getTopLeft(projectionExtent),
                    resolutions: resolutions,
                    matrixIds: matrixIds
                }),
                style: 'default',
                wrapX: true
            }),
            name: 'wmtsLayer'
        })
    }

    getMap() {

    }

    addPolygon(index) {
        console.log(polygons)
    }
}

export default MapInstance;
