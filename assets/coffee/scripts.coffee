$ ->
	keyUri = 'data/key8.csv'
	$embed = $('#embed')
	$filters = $('#filters')
	$phenomena = $('#phenomena')
	$creation = $('#creation')
	$fixedHeader = $('header.fixed')
	$headerSentence = $('header.fixed .sentence')
	accessToken = 'pk.eyJ1IjoieWdkcCIsImEiOiJjamY5bXU1YzgyOHdtMnhwNDljdTkzZjluIn0.YS8NHwrTLvUlZmE8WEEJPg'
	styleUri = 'mapbox://styles/ygdp/cjf9yeodd67sq2ro1uvh1ua67'

	window.mapdata =
		survey:
			uri: 'mapbox://ygdp.cjfaf000j0nxs2qp8gs7qpy75-2syg1'
			id: 'Survey_8'
		coldspots:
			uri: 'mapbox://ygdp.cjf9zc8rv1evr2wqwbsym7s86-8iw7q'
			id: 'Coldspots_8'
		hotspots:
			uri: 'mapbox://ygdp.cjf9zw1ys0j8o2wp8qs9iqo81-00bge'
			id: 'Hotspots_8'

	createMap = () ->
		$embed.removeClass('pre form')
		mapboxgl.accessToken = accessToken
		window.map = new mapboxgl.Map
			container: 'map',
			style: styleUri,
			zoom: 3,
			center: [-95.7129, 37.0902]
		map.on 'load', initMap

	initMap = () ->
		map.addLayer
			'id': 'survey-data'
			'type': 'symbol'
			'source':
				'type': 'vector'
				'url': mapdata.survey.uri
			'source-layer': mapdata.survey.id
			'zoom': 10
			'layout':
				'icon-allow-overlap': true
				'icon-size': 0.5
				'icon-image': ''

		dataLayer = map.getLayer('survey-data')
		dataBounds = map.getBounds(dataLayer).toArray()

		map.addLayer
			'id': 'coldspots'
			'type': 'line'
			'source':
				'type': 'vector'
				'url': mapdata.coldspots.uri
			'source-layer': mapdata.coldspots.id
			'minzoom': 0
			'maxzoom': 24
			'layout':
				'visibility': 'none'
			'paint':
				'line-width': 1
				'line-color': '#8ba9c4'

		map.addLayer
			'id': 'hotspots'
			'type': 'line'
			'source':
				'type': 'vector'
				'url': mapdata.hotspots.uri
			'source-layer': mapdata.hotspots.id
			'minzoom': 0
			'maxzoom': 24
			'layout':
				'visibility': 'none'
			'paint':
				'line-width': 1
				'line-color': '#c48f8f'

		window.popup = new mapboxgl.Popup
			closeButton: false,
			closeOnClick: false

		$embed.removeClass('pre')
		startListening()
		getFilterQuery()
		selectSentence()	

	getUniqueFeatures = (array, comparatorProperty) ->
		existingFeatureKeys = {}
		uniqueFeatures = array.filter (el) ->
			if(existingFeatureKeys[el.properties[comparatorProperty]])
				return false
			else
				existingFeatureKeys[el.properties[comparatorProperty]] = true
				return true
		return uniqueFeatures


	toggleSide = (e) ->
		$side = $(this).parents('aside')
		$side.toggleClass('closed')
		if $side.is('#phenomena')
			$fixedHeader.toggleClass('hide')


	clickSentence = (e) ->
		$sentence = $(this)
		val = $sentence.attr('data-val')
		selectSentence(val)	
		setUrl()	

	selectSentence = (val) ->
		$sentence = $phenomena.find('.option[data-val="'+val+'"]')
		if !$sentence.length
			$sentence = $phenomena.find('.option').first()
			val = $sentence.attr('data-val')
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

	getSentence = (val) ->
		if !val
			return $phenomena.find('.sentence.selected')

	clickFilter = (e) ->		
		$option = $(this)
		if $option.is('.range-input') && $(e.target).is('.inputs, .inputs *')
			return false
		$fieldset = $option.parents('.fieldset')
		$side = $fieldset.parents('aside')
		prop = $fieldset.attr('data-prop-slug') || $fieldset.attr('data-prop') 
		val = $option.attr('data-val-slug') || $option.attr('data-val')
		selectFilter(prop, val)
		setUrl()


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
		if $option.is('.all')
			$selected.filter(':not(.all)').removeClass('selected')
		else if $fieldset.is('.radio')
			$selected.removeClass('selected')
		else
			$selected.filter('.all').removeClass('selected')

		if $option.is('.selected:not(.all)')
			$option.removeClass('selected')
			if !$options.find('.selected').length
				$fieldset.find('.all').addClass('selected')
		else
			$option.addClass('selected')

		if $fieldset.is('.layers')
			toggleLayer(val)
		else
			setFilter()

	setSlider = (prop, vals) ->
		$fieldset = getFieldset(prop)
		$slider = $fieldset.find('.slider')
		$fieldset.addClass('open')
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
		if !filter
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
		else
			filter = clearFilter(prop)

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
		
		map.setFilter('survey-data', filter)

	clearFilter = (prop) ->
		if !map.length
			return
		filter = map.getFilter('survey-data')
		if filter
			arrs = filter.slice(0)
			arrs.shift()
			for arr, i in arrs
				if arr.indexOf(prop) > -1
					filter.splice(i+1)
			return filter

	toggleLayer = (layerId) ->
		if !map.getLayer(layerId)
			return
		visibility = map.getLayoutProperty(layerId, 'visibility')
		if visibility == 'visible'
			map.setLayoutProperty(layerId, 'visibility', 'none')
		else
			map.setLayoutProperty(layerId, 'visibility', 'visible')

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
		setUrl()

	MIN = 1
	MAX = 5

	limitThresholds = (e) ->
		$input = $(this)
		$option = $input.parents('.option')
		val = parseInt(this.value)
		if !val
			if $option.is('.accept')
				val = MAX
			else
				val = MIN
		else if val < MIN
			val = MIN
		else if val > MAX
			val = MAX
		$(this).val(val)

	changeThresholds = (e) ->
		$input = $(this)
		$sibInput = $input.siblings('input')
		$option = $input.parents('.option')
		$altOption = $option.siblings('.option.range-input')
		val = $input.val()
		sibVal = $sibInput.val()

		if $input.is('.min')
			if val > sibVal
				val = sibVal
		else if $input.is('.max')
			if val < sibVal
				val = sibVal
		if val > MAX
			val = MAX
		else if val < MIN
			val = MIN
		$input.val(val)

		altMinVal = $altOption.find('.min').val()
		altMaxVal = $altOption.find('.max').val()
		type = $option.attr('data-type')
		if type == 'accept' && $input.is('.min') && val <= altMaxVal
			newAltMax = Math.abs(val) - 1
			if newAltMax < $altOption.find('.max').val()
				newAltMax += 1
			$altMaxInput = $altOption.find('.max')
			if newAltMax < MIN
				newAltMax = MIN
			$altMaxInput.val(newAltMax)
		else if type == 'reject' && $input.is('.max') && val >= altMinVal
			newAltMin = Math.abs(val) + 1
			if newAltMin > $altOption.find('.min').val()
				newAltMin -= 1
			$altMinInput = $altOption.find('.min')
			if newAltMin > MAX
				newAltMax = MAX
			$altMinInput.val(newAltMin)


		setThresholdVal($option)
		setThresholdVal($altOption)

		updateThresholdColors()
		setFilter()

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
		for i in [MIN..MAX]
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
		map.setLayoutProperty('survey-data', 'icon-image', markerProps);

	installKey = () ->
		$options = $phenomena.find('ul')
		$.ajax
			url: keyUri
			dataType: 'text'
			success: (data) ->
				data = data.split(/\r?\n|\r/)
				for row, i in data
					if i != 0
						parsedRow = row.split(',')
						type = parsedRow[0]
						num = parsedRow[1]
						sentence = row.split(num+',')[1]
						prefix = switch
							when type.indexOf('Primary') > -1 then 'PR'
							when type.indexOf('Pilot') > -1 then 'PI'
							when type.indexOf('ControlG') > -1 then 'CG'
							when type.indexOf('ControlU') > -1 then 'CU'
							else 'X'
						val = prefix + '_' + num
						$li = $('<li></li>')
							.addClass('sentence')
							.append('<span>'+sentence+'</span>')
						$options.append($li.addClass('option'))

						$li = $li.attr('data-val', val)
						$filters.find('.fieldset.accept ul').append($li.clone())
						$filters.find('.fieldset.reject ul').append($li.clone())

	setUrl = () ->
		filters = map.getFilter('survey-data')
		query = {}
		$sentence = $phenomena.find('.sentence.selected')
		if $sentence.length
			sentenceVal = $sentence.attr('data-val')
			query['s'] = sentenceVal
		if filters
			for i in [1..filters.length-1]
				if filter = filters[i]
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
		location =  window.location
		url = location.href.replace(location.search,'')
		if filter != 'all'
			url += '?'+$.param query
		url = decodeURIComponent(url)
		history.pushState queryVals, '', url

	getMapQuery = () ->
		query = window.location.search.substring(1)
		if query
			query = decodeURIComponent(query)
			queryVars = query.split('&')
			# window.mapdata = {}
			for queryVar, i in queryVars
				pair = queryVar.split('=')
				val = pair[1]
				props = pair[0].split('.')
				layer = props[0]
				type = props[1]
				# if !mapdata[layer]
				# 	mapdata[layer] = {}
				# mapdata[layer][type] = val
		createMap()


	getFilterQuery = () ->
		query = window.location.search.substring(1)
		if query
			query = decodeURIComponent(query)
			queryVars = query.split('&')
			for queryVar, i in queryVars
				pair = queryVar.split('=')
				if pair[0] == 's'
					selectSentence(pair[1])
			for queryVar, i in queryVars
				pair = queryVar.split('=')
				prop = pair[0]
				openMulti(prop)
				if pair[0].indexOf('map') > -1
					return
				if prop == 'show'
					return selectFilter(prop, pair[1])
				vals = pair[1]
				if pair[0].indexOf('_') < 0
					vals = vals.split(',')
				else
					vals = [getThresholdVal(vals)]
				if prop == 'age'
					setSlider(prop, vals)
				else if prop != 's'
					for val in vals
						selectFilter(prop, val)

	toggleView = (e) ->
		if (e.keyCode == 27)
			$('body').toggleClass('embedded')
			map.resize()

	hoverMarker = (e) ->
		sentence = $phenomena.attr('data-selected')
		map.getCanvas().style.cursor = 'pointer'
		marker = e.features[0]
		props = marker.properties
		val = props[sentence]
		aVals = $filters.find('.option.accept').attr('data-val')
		uVals = $filters.find('.option.reject').attr('data-val')
		if aVals.indexOf(val) > -1
			color = '#5fa990'
		else if uVals.indexOf(val) > -1
			color = '#795292'

		props =
			'Age': props['Age']
			'Gender': props['Gender']
			'Education': props['Education']
			'Race': props['Race']
			'Place Raised': props['RaisedPlace']
			'Current Place': props['CurrentCity']+', '+props['CurrentState']
			'Father Raised Place': props['DadCity']+', '+props['DadState']
			'Mother Raised Place': props['MomCity']+', '+props['MomState']
		ul = '<ul>'
		prop_keys = Object.keys(props)
		for prop, i in prop_keys
			ul += '<li>'+prop+': '+props[prop]+'</li>'
			if i > prop_keys.length - 1
				description += '</ul>'
		popup.setLngLat(marker.geometry.coordinates)
			.setHTML(ul)
			.addTo(map)

		$content = $(popup._content)
		$popup = $content.parent()	
		$popup
			.addClass('show')
			.attr('data-id', marker.id)
		$content.css('background', color)

	startListening = () ->
		map.on 'mouseenter', 'survey-data', hoverMarker
		map.on 'mouseleave', 'survey-data', (e) ->
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


	installKey()
	getMapQuery()
	setUpSliders()

	$('body').on 'click', 'aside .label', toggleFieldset
	$('body').on 'click', 'aside .multi-label', selectMulti
	$('body').on 'click', 'aside#filters ul li', clickFilter
	$('.slider').on 'slidechange', changeSlider
	$('.range-input input').on 'keyup', limitThresholds
	$('.range-input input').on 'change', changeThresholds
	$('.range-input .inputs').on 'mouseenter', hoverThresholds
	$('.range-input .inputs').on 'mouseleave', unhoverThresholds
	$('body').on 'click', 'aside .close', toggleSide
	$('body').on 'click', 'aside#phenomena ul li', clickSentence
	$('body').on 'click', 'aside#filters .tab', toggleFilterTabs
	$('body').keyup toggleView





		