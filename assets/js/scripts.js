$(function() {
  var $filters, $phenomena, accessToken, addFilters, addListeners, addPhenomena, changeSlider, clearFilter, clickFilter, countID, countURI, createMap, dataID, dataURI, filterMarkers, getQuery, getUniqueFeatures, human, humanize, installKey, keyURI, machine, mechanize, selectFilter, selectSentence, setUpSliders, styleURI, toggleFilter, toggleSide, updatePaintProperty, updateUrl, whiteList;
  accessToken = 'pk.eyJ1IjoiY29yZXl0ZWdlbGVyIiwiYSI6ImNpd25xNjU0czAyeG0yb3A3cjdkc2NleHAifQ.EJAjj38qZXzIylzax3EMWg';
  mapboxgl.accessToken = accessToken;
  styleURI = 'mapbox://styles/mapbox/light-v9';
  styleURI = 'mapbox://styles/coreytegeler/cj5adbyws0g7l2sqnl74tvzoa';
  dataURI = 'mapbox://coreytegeler.cj8yqu9o509q92wo4ybzg13xo-9ir7s';
  dataID = 'survey8';
  countURI = 'mapbox://coreytegeler.afjjqi6e';
  countID = 'gz_2010_us_050_00_500k-c9lvkv';
  keyURI = '/data/key8.csv';
  $filters = $('#filters');
  $phenomena = $('#phenomena');
  createMap = function() {
    window.map = new mapboxgl.Map({
      container: 'map',
      style: styleURI,
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
          url: dataURI
        },
        'source-layer': dataID,
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
      map.setMaxBounds(paddedBounds);
      map.addLayer({
        'id': 'counties',
        'type': 'line',
        'source': {
          type: 'vector',
          url: countURI
        },
        'source-layer': countID,
        'paint': {
          'line-width': 1,
          'line-color': 'black',
          'line-opacity': 0.1
        }
      });
      addListeners(map);
      return getQuery();
    });
  };
  updatePaintProperty = function(prop) {
    var styles;
    styles = {
      property: prop,
      type: 'categorical',
      stops: [[0, '#ffffff'], [1, '#d1d2d4'], [2, '#a7a9ab'], [3, '#808284'], [4, '#58585b'], [5, '#000000']]
    };
    return map.setPaintProperty('data', 'circle-color', styles);
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
  addPhenomena = function(val) {
    var $phen, $phenItem, $phenList, sentence;
    sentence = humanize(val);
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
  toggleSide = function(e) {
    var $side;
    $side = $(this).parents('aside');
    $side.toggleClass('closed');
    if ($side.is('#phenomena')) {
      return $('#sentence').toggleClass('show');
    }
  };
  selectSentence = function() {
    var $accFilter, $accLabel, $filter, $sentence, $side, text, val;
    $sentence = $(this);
    $filter = $sentence.parents('.filter');
    $side = $filter.parents('aside');
    val = $sentence.attr('data-val');
    text = $sentence.find('span').text();
    $side.find('.selected').removeClass('selected');
    $sentence.toggleClass('selected');
    $accFilter = $filters.find('.filter.acceptance');
    $accLabel = $filters.find('.label.acceptance');
    $accFilter.attr('data-prop', val);
    $accLabel.attr('data-prop', val);
    if ($sentence.is('.selected')) {
      $('#sentence h1').text(text);
      return updatePaintProperty(val);
    } else {
      return $('#sentence h1').text('');
    }
  };
  toggleFilter = function(e) {
    var $filter, $label;
    $label = $(this);
    $filter = $label.parents('.filter');
    return $filter.toggleClass('open');
  };
  clickFilter = function(e) {
    var $filter, $option, $side, prop, val;
    $option = $(this);
    $filter = $option.parents('.filter');
    $side = $filter.parents('aside');
    prop = $filter.attr('data-prop');
    val = $option.attr('data-val');
    selectFilter(prop, val);
    return updateUrl();
  };
  selectFilter = function(prop, val) {
    var $filter, $option, $selected;
    $filter = $filters.find('.filter[data-prop="' + prop + '"]');
    $selected = $filter.find('.selected');
    if (!val) {
      $option = $filter.find('.option.all');
    } else {
      $option = $filter.find('.option[data-val="' + val + '"]');
    }
    if ($option.is('.all')) {
      $selected.filter(':not(.all)').removeClass('selected');
    } else if (!$option.length) {
      return;
    } else if ($filter.is('.radio')) {
      $selected.removeClass('selected');
    } else {
      $selected.filter('.all').removeClass('selected');
    }
    if ($option.is('.selected:not(.all)')) {
      $option.removeClass('selected');
      if (!$filter.find('.selected').length) {
        $filter.find('.all').addClass('selected');
      }
    } else {
      $option.addClass('selected');
    }
    return filterMarkers();
  };
  filterMarkers = function() {
    var $selected, $sliders, __val, _prop, _vals, args, cond, filter, j, k, len, len1, ref, vals;
    vals = {};
    $selected = $filters.find('li.selected');
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
          args.push(__val);
        }
        filter.push(args);
      }
    } else {
      filter = clearFilter(prop);
    }
    $sliders = $filters.find('.slider');
    $sliders.each(function(i, slider) {
      var $slider, maxVal, minVal, prop, type, val;
      $slider = $(slider);
      prop = $slider.attr('data-prop');
      type = $slider.attr('data-type');
      if (type === 'scale') {
        if (val = $slider.attr('data-val')) {
          return filter.push(['==', prop, val]);
        }
      } else if (type === 'range') {
        minVal = $slider.attr('data-min-val');
        maxVal = $slider.attr('data-max-val');
        console.log(minVal, maxVal);
        if (minVal && maxVal) {
          filter.push(['>=', prop, parseInt(minVal)]);
          return filter.push(['<=', prop, parseInt(maxVal)]);
        }
      }
    });
    console.log(filter);
    return map.setFilter('data', filter);
  };
  clearFilter = function(prop) {
    var arr, arrs, filter, i, j, len;
    if (!map.length) {
      return;
    }
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
  installKey = function() {
    var $options;
    $options = $phenomena.find('ul');
    return $.ajax({
      url: keyURI,
      dataType: 'text',
      success: function(data) {
        var $option, i, j, len, num, parsedRow, prefix, results, row, sentence, type, val;
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
            $option = $('<li></li>').addClass('option').attr('data-val', val).append('<span>' + sentence + '</span>');
            results.push($options.append($option));
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
    filters = map.getFilter('data');
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
  addListeners = function(map) {
    var popup;
    $('body').on('click', 'aside .label', toggleFilter);
    $('body').on('click', 'aside#filters ul li', clickFilter);
    $('.slider').on('slidechange', changeSlider);
    $('body').on('click', 'aside .close', toggleSide);
    $('body').on('click', 'aside#phenomena ul li', selectSentence);
    popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });
    map.on('mouseenter', 'data', function(e) {
      var description, i, j, len, marker, prop, prop_keys, props, val;
      map.getCanvas().style.cursor = 'pointer';
      marker = e.features[0];
      props = marker.properties;
      console.log(props);
      props = {
        gender: props['Gender'],
        race: props['Race'],
        raised: props['RaisedPlace'],
        edu: props['Education'],
        income: '$' + props['Income'] + '/yr'
      };
      description = '';
      prop_keys = Object.keys(props);
      for (i = j = 0, len = prop_keys.length; j < len; i = ++j) {
        prop = prop_keys[i];
        val = props[prop].replace('_', '');
        description += props[prop];
        if (i < prop_keys.length - 1) {
          description += ', ';
        }
      }
      return popup.setLngLat(marker.geometry.coordinates).setHTML(description).addTo(map);
    });
    return map.on('mouseleave', 'data', function(e) {
      return popup.remove();
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
