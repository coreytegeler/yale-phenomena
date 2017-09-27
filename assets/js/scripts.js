$(function() {
  var $filters, $phenomena, accessToken, addFilters, addPhenomena, apiBase, changeSlider, clearFilter, createMap, datasetId, filterMarkers, getUniqueFeatures, loadDataset, selectFilter, selectSentence, setUpSliders, style, tilesetId, toggleFilters, togglePhenomena, translator, updatePaintProperty, username, whiteList;
  tilesetId = 'Yale_GDP';
  datasetId = 'cj5acubfx065v32mmdelcwb71';
  username = 'coreytegeler';
  apiBase = 'https://api.mapbox.com/datasets/v1/' + username + '/' + datasetId;
  accessToken = 'pk.eyJ1IjoiY29yZXl0ZWdlbGVyIiwiYSI6ImNpd25xNjU0czAyeG0yb3A3cjdkc2NleHAifQ.EJAjj38qZXzIylzax3EMWg';
  mapboxgl.accessToken = accessToken;
  style = 'mapbox://styles/coreytegeler/cj5adbyws0g7l2sqnl74tvzoa';
  style = 'mapbox://styles/mapbox/light-v9';
  $filters = $('#filters');
  $phenomena = $('#phenomena');
  createMap = function() {
    window.map = new mapboxgl.Map({
      container: 'map',
      style: style,
      zoom: 3,
      center: [-95.7129, 37.0902]
    });
    return map.on('load', function() {
      var dataBounds, dataLayer, paddedBounds;
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
          }
        }
      });
      dataLayer = map.getLayer('data');
      dataBounds = map.getBounds(dataLayer).toArray();
      map.fitBounds(dataBounds, {
        padding: {
          top: 200,
          bottom: 200,
          left: 200,
          right: 200
        },
        animate: false
      });
      paddedBounds = map.getBounds();
      return map.setMaxBounds(paddedBounds);
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
        var filters;
        window.keys = Object.keys(response.features[0].properties);
        window.dataset = response;
        return filters = {};
      }
    });
  };
  whiteList = ['Income', 'Race', 'Age'];
  addFilters = function(filters, prop) {
    var $filter, $filterItem, $filterList, j, len, results, val, vals;
    vals = filters[prop];
    $filterList = $('#filters .filter[data-prop="' + prop + '"]');
    if (!$filterList.length) {
      $filter = $('<div></div>');
      $filter.attr('data-prop', prop);
      $filterList = $('<ul></ul>');
      $filter.append('<h3>' + prop + '</h3>');
      $filter.append($filterList);
      $('#filters').append($filter);
    }
    results = [];
    for (j = 0, len = vals.length; j < len; j++) {
      val = vals[j];
      $filterItem = $filterList.find('li[data-value="' + val + '"]');
      if (!$filterItem.length) {
        $filterItem = $('<li></li>');
        $filterItem.attr('data-val', val).html(val);
        results.push($filter.find('ul').append($filterItem));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };
  translator = {
    'PR_1125': 'The car needs washed',
    'CG_1025.1': 'I was afraid you might couldn’t find it',
    'PI_1160': 'John plays guitar, but so don’t I',
    'PI_1171': 'Here’s you a piece of pizza',
    'CG_1026.1': 'This seat reclines hella',
    'PI_1161': 'When I don\'t have hockey and I\'m done my homework, I go there and skate',
    'PI_1172': 'I’m SO not going to study tonight',
    'PR_1116': 'Every time you ask me not to hum, I’ll hum more louder'
  };
  addPhenomena = function(val) {
    var $phen, $phenItem, $phenList, sentence;
    sentence = translator[val];
    if (!sentence) {
      return;
    }
    $phenList = $('#phenomena .filter[data-prop="phenomena"]');
    if (!$filterList.length) {
      $phen = $('<div></div>');
      $phen.attr('data-prop', prop);
      $phenList = $('<ul></ul>');
      $phen.append('<h3>' + prop + '</h3>');
      $phen.append($phenList);
      $('#filters').append($phen);
    }
    $phenItem = $phenList.find('li[data-val="' + val + '"]');
    if (!$phenItem.length) {
      $phenItem = $('<li></li>');
      $phenItem.attr('data-val', val).html(sentence);
      return $phen.find('ul').append($phenItem);
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
  togglePhenomena = function(e) {
    var $side;
    $side = $(this).parents('aside');
    $side.toggleClass('close');
    return $('#sentence').toggleClass('show');
  };
  selectSentence = function() {
    var $filter, $sentence, $side, text, val;
    $sentence = $(this);
    $filter = $sentence.parents('.filter');
    $side = $filter.parents('aside');
    val = $sentence.attr('data-val');
    text = $sentence.find('span').text();
    $side.find('.selected').removeClass('selected');
    $sentence.toggleClass('selected');
    if ($sentence.is('.selected')) {
      $('#sentence h1').text(text);
      return updatePaintProperty(val);
    } else {
      return $('#sentence h1').text('');
    }
  };
  filterMarkers = function() {
    return $filters.find('.option.selected').each(function(i, option) {
      var $filter, $option, j, len, marker, markerProps, prop, ref, results, val;
      $option = $(option);
      $filter = $option.parents('.filter');
      prop = $filter.attr('data-prop');
      val = $option.attr('data-val');
      if (!val) {
        val = null;
      }
      ref = dataset.features;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        marker = ref[j];
        markerProps = marker.properties;
        results.push(console.log(prop));
      }
      return results;
    });
  };
  toggleFilters = function(e) {
    var $filter, $label, prop;
    $label = $(this);
    prop = $label.attr('data-prop');
    $filter = $('.filter[data-prop="' + prop + '"]');
    return $filter.toggleClass('open');
  };
  selectFilter = function(e) {
    var $filter, $li, $selected, $side, __val, _prop, _vals, filter, j, k, len, len1, prop, ref, val, vals;
    $li = $(this);
    $filter = $li.parents('.filter');
    $side = $filter.parents('aside');
    prop = $filter.attr('data-prop');
    val = $li.attr('data-val');
    if ($li.is('.selected')) {
      $li.removeClass('selected');
    } else {
      $filter.find('.selected:not([data-val="' + val + '"])').removeClass('selected');
      $li.addClass('selected');
    }
    if (val) {
      vals = {};
      $selected = $side.find('li.selected');
      $selected.each(function(i, li) {
        var _prop, _val;
        _val = $(li).attr('data-val');
        if (!_val) {
          return;
        }
        _prop = $(li).parents('.filter').attr('data-prop');
        if (!vals[_prop]) {
          return vals[_prop] = [_val];
        } else {
          return vals[_prop].push(_val);
        }
      });
      filter = clearFilter(prop);
      if (!filter) {
        filter = ['all'];
      }
      ref = Object.keys(vals);
      for (j = 0, len = ref.length; j < len; j++) {
        _prop = ref[j];
        _vals = vals[_prop];
        for (k = 0, len1 = _vals.length; k < len1; k++) {
          __val = _vals[k];
          filter.push(['==', _prop, __val]);
        }
      }
    } else {
      filter = clearFilter(prop);
    }
    console.log(filter);
    return map.setFilter('data', filter);
  };
  clearFilter = function(prop) {
    var arr, arrs, filter, i, j, len;
    filter = map.getFilter('data');
    if (filter) {
      arrs = filter.slice(0);
      arrs.shift();
      for (i = j = 0, len = arrs.length; j < len; i = ++j) {
        arr = arrs[i];
        if (arr.indexOf(prop) > -1) {
          filter.splice(i + 1);
        }
      }
      return filter;
    }
  };
  setUpSliders = function() {
    return $('.slider').each(function(i, slider) {
      var $slider, max, med, min, options, type;
      $slider = $(slider);
      type = $slider.attr('data-type');
      min = Number($slider.attr('data-min'));
      max = Number($slider.attr('data-max'));
      med = Number(((min + max) / 2).toFixed(0));
      options = {
        min: min,
        max: max,
        range: type === 'range'
      };
      if (type === 'scale') {
        options.value = med;
      } else if (type === 'range') {
        options.values = [min, max];
      }
      return $slider.slider(options);
    });
  };
  changeSlider = function(e, ui) {
    var $slider, filter, maxVal, minVal, prop, type, val, vals;
    $slider = $(this);
    prop = $slider.attr('data-prop');
    type = $slider.attr('data-type');
    filter = clearFilter(prop);
    if (!filter) {
      filter = ['any'];
    }
    if (type === 'scale') {
      val = ui.value.toString();
      filter.push(['==', prop, val]);
      return map.setFilter('data', filter);
    } else if (type === 'range') {
      vals = ui.values;
      minVal = vals[0];
      maxVal = vals[1];
      filter.push(['>=', prop, minVal]);
      filter.push(['<=', prop, maxVal]);
      return map.setFilter('data', filter);
    }
  };
  $('body').on('click', 'aside .label', toggleFilters);
  $('body').on('click', 'aside#filters ul li', selectFilter);
  $('.slider').on('slidechange', changeSlider);
  $('body').on('click', '.hamburger', togglePhenomena);
  $('body').on('click', 'aside#phenomena ul li', selectSentence);
  createMap();
  loadDataset();
  return setUpSliders();
});
