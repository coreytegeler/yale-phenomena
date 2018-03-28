$ ->
	keyUri = 'data/key8.csv'
	$filters = $('#filters')
	$phenomena = $('#phenomena')
	$fixedHeader = $('header.fixed')
	$headerSentence = $('header.fixed .sentence')



	createMap = () ->
		mapboxAttr = $('#embed').attr('data-mapbox')
		mapbox = JSON.parse(decodeURI(mapboxAttr))
		mapboxgl.accessToken = mapbox.accessToken


		window.map = new mapboxgl.Map
			container: 'map',
			style: mapbox.styleUri,
			zoom: 3,
			center: [-95.7129, 37.0902]

		map.on 'load', () ->
			map.addLayer
				'id': 'survey-data',
				'type': 'circle'
				'source':
					type: 'vector'
					url: mapbox.surveyUri
				'source-layer': mapbox.surveyId
				'zoom': 10
				'paint':
					'circle-color': '#000'
					'circle-radius': 4

			dataLayer = map.getLayer('survey-data')

			dataBounds = map.getBounds(dataLayer).toArray()

			map.addLayer
				'id': 'coldspots'
				'type': 'line'
				'source':
					'type': 'vector'
					'url': mapbox.coldspotsUri
				'source-layer': mapbox.coldspotsId
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
					'url': mapbox.hotspotsUri
				'source-layer': mapbox.hotspotsId
				'minzoom': 0
				'maxzoom': 24
				'layout':
					'visibility': 'none'
				'paint':
					'line-width': 1
					'line-color': '#c48f8f'

			startListening(map)
			getQuery()

	updateThresholdColors = () ->
		prop = $('.fieldset.phenomena .sentence.selected').attr('data-val')
		if !prop
			return

		aColor = '#5fa990'
		uColor = '#795292'

		aVal = $('.option.acceptable').attr('data-val')
		aRange = JSON.parse('['+aVal+']')
		uVal = $('.option.unacceptable').attr('data-val')
		uRange = JSON.parse('['+uVal+']')

		stops = []
		for i in aRange
			stops.push([i.toString(), aColor])
		for i in uRange
			stops.push([i.toString(), uColor])

		circleStyles = 
			property: prop
			type: 'categorical'
			stops: stops

		map.setPaintProperty('survey-data', 'circle-color', circleStyles);

	# whiteList = ['Income', 'Race', 'Age']
	# addFilters = (filters, prop) ->
	# 	vals = filters[prop]
	# 	$filterList = $('#filters .filter[data-prop="'+prop+'"]')
	# 	if !$filterList.length
	# 		$filter = $('<div></div>')
	# 		$filter.attr('data-prop', prop)
	# 		$filterList = $('<ul></ul>')
	# 		$filter.append('<h3>'+prop+'</h3>')
	# 		$filter.append($filterList)
	# 		$('#filters').append($filter)
	# 	for val in vals
	# 		$filterItem = $filterList.find('li[data-value="'+val+'"]')
	# 		if !$filterItem.length
	# 			$filterItem = $('<li></li>')
	# 			$filterItem.attr('data-val', val).html(val)
	# 			$filter.find('ul').append($filterItem)

	# addPhenomena = (val) ->
	# 	sentence = getSlug(val)
	# 	if !sentence
	# 		return
	# 	$phenList = $('#phenomena .filter[data-prop="phenomena"]')
	# 	if !$filterList.length
	# 		$phen = $('<div></div>')
	# 		$phen.attr('data-prop', prop)
	# 		$phenList = $('<ul></ul>')
	# 		$phen.append('<h3>'+prop+'</h3>')
	# 		$phen.append($phenList)
	# 		$('#filters').append($phen)
	# 	$phenItem = $phenList.find('li[data-val="'+val+'"]')
	# 	if !$phenItem.length
	# 		$phenItem = $('<li></li>')
	# 		$phenItem.attr('data-val', val).html(sentence)
	# 		$phen.find('ul').append($phenItem)				

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
		updateUrl()	

	selectSentence = (val) ->	
		$sentence = $('.option')
		$sentence = $phenomena.find('.sentence[data-val="'+val+'"]')
		$fieldset = $sentence.parents('.fieldset')
		$side = $fieldset.parents('aside')
		text = $sentence.find('span').text()
		$side.find('.selected').removeClass('selected')
		$sentence.toggleClass('selected')
		$accFieldset = $filters.find('.fieldset.accepted')
		$accLabel = $filters.find('.label.accepted')
		$accFieldset.attr('data-prop', val)
		$accLabel.attr('data-prop', val)
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
		updateUrl()


	selectFilter = (prop, val) ->
		val = getValSlug(prop, val)
		$fieldset = getFieldset(prop)
		$fieldset.addClass('open')
		$selected = $fieldset.find('.selected')
		$option = getOption(prop, val)
		if !$option.length
			return
		if $option.is('.all')
			$selected.filter(':not(.all)').removeClass('selected')
		else if $fieldset.is('.radio')
			$selected.removeClass('selected')
		else
			$selected.filter('.all').removeClass('selected')

		if $option.is('.selected:not(.all)')
			$option.removeClass('selected')
			if !$fieldset.find('.selected').length
				$fieldset.find('.all').addClass('selected')
		else
			$option.addClass('selected')

		if $fieldset.is('.layers')
			toggleLayer(val)
		else
			setFilter()

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

	setFilter = () ->
		vals = {}
		$selected = $filters.find('.filter li.selected')
		$selected.each (i, li) ->
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
				args = [cond, _prop]
				for __val in _vals
					if !isNaN(__val)
						__val = __val
					args.push(__val)
				filter.push(args)
		else
			filter = clearFilter(prop)

		$sliders = $filters.find('.slider')
		$sliders.each (i, slider) ->
			$slider = $(slider)
			$handles = $slider.find('.ui-slider-handle')
			$fieldset = $slider.parents('.fieldset')
			# $val = $fieldset.find('.label .val')
			prop = $fieldset.attr('data-prop')
			type = $slider.attr('data-type')
			current = ''
			if type == 'scale'
				if val = $slider.attr('data-val')
					filter.push(['==', prop, val])
					current = '('+val+')'
			else if type == 'range'
				minVal = $slider.attr('data-min-val')
				maxVal = $slider.attr('data-max-val')
				$handles.first().attr('data-val', minVal)
				$handles.last().attr('data-val', maxVal)
				if minVal && maxVal
					rangerFilter = ['in', prop]
					filter.push(rangerFilter)
					filter.push(['>=', prop, minVal])
					filter.push(['<=', prop, maxVal])
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
		prop = $slider.attr('data-prop')
		type = $slider.attr('data-type')
		if type == 'scale'
			val = ui.value.toString()
			$slider.attr('data-val', val)
		else if type == 'range'
			vals = ui.values
			minVal = vals[0]
			maxVal = vals[1]
			$slider.attr('data-min-val', minVal)
			$slider.attr('data-max-val', maxVal)
			$handles = $slider.find('.ui-slider-handle')
			$handles.first().attr('data-val', minVal)
			$handles.last().attr('data-val', maxVal)
		setFilter()

	changeThresholds = (e) ->
		$input = $(this)
		$sibInput = $input.siblings('input')
		$option = $input.parents('.option')
		$sibOption = $option.siblings('.option.range-input')
		val = $input.val()
		sibVal = $sibInput.val()

		if $input.is('.min')
			allowed = val <= sibVal
		else
			allowed = val >= sibVal
		if !allowed
			$input.val(sibVal)

		sibMinVal = $sibOption.find('.min').val()
		sibMaxVal = $sibOption.find('.max').val()
		if $option.is('.acceptable') && $input.is('.min') && val <= sibMaxVal
			$input.val(Math.abs(sibMaxVal) + 1)
		else if $option.is('.unacceptable') && $input.is('.max') && val >= sibMinVal
			$input.val(Math.abs(sibMinVal) - 1)

		min = $option.find('input.min').val()
		max = $option.find('input.max').val()

		range = []
		for i in [min..max]
			range.push(Math.abs(i))
		rangeStr = JSON.stringify(range).replace(/[\[\]']+/g,'')
		$option.attr('data-val', rangeStr)

		updateThresholdColors()
		setFilter()

	hoverThresholds = (e) ->
		$(this).parents('.option').addClass('no-hover')

	unhoverThresholds = (e) ->
		$(this).parents('.option').removeClass('no-hover')


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
							.attr('data-val', val)
							.append('<span>'+sentence+'</span>')
						$filters.find('.fieldset.accept ul').append($li.clone())
						$filters.find('.fieldset.reject ul').append($li.clone())
						$options.append($li.addClass('option'))

	updateUrl = () ->
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
					for ii in [2..filter.length-1]
						queryVal = getValSlug(prop, filter[ii])
						queryVals.push(queryVal)
					vals = queryVals.join()
					query[prop] = vals
		location =  window.location
		url = location.href.replace(location.search,'')
		if filter != 'all'
			url += '?'+$.param query
		url = decodeURIComponent(url)
		history.pushState queryVals, '', url

	getQuery = () ->
		query = window.location.search.substring(1)
		if !query
			return
		query = decodeURIComponent(query)
		queryVars = query.split('&')
		for queryVar, i in queryVars
			pair = queryVar.split('=')
			if pair[0] == 's'
				selectSentence(pair[1])
		for queryVar, i in queryVars
			pair = queryVar.split('=')
			prop = pair[0]
			if prop == 'show'
				selectFilter(prop, pair[1])
			else if prop != 's'
				vals = pair[1].split(',')
				for val in vals
					selectFilter(prop, val)

	toggleView = (e) ->
		if (e.keyCode == 27)
			$('body').toggleClass('embedded')
			map.resize()

	startListening = (map) ->
		$('body').on 'click', 'aside .label', toggleFieldset
		$('body').on 'click', 'aside#filters ul li', clickFilter
		$('.slider').on 'slidechange', changeSlider
		$('.range-input input').on 'change', changeThresholds
		$('.range-input .inputs').on 'mouseenter', hoverThresholds
		$('.range-input .inputs').on 'mouseleave', unhoverThresholds

		$('body').on 'click', 'aside .close', toggleSide
		$('body').on 'click', 'aside#phenomena ul li', clickSentence

		$('body').on 'click', 'aside#filters .tab', toggleFilterTabs

		$('body').keyup toggleView

		popup = new mapboxgl.Popup
			closeButton: false,
			closeOnClick: false

		map.on 'mouseenter', 'survey-data', (e) ->
			map.getCanvas().style.cursor = 'pointer'
			marker = e.features[0]
			props = marker.properties
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
			$(popup._content).parent()
				.addClass('show')
				.attr('data-id', marker.id)


		map.on 'mouseleave', 'survey-data', (e) ->
			$popup = $('.mapboxgl-popup')
			oldId = $popup.attr('data-id')
			setTimeout () ->
				newId = $popup.attr('data-id')
				if oldId == newId
					$popup.removeClass('show')
			, 500

	installKey()
	createMap()
	setUpSliders()

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
		$option = $('.fieldset[data-prop="'+prop+'"] .option[data-val-slug="'+valSlug+'"]')
		if $option.length
			val = $option.attr('data-val')
			if val.length
				return val
		return valSlug

	getValSlug = (prop, val) ->
		prop = getPropSlug(prop)
		$option = $('.fieldset[data-prop-slug="'+prop+'"] .option[data-val="'+val+'"]')
		if $option.length
			valSlug = $option.attr('data-val-slug') || $option.attr('data-val')
			if valSlug && valSlug.length
				return valSlug
		return val


	mechanize = (str) ->
		if machine[str]
			str = machine[str]
		return str					


	human =
		'PR_1125': 'The car needs washed'
		'CG_1025.1': 'I was afraid you might couldn’t find it'
		'PI_1160': 'John plays guitar, but so don’t I'
		'PI_1171': 'Here’s you a piece of pizza'
		'CG_1026.1': 'This seat reclines hella'
		'PI_1161': 'When I don\'t have hockey and I\'m done my homework, I go there and skate'
		'PI_1172': 'I’m SO not going to study tonight'
		'PR_1116': 'Every time you ask me not to hum, I’ll hum more louder'
		'Age_Bin': 'age'
		'Race': 'race'
		'Income': 'income'
		'Age': 'age'
		'Asian': 'asian'
		'Black': 'black'
		'White': 'white'
		'Hispanic': 'hispanic'
		'Amerindian': 'amerindian'

	machine =
		'age': 'Age_Bin'
		'income': 'Income'
		'race': 'Race'
		'asian': 'Asian'
		'black': 'Black'
		'white': 'White'
		'hispanic': 'Hispanic'
		'amerindian': 'Amerindian'

		