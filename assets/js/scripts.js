$(function() {
  var accessToken, addFilters, addPhenomena, apiBase, createMap, datasetId, getUniqueFeatures, loadDataset, style, tilesetId, updatePaintProperty, username;
  tilesetId = 'Yale_GDP';
  datasetId = 'cj5acubfx065v32mmdelcwb71';
  username = 'coreytegeler';
  apiBase = 'https://api.mapbox.com/datasets/v1/' + username + '/' + datasetId;
  accessToken = 'pk.eyJ1IjoiY29yZXl0ZWdlbGVyIiwiYSI6ImNpd25xNjU0czAyeG0yb3A3cjdkc2NleHAifQ.EJAjj38qZXzIylzax3EMWg';
  mapboxgl.accessToken = accessToken;
  style = 'mapbox://styles/coreytegeler/cj5adbyws0g7l2sqnl74tvzoa';
  style = 'mapbox://styles/mapbox/light-v9';
  createMap = function() {
    window.map = new mapboxgl.Map({
      container: 'map',
      style: style,
      zoom: 3,
      center: [-95.7129, 37.0902]
    });
    return map.on('load', function() {
      var dataBounds, dataLayer;
      map.addLayer({
        'id': 'data',
        'type': 'circle',
        'source': {
          type: 'vector',
          url: 'mapbox://coreytegeler.cj5acubfx065v32mmdelcwb71-677sh'
        },
        'source-layer': tilesetId,
        'paint': {
          'circle-radius': {
            'base': 1.75,
            'stops': [[12, 5], [22, 10]]
          },
          'circle-color': {
            property: 'Gender',
            type: 'categorical',
            stops: [['Male', 'blue'], ['Female', 'pink'], ['Transgender (MTF)', 'green'], ['Transgender (FTM)', 'green']]
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
  };
  updatePaintProperty = function(prop) {
    var styles;
    styles = {
      property: prop,
      type: 'categorical',
      stops: [['0', 'rgba(0,0,0,.1)'], ['1', 'rgba(0,0,0,.2)'], ['2', 'rgba(0,0,0,.4)'], ['3', 'rgba(0,0,0,.6)'], ['4', 'rgba(0,0,0,.8)'], ['5', 'rgba(0,0,0,1)']]
    };
    return map.setPaintProperty('data', 'circle-color', styles);
  };
  loadDataset = function() {
    return $.ajax({
      url: apiBase + '/features',
      data: {
        access_token: accessToken
      },
      success: function(response) {
        var allowedProps, feature, filters, i, j, k, keys, len, len1, len2, prop, props, ref, ref1, results, value;
        window.keys = Object.keys(response.features[0].properties);
        window.dataset = response;
        filters = {};
        ref = dataset.features;
        for (i = 0, len = ref.length; i < len; i++) {
          feature = ref[i];
          props = feature.properties;
          keys = Object.keys(props);
          for (j = 0, len1 = keys.length; j < len1; j++) {
            prop = keys[j];
            value = props[prop];
            if (!filters[prop]) {
              filters[prop] = [value];
            } else if (filters[prop].indexOf(value) < 0) {
              filters[prop].push(value);
            }
          }
        }
        ref1 = Object.keys(filters);
        results = [];
        for (k = 0, len2 = ref1.length; k < len2; k++) {
          prop = ref1[k];
          allowedProps = ['Gender', 'Education', 'Income', 'Race', 'Languages', 'Age'];
          if (allowedProps.indexOf(prop) > 0) {
            results.push(addFilters(filters, prop));
          } else if (prop.match(/\d+/g)) {
            results.push(addPhenomena(prop));
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    });
  };
  addFilters = function(filters, prop) {
    var $filterItem, $filterList, i, len, results, val, vals;
    vals = filters[prop];
    $filterList = $('#filters ul[data-prop="' + prop + '"]');
    if (!$filterList.length) {
      $filterList = $('<ul></ul>');
      $filterList.attr('data-prop', prop);
      $('#filters').append('<h3>' + prop + '</h3>');
      $('#filters').append($filterList);
    }
    results = [];
    for (i = 0, len = vals.length; i < len; i++) {
      val = vals[i];
      $filterItem = $filterList.find('li[data-value="' + val + '"]');
      if (!$filterItem.length) {
        $filterItem = $('<li></li>');
        $filterItem.attr('data-val', val).html(val);
        results.push($filterList.append($filterItem));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };
  addPhenomena = function(val) {
    var $phenItem, $phenList;
    $phenList = $('#phenomena ul[data-prop="phenomena"]');
    if (!$phenList.length) {
      $phenList = $('<ul></ul>');
      $phenList.attr('data-prop', 'phenomena');
      $('#phenomena').append('<h3>Phenomena</h3>');
      $('#phenomena').append($phenList);
    }
    $phenItem = $phenList.find('li[data-value="' + val + '"]');
    if (!$phenItem.length) {
      $phenItem = $('<li></li>');
      $phenItem.attr('data-val', val).html(val);
      return $phenList.append($phenItem);
    }
  };
  getUniqueFeatures = function(array, comparatorProperty) {
    var existingFeatureKeys, uniqueFeatures;
    existingFeatureKeys = {};
    uniqueFeatures = array.filter(function(el) {
      if (existingFeatureKeys[el.properties[comparatorProperty]]) {
        return false;
      } else {
        existingFeatureKeys[el.properties[comparatorProperty]] = true;
        return true;
      }
    });
    return uniqueFeatures;
  };
  createMap();
  loadDataset();
  return $('body').on('click', 'aside ul li', function() {
    var cond, filter, prop, val;
    prop = $(this).parents('ul').attr('data-prop');
    val = $(this).attr('data-val');
    cond = '==';
    if (prop === 'phenomena') {
      return updatePaintProperty(val);
    }
    if (val.length) {
      filter = ['==', prop, val];
    } else {
      filter = ['has', prop];
    }
    return map.setFilter('data', filter);
  });
});
