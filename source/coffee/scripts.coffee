$ ->
	$body = $('body')
	$map = $('#map')
	$filters = $('#filters')
	$phenomena = $('#phenomena')
	$creation = $('#creation')
	$embedder = $('#embedder')
	$fixedHeader = $('header.fixed')
	$headerSentence = $('header.fixed .sentence')
	accessToken = 'pk.eyJ1IjoieWdkcCIsImEiOiJjamY5bXU1YzgyOHdtMnhwNDljdTkzZjluIn0.YS8NHwrTLvUlZmE8WEEJPg'
	styleUri = 'mapbox://styles/ygdp/cjl7azzlm04592so27jav5xlw'
	env = 'ENVIRONMENT'

	DATA_PATH = './assets/data/'

	DEFAULT_LAT = 39.6
	DEFAULT_LNG = -99.4
	DEFAULT_ZOOM = 3.4
	MIN_ZOOM = 0
	MAX_ZOOM = 24
	MIN_THRESH = 1
	MAX_THRESH = 5

	window.query =
		map:
			lat: DEFAULT_LAT
			lng: DEFAULT_LNG
			zoom: DEFAULT_ZOOM

	window.phen = {}

	getMaps = (id) ->
		if env == 'dev'
			ajaxUrl = DATA_PATH+'maps.json'
		else
			ajaxUrl = 'https://ygdp.yale.edu/maps/json'
		$.ajax
			type: 'GET',
			contentType: 'application/json',
			dataType: 'json',
			url: ajaxUrl,
			success: (data, textStatus, jqXHR) ->
				populateMapOptions(data)
			error: (error) ->
				console.log error

	getMap = (id) ->
		if env == 'dev'
			ajaxUrl = DATA_PATH+'maps.json'
		else
			ajaxUrl = 'https://ygdp.yale.edu/maps/json/'+id
		$.ajax
			type: 'GET',
			contentType: 'application/json',
			dataType: 'json',
			url: ajaxUrl,
			success: (data, textStatus, jqXHR) ->
				if env == 'dev'
					for datum in data
						if parseInt(datum.id) == id
							map = datum
				else
					map = data[0]
				if window.map = map
					getSentences()
			error: (error) ->
				console.log error

	changePhenTitle = (phenTitle) ->
		$('header .phenomenon').each () ->
			this.innerHTML = decodeHtml(phenTitle)

	populateMapOptions = (maps) ->
		for map in maps
			option = $('<option></option>')
			option.text(decodeHtml(map.title))
			option.val(map.id)
			$('select[name="id"]').append(option)

	getSentences = () ->
		if sentences = window.map.sentences
			sentences = sentences.split(',')
			for sentence in sentences
				getSentence(sentence)

	getSentence = (id) ->
		if env == 'dev'
			ajaxUrl = DATA_PATH+'sentences.json'
		else
			ajaxUrl = 'https://ygdp.yale.edu/sentences/json/'+id
		$.ajax
			type: 'GET',
			contentType: 'application/json',
			dataType: 'json',
			url: ajaxUrl,
			success: (data, textStatus, jqXHR) ->
				if env == 'dev'
					for sentence in data
						if sentence.id == id
							populateSentence(sentence)
				else
					populateSentence(data[0])
				
			error: (error) ->
				console.log error

	populateSentence = (sentence) ->
		$options = $phenomena.find('ul')
		$option = $('<li></li>')
			.addClass('sentence')
			.attr('data-val', sentence.sentence_id)
			.attr('data-phen-title', sentence.phenomenon_title)
			.attr('data-phen-id', sentence.phenomenon_id)
			.html('<span>'+sentence.title+'</span>')
		$options.append($option.addClass('option'))
		$filters.find('.fieldset.accept ul').append($option.clone())
		$filters.find('.fieldset.reject ul').append($option.clone())

	prepareMap = (e) ->
		e.preventDefault()
		serializedData = $('form').serializeArray()
		mapData = {}
		$.each serializedData, () ->
			vars = this.name.split('.')
			dataType = vars[0]
			varType = vars[1]
			if !query.map[dataType]
				query.map[dataType] = {}
			if varType
				query.map[dataType][varType] = this.value
			else
				query.map[dataType] = parseFloat(this.value)
		setUrlParams()
		createMap()

	createMap = () ->
		setEmbedder()
		getMap(query.map.id)
		$body.removeClass('form').addClass('map')
		mapboxgl.accessToken = accessToken
		window.mapbox = new mapboxgl.Map
			container: 'map',
			style: styleUri,
			zoom: query.map.zoom,
		if query.map.lng && query.map.lat
			lngLat = new mapboxgl.LngLat(query.map.lng, query.map.lat)
			mapbox.setCenter(lngLat)
		mapbox.on 'load', initMap

	initMap = () ->
		if !map || !map.geojson
			return
		if env == 'dev'
			str = map.geojson
			map.geojson = DATA_PATH+str.substring(str.lastIndexOf('/') + 1, str.length)
		stamp =  Math.floor(Date.now() / 1000)
		mapbox.addSource 'markers',
			type: 'geojson',
			data: map.geojson+'?version='+stamp
		mapbox.addLayer
			'id': 'markers'
			'type': 'symbol'
			'source': 'markers'
			'layout':
				'icon-image': 'marker'
				'icon-allow-overlap': true
				'icon-size':
					'base': 0.9
					'stops': [[0, 0.2],[16, 1.4]]
		window.popup = new mapboxgl.Popup
			closeButton: false,
			closeOnClick: false
		startListening()
		getFilterQuery()

	toggleSide = (e) ->
		$side = $(this).parents('aside')
		$side.toggleClass('closed')
		if $side.is('#phenomena')
			$fixedHeader.toggleClass('hide')


	clickSentence = (e) ->
		$sentence = $(this)
		val = $sentence.attr('data-val')
		selectSentence(val)
		setUrlParams()

	selectSentence = (val) ->
		$sentence = $phenomena.find('.option[data-val="'+val+'"]')
		if !$sentence.length
			$sentence = $phenomena.find('.sentence').first()
			val = $sentence.attr('data-val')
		if !$sentence.length
			updateThresholdColors()
			return
		phenTitle = $sentence.attr('data-phen-title')
		phenId = $sentence.attr('data-phen-id')
		changePhenTitle(phenTitle)
		$fieldset = $sentence.parents('.fieldset')
		$side = $fieldset.parents('aside')
		text = $sentence.find('span').text()
		$side.find('.selected').removeClass('selected')
		$sentence.toggleClass('selected')
		$accFieldset = $filters.find('.fieldset.accepted')
		$accLabel = $filters.find('.label.accepted')
		$accFieldset.attr('data-prop', val)
		$accLabel.attr('data-prop', val)
		$side.attr('data-selected', val)
		if $sentence.is('.selected')
			$headerSentence.text(text)
			updateThresholdColors()
			$accFieldset.removeClass('disabled')
		else
			$headerSentence.text('')
			$accFieldset.addClass('disabled')

	clickFilter = (e) ->		
		$option = $(this)
		if $(e.target).is('.inputs, .inputs *')
			return false
		$fieldset = $option.parents('.fieldset')
		$side = $fieldset.parents('aside')
		prop = $fieldset.attr('data-prop-slug') || $fieldset.attr('data-prop') 
		val = $option.attr('data-val-slug') || $option.attr('data-val')
		selectFilter(prop, val)
		setUrlParams()

	clickReset = (e) ->
		$filters.find('.fieldset').each (i, fieldset) ->
			prop = $(fieldset).data('prop-slug')
			selectFilter(prop)
			if $(fieldset).find('.slider')
				setSlider(prop)
			$(fieldset).removeClass('open')

	selectFilter = (prop, val) ->
		val = getValSlug(prop, val)
		if ['accept','reject'].includes(val)
			$fieldset = getFieldset(val)
			$option = getOption(val, prop)
		else	
			$fieldset = getFieldset(prop)
			$option = getOption(prop, val)
		$fieldset.addClass('open')
		$selected = $fieldset.find('.selected')
		$options = $fieldset.find('.options')
		if !$option || !$option.length
			return
		if $option.is('.selected:not(.all)')
			$option.removeClass('selected')
			if !$options.find('.selected').length
				$fieldset.find('.all').addClass('selected')
		else
			$option.addClass('selected')
		if $option.is('.all')
			$selected.filter(':not(.all)').removeClass('selected')
		else if $fieldset.is('.radio')
			$selected.removeClass('selected')
		else
			$selected.filter('.all').removeClass('selected')

		if $fieldset.is('.layers')
			toggleLayer(val)
		else
			setFilter()

	setSlider = (prop, vals) ->
		$fieldset = getFieldset(prop)
		$slider = $fieldset.find('.slider')
		$fieldset.addClass('open')
		if !vals || vals.length != 2
			vals = [1,100]
		$slider.slider('values', vals)

	getFieldset = (prop) ->
		prop = getProp(prop)
		$fieldset = $filters.find('.fieldset[data-prop="'+prop+'"]')
		if !$fieldset.length
			propSlug = getPropSlug(prop)
			$fieldset = $filters.find('.fieldset[data-prop-slug="'+propSlug+'"]')
		return $fieldset

	getOption = (prop, val) ->
		$fieldset = getFieldset(prop)
		if !val
			return $fieldset.find('.option.all')
		val = getVal(prop, val)
		$option = $fieldset.find('.option[data-val="'+val+'"]')
		if $option.length
			return $option
		valSlug = getValSlug(prop, val)
		$option = $fieldset.find('.option[data-val-slug="'+valSlug+'"]')
		if $option.length
			return $option

	toggleFilterTabs = (e) ->
		$tab = $(this)
		$filters = $tab.parents('#filters')
		if $tab.is('.active')
			$tab.removeClass('active')
			return $filters.toggleClass('closed')
		$filters.removeClass('closed')
		formId = $tab.attr('data-form')
		$form = $('.form[data-form="'+formId+'"]')
		$('.tab.active').removeClass('active')
		$('.form.active').removeClass('active')
		$tab.addClass('active')
		$form.addClass('active')

	toggleFieldset = (e) ->
		$label = $(this)
		$fieldset = $label.parents('.fieldset')
		$fieldset.toggleClass('open')

	selectMulti = (e) ->
		$label = $(this)
		if $label.is('.selected')
			return
		propSlug = $label.attr('data-prop-slug')
		openMulti(propSlug)

	openMulti = (propSlug) ->
		$multi = $('.multi-field[data-prop="'+propSlug+'"]')
		if !$multi.length
			return
		$fieldset = $multi.parents('.fieldset')
		$label = $fieldset.find('.multi-label[data-prop-slug="'+propSlug+'"]')
		prop = $label.attr('data-prop')
		$fieldset = $label.parents('.fieldset')
		prop = $label.attr('data-prop')
		$label.siblings().removeClass('selected')
		$label.addClass('selected')
		$field = $fieldset.find('[data-prop="'+propSlug+'"]')
		$field.siblings().removeClass('open').addClass('disabled')
		$field.addClass('open').removeClass('disabled')
		$fieldset.attr('data-prop', prop)
		$fieldset.attr('data-prop-slug', propSlug)
		setFilter()
		setUrlParams()
		
	setFilter = () ->
		vals = {}
		$selected = $filters.find('.filter li.selected')
		$selected.each (i, li) ->
			if $(li).parents('.disabled').length
				return
			$filter = $(li).parents('.filter')
			prop = $filter.attr('data-prop')
			_val = $(li).attr('data-val')
			if !_val
				return
			_prop = $(li).parents('.filter').attr('data-prop')
			if !vals[_prop]
				vals[_prop] = [_val]
			else
				vals[_prop].push(_val)
			filter = clearFilter(prop)
		if filter
			filter = clearFilter(prop)
		else
			filter = ['all']
			cond = 'in'
			for _prop in Object.keys(vals)
				_vals = vals[_prop]
				if _prop.indexOf('_') > -1 && _vals[0] && _prop != 'Age_Bin'
					_vals = _vals[0].split(',')
				if ['accept','reject'].includes(_prop)
					for __val in _vals
						__vals = getThresholdVal(_prop).split(',')
						args = [cond, __val]
						for ___val in __vals
							args.push(parseInt(___val))
						filter.push(args)
				else
					args = [cond, _prop]
					for __val in _vals
						if Number.isInteger(parseInt(__val)) && __val.indexOf('-') < 0
							__val = parseInt(__val)
						args.push(__val)
					filter.push(args)
		$sliders = $filters.find('.slider')
		$sliders.each (i, slider) ->
			$slider = $(slider)
			if $slider.parents('.disabled').length
				return
			$handles = $slider.find('.ui-slider-handle')
			$fieldset = $slider.parents('.fieldset')
			prop = $fieldset.attr('data-prop')
			type = $slider.attr('data-type')
			current = ''
			if type == 'scale'
				if val = $slider.attr('data-val')
					filter.push(['==', prop, val])
					current = '('+val+')'
			else if type == 'range'
				vals = $slider.slider('values')
				if vals.length
					$slider.attr('data-val', vals.join(','))
					filter.push(['>=', prop, vals[0]])
					filter.push(['<=', prop, vals[1]])
		if mapbox.getLayer('markers')
			mapbox.setFilter('markers', filter)

	clearFilter = (prop) ->
		if !mapbox.length
			return
		filter = mapbox.getFilter('markers')
		if filter
			arrs = filter.slice(0)
			arrs.shift()
			for arr, i in arrs
				if arr.indexOf(prop) > -1
					filter.splice(i+1)
			return filter

	toggleLayer = (layerId) ->
		if mapbox.getLayer(layerId)
			visibility = mapbox.getLayoutProperty(layerId, 'visibility')
			if visibility == 'visible'
				mapbox.setLayoutProperty(layerId, 'visibility', 'none')
			else
				mapbox.setLayoutProperty(layerId, 'visibility', 'visible')

	setUpSliders = () ->
		$('.slider').each (i, slider) ->
			$slider = $(slider)
			type = $slider.attr('data-type')
			min = Number($slider.attr('data-min'))
			max = Number($slider.attr('data-max'))
			med = Number(((min+max)/2).toFixed(0))
			options =
				min: min,
				max: max,
				range: (type == 'range')
			if type == 'scale'
				options.value = med
			else if type == 'range'
				options.values = [min, max]

			$slider.slider options

			if type == 'range'
				$handles = $slider.find('.ui-slider-handle')
				$handles.first().attr('data-val', min)
				$handles.last().attr('data-val', max)


	changeSlider = (e, ui) ->
		$slider = $(this)
		$fieldset = $slider.parents('.fieldset')
		prop = $fieldset.attr('data-prop-slug')
		type = $slider.attr('data-type')
		if type == 'scale'
			val = ui.value.toString()
			$slider.attr('data-val', val)
		else if type == 'range'
			vals = ui.values
			minVal = vals[0]
			maxVal = vals[1]
			$slider.attr('data-min', minVal)
			$slider.attr('data-max', maxVal)
			$handles = $slider.find('.ui-slider-handle')
			$handles.first().attr('data-val', minVal)
			$handles.last().attr('data-val', maxVal)
			val = [minVal,maxVal].join(',')
			$slider.attr('data-val', val)
			$slider.attr('data-val-slug', val)
		setFilter()
		setUrlParams()

	limitThresholds = (e) ->
		$input = $(this)
		$option = $input.parents('.option')
		val = parseInt(this.value)
		if !val
			if $option.is('.accept')
				val = MAX_THRESH
			else
				val = MIN_THRESH
		else if val < MIN_THRESH
			val = MIN_THRESH
		else if val > MAX_THRESH
			val = MAX_THRESH
		$(this).val(val)

	changeThresholds = (e) ->
		$input = $(this)
		$sibInput = $input.siblings('input')
		$option = $input.parents('.option')
		$altOption = $option.siblings('.option.range-input')
		val = parseInt($input.val())
		type = $option.attr('data-type')
		sibVal = $sibInput.val()

		if $input.is('.min') && val > sibVal
			$sibInput.val(val)
		else if $input.is('.max') && val < sibVal
			$sibInput.val(val)

		if val > MAX_THRESH
			val = MAX_THRESH
		else if val < MIN_THRESH
			val = MIN_THRESH

		$input.val(val)

		$altMinInput = $altOption.find('.min')
		$altMaxInput = $altOption.find('.max')
		altMinVal = parseInt($altMinInput.val())
		altMaxVal = parseInt($altMaxInput.val())
		if type == 'accept' && val <= altMaxVal
			newAltMax = val-1
			if newAltMax < $altMaxInput.val()
				newAltMax++
			if newAltMax == altMaxVal
				newAltMax = val-1
			if newAltMax < MIN_THRESH
				newAltMax = MIN_THRESH
			$altMaxInput.val(newAltMax)
			if newAltMax < altMinVal
				$altMinInput.val(newAltMax)
		else if type == 'reject' && val >= altMinVal
			newAltMin = val + 1
			if newAltMin > $altMinInput.val()
				newAltMin--
			if newAltMin == altMinVal
				newAltMin = val+1
			if newAltMin > MAX_THRESH
				newAltMax = MAX_THRESH
			$altMinInput.val(newAltMin)
			if newAltMin > altMaxVal
				$altMaxInput.val(newAltMin)

		setThresholdVal($option)
		setThresholdVal($altOption)
		updateThresholdColors()
		setFilter()
		setUrlParams()

	setThresholdVal = ($option) ->
		min = $option.find('input.min').val()
		max = $option.find('input.max').val()
		range = []
		for i in [min..max]
			range.push(Math.abs(i))
		rangeStr = JSON.stringify(range).replace(/[\[\]']+/g,'')
		$option.attr('data-val', rangeStr)

	getThresholdVal = (prop) ->
		if prop == 'accept'
			$option = $filters.find('.option.accept')
		else if prop == 'reject'
			$option = $filters.find('.option.reject')
		else
			$option = $filters.find('.option[data-val="'+prop+'"]')
			if $option.length
				return $option.attr('data-type')
			else
				return null
		return $option.attr('data-val')


	hoverThresholds = (e) ->
		$(this).parents('.option').addClass('no-hover')

	unhoverThresholds = (e) ->
		$(this).parents('.option').removeClass('no-hover')

	updateThresholdColors = () ->
		prop = $('.fieldset.phenomena .sentence.selected').attr('data-val')
		if !prop
			return
		aVal = $('.option.accept').attr('data-val')
		aRange = JSON.parse('['+aVal+']')
		uVal = $('.option.reject').attr('data-val')
		uRange = JSON.parse('['+uVal+']')
		stops = []
		for i in [MIN_THRESH..MAX_THRESH]
			if aRange.indexOf(i) > -1
				stops.push([i, 'marker-accepted'])
			else if uRange.indexOf(i) > -1
				stops.push([i, 'marker-rejected'])
			else
				stops.push([i, ''])
		markerProps = 
			property: prop
			type: 'categorical'
			stops: stops
		if mapbox.getLayer('markers')
			mapbox.setLayoutProperty('markers', 'icon-image', markerProps)

	getMapData = () ->
		mapData = {}
		queryStr = window.location.search.substring(1)
		if !queryStr
			return
		queryStr = decodeURIComponent(queryStr)
		queryVars = queryStr.split('&')
		for queryVar, i in queryVars
			pair = queryVar.split('=')
			vars = pair[0].split('.')
			dataType = vars[1]
			varType = vars[2]
			val = pair[1]
			if vars[0] == 'map'
				if !mapData[dataType]
					query.map[dataType] = {}
				if varType
					query.map[dataType][varType] = val
				else
					query.map[dataType] = parseFloat(val)

	setUrlParams = () ->
		mapData = window.query.map
		$sentence = $phenomena.find('.sentence.selected')
		for key in Object.keys(window.query)
			if ['map','s'].indexOf(key) < 0
				delete window.query[key]
		if $sentence.length
			sentenceId = $sentence.attr('data-val')
			query['s'] = sentenceId
		if $map.is('.mapboxgl-map') && filters = mapbox.getFilter('markers')
			for i in [1..filters.length-1]
				filter = filters[i]
				if filter && filter != 'all'
					prop = getPropSlug(filter[1])
					queryVals = []
					for j in [2..filter.length-1]
						queryVal = getValSlug(prop, filter[j])
						queryVals.push(queryVal)
					vals = queryVals.join()
					if query[prop]
						query[prop] = query[prop]+','+vals
					else
						query[prop] = vals

		window.query = Object.assign({'map':mapData}, query)
		queryStr = $.param(window.query)
		queryStr = queryStr.replace(/\%5B/g, '.').replace(/%5D/g, '')
		location =  window.location
		url = location.origin+location.pathname
		if filters
			url = url.replace(location.search,'')	
		url += '?'+queryStr
		url = decodeURIComponent(url)
		history.pushState(queryVals, '', url)
		setEmbedder()

	setEmbedder = () ->
		url = window.location
		iframe = '<iframe width="100%" height="500px" src="'+url+'"></iframe>'
		$embedder.find('textarea').html(iframe)

	getMapQuery = () ->
		getMapData()
		if query.map && query.map.id
			createMap()
		else
			$body.addClass('form')

	getFilterQuery = () ->
		queryStr = window.location.search.substring(1)
		if !queryStr
			return
		queryStr = decodeURIComponent(queryStr)
		queryVars = queryStr.split('&')
		sentenceSelected = false
		for queryVar, i in queryVars
			pair = queryVar.split('=')
			prop = pair[0]
			vals = pair[1]
			if prop == 's'
				sentenceSelected = true
				selectSentence(vals)
			openMulti(prop)				
			if prop == 'show'
				selectFilter(prop, vals)
			if prop.indexOf('_') < 0
				vals = vals.split(',')
			else
				vals = [getThresholdVal(vals)]
			if prop == 'age'
				setSlider(prop, vals)
			else if prop != 's'
				for val in vals
					selectFilter(prop, val)
		if !sentenceSelected
			selectSentence()

	hoverMarker = (e) ->
		sentence = $phenomena.attr('data-selected')
		mapbox.getCanvas().style.cursor = 'pointer'
		marker = e.features[0]
		props = marker.properties
		val = props[sentence]
		aVals = $filters.find('.option.accept').attr('data-val')
		uVals = $filters.find('.option.reject').attr('data-val')
		if aVals.indexOf(val) > -1
			color = '#5fa990'
		else if uVals.indexOf(val) > -1
			color = '#795292'

		propNames = ['Age','Gender','Education','Race','Place Raised','Currently Lives','Mother/Guardian 1 Raised','Father/Guardian 2 Raised']
		ul = '<ul>'
		for prop, i in propNames
			propVal = props[checkKey(prop)]
			if propVal && propVal != 'NA'
				ul += '<li>'+prop+': '+checkKey(propVal)+'</li>'
				if i > propNames.length - 1
					description += '</ul>'

		popup.setLngLat(marker.geometry.coordinates)
			.setHTML(ul)
			.addTo(mapbox)
		$content = $(popup._content)
		$popup = $content.parent()
		$popup
			.addClass('show')
			.attr('data-id', Date.now())
		$content.css('background', color)

	checkKey = (val) ->
		key =
			'No_HS_diploma': 'Some high school'
			'HS_diploma': 'High school'
			'No_degree': 'Some college'
			'Associates': 'Associate\'s degree'
			'Bachelors': 'Bachelor\'s degree'
			'Graduate': 'Graduate degree'
			'Place Raised': 'Raised.CityState'
			'Currently Lives': 'Current.CityState'
			'Mother/Guardian 1 Raised': 'Mother.CityState'
			'Father/Guardian 2 Raised': 'Father.CityState'
		if key[val]
			return key[val]
		else
			return val

	startListening = () ->
		mapbox.on 'moveend', (e) ->
			center = mapbox.getCenter()
			query.map.zoom = mapbox.getZoom()
			query.map.lng = center.lng
			query.map.lat = center.lat
			setUrlParams()

		mapbox.on 'mouseenter', 'markers', hoverMarker
		mapbox.on 'mouseleave', 'markers', (e) ->
			$popup = $('.mapboxgl-popup')
			oldId = $popup.attr('data-id')
			setTimeout () ->
				newId = $popup.attr('data-id')
				if oldId == newId
					$popup.removeClass('show')
			, 500

	getProp = (propSlug) ->
		if $fieldset = $('.fieldset[data-prop-slug="'+propSlug+'"]')
			if prop = $fieldset.attr('data-prop')
				return prop
		return propSlug

	getPropSlug = (prop) ->
		if $fieldset = $('.fieldset[data-prop="'+prop+'"]')
			if propSlug = $fieldset.attr('data-prop-slug')
				return propSlug
		return prop
		
	getVal = (prop, valSlug) ->
		prop = getProp(prop)
		$fieldset = $('.fieldset[data-prop="'+prop+'"]')
		if $fieldset.find('.slider').length
			return valSlug
		$option = $fieldset.find('.option[data-val-slug="'+valSlug+'"]')
		if !$option || !$option.length
			$option = $fieldset.find('.slider[data-val-slug="'+valSlug+'"]')
		if $option.length
			val = $option.attr('data-val')
			if val.length
				return val
		return valSlug

	getValSlug = (prop, val) ->
		prop = getPropSlug(prop)
		$fieldset = $('.fieldset[data-prop-slug="'+prop+'"]')
		if $fieldset.find('.slider').length
			return val
		$option = $fieldset.find('.option[data-val="'+val+'"]')
		if $option.length
			valSlug = $option.attr('data-val-slug') || $option.attr('data-val')
			if valSlug && valSlug.length
				return valSlug
		return val

	decodeHtml = (str) ->
		textarea = document.createElement('textarea')
		textarea.innerHTML = str
		return textarea.value


	getMaps()
	getMapQuery()
	setUpSliders()

	new ClipboardJS('.instruct, #embed')

	$('body').on 'click', 'aside .label', toggleFieldset
	$('body').on 'click', 'aside .multi-label', selectMulti
	$('body').on 'click', 'aside#filters .option', clickFilter
	$('body').on 'click', 'aside#filters .reset .label', clickReset
	$('.slider').on 'slidechange', changeSlider
	$('.range-input input').on 'keyup', limitThresholds
	$('.range-input input').on 'change', changeThresholds
	$('.range-input .inputs').on 'mouseenter', hoverThresholds
	$('.range-input .inputs').on 'mouseleave', unhoverThresholds
	$('body').on 'click', 'aside .close', toggleSide
	$('body').on 'click', 'aside#phenomena ul li', clickSentence
	$('body').on 'click', 'aside#filters .tab', toggleFilterTabs
	$('body').on 'submit', '#creation form', prepareMap





		