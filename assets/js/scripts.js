$(function() {
  var $filters, $fixedHeader, $headerSentence, $phenomena, MAX, MIN, changeSlider, changeThresholds, clearFilter, clickFilter, clickSentence, createMap, getFieldset, getOption, getProp, getPropSlug, getQuery, getSentence, getUniqueFeatures, getVal, getValSlug, hoverThresholds, human, installKey, keyUri, limitThresholds, machine, mechanize, openMulti, selectFilter, selectMulti, selectSentence, setFilter, setSlider, setThresholdVal, setUpSliders, startListening, toggleFieldset, toggleFilterTabs, toggleLayer, toggleSide, toggleView, unhoverThresholds, updateThresholdColors, updateUrl;
  keyUri = 'data/key8.csv';
  $filters = $('#filters');
  $phenomena = $('#phenomena');
  $fixedHeader = $('header.fixed');
  $headerSentence = $('header.fixed .sentence');
  createMap = function() {
    var mapbox, mapboxAttr;
    mapboxAttr = $('#embed').attr('data-mapbox');
    mapbox = JSON.parse(decodeURI(mapboxAttr));
    mapboxgl.accessToken = mapbox.accessToken;
    window.map = new mapboxgl.Map({
      container: 'map',
      style: mapbox.styleUri,
      zoom: 3,
      center: [-95.7129, 37.0902]
    });
    return map.on('load', function() {
      var dataBounds, dataLayer;
      map.addLayer({
        'id': 'survey-data',
        'type': 'symbol',
        'source': {
          'type': 'vector',
          'url': mapbox.surveyUri
        },
        'source-layer': mapbox.surveyId,
        'zoom': 10,
        'layout': {
          'icon-size': 0.5
        }
      });
      dataLayer = map.getLayer('survey-data');
      dataBounds = map.getBounds(dataLayer).toArray();
      map.addLayer({
        'id': 'coldspots',
        'type': 'line',
        'source': {
          'type': 'vector',
          'url': mapbox.coldspotsUri
        },
        'source-layer': mapbox.coldspotsId,
        'minzoom': 0,
        'maxzoom': 24,
        'layout': {
          'visibility': 'none'
        },
        'paint': {
          'line-width': 1,
          'line-color': '#8ba9c4'
        }
      });
      map.addLayer({
        'id': 'hotspots',
        'type': 'line',
        'source': {
          'type': 'vector',
          'url': mapbox.hotspotsUri
        },
        'source-layer': mapbox.hotspotsId,
        'minzoom': 0,
        'maxzoom': 24,
        'layout': {
          'visibility': 'none'
        },
        'paint': {
          'line-width': 1,
          'line-color': '#c48f8f'
        }
      });
      startListening(map);
      getQuery();
      return selectSentence();
    });
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
  clickSentence = function(e) {
    var $sentence, val;
    $sentence = $(this);
    val = $sentence.attr('data-val');
    selectSentence(val);
    return updateUrl();
  };
  selectSentence = function(val) {
    var $accFieldset, $accLabel, $fieldset, $sentence, $side, text;
    $sentence = $phenomena.find('.option[data-val="' + val + '"]');
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
    return updateUrl();
  };
  selectFilter = function(prop, val) {
    var $fieldset, $option, $selected;
    val = getValSlug(prop, val);
    $fieldset = getFieldset(prop);
    $fieldset.addClass('open');
    $selected = $fieldset.find('.selected');
    $option = getOption(prop, val);
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
      if (!$fieldset.find('.selected').length) {
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
    var $selected, $sliders, __val, _prop, _vals, args, cond, filter, j, k, len, len1, ref, vals;
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
      for (j = 0, len = ref.length; j < len; j++) {
        _prop = ref[j];
        _vals = vals[_prop];
        if (_prop.indexOf('_') > -1 && _vals[0] && _prop !== 'Age_Bin') {
          _vals = _vals[0].split(',');
        }
        args = [cond, _prop];
        for (k = 0, len1 = _vals.length; k < len1; k++) {
          __val = _vals[k];
          if (Number.isInteger(parseInt(__val)) && __val.indexOf('_') > -1) {
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
    var arr, arrs, filter, i, j, len;
    if (!map.length) {
      return;
    }
    filter = map.getFilter('survey-data');
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
  toggleLayer = function(layerId) {
    var visibility;
    if (!map.getLayer(layerId)) {
      return;
    }
    visibility = map.getLayoutProperty(layerId, 'visibility');
    if (visibility === 'visible') {
      return map.setLayoutProperty(layerId, 'visibility', 'none');
    } else {
      return map.setLayoutProperty(layerId, 'visibility', 'visible');
    }
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
    return updateUrl();
  };
  MIN = 1;
  MAX = 5;
  limitThresholds = function(e) {
    var $input, $option, val;
    $input = $(this);
    $option = $input.parents('.option');
    val = parseInt(this.value);
    if (!val) {
      if ($option.is('.acceptable')) {
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
    var $altMaxInput, $altMinInput, $altOption, $input, $option, $sibInput, altMaxVal, altMinVal, newAltMax, newAltMin, sibVal, val;
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
    if ($option.is('.acceptable') && $input.is('.min') && val <= altMaxVal) {
      newAltMax = Math.abs(val) - 1;
      if (newAltMax < $altOption.find('.max').val()) {
        newAltMax += 1;
      }
      $altMaxInput = $altOption.find('.max');
      if (newAltMax < MIN) {
        newAltMax = MIN;
      }
      $altMaxInput.val(newAltMax);
    } else if ($option.is('.unacceptable') && $input.is('.max') && val >= altMinVal) {
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
    var i, j, max, min, range, rangeStr, ref, ref1;
    min = $option.find('input.min').val();
    max = $option.find('input.max').val();
    range = [];
    for (i = j = ref = min, ref1 = max; ref <= ref1 ? j <= ref1 : j >= ref1; i = ref <= ref1 ? ++j : --j) {
      range.push(Math.abs(i));
    }
    rangeStr = JSON.stringify(range).replace(/[\[\]']+/g, '');
    return $option.attr('data-val', rangeStr);
  };
  hoverThresholds = function(e) {
    return $(this).parents('.option').addClass('no-hover');
  };
  unhoverThresholds = function(e) {
    return $(this).parents('.option').removeClass('no-hover');
  };
  updateThresholdColors = function() {
    var aRange, aVal, i, j, markerProps, prop, ref, ref1, stops, uRange, uVal;
    prop = $('.fieldset.phenomena .sentence.selected').attr('data-val');
    if (!prop) {
      return;
    }
    aVal = $('.option.acceptable').attr('data-val');
    aRange = JSON.parse('[' + aVal + ']');
    uVal = $('.option.unacceptable').attr('data-val');
    uRange = JSON.parse('[' + uVal + ']');
    stops = [];
    for (i = j = ref = MIN, ref1 = MAX; ref <= ref1 ? j <= ref1 : j >= ref1; i = ref <= ref1 ? ++j : --j) {
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
    var $sentence, filter, filters, i, ii, j, k, location, prop, query, queryVal, queryVals, ref, ref1, sentenceVal, url, vals;
    filters = map.getFilter('survey-data');
    query = {};
    $sentence = $phenomena.find('.sentence.selected');
    if ($sentence.length) {
      sentenceVal = $sentence.attr('data-val');
      query['s'] = sentenceVal;
    }
    if (filters) {
      for (i = j = 1, ref = filters.length - 1; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        if (filter = filters[i]) {
          prop = getPropSlug(filter[1]);
          queryVals = [];
          for (ii = k = 2, ref1 = filter.length - 1; 2 <= ref1 ? k <= ref1 : k >= ref1; ii = 2 <= ref1 ? ++k : --k) {
            queryVal = getValSlug(prop, filter[ii]);
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
    location = window.location;
    url = location.href.replace(location.search, '');
    if (filter !== 'all') {
      url += '?' + $.param(query);
    }
    url = decodeURIComponent(url);
    return history.pushState(queryVals, '', url);
  };
  getQuery = function() {
    var i, j, k, l, len, len1, len2, pair, prop, query, queryVar, queryVars, val, vals;
    query = window.location.search.substring(1);
    if (query) {
      query = decodeURIComponent(query);
      queryVars = query.split('&');
      for (i = j = 0, len = queryVars.length; j < len; i = ++j) {
        queryVar = queryVars[i];
        pair = queryVar.split('=');
        if (pair[0] === 's') {
          selectSentence(pair[1]);
        }
      }
      for (i = k = 0, len1 = queryVars.length; k < len1; i = ++k) {
        queryVar = queryVars[i];
        pair = queryVar.split('=');
        prop = pair[0];
        openMulti(prop);
        if (prop === 'show') {
          selectFilter(prop, pair[1]);
          return;
        }
        vals = pair[1].split(',');
        if (prop === 'age') {
          setSlider(prop, vals);
        } else if (prop !== 's') {
          for (l = 0, len2 = vals.length; l < len2; l++) {
            val = vals[l];
            selectFilter(prop, val);
          }
        }
      }
    }
  };
  toggleView = function(e) {
    if (e.keyCode === 27) {
      $('body').toggleClass('embedded');
      return map.resize();
    }
  };
  startListening = function(map) {
    var popup;
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
    $('body').on('click', 'aside#filters .tab', toggleFilterTabs);
    $('body').keyup(toggleView);
    popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });
    map.on('mouseenter', 'survey-data', function(e) {
      var $content, $popup, aVals, color, i, j, len, marker, prop, prop_keys, props, sentence, uVals, ul, val;
      sentence = $phenomena.attr('data-selected');
      map.getCanvas().style.cursor = 'pointer';
      marker = e.features[0];
      props = marker.properties;
      val = props[sentence];
      aVals = $filters.find('.option.acceptable').data('val');
      uVals = $filters.find('.option.unacceptable').data('val');
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
      for (i = j = 0, len = prop_keys.length; j < len; i = ++j) {
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
    });
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
  installKey();
  createMap();
  setUpSliders();
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
