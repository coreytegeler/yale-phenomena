$ ->
	accessToken = 'pk.eyJ1IjoiY29yZXl0ZWdlbGVyIiwiYSI6ImNpd25xNjU0czAyeG0yb3A3cjdkc2NleHAifQ.EJAjj38qZXzIylzax3EMWg'
	mapboxgl.accessToken = accessToken

	styleURI = 'mapbox://styles/mapbox/light-v9'
	styleURI = 'mapbox://styles/coreytegeler/cj5adbyws0g7l2sqnl74tvzoa'

	dataURI = 'mapbox://coreytegeler.cj8yqu9o509q92wo4ybzg13xo-9ir7s'
	dataID = 'survey8'

	countURI = 'mapbox://coreytegeler.afjjqi6e'
	countID = 'gz_2010_us_050_00_500k-c9lvkv'
	
	keyURI = '/data/key8.csv'

	$filters = $('#filters')
	$phenomena = $('#phenomena')

	createMap = () ->
		window.map = new mapboxgl.Map
			container: 'map',
			style: styleURI,
			zoom: 3,
			center: [-95.7129, 37.0902]

		map.on 'load', () ->
			map.addLayer
				'id': 'data',
				'type': 'circle'
				'source':
					type: 'vector'
					url: dataURI
				'source-layer': dataID
				'zoom': 10
				'paint':
					'circle-radius':
						'base': 1.75,
						'stops': [[12, 5], [22, 10]]

			dataLayer = map.getLayer('data')
			dataBounds = map.getBounds(dataLayer).toArray()
			# map.fitBounds dataBounds,
			# 	padding:
			# 		top: 200
			# 		bottom: 200
			# 		left: 200
			# 		right: 200
			# 	animate: false

			# paddedBounds = map.getBounds()
			# map.setMaxBounds(paddedBounds)
			

			map.addLayer
				'id': 'counties'
				'type': 'line'
				'source':
					type: 'vector'
					url: countURI
				'source-layer': countID
				'layout':
					'visibility': 'none'
				'minzoom': 0
				'maxzoom': 24
				'paint':
					'line-width': 1
					'line-color': 'black'
					'line-opacity': 0.1

			addListeners(map)
			getQuery()

	updatePaintProperty = (prop) ->
		styles = 
			property: prop,
			type: 'categorical',
			stops: [
				[0, '#ffffff'],
				[1, '#d1d2d4'],
				[2, '#a7a9ab'],
				[3, '#808284'],
				[4, '#58585b']
				[5, '#000000']
			]
		map.setPaintProperty('data', 'circle-color', styles);

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
	# 	sentence = humanize(val)
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
			$('#sentence').toggleClass('show')

	selectSentence = () ->	
		$sentence = $(this)
		$fieldset = $sentence.parents('.fieldset')
		$side = $fieldset.parents('aside')
		val = $sentence.attr('data-val')
		text = $sentence.find('span').text()
		$side.find('.selected').removeClass('selected')
		$sentence.toggleClass('selected')
		$accFilter = $filters.find('.fieldset.acceptance')
		$accLabel = $filters.find('.label.acceptance')
		$accFilter.attr('data-prop', val)
		$accLabel.attr('data-prop', val)

		if $sentence.is('.selected')
			$('#sentence h1').text(text)
			updatePaintProperty(val)
		else
			$('#sentence h1').text('')


	toggleFieldset = (e) ->
		$label = $(this)
		$fieldset = $label.parents('.fieldset')
		$fieldset.toggleClass('open')

	clickFilter = (e) ->		
		$option = $(this)
		$fieldset = $option.parents('.fieldset')
		$side = $fieldset.parents('aside')
		prop = $fieldset.attr('data-prop')
		val = $option.attr('data-val')
		selectFilter(prop, val)
		updateUrl()

	selectFilter = (prop, val) ->
		$fieldset = $filters.find('.fieldset[data-prop="'+prop+'"]')
		$selected = $fieldset.find('.selected')
		if !val
			$option = $fieldset.find('.option.all')
		else
			$option = $fieldset.find('.option[data-val="'+val+'"]')
		if $option.is('.all')
			$selected.filter(':not(.all)').removeClass('selected')
		else if !$option.length
			return
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

		if $fieldset.is('.features')
			toggleFeature($option)
		else
			filterMarkers()

	filterMarkers = () ->
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
						__val = parseInt(__val)
					args.push(__val)
				filter.push(args)
		else
			filter = clearFilter(prop)
		$sliders = $filters.find('.slider')
		$sliders.each (i, slider) ->
			$slider = $(slider)
			prop = $slider.attr('data-prop')
			type = $slider.attr('data-type')
			if type == 'scale'
				if val = $slider.attr('data-val')
					filter.push(['==', prop, val])
			else if type == 'range'
				minVal = $slider.attr('data-min-val')
				maxVal = $slider.attr('data-max-val')
				if minVal && maxVal
					filter.push(['>=', prop, parseInt(minVal)])
					filter.push(['<=', prop, parseInt(maxVal)])
		map.setFilter('data', filter)

	clearFilter = (prop) ->
		if !map.length
			return
		filter = map.getFilter('data')
		if filter
			arrs = filter.slice(0)
			arrs.shift()
			for arr, i in arrs
				if arr.indexOf(prop) > -1
					filter.splice(i+1)
			return filter

	toggleFeature = (option) ->
		$option = $(option)
		$fieldset = $option.parents('.fieldset')
		layer = $option.attr('data-val')
		if !map.getLayer(layer)
			return
		visibility = map.getLayoutProperty(layer, 'visibility')
		if visibility == 'visible'
			map.setLayoutProperty(layer, 'visibility', 'none')
		else
			map.setLayoutProperty(layer, 'visibility', 'visible')

	setUpSliders = () ->
		$('.slider').each (i, slider) ->
			$slider = $(slider)
			type = $slider.attr('data-type')
			min = Number($slider.attr('data-min'))
			max = Number($slider.attr('data-max'))
			med = Number(((min+max)/2).toFixed(0))
			options = {
				min: min,
				max: max,
				range: (type == 'range')
			}
			if type == 'scale'
				options.value = med
			else if type == 'range'
				options.values = [min, max]
			$slider.slider options

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
		filterMarkers()

	installKey = () ->
		$options = $phenomena.find('ul')
		$.ajax
			url: keyURI
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
						$option = $('<li></li>')
							.addClass('option')
							.attr('data-val', val)
							.append('<span>'+sentence+'</span>')
						$options.append($option)

	updateUrl = () ->
		filters = map.getFilter('data')
		query = {}
		if !filters
			return
		for i in [1..filters.length-1]
			if filter = filters[i]
				prop = humanize(filter[1])
				queryVals = []
				for ii in [2..filter.length-1]
					queryVal = humanize(filter[ii])
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
		query = decodeURIComponent(query)
		if !query
			return
		queryVars = query.split('&')
		for queryVar, i in queryVars
			pair = queryVar.split('=')
			prop = pair[0]
			vals = pair[1].split(',')
			if mechanize(prop)
				prop = mechanize(prop)
			for val in  vals
				if mechanize(val)
					val = mechanize(val)
				selectFilter(prop, val)

	addListeners = (map) ->
		$('body').on 'click', 'aside .label', toggleFieldset
		$('body').on 'click', 'aside#filters ul li', clickFilter
		$('.slider').on 'slidechange', changeSlider

		$('body').on 'click', 'aside .close', toggleSide
		$('body').on 'click', 'aside#phenomena ul li', selectSentence

		popup = new mapboxgl.Popup
			closeButton: false,
			closeOnClick: false

		map.on 'mouseenter', 'data', (e) ->
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

		map.on 'mouseleave', 'data', (e) ->
			popup.remove()

	installKey()
	createMap()
	setUpSliders()

	humanize = (str) ->
		if human[str]
			str = human[str]
		return str

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

		