$(function() {
  var $filters, $fixedHeader, $headerSentence, $phenomena, accessToken, changeSlider, changeThresholds, clearFilter, clickFilter, countID, countURI, createMap, dataID, dataURI, filterMarkers, getQuery, getUniqueFeatures, human, humanize, installKey, keyURI, machine, mechanize, selectFilter, selectSentence, setUpSliders, startListening, styleURI, toggleFeature, toggleFieldset, toggleFilterTabs, toggleSide, updatePaintProperty, updateUrl;
  accessToken = 'pk.eyJ1IjoiY29yZXl0ZWdlbGVyIiwiYSI6ImNpd25xNjU0czAyeG0yb3A3cjdkc2NleHAifQ.EJAjj38qZXzIylzax3EMWg';
  mapboxgl.accessToken = accessToken;
  styleURI = 'mapbox://styles/mapbox/light-v9';
  styleURI = 'mapbox://styles/coreytegeler/cj5adbyws0g7l2sqnl74tvzoa';
  dataURI = 'mapbox://coreytegeler.cj8yqu9o509q92wo4ybzg13xo-9ir7s';
  dataID = 'survey8';
  countURI = 'mapbox://coreytegeler.afjjqi6e';
  countID = 'gz_2010_us_050_00_500k-c9lvkv';
  keyURI = 'data/key8.csv';
  $filters = $('#filters');
  $phenomena = $('#phenomena');
  $fixedHeader = $('header.fixed');
  $headerSentence = $('header.fixed .sentence');
  createMap = function() {
    window.map = new mapboxgl.Map({
      container: 'map',
      style: styleURI,
      zoom: 3,
      center: [-95.7129, 37.0902]
    });
    return map.on('load', function() {
      var dataBounds, dataLayer;
      map.addLayer({
        'id': 'data-circle',
        'type': 'circle',
        'source': {
          type: 'vector',
          url: dataURI
        },
        'source-layer': dataID,
        'zoom': 10,
        'paint': {
          'circle-color': 'rgb(21,53,84)',
          'circle-radius': 4
        }
      });
      map.addLayer({
        'id': 'data-outline',
        'type': 'circle',
        'source': {
          type: 'vector',
          url: dataURI
        },
        'source-layer': dataID,
        'zoom': 10,
        'paint': {
          'circle-stroke-color': 'rgb(21,53,84)',
          'circle-stroke-width': 2,
          'circle-radius': 5,
          'circle-color': 'transparent'
        }
      });
      dataLayer = map.getLayer('data-circle');
      dataBounds = map.getBounds(dataLayer).toArray();
      map.addLayer({
        'id': 'counties',
        'type': 'line',
        'source': {
          type: 'vector',
          url: countURI
        },
        'source-layer': countID,
        'layout': {
          'visibility': 'none'
        },
        'minzoom': 0,
        'maxzoom': 24,
        'paint': {
          'line-width': 1,
          'line-color': 'black',
          'line-opacity': 0.1
        }
      });
      startListening(map);
      return getQuery();
    });
  };
  updatePaintProperty = function(prop) {
    var fillStyles, outlineStyles;
    fillStyles = {
      property: prop,
      type: 'categorical',
      stops: [[0, '#795292'], [1, '#795292'], [2, '#795292'], [3, '#5fa990'], [4, '#5fa990'], [5, '#5fa990']]
    };
    outlineStyles = {
      property: prop,
      type: 'categorical',
      stops: [[0, '#795292'], [1, '#795292'], [2, '#795292'], [3, '#5fa990'], [4, '#5fa990'], [5, '#5fa990']]
    };
    map.setPaintProperty('data-circle', 'circle-color', fillStyles);
    return map.setPaintProperty('data-outline', 'circle-stroke-color', outlineStyles);
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
  toggleSide = function(e) {
    var $side;
    $side = $(this).parents('aside');
    $side.toggleClass('closed');
    if ($side.is('#phenomena')) {
      return $fixedHeader.toggleClass('hide');
    }
  };
  selectSentence = function() {
    var $accFieldset, $accLabel, $fieldset, $sentence, $side, text, val;
    $sentence = $(this);
    $fieldset = $sentence.parents('.fieldset');
    $side = $fieldset.parents('aside');
    val = $sentence.attr('data-val');
    text = $sentence.find('span').text();
    $side.find('.selected').removeClass('selected');
    $sentence.toggleClass('selected');
    $accFieldset = $filters.find('.fieldset.acceptability');
    $accLabel = $filters.find('.label.acceptability');
    $accFieldset.attr('data-prop', val);
    $accLabel.attr('data-prop', val);
    if ($sentence.is('.selected')) {
      $headerSentence.text(text);
      updatePaintProperty(val);
      return $accFieldset.removeClass('disabled');
    } else {
      $headerSentence.text('');
      return $accFieldset.addClass('disabled');
    }
  };
  toggleFilterTabs = function(e) {
    var $form, $tab, formId;
    $tab = $(this);
    if ($tab.is('.active')) {
      return;
    }
    formId = $tab.attr('data-form');
    $form = $('.form[data-form="' + formId + '"]');
    $('.tab.active').removeClass('active');
    $('.form.active').removeClass('active');
    $tab.addClass('active');
    return $form.addClass('active');
  };
  toggleFieldset = function(e) {
    var $fieldset, $label;
    $label = $(this);
    $fieldset = $label.parents('.fieldset');
    return $fieldset.toggleClass('open');
  };
  clickFilter = function(e) {
    var $fieldset, $option, $side, prop, val;
    $option = $(this);
    $fieldset = $option.parents('.fieldset');
    $side = $fieldset.parents('aside');
    prop = $fieldset.attr('data-prop');
    val = $option.attr('data-val');
    selectFilter(prop, val);
    return updateUrl();
  };
  selectFilter = function(prop, val) {
    var $fieldset, $option, $selected;
    $fieldset = $filters.find('.fieldset[data-prop="' + prop + '"]');
    $selected = $fieldset.find('.selected');
    if (!val) {
      $option = $fieldset.find('.option.all');
    } else {
      $option = $fieldset.find('.option[data-val="' + val + '"]');
    }
    if ($option.is('.all')) {
      $selected.filter(':not(.all)').removeClass('selected');
    } else if (!$option.length) {
      return;
    } else if ($fieldset.is('.radio')) {
      $selected.removeClass('selected');
    } else {
      $selected.filter('.all').removeClass('selected');
    }
    if ($option.is('.selected:not(.all)')) {
      $option.removeClass('selected');
      if (!$fieldset.find('.selected').length) {
        $fieldset.find('.all').addClass('selected');
      }
    } else {
      $option.addClass('selected');
    }
    if ($fieldset.is('.advanced')) {
      return toggleFeature($option);
    } else {
      return filterMarkers();
    }
  };
  filterMarkers = function() {
    var $selected, $sliders, __val, _prop, _vals, args, cond, filter, j, k, len, len1, ref, vals;
    vals = {};
    $selected = $filters.find('.filter li.selected');
    $selected.each(function(i, li) {
      var $filter, _prop, _val, filter, prop;
      $filter = $(li).parents('.filter');
      prop = $filter.attr('data-prop');
      _val = $(li).attr('data-val');
      if (!_val) {
        return;
      }
      _prop = $(li).parents('.filter').attr('data-prop');
      if (!vals[_prop]) {
        vals[_prop] = [_val];
      } else {
        vals[_prop].push(_val);
      }
      return filter = clearFilter(prop);
    });
    if (!filter) {
      filter = ['all'];
      cond = 'in';
      ref = Object.keys(vals);
      for (j = 0, len = ref.length; j < len; j++) {
        _prop = ref[j];
        _vals = vals[_prop];
        if (_prop.indexOf('_') > -1 && _vals[0] && _prop !== 'Age_Bin') {
          _vals = _vals[0].split(',');
        }
        args = [cond, _prop];
        for (k = 0, len1 = _vals.length; k < len1; k++) {
          __val = _vals[k];
          if (!isNaN(__val)) {
            __val = parseInt(__val);
          }
          args.push(__val);
        }
        filter.push(args);
      }
    } else {
      filter = clearFilter(prop);
    }
    $sliders = $filters.find('.slider');
    $sliders.each(function(i, slider) {
      var $fieldset, $slider, $val, current, maxVal, minVal, prop, type, val;
      $slider = $(slider);
      $fieldset = $slider.parents('.fieldset');
      $val = $fieldset.find('.label .val');
      prop = $fieldset.attr('data-prop');
      type = $slider.attr('data-type');
      current = '';
      if (type === 'scale') {
        if (val = $slider.attr('data-val')) {
          filter.push(['==', prop, val]);
          current = '(' + val + ')';
        }
      } else if (type === 'range') {
        minVal = $slider.attr('data-min-val');
        maxVal = $slider.attr('data-max-val');
        if (minVal && maxVal) {
          filter.push(['>=', prop, parseInt(minVal)]);
          filter.push(['<=', prop, parseInt(maxVal)]);
          current = '(' + minVal + '-' + maxVal + ')';
        }
      }
      return $val.text(current);
    });
    map.setFilter('data-circle', filter);
    return map.setFilter('data-outline', filter);
  };
  clearFilter = function(prop) {
    var arr, arrs, filter, i, j, len;
    if (!map.length) {
      return;
    }
    filter = map.getFilter('data-circle');
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
  toggleFeature = function(option) {
    var $fieldset, $option, layer, visibility;
    $option = $(option);
    $fieldset = $option.parents('.fieldset');
    layer = $option.attr('data-val');
    if (!map.getLayer(layer)) {
      return;
    }
    visibility = map.getLayoutProperty(layer, 'visibility');
    if (visibility === 'visible') {
      return map.setLayoutProperty(layer, 'visibility', 'none');
    } else {
      return map.setLayoutProperty(layer, 'visibility', 'visible');
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
    var $slider, maxVal, minVal, prop, type, val, vals;
    $slider = $(this);
    prop = $slider.attr('data-prop');
    type = $slider.attr('data-type');
    if (type === 'scale') {
      val = ui.value.toString();
      $slider.attr('data-val', val);
    } else if (type === 'range') {
      vals = ui.values;
      minVal = vals[0];
      maxVal = vals[1];
      $slider.attr('data-min-val', minVal);
      $slider.attr('data-max-val', maxVal);
    }
    return filterMarkers();
  };
  changeThresholds = function(e) {
    var $input, $option, $sibling, sibVal, val;
    $input = $(this);
    $sibling = $input.siblings('input');
    $option = $input.parents('.option');
    val = $input.val();
    sibVal = $sibling.val();
    if ($input.is('.min')) {
      return console.log(val < sibVal);
    } else {
      return console.log(val > sibVal);
    }
  };
  installKey = function() {
    var $options;
    $options = $phenomena.find('ul');
    return $.ajax({
      url: keyURI,
      dataType: 'text',
      success: function(data) {
        var $li, i, j, len, num, parsedRow, prefix, results, row, sentence, type, val;
        data = data.split(/\r?\n|\r/);
        results = [];
        for (i = j = 0, len = data.length; j < len; i = ++j) {
          row = data[i];
          if (i !== 0) {
            parsedRow = row.split(',');
            type = parsedRow[0];
            num = parsedRow[1];
            sentence = row.split(num + ',')[1];
            prefix = (function() {
              switch (false) {
                case !(type.indexOf('Primary') > -1):
                  return 'PR';
                case !(type.indexOf('Pilot') > -1):
                  return 'PI';
                case !(type.indexOf('ControlG') > -1):
                  return 'CG';
                case !(type.indexOf('ControlU') > -1):
                  return 'CU';
                default:
                  return 'X';
              }
            })();
            val = prefix + '_' + num;
            $li = $('<li></li>').addClass('sentence').attr('data-val', val).append('<span>' + sentence + '</span>');
            $filters.find('.fieldset.accept ul').append($li.clone());
            $filters.find('.fieldset.reject ul').append($li.clone());
            results.push($options.append($li.addClass('option')));
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    });
  };
  updateUrl = function() {
    var filter, filters, i, ii, j, k, location, prop, query, queryVal, queryVals, ref, ref1, url, vals;
    filters = map.getFilter('data-circle');
    query = {};
    if (!filters) {
      return;
    }
    for (i = j = 1, ref = filters.length - 1; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
      if (filter = filters[i]) {
        prop = humanize(filter[1]);
        queryVals = [];
        for (ii = k = 2, ref1 = filter.length - 1; 2 <= ref1 ? k <= ref1 : k >= ref1; ii = 2 <= ref1 ? ++k : --k) {
          queryVal = humanize(filter[ii]);
          queryVals.push(queryVal);
        }
        vals = queryVals.join();
        query[prop] = vals;
      }
    }
    location = window.location;
    url = location.href.replace(location.search, '');
    if (filter !== 'all') {
      url += '?' + $.param(query);
    }
    url = decodeURIComponent(url);
    return history.pushState(queryVals, '', url);
  };
  getQuery = function() {
    var i, j, len, pair, prop, query, queryVar, queryVars, results, val, vals;
    query = window.location.search.substring(1);
    query = decodeURIComponent(query);
    if (!query) {
      return;
    }
    queryVars = query.split('&');
    results = [];
    for (i = j = 0, len = queryVars.length; j < len; i = ++j) {
      queryVar = queryVars[i];
      pair = queryVar.split('=');
      prop = pair[0];
      vals = pair[1].split(',');
      if (mechanize(prop)) {
        prop = mechanize(prop);
      }
      results.push((function() {
        var k, len1, results1;
        results1 = [];
        for (k = 0, len1 = vals.length; k < len1; k++) {
          val = vals[k];
          if (mechanize(val)) {
            val = mechanize(val);
          }
          results1.push(selectFilter(prop, val));
        }
        return results1;
      })());
    }
    return results;
  };
  startListening = function(map) {
    var popup;
    $('body').on('click', 'aside .label', toggleFieldset);
    $('body').on('click', 'aside#filters ul li', clickFilter);
    $('.slider').on('slidechange', changeSlider);
    $('.range-input input').on('change', changeThresholds);
    $('body').on('click', 'aside .close', toggleSide);
    $('body').on('click', 'aside#phenomena ul li', selectSentence);
    $('body').on('click', 'aside#filters .tab', toggleFilterTabs);
    popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });
    map.on('mouseenter', 'data-circle', function(e) {
      var i, j, len, marker, prop, prop_keys, props, ul;
      map.getCanvas().style.cursor = 'pointer';
      marker = e.features[0];
      props = marker.properties;
      props = {
        'Age': props['Age'],
        'Gender': props['Gender'],
        'Education': props['Education'],
        'Race': props['Race'],
        'Place Raised': props['RaisedPlace'],
        'Current Place': props['CurrentCity'] + ', ' + props['CurrentState'],
        'Father Raised Place': props['DadCity'] + ', ' + props['DadState'],
        'Mother Raised Place': props['MomCity'] + ', ' + props['MomState']
      };
      ul = '<ul>';
      prop_keys = Object.keys(props);
      for (i = j = 0, len = prop_keys.length; j < len; i = ++j) {
        prop = prop_keys[i];
        ul += '<li>' + prop + ': ' + props[prop] + '</li>';
        if (i > prop_keys.length - 1) {
          description += '</ul>';
        }
      }
      popup.setLngLat(marker.geometry.coordinates).setHTML(ul).addTo(map);
      return $(popup._content).parent().addClass('show').attr('data-id', marker.id);
    });
    return map.on('mouseleave', 'data-circle', function(e) {
      var $popup, oldId;
      $popup = $('.mapboxgl-popup');
      oldId = $popup.attr('data-id');
      return setTimeout(function() {
        var newId;
        newId = $popup.attr('data-id');
        if (oldId === newId) {
          return $popup.removeClass('show');
        }
      }, 500);
    });
  };
  installKey();
  createMap();
  setUpSliders();
  humanize = function(str) {
    if (human[str]) {
      str = human[str];
    }
    return str;
  };
  mechanize = function(str) {
    if (machine[str]) {
      str = machine[str];
    }
    return str;
  };
  human = {
    'PR_1125': 'The car needs washed',
    'CG_1025.1': 'I was afraid you might couldn’t find it',
    'PI_1160': 'John plays guitar, but so don’t I',
    'PI_1171': 'Here’s you a piece of pizza',
    'CG_1026.1': 'This seat reclines hella',
    'PI_1161': 'When I don\'t have hockey and I\'m done my homework, I go there and skate',
    'PI_1172': 'I’m SO not going to study tonight',
    'PR_1116': 'Every time you ask me not to hum, I’ll hum more louder',
    'Age_Bin': 'age',
    'Race': 'race',
    'Income': 'income',
    'Age': 'age',
    'Asian': 'asian',
    'Black': 'black',
    'White': 'white',
    'Hispanic': 'hispanic',
    'Amerindian': 'amerindian'
  };
  return machine = {
    'age': 'Age_Bin',
    'income': 'Income',
    'race': 'Race',
    'asian': 'Asian',
    'black': 'Black',
    'white': 'White',
    'hispanic': 'Hispanic',
    'amerindian': 'Amerindian'
  };
});
