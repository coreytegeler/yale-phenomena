$(function() {
  var map, property, style;
  mapboxgl.accessToken = 'pk.eyJ1IjoiY29yZXl0ZWdlbGVyIiwiYSI6ImNpd25xNjU0czAyeG0yb3A3cjdkc2NleHAifQ.EJAjj38qZXzIylzax3EMWg';
  style = 'mapbox://styles/coreytegeler/cj5adbyws0g7l2sqnl74tvzoa';
  style = 'mapbox://styles/mapbox/light-v9';
  map = new mapboxgl.Map({
    container: 'map',
    style: style,
    zoom: 3,
    center: [-95.7129, 37.0902]
  });
  property = 'CU_1060.1';
  return map.on('load', function() {
    var dataBounds, dataLayer;
    map.addLayer({
      'id': 'data',
      'type': 'circle',
      'source': {
        type: 'vector',
        url: 'mapbox://coreytegeler.cj5acubfx065v32mmdelcwb71-677sh'
      },
      'source-layer': 'Yale_GDP',
      'paint': {
        'circle-radius': {
          'base': 1.75,
          'stops': [[12, 5], [22, 10]]
        },
        'circle-color': {
          property: property,
          type: 'categorical',
          stops: [['0', 'rgba(0,0,0,.1)'], ['1', 'rgba(0,0,0,.2)'], ['2', 'rgba(0,0,0,.4)'], ['3', 'rgba(0,0,0,.6)'], ['4', 'rgba(0,0,0,.8)'], ['5', 'rgba(0,0,0,1)']]
        }
      }
    });
    dataLayer = map.getLayer('data');
    dataBounds = map.getBounds(dataLayer).toArray();
    return map.fitBounds(dataBounds, {
      padding: 100,
      animate: false
    });
  });
});
