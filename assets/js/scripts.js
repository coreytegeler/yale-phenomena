$(function() {
  var $body, $creation, $embedder, $filters, $fixedHeader, $headerSentence, $map, $phenomena, MAX, MIN, accessToken, changeSlider, changeThresholds, clearFilter, clickFilter, clickSentence, createMap, getFieldset, getFilterQuery, getMapData, getMapQuery, getOption, getProp, getPropSlug, getSentence, getThresholdVal, getVal, getValSlug, hoverMarker, hoverThresholds, initMap, installKey, keyUri, limitThresholds, openMulti, prepareMap, selectFilter, selectMulti, selectSentence, setEmbedder, setFilter, setSlider, setThresholdVal, setUpSliders, setUrlParams, startListening, styleUri, toggleFieldset, toggleFilterTabs, toggleLayer, toggleSide, unhoverThresholds, updateThresholdColors;
  keyUri = 'data/key8.csv';
  $body = $('body');
  $map = $('#map');
  $filters = $('#filters');
  $phenomena = $('#phenomena');
  $creation = $('#creation');
  $embedder = $('#embedder');
  $fixedHeader = $('header.fixed');
  $headerSentence = $('header.fixed .sentence');
  accessToken = 'pk.eyJ1IjoieWdkcCIsImEiOiJjamY5bXU1YzgyOHdtMnhwNDljdTkzZjluIn0.YS8NHwrTLvUlZmE8WEEJPg';
  styleUri = 'mapbox://styles/ygdp/cjf9yeodd67sq2ro1uvh1ua67';
  window.query = {};
  prepareMap = function(e) {
    var mapData, mapDataStr, serializedData;
    e.preventDefault();
    serializedData = $('form').serializeArray();
    mapData = {};
    $.each(serializedData, function() {
      var dataType, varType, vars;
      vars = this.name.split('.');
      dataType = vars[0];
      varType = vars[1];
      if (!mapData[dataType]) {
        mapData[dataType] = {};
      }
      return mapData[dataType][varType] = this.value;
    });
    query.map = mapData;
    mapDataStr = JSON.stringify(mapData);
    $map.attr('data-map', mapDataStr);
    return createMap();
  };
  createMap = function() {
    setEmbedder();
    $body.removeClass('form').addClass('map');
    mapboxgl.accessToken = accessToken;
    window.map = new mapboxgl.Map({
      container: 'map',
      style: styleUri,
      zoom: 3,
      center: [-95.7129, 37.0902]
    });
    return map.on('load', initMap);
  };
  initMap = function() {
    var dataBounds, dataLayer;
    map.addLayer({
      'id': 'survey-data',
      'type': 'symbol',
      'source': {
        'type': 'vector',
        'url': query.map.survey.uri
      },
      'source-layer': query.map.survey.id,
      'zoom': 10,
      'layout': {
        'icon-allow-overlap': true,
        'icon-size': {
          'base': 0.9,
          'stops': [[2, 0.2], [22, 1.3]]
        },
        'icon-image': ''
      }
    });
    dataLayer = map.getLayer('survey-data');
    dataBounds = map.getBounds(dataLayer).toArray();
    map.addLayer({
      'id': 'coldspots-line',
      'type': 'line',
      'source': {
        'type': 'vector',
        'url': query.map.coldspots.uri
      },
      'source-layer': query.map.coldspots.id,
      'minzoom': 0,
      'maxzoom': 24,
      'layout': {
        'visibility': 'none'
      },
      'paint': {
        'line-color': '#8ba9c4',
        'line-opacity': 0.75,
        'line-blur': {
          'base': 1.08,
          'stops': [[2, 1.6], [8, 4.8]]
        },
        'line-width': {
          'base': 1.25,
          'stops': [[2, 2.2], [8, 9]]
        }
      }
    });
    map.addLayer({
      'id': 'hotspots-line',
      'type': 'line',
      'source': {
        'type': 'vector',
        'url': query.map.hotspots.uri
      },
      'source-layer': query.map.hotspots.id,
      'minzoom': 0,
      'maxzoom': 24,
      'layout': {
        'visibility': 'none'
      },
      'paint': {
        'line-color': '#c48f8f',
        'line-opacity': 0.75,
        'line-blur': {
          'base': 1.08,
          'stops': [[2, 1.6], [8, 4.8]]
        },
        'line-width': {
          'base': 1.25,
          'stops': [[2, 2.2], [8, 9]]
        }
      }
    });
    map.addLayer({
      'id': 'coldspots-fill',
      'type': 'fill',
      'source': {
        'type': 'vector',
        'url': query.map.coldspots.uri
      },
      'source-layer': query.map.coldspots.id,
      'minzoom': 0,
      'maxzoom': 24,
      'layout': {
        'visibility': 'none'
      },
      'paint': {
        'fill-color': 'rgba(190,215,255,0.12)',
        'fill-outline-color': 'rgb(190,215,255)'
      }
    });
    map.addLayer({
      'id': 'hotspots-fill',
      'type': 'fill',
      'source': {
        'type': 'vector',
        'url': query.map.hotspots.uri
      },
      'source-layer': query.map.hotspots.id,
      'minzoom': 0,
      'maxzoom': 24,
      'layout': {
        'visibility': 'none'
      },
      'paint': {
        'fill-color': 'rgba(240,200,200,0.12)',
        'fill-outline-color': 'rgb(240,200,200)'
      }
    });
    window.popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });
    startListening();
    return getFilterQuery();
  };
  toggleSide = function(e) {
    var $side;
    $side = $(this).parents('aside');
    $side.toggleClass('closed');
    if ($side.is('#phenomena')) {
      return $fixedHeader.toggleClass('hide');
    }
  };
  clickSentence = function(e) {
    var $sentence, val;
    $sentence = $(this);
    val = $sentence.attr('data-val');
    selectSentence(val);
    return setUrlParams();
  };
  selectSentence = function(val) {
    var $accFieldset, $accLabel, $fieldset, $sentence, $side, text;
    $sentence = $phenomena.find('.option[data-val="' + val + '"]');
    console.log($sentence);
    if (!$sentence.length) {
      $sentence = $phenomena.find('.option').first();
      val = $sentence.attr('data-val');
    }
    $fieldset = $sentence.parents('.fieldset');
    $side = $fieldset.parents('aside');
    text = $sentence.find('span').text();
    $side.find('.selected').removeClass('selected');
    $sentence.toggleClass('selected');
    $accFieldset = $filters.find('.fieldset.accepted');
    $accLabel = $filters.find('.label.accepted');
    $accFieldset.attr('data-prop', val);
    $accLabel.attr('data-prop', val);
    $side.attr('data-selected', val);
    if ($sentence.is('.selected')) {
      $headerSentence.text(text);
      updateThresholdColors();
      return $accFieldset.removeClass('disabled');
    } else {
      $headerSentence.text('');
      return $accFieldset.addClass('disabled');
    }
  };
  getSentence = function(val) {
    if (!val) {
      return $phenomena.find('.sentence.selected');
    }
  };
  clickFilter = function(e) {
    var $fieldset, $option, $side, prop, val;
    $option = $(this);
    if ($option.is('.range-input') && $(e.target).is('.inputs, .inputs *')) {
      return false;
    }
    $fieldset = $option.parents('.fieldset');
    $side = $fieldset.parents('aside');
    prop = $fieldset.attr('data-prop-slug') || $fieldset.attr('data-prop');
    val = $option.attr('data-val-slug') || $option.attr('data-val');
    selectFilter(prop, val);
    return setUrlParams();
  };
  selectFilter = function(prop, val) {
    var $fieldset, $option, $options, $selected;
    val = getValSlug(prop, val);
    if (['accept', 'reject'].includes(val)) {
      $fieldset = getFieldset(val);
      $option = getOption(val, prop);
    } else {
      $fieldset = getFieldset(prop);
      $option = getOption(prop, val);
    }
    $fieldset.addClass('open');
    $selected = $fieldset.find('.selected');
    $options = $fieldset.find('.options');
    if (!$option || !$option.length) {
      return;
    }
    if ($option.is('.all')) {
      $selected.filter(':not(.all)').removeClass('selected');
    } else if ($fieldset.is('.radio')) {
      $selected.removeClass('selected');
    } else {
      $selected.filter('.all').removeClass('selected');
    }
    if ($option.is('.selected:not(.all)')) {
      $option.removeClass('selected');
      if (!$options.find('.selected').length) {
        $fieldset.find('.all').addClass('selected');
      }
    } else {
      $option.addClass('selected');
    }
    if ($fieldset.is('.layers')) {
      return toggleLayer(val);
    } else {
      return setFilter();
    }
  };
  setSlider = function(prop, vals) {
    var $fieldset, $slider;
    $fieldset = getFieldset(prop);
    $slider = $fieldset.find('.slider');
    $fieldset.addClass('open');
    return $slider.slider('values', vals);
  };
  getFieldset = function(prop) {
    var $fieldset, propSlug;
    prop = getProp(prop);
    $fieldset = $filters.find('.fieldset[data-prop="' + prop + '"]');
    if (!$fieldset.length) {
      propSlug = getPropSlug(prop);
      $fieldset = $filters.find('.fieldset[data-prop-slug="' + propSlug + '"]');
    }
    return $fieldset;
  };
  getOption = function(prop, val) {
    var $fieldset, $option, valSlug;
    $fieldset = getFieldset(prop);
    if (!val) {
      return $fieldset.find('.option.all');
    }
    val = getVal(prop, val);
    $option = $fieldset.find('.option[data-val="' + val + '"]');
    if ($option.length) {
      return $option;
    }
    valSlug = getValSlug(prop, val);
    $option = $fieldset.find('.option[data-val-slug="' + valSlug + '"]');
    if ($option.length) {
      return $option;
    }
  };
  toggleFilterTabs = function(e) {
    var $form, $tab, formId;
    $tab = $(this);
    $filters = $tab.parents('#filters');
    if ($tab.is('.active')) {
      return $filters.toggleClass('closed');
    }
    $filters.removeClass('closed');
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
  selectMulti = function(e) {
    var $label, propSlug;
    $label = $(this);
    if ($label.is('.selected')) {
      return;
    }
    propSlug = $label.attr('data-prop-slug');
    return openMulti(propSlug);
  };
  openMulti = function(propSlug) {
    var $field, $fieldset, $label, $multi, prop;
    $multi = $('.multi-field[data-prop="' + propSlug + '"]');
    if (!$multi.length) {
      return;
    }
    $fieldset = $multi.parents('.fieldset');
    $label = $fieldset.find('.multi-label[data-prop-slug="' + propSlug + '"]');
    prop = $label.attr('data-prop');
    $fieldset = $label.parents('.fieldset');
    prop = $label.attr('data-prop');
    $label.siblings().removeClass('selected');
    $label.addClass('selected');
    $field = $fieldset.find('[data-prop="' + propSlug + '"]');
    $field.siblings().removeClass('open').addClass('disabled');
    $field.addClass('open').removeClass('disabled');
    $fieldset.attr('data-prop', prop);
    $fieldset.attr('data-prop-slug', propSlug);
    return setFilter();
  };
  setFilter = function() {
    var $selected, $sliders, ___val, __val, __vals, _prop, _vals, args, cond, filter, k, l, len, len1, len2, len3, m, n, ref, vals;
    vals = {};
    $selected = $filters.find('.filter li.selected');
    $selected.each(function(i, li) {
      var $filter, _prop, _val, filter, prop;
      if ($(li).parents('.disabled').length) {
        return;
      }
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
      for (k = 0, len = ref.length; k < len; k++) {
        _prop = ref[k];
        _vals = vals[_prop];
        if (_prop.indexOf('_') > -1 && _vals[0] && _prop !== 'Age_Bin') {
          _vals = _vals[0].split(',');
        }
        if (['accept', 'reject'].includes(_prop)) {
          for (l = 0, len1 = _vals.length; l < len1; l++) {
            __val = _vals[l];
            __vals = getThresholdVal(_prop).split(',');
            args = [cond, __val];
            for (m = 0, len2 = __vals.length; m < len2; m++) {
              ___val = __vals[m];
              args.push(parseInt(___val));
            }
            filter.push(args);
          }
        } else {
          args = [cond, _prop];
          for (n = 0, len3 = _vals.length; n < len3; n++) {
            __val = _vals[n];
            if (Number.isInteger(parseInt(__val)) && __val.indexOf('-') < 0) {
              __val = parseInt(__val);
            }
            args.push(__val);
          }
          filter.push(args);
        }
      }
    } else {
      filter = clearFilter(prop);
    }
    $sliders = $filters.find('.slider');
    $sliders.each(function(i, slider) {
      var $fieldset, $handles, $slider, current, prop, type, val;
      $slider = $(slider);
      if ($slider.parents('.disabled').length) {
        return;
      }
      $handles = $slider.find('.ui-slider-handle');
      $fieldset = $slider.parents('.fieldset');
      prop = $fieldset.attr('data-prop');
      type = $slider.attr('data-type');
      current = '';
      if (type === 'scale') {
        if (val = $slider.attr('data-val')) {
          filter.push(['==', prop, val]);
          return current = '(' + val + ')';
        }
      } else if (type === 'range') {
        vals = $slider.slider('values');
        if (vals.length) {
          $slider.attr('data-val', vals.join(','));
          filter.push(['>=', prop, vals[0]]);
          return filter.push(['<=', prop, vals[1]]);
        }
      }
    });
    return map.setFilter('survey-data', filter);
  };
  clearFilter = function(prop) {
    var arr, arrs, filter, i, k, len;
    if (!map.length) {
      return;
    }
    filter = map.getFilter('survey-data');
    if (filter) {
      arrs = filter.slice(0);
      arrs.shift();
      for (i = k = 0, len = arrs.length; k < len; i = ++k) {
        arr = arrs[i];
        if (arr.indexOf(prop) > -1) {
          filter.splice(i + 1);
        }
      }
      return filter;
    }
  };
  toggleLayer = function(string) {
    var k, layerId, layerType, layerTypes, len, results, visibility;
    layerTypes = ['', '-fill', '-line'];
    results = [];
    for (k = 0, len = layerTypes.length; k < len; k++) {
      layerType = layerTypes[k];
      layerId = string + layerType;
      if (map.getLayer(layerId)) {
        visibility = map.getLayoutProperty(layerId, 'visibility');
        if (visibility === 'visible') {
          results.push(map.setLayoutProperty(layerId, 'visibility', 'none'));
        } else {
          results.push(map.setLayoutProperty(layerId, 'visibility', 'visible'));
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  };
  setUpSliders = function() {
    return $('.slider').each(function(i, slider) {
      var $handles, $slider, max, med, min, options, type;
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
      $slider.slider(options);
      if (type === 'range') {
        $handles = $slider.find('.ui-slider-handle');
        $handles.first().attr('data-val', min);
        return $handles.last().attr('data-val', max);
      }
    });
  };
  changeSlider = function(e, ui) {
    var $fieldset, $handles, $slider, maxVal, minVal, prop, type, val, vals;
    $slider = $(this);
    $fieldset = $slider.parents('.fieldset');
    prop = $fieldset.attr('data-prop-slug');
    type = $slider.attr('data-type');
    if (type === 'scale') {
      val = ui.value.toString();
      $slider.attr('data-val', val);
    } else if (type === 'range') {
      vals = ui.values;
      minVal = vals[0];
      maxVal = vals[1];
      $slider.attr('data-min', minVal);
      $slider.attr('data-max', maxVal);
      $handles = $slider.find('.ui-slider-handle');
      $handles.first().attr('data-val', minVal);
      $handles.last().attr('data-val', maxVal);
      val = [minVal, maxVal].join(',');
      $slider.attr('data-val', val);
      $slider.attr('data-val-slug', val);
    }
    setFilter();
    return setUrlParams();
  };
  MIN = 1;
  MAX = 5;
  limitThresholds = function(e) {
    var $input, $option, val;
    $input = $(this);
    $option = $input.parents('.option');
    val = parseInt(this.value);
    if (!val) {
      if ($option.is('.accept')) {
        val = MAX;
      } else {
        val = MIN;
      }
    } else if (val < MIN) {
      val = MIN;
    } else if (val > MAX) {
      val = MAX;
    }
    return $(this).val(val);
  };
  changeThresholds = function(e) {
    var $altMaxInput, $altMinInput, $altOption, $input, $option, $sibInput, altMaxVal, altMinVal, newAltMax, newAltMin, sibVal, type, val;
    $input = $(this);
    $sibInput = $input.siblings('input');
    $option = $input.parents('.option');
    $altOption = $option.siblings('.option.range-input');
    val = $input.val();
    sibVal = $sibInput.val();
    if ($input.is('.min')) {
      if (val > sibVal) {
        val = sibVal;
      }
    } else if ($input.is('.max')) {
      if (val < sibVal) {
        val = sibVal;
      }
    }
    if (val > MAX) {
      val = MAX;
    } else if (val < MIN) {
      val = MIN;
    }
    $input.val(val);
    altMinVal = $altOption.find('.min').val();
    altMaxVal = $altOption.find('.max').val();
    type = $option.attr('data-type');
    if (type === 'accept' && $input.is('.min') && val <= altMaxVal) {
      newAltMax = Math.abs(val) - 1;
      if (newAltMax < $altOption.find('.max').val()) {
        newAltMax += 1;
      }
      $altMaxInput = $altOption.find('.max');
      if (newAltMax < MIN) {
        newAltMax = MIN;
      }
      $altMaxInput.val(newAltMax);
    } else if (type === 'reject' && $input.is('.max') && val >= altMinVal) {
      newAltMin = Math.abs(val) + 1;
      if (newAltMin > $altOption.find('.min').val()) {
        newAltMin -= 1;
      }
      $altMinInput = $altOption.find('.min');
      if (newAltMin > MAX) {
        newAltMax = MAX;
      }
      $altMinInput.val(newAltMin);
    }
    setThresholdVal($option);
    setThresholdVal($altOption);
    updateThresholdColors();
    return setFilter();
  };
  setThresholdVal = function($option) {
    var i, k, max, min, range, rangeStr, ref, ref1;
    min = $option.find('input.min').val();
    max = $option.find('input.max').val();
    range = [];
    for (i = k = ref = min, ref1 = max; ref <= ref1 ? k <= ref1 : k >= ref1; i = ref <= ref1 ? ++k : --k) {
      range.push(Math.abs(i));
    }
    rangeStr = JSON.stringify(range).replace(/[\[\]']+/g, '');
    return $option.attr('data-val', rangeStr);
  };
  getThresholdVal = function(prop) {
    var $option;
    if (prop === 'accept') {
      $option = $filters.find('.option.accept');
    } else if (prop === 'reject') {
      $option = $filters.find('.option.reject');
    } else {
      $option = $filters.find('.option[data-val="' + prop + '"]');
      if ($option.length) {
        return $option.attr('data-type');
      } else {
        return null;
      }
    }
    return $option.attr('data-val');
  };
  hoverThresholds = function(e) {
    return $(this).parents('.option').addClass('no-hover');
  };
  unhoverThresholds = function(e) {
    return $(this).parents('.option').removeClass('no-hover');
  };
  updateThresholdColors = function() {
    var aRange, aVal, i, k, markerProps, prop, ref, ref1, stops, uRange, uVal;
    prop = $('.fieldset.phenomena .sentence.selected').attr('data-val');
    if (!prop) {
      return;
    }
    aVal = $('.option.accept').attr('data-val');
    aRange = JSON.parse('[' + aVal + ']');
    uVal = $('.option.reject').attr('data-val');
    uRange = JSON.parse('[' + uVal + ']');
    stops = [];
    for (i = k = ref = MIN, ref1 = MAX; ref <= ref1 ? k <= ref1 : k >= ref1; i = ref <= ref1 ? ++k : --k) {
      if (aRange.indexOf(i) > -1) {
        stops.push([i, 'marker-accepted']);
      } else if (uRange.indexOf(i) > -1) {
        stops.push([i, 'marker-rejected']);
      } else {
        stops.push([i, '']);
      }
    }
    markerProps = {
      property: prop,
      type: 'categorical',
      stops: stops
    };
    return map.setLayoutProperty('survey-data', 'icon-image', markerProps);
  };
  installKey = function() {
    var $options;
    $options = $phenomena.find('ul');
    return $.ajax({
      url: keyUri,
      dataType: 'text',
      success: function(data) {
        var $li, i, k, len, num, parsedRow, prefix, results, row, sentence, type, val;
        data = data.split(/\r?\n|\r/);
        results = [];
        for (i = k = 0, len = data.length; k < len; i = ++k) {
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
            $li = $('<li></li>').addClass('sentence').append('<span>' + sentence + '</span>');
            $options.append($li.addClass('option'));
            $li = $li.attr('data-val', val);
            $filters.find('.fieldset.accept ul').append($li.clone());
            results.push($filters.find('.fieldset.reject ul').append($li.clone()));
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    });
  };
  getMapData = function() {
    var dataType, i, k, len, mapData, pair, queryStr, queryVar, queryVars, val, varType, vars;
    mapData = {};
    queryStr = window.location.search.substring(1);
    if (!queryStr) {
      return;
    }
    queryStr = decodeURIComponent(queryStr);
    queryVars = queryStr.split('&');
    for (i = k = 0, len = queryVars.length; k < len; i = ++k) {
      queryVar = queryVars[i];
      pair = queryVar.split('=');
      vars = pair[0].split('.');
      dataType = vars[1];
      varType = vars[2];
      val = pair[1];
      if (vars[0] === 'map') {
        if (!mapData[dataType]) {
          mapData[dataType] = {};
        }
        mapData[dataType][varType] = val;
      }
    }
    return window.query.map = mapData;
  };
  setUrlParams = function() {
    var $sentence, filter, filters, i, j, k, l, location, mapData, prop, queryStr, queryVal, queryVals, ref, ref1, sentenceVal, url, vals;
    $sentence = $phenomena.find('.sentence.selected');
    if ($sentence.length) {
      sentenceVal = $sentence.attr('data-val');
      query['s'] = sentenceVal;
    }
    filters = map.getFilter('survey-data');
    if (filters) {
      for (i = k = 1, ref = filters.length - 1; 1 <= ref ? k <= ref : k >= ref; i = 1 <= ref ? ++k : --k) {
        if (filter = filters[i]) {
          prop = getPropSlug(filter[1]);
          queryVals = [];
          for (j = l = 2, ref1 = filter.length - 1; 2 <= ref1 ? l <= ref1 : l >= ref1; j = 2 <= ref1 ? ++l : --l) {
            queryVal = getValSlug(prop, filter[j]);
            queryVals.push(queryVal);
          }
          vals = queryVals.join();
          if (query[prop]) {
            query[prop] = query[prop] + ',' + vals;
          } else {
            query[prop] = vals;
          }
        }
      }
    }
    mapData = query.map;
    window.query = Object.assign(query, {
      'map': mapData
    });
    queryStr = $.param(window.query);
    queryStr = queryStr.replace(/\%5B/g, '.').replace(/%5D/g, '');
    location = window.location;
    url = location.href;
    if (filters) {
      url = url.replace(location.search, '');
    }
    url += '?' + queryStr;
    url = decodeURIComponent(url);
    history.pushState(queryVals, '', url);
    return setEmbedder();
  };
  setEmbedder = function() {
    var iframe, url;
    url = window.location;
    iframe = '<iframe width="100%" height="700px" src="' + url + '"></iframe>';
    return $embedder.find('textarea').html(iframe);
  };
  getMapQuery = function() {
    var queryStr;
    queryStr = window.location.search.substring(1);
    if (queryStr) {
      getMapData();
      return createMap();
    } else {
      $body.addClass('form');
      return $creation.find('form').on('submit', prepareMap);
    }
  };
  getFilterQuery = function() {
    var i, k, l, len, len1, pair, prop, queryStr, queryVar, queryVars, sentenceSelected, val, vals;
    queryStr = window.location.search.substring(1);
    if (!queryStr) {
      return;
    }
    queryStr = decodeURIComponent(queryStr);
    queryVars = queryStr.split('&');
    sentenceSelected = false;
    for (i = k = 0, len = queryVars.length; k < len; i = ++k) {
      queryVar = queryVars[i];
      pair = queryVar.split('=');
      prop = pair[0];
      vals = pair[1];
      if (prop === 's') {
        sentenceSelected = true;
        selectSentence(vals);
      }
      openMulti(prop);
      if (prop === 'show') {
        return selectFilter(prop, vals);
      }
      if (prop.indexOf('_') < 0) {
        vals = vals.split(',');
      } else {
        vals = [getThresholdVal(vals)];
      }
      if (prop === 'age') {
        setSlider(prop, vals);
      } else if (prop !== 's') {
        for (l = 0, len1 = vals.length; l < len1; l++) {
          val = vals[l];
          selectFilter(prop, val);
        }
      }
    }
    if (!sentenceSelected) {
      return selectSentence();
    }
  };
  hoverMarker = function(e) {
    var $content, $popup, aVals, color, i, k, len, marker, prop, prop_keys, props, sentence, uVals, ul, val;
    sentence = $phenomena.attr('data-selected');
    map.getCanvas().style.cursor = 'pointer';
    marker = e.features[0];
    props = marker.properties;
    val = props[sentence];
    aVals = $filters.find('.option.accept').attr('data-val');
    uVals = $filters.find('.option.reject').attr('data-val');
    if (aVals.indexOf(val) > -1) {
      color = '#5fa990';
    } else if (uVals.indexOf(val) > -1) {
      color = '#795292';
    }
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
    for (i = k = 0, len = prop_keys.length; k < len; i = ++k) {
      prop = prop_keys[i];
      ul += '<li>' + prop + ': ' + props[prop] + '</li>';
      if (i > prop_keys.length - 1) {
        description += '</ul>';
      }
    }
    popup.setLngLat(marker.geometry.coordinates).setHTML(ul).addTo(map);
    $content = $(popup._content);
    $popup = $content.parent();
    $popup.addClass('show').attr('data-id', marker.id);
    return $content.css('background', color);
  };
  startListening = function() {
    map.on('mouseenter', 'survey-data', hoverMarker);
    return map.on('mouseleave', 'survey-data', function(e) {
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
  getProp = function(propSlug) {
    var $fieldset, prop;
    if ($fieldset = $('.fieldset[data-prop-slug="' + propSlug + '"]')) {
      if (prop = $fieldset.attr('data-prop')) {
        return prop;
      }
    }
    return propSlug;
  };
  getPropSlug = function(prop) {
    var $fieldset, propSlug;
    if ($fieldset = $('.fieldset[data-prop="' + prop + '"]')) {
      if (propSlug = $fieldset.attr('data-prop-slug')) {
        return propSlug;
      }
    }
    return prop;
  };
  getVal = function(prop, valSlug) {
    var $fieldset, $option, val;
    prop = getProp(prop);
    $fieldset = $('.fieldset[data-prop="' + prop + '"]');
    if ($fieldset.find('.slider').length) {
      return valSlug;
    }
    $option = $fieldset.find('.option[data-val-slug="' + valSlug + '"]');
    if (!$option || !$option.length) {
      $option = $fieldset.find('.slider[data-val-slug="' + valSlug + '"]');
    }
    if ($option.length) {
      val = $option.attr('data-val');
      if (val.length) {
        return val;
      }
    }
    return valSlug;
  };
  getValSlug = function(prop, val) {
    var $fieldset, $option, valSlug;
    prop = getPropSlug(prop);
    $fieldset = $('.fieldset[data-prop-slug="' + prop + '"]');
    if ($fieldset.find('.slider').length) {
      return val;
    }
    $option = $fieldset.find('.option[data-val="' + val + '"]');
    if ($option.length) {
      valSlug = $option.attr('data-val-slug') || $option.attr('data-val');
      if (valSlug && valSlug.length) {
        return valSlug;
      }
    }
    return val;
  };
  installKey();
  getMapQuery();
  setUpSliders();
  $('body').on('click', 'aside .label', toggleFieldset);
  $('body').on('click', 'aside .multi-label', selectMulti);
  $('body').on('click', 'aside#filters ul li', clickFilter);
  $('.slider').on('slidechange', changeSlider);
  $('.range-input input').on('keyup', limitThresholds);
  $('.range-input input').on('change', changeThresholds);
  $('.range-input .inputs').on('mouseenter', hoverThresholds);
  $('.range-input .inputs').on('mouseleave', unhoverThresholds);
  $('body').on('click', 'aside .close', toggleSide);
  $('body').on('click', 'aside#phenomena ul li', clickSentence);
  return $('body').on('click', 'aside#filters .tab', toggleFilterTabs);
});
