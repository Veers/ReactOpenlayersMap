import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {
    Tile as TileLayer,
    Vector as VectorLayer
} from 'ol/layer';
import {
    OSM,
    TileWMS,
    Vector as VectorSource,
    XYZ
} from 'ol/source'
import WKT from 'ol/format/WKT';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import {get as getProjection
} from 'ol/proj';
import {
    getWidth,
    getTopLeft,
    getCenter
} from 'ol/extent'
import WMTSCapabilities from 'ol/format/WMTSCapabilities'
import Collection from 'ol/Collection';
import {
    register
} from 'ol/proj/proj4';
import WMTS, {
    optionsFromCapabilities
} from 'ol/source/WMTS';
import Static from 'ol/source/ImageStatic.js';
import ImageLayer from 'ol/layer/Image.js';
import LayerGroup from 'ol/layer/Group';
import {Style} from 'ol/style.js';
import proj4 from 'proj4';

import {
    polygons
} from './Polygons'

class MapInstance {
    constructor(mapProjection) {

        this.initializeProjections()
        this.initializeLayers()

        var layers = [];

        var osmLayer = new TileLayer({
            source: new OSM(),
            name: 'osmLayer'
        })

        layers.push(osmLayer)

        // let wmsLayer = this.createWMSLayer()
        // layers.push(wmsLayer)

        let wmtsLayer = this.createWMTSLayer();
        // let wmtsFeatureLayer = this.createWMTSFeatureLayer();
        let vectorLayer = this.createVectorLayer();

        // layers.push(wmsLayer)

        // layers.push(wmtsFeatureLayer);
        layers.push(wmtsLayer);
        layers.push(vectorLayer);

        // let layer_4326 = new TileLayer({
        //     source: new TileWMS({
        //         url: 'https://ahocevar.com/geoserver/wms',
        //         crossOrigin: '',
        //         params: {
        //             'LAYERS': 'ne:NE1_HR_LC_SR_W_DR',
        //             'TILED': true
        //         },
        //         projection: 'EPSG:4326'
        //     })
        // });

        // layers.push(layer_4326)

        var parser = new WMTSCapabilities();
        var url = 'https://map1.vis.earthdata.nasa.gov/wmts-arctic/' +
            'wmts.cgi?SERVICE=WMTS&request=GetCapabilities';
        fetch(url).then(function(response) {
            return response.text();
        }).then(function(text) {
            var result = parser.read(text);
            var options = optionsFromCapabilities(result, {
                layer: 'OSM_Land_Mask',
                matrixSet: 'EPSG3413_250m'
            });
            options.crossOrigin = '';
            options.projection = 'EPSG:3413';
            options.wrapX = false;
            //layers.push(new TileLayer({
            //    source: new WMTS(/** @type {!module:ol/source/WMTS~Options} */ (options))
            //}));
        });
        // var xyzLayer = this.createXYZLayer();
        // var wmsLayer = this.createWMSLayer();
        // var wmtsLayer = this.createWMTSLayer();

        this.view = new View({
            projection: mapProjection,
            // center: [10000000, 9000000],
            center: [0, 0],
            zoom: 4
        });

        this.mapInstance = new Map({
            target: 'map',
            // layers: [osmLayer, xyzLayer, wmsLayer, wmtsLayer],
            layers: layers,
            view: this.view
        });

        console.log(this.wmsSource)

        let onClickFunction = function(evt) {
            // http://tb-autotransforming.sec45.ccr.dep4.niitp:8080/geoserver/cite/wms?
            // SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&
            // QUERY_LAYERS=cite%3Amosaic1_metadata&STYLES&LAYERS=cite%3Amosaic1_metadata&INFO_FORMAT=text%2Fhtml&FEATURE_COUNT=50&X=50&Y=50&
            // SRS=EPSG%3A3857&WIDTH=101&HEIGHT=101&BBOX=8299709.20777724%2C1524585.9716376204%2C8793245.051159931%2C2018121.8150203119
            // document.getElementById('info').innerHTML = '';

            let wurl = 'http://tb-autotransforming.sec45.ccr.dep4.niitp:8080/geoserver/cite/wms';
            // let format = 'image/jpeg';
            // let version = '1.0.0';


            const wmsSource = new TileWMS({
                url: wurl,
                params: {
                    'LAYERS': 'cite:mosaic1_metadata',
                    'TILED': true
                },
                serverType: 'geoserver',
                crossOrigin: 'anonymous'
            });

            let viewResolution = /** @type {number} */ (this.getView().getResolution());
            let url = wmsSource.getGetFeatureInfoUrl(
                evt.coordinate, viewResolution, 'EPSG:3857', {
                    'INFO_FORMAT': 'application/json'
                });
            console.log(url)
            fetch(url).then(function(response) {
                return response.json()
            }).then(function(json) {
                return json.features
            }).then(function(features) {
                features.forEach(function(feature) {
                    let featuresDiv = document.querySelector('#features')
                        // let featureTag = document.createElement('div')
                    let text = "id: " + feature['id']
                    let featureProperties = feature['properties']
                    for (var key in featureProperties) {
                        text += "<br/>" + key + ": " + featureProperties[key]
                    }
                    featuresDiv.innerHTML = text;
                })
            }).catch(alert);
            // if (url) {
            //     document.getElementById('info').innerHTML =
            //         '<iframe seamless src="' + url + '"></iframe>';
            // }
        }

        this.mapInstance.on('singleclick', onClickFunction);

        // var feature = this.createVectorFeature();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
        // this.addVectorFeature(feature)
    }

    initializeProjections() {
        proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
            '+x_0=400000 +y_0=-100000 +ellps=airy ' +
            '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
            '+units=m +no_defs');
        proj4.defs('EPSG:23032', '+proj=utm +zone=32 +ellps=intl ' +
            '+towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs');
        proj4.defs('EPSG:5479', '+proj=lcc +lat_1=-76.66666666666667 +lat_2=' +
            '-79.33333333333333 +lat_0=-78 +lon_0=163 +x_0=7000000 +y_0=5000000 ' +
            '+ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
        proj4.defs('EPSG:21781', '+proj=somerc +lat_0=46.95240555555556 ' +
            '+lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel ' +
            '+towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs');
        proj4.defs('EPSG:3413', '+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 ' +
            '+x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs');
        proj4.defs('EPSG:2163', '+proj=laea +lat_0=45 +lon_0=-100 +x_0=0 +y_0=0 ' +
            '+a=6370997 +b=6370997 +units=m +no_defs');
        proj4.defs('ESRI:54009', '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 ' +
            '+units=m +no_defs');
        register(proj4);
        var proj27700 = getProjection('EPSG:27700');
        proj27700.setExtent([0, 0, 700000, 1300000]);

        var proj23032 = getProjection('EPSG:23032');
        proj23032.setExtent([-1206118.71, 4021309.92, 1295389.00, 8051813.28]);

        var proj5479 = getProjection('EPSG:5479');
        proj5479.setExtent([6825737.53, 4189159.80, 9633741.96, 5782472.71]);

        var proj21781 = getProjection('EPSG:21781');
        proj21781.setExtent([485071.54, 75346.36, 828515.78, 299941.84]);

        var proj3413 = getProjection('EPSG:3413');
        proj3413.setExtent([-4194304, -4194304, 4194304, 4194304]);

        var proj2163 = getProjection('EPSG:2163');
        proj2163.setExtent([-8040784.5135, -2577524.9210, 3668901.4484, 4785105.1096]);

        var proj54009 = getProjection('ESRI:54009');
        proj54009.setExtent([-18e6, -9e6, 18e6, 9e6]);
    }

    initializeLayers() {
        this.layers = {};

        this.layers['osm'] = new TileLayer({
            source: new OSM()
        });

        this.layers['wms4326'] = new TileLayer({
            source: new TileWMS({
                url: 'https://ahocevar.com/geoserver/wms',
                crossOrigin: '',
                params: {
                    'LAYERS': 'ne:NE1_HR_LC_SR_W_DR',
                    'TILED': true
                },
                projection: 'EPSG:4326'
            })
        });

        var parser = new WMTSCapabilities();
        var url = 'https://map1.vis.earthdata.nasa.gov/wmts-arctic/' +
            'wmts.cgi?SERVICE=WMTS&request=GetCapabilities';
        this.layers['wmts3413'] = fetch(url).then(function(response) {
            return response.text();
        }).then(function(text) {
            var result = parser.read(text);
            var options = optionsFromCapabilities(result, {
                layer: 'OSM_Land_Mask',
                matrixSet: 'EPSG3413_250m'
            });
            options.crossOrigin = '';
            options.projection = 'EPSG:3413';
            options.wrapX = false;
            return new TileLayer({
                source: new WMTS( /** @type {!module:ol/source/WMTS~Options} */ (options))
            });
        });

        var startResolution =
            getWidth(getProjection('EPSG:3857').getExtent()) / 256;
        var resolutions = new Array(22);
        for (var i = 0, ii = resolutions.length; i < ii; ++i) {
            resolutions[i] = startResolution / Math.pow(2, i);
        }
    }

    changeProjection(newProjection) {
        // let oldProjection = this.mapInstance.getView().getProjection().getCode()
        var newProj = getProjection(newProjection);
        var newProjExtent = newProj.getExtent();
        var newView = new View({
            projection: newProj,
            center: getCenter(newProjExtent || [0, 0, 0, 0]),
            zoom: 0,
            extent: newProjExtent || undefined
        });
        this.mapInstance.setView(newView);
        // this.transformVectorFeatures(oldProjection, newProjection);

        //   layers['bng'].setExtent([-1057216, 6405988, 404315, 8759696]);
        // } else {
        //   layers['bng'].setExtent(undefined);
        // }
    }

    updateLayers(layers) {
        this.switchLayerVisibility(layers)
    }

    switchLayerVisibility(layers) {
        for (var layer in layers) {
            if (layers.hasOwnProperty(layer)) {
                switch (layer) {
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

    switchLayerXYZ(visibility) {
        var layers = this.mapInstance.getLayers();
        layers.forEach(function(layer) {
            if (layer.get('name') === 'xyzLayer') {
                layer.set('visible', visibility)
            }
        })
    }

    switchLayerWMS(visibility) {
        var layers = this.mapInstance.getLayers();
        layers.forEach(function(layer) {
            if (layer.get('name') === 'wmsLayer') {
                console.log(layer)
                layer.set('visible', visibility)
            }
        })
    }

    switchLayerWMTS(visibility) {
        var layers = this.mapInstance.getLayers();
        layers.forEach(function(layer) {
            if (layer.get('name') === 'wmtsLayer') {
                layer.set('visible', visibility)
            }
        })
    }

    createLandsatLayer() {
        //https://gptl.ru/coverages/images_landsat/4/0010-1010.jpg
        return new TileLayer({

            source: new XYZ({
                tileUrlFunction(tileCoord, pixelRatio, projection) {
                    var z = tileCoord[0].toString();

                    // add the part /1/1-0.jpg, --> {z}/{x}-{y}.jpg
                    let path = 'https://gptl.ru/coverages/images_landsat';
                    path += '/' + z + '/';

                    var textX = tileCoord[1].toString(2);
                    while (textX.length < tileCoord[0]) textX = '0' + textX;

                    var textY = tileCoord[2].toString(2);
                    while (textY.length < tileCoord[0]) textY = '0' + textY;

                    for (var i = 6; i < tileCoord[0]; i++)
                        path += textY.substr(0, i - 5) + '-' + textX.substr(0, i - 5) + '/';

                    path += textY + '-' + textX + '.jpg';
                    return path;
                }
            })
        })
    }

    createVectorLayer() {
        return new VectorLayer({
            source: new VectorSource({
                features: []
            }),
            name: 'featureLayer'
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


        // https://gptl.ru/wms/mm1_msu/service?TRANSPARENT=TRUE&FORMAT=image%2Fpng&INFO_FORMAT=application%2Fvnd.ogc.gml&SERVICE=WMS&
        // VERSION=1.1.1&REQUEST=GetMap&STYLES=%2C&LAYERS=imageries%2Cboundaries&QUERY_LAYERS=imageries,boundaries&SRS=EPSG%3A3857&
        // BBOX=7514065.6275,12523442.7125,10018754.17,15028131.255&WIDTH=256&HEIGHT=256



        var wmsSource = new TileWMS({
            url: 'https://ahocevar.com/geoserver/wms',
            params: {
                'LAYERS': 'ne:ne',
                'TILED': true
            },
            serverType: 'geoserver',
            crossOrigin: 'anonymous'
        });

        return new TileLayer({
            source: wmsSource,
            name: 'wmsLayer'
        });
    }

    createPolarWMTSLayer() {
        var parser = new WMTSCapabilities();
        var url = 'https://map1.vis.earthdata.nasa.gov/wmts-arctic/' +
            'wmts.cgi?SERVICE=WMTS&request=GetCapabilities';
        var layer = null;
        fetch(url).then(function(response) {
            return response.text();
        }).then(function(text) {
            var result = parser.read(text);
            var options = optionsFromCapabilities(result, {
                layer: 'OSM_Land_Mask',
                matrixSet: 'EPSG3413_250m'
            });
            options.crossOrigin = '';
            options.projection = 'EPSG:3413';
            options.wrapX = false;
            layer = new TileLayer({
                source: new WMTS( /** @type {!module:ol/source/WMTS~Options} */ (options))
            });
        });
        return layer;
    }

    createWMTSLayer() {
        let url = 'http://tb-autotransforming.sec45.ccr.dep4.niitp:8080/geoserver/gwc/service/wmts';
        let format = 'image/png';
        // let version = '1.0.0';


        var projection = getProjection('EPSG:900913');
        var projectionExtent = projection.getExtent();
        var size = getWidth(projectionExtent) / 256;
        var resolutions = new Array(14);
        var matrixIds = new Array(14);
        for (var z = 0; z < 14; ++z) {
            resolutions[z] = size / Math.pow(2, z);
            matrixIds[z] = 'EPSG:900913:' + z;
        }


        return new TileLayer({
            // opacity: 0.0,
            source: new WMTS({
                attributions: '',
                url: url,
                layer: 'cite:mosaic1',
                matrixSet: 'EPSG:900913',
                format: format,
                projection: projection,
                crossOrigin: 'Access-Control-Allow-Origin',
                // crossOrigin: 'anonymous',
                tileGrid: new WMTSTileGrid({
                    origin: getTopLeft(projectionExtent),
                    resolutions: resolutions,
                    matrixIds: matrixIds
                }),
                // style: new Style({
                //     stroke: new Stroke({
                //         width: 3,
                //         color: [255, 0, 0, 1]
                //     }),
                //     fill: new Fill({
                //         color: [0, 0, 255, 0.6]
                //     })
                // }),
                wrapX: true
            }),
            name: 'wmtsLayer'
        })
    }

    createWMTSFeatureLayer() {
        // http://tb-autotransforming.sec45.ccr.dep4.niitp:8080/geoserver/cite/wms?SERVICE=WMS&
        // VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&STYLES&LAYERS=cite%3Amosaic1_metadata&SRS=EPSG%3A3857&WIDTH=769&
        // HEIGHT=553&BBOX=5336050.900731673%2C-908887.790783966%2C20347358.929163635%2C9900035.82864686


        // http://tb-autotransforming.sec45.ccr.dep4.niitp:8080/geoserver/cite/wms
        // ?service=WMS&version=1.1.0&request=GetMap&layers=cite:mosaic1_metadata&
        // styles=&bbox=8096176.35478691,1090673.23369829,1.75708210227368E7,7919673.46409706&width=768&height=553&
        // srs=EPSG:3857&format=application/openlayers#toggle

        let url = 'http://tb-autotransforming.sec45.ccr.dep4.niitp:8080/geoserver/cite/wms';
        // let format = 'image/jpeg';
        // let version = '1.0.0';


        this.wmsSource = new TileWMS({
            url: url,
            params: {
                'LAYERS': 'cite:mosaic1_metadata',
                'TILED': true                
            },

            serverType: 'geoserver'
,            crossOrigin: 'anonymous'
        });

        return new TileLayer({
            source: this.wmsSource
        });
    }

    createVectorFeature(wktPolygon, visibility) {
        let wkt = wktPolygon ? wktPolygon : polygons[1];
        var format = new WKT()
        var feature = format.readFeature(wkt, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
            visibility: visibility
        })
        feature.setStyle(new Style({}));
        return feature
    }

    addVectorFeature(feature) {
        var layers = this.mapInstance.getLayers();
        layers.forEach(function(layer) {
            if (layer.get('name') === 'featureLayer') {
                layer.getSource().addFeature(feature);
            }
        })
    }

    transformVectorFeatures(oldProjection, newProjection) {
        var layers = this.mapInstance.getLayers();
        layers.forEach(function(layer) {
            if (layer.get('name') === 'featureLayer') {
                layer.getSource().forEachFeature(function(feature) {
                    feature.getGeometry().transform(oldProjection, newProjection);
                });
            }
        })
    }

    createImageFeature(previews, feature) {
        var format = new WKT()
        let layersCollection = new Collection()
        let featureGroup = new LayerGroup({
            extent: feature.getGeometry().getExtent(),
            layerGroupId: previews[0].id
        })
        for (let i = 0; i < previews.length; i++) {
            let preview = previews[i];
            console.log(preview.file_name)

            let vectorFeature = format.readFeature(preview.polygon, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            })

            let pro = this.mapInstance.getView().getProjection();
            let il = new ImageLayer({
                source: new Static({
                    attributions: '© <a href="http://xkcd.com/license.html">xkcd</a>',
                    //url: '/10103996_'+(i+1)+'.png',
                    url: '/' + preview.file_name.split('/')[preview.file_name.split('/').length - 1],
                    projection: pro,
                    imageExtent: vectorFeature.getGeometry().getExtent()
                }),
                visible: false
            })

            layersCollection.push(il)
                // this.mapInstance.addLayer(layer)
        }
        featureGroup.setLayers(layersCollection)
        this.mapInstance.addLayer(featureGroup)
            // this.mapInstance.getView().fit(feature.getGeometry().getExtent())
    }

    addImageFeature(imageFeature) {

    }

    drawFeatures(features, featuresData) {
        for (let i = 0; i < featuresData.length; i++) {
            let values = Object.values(featuresData[i].data)
            let wktPolygon = values[0].polygon
            let previews = values[0].previews
            let contourFeature = this.createVectorFeature(wktPolygon, features[i].contour)
            this.addVectorFeature(contourFeature)

            // this.addImageFeature(this.createImageFeature(previews, contourFeature))
            this.createImageFeature(previews, contourFeature)
        }
    }

    updateFeatures(features) {
        let layer = null;
        let layersArray = this.mapInstance.getLayers().getArray();
        for (let i = 0; i < layersArray.length; i++) {
            if (layersArray[i].get('name') === "featureLayer")
                layer = layersArray[i];
        }


        for (var i = 0; i < features.length; i++) {
            let feature = features[i]
            layer.get('source').getFeatures()[i].setStyle(feature.contour ? null : new Style({}))
            const visibility = feature.image
            let id = feature.id;
            for (let i = 0; i < layersArray.length; i++) {
                if (layersArray[i].get('layerGroupId') === id) {
                    layersArray[i].getLayers().forEach(function(layer, index, array) {
                        layer.setVisible(visibility)
                    })
                }
            }
        }
    }

    switchPolarView(isPolar) {
        var newProj = getProjection("EPSG:3413");
        var newProjExtent = newProj.getExtent();
        var newView = new View({
            projection: newProj,
            center: getCenter(newProjExtent || [0, 0, 0, 0]),
            zoom: 0,
            extent: newProjExtent || undefined
        });


        // // bngLayer.setExtent(undefined)
        // // map.setView(newView);
        if (isPolar) {
            this.mapInstance.setView(newView)
        //         // this.mapInstance.getLayers().setAt(0, bngLayer);
        }
    }
}

export default MapInstance;