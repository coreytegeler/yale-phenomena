$ ->
	tilesetId = 'Yale_GDP'
	datasetId = 'cj5acubfx065v32mmdelcwb71'
	username = 'coreytegeler'
	apiBase = 'https://api.mapbox.com/datasets/v1/'+username+'/'+datasetId
	accessToken = 'pk.eyJ1IjoiY29yZXl0ZWdlbGVyIiwiYSI6ImNpd25xNjU0czAyeG0yb3A3cjdkc2NleHAifQ.EJAjj38qZXzIylzax3EMWg'
	mapboxgl.accessToken = accessToken
	style = 'mapbox://styles/coreytegeler/cj5adbyws0g7l2sqnl74tvzoa'
	style = 'mapbox://styles/mapbox/light-v9'

	$filters = $('#filters')
	$phenomena = $('#phenomena')

	createMap = () ->
		window.map = new mapboxgl.Map
			container: 'map',
			style: style,
			zoom: 3,
			center: [-95.7129, 37.0902]

		map.on 'load', () ->
			map.addLayer
				'id': 'data',
				'type': 'circle',
				'source':
					type: 'vector',
					url: 'mapbox://coreytegeler.cj5acubfx065v32mmdelcwb71-677sh'
				'source-layer': tilesetId
				'paint':
					'circle-radius':
						'base': 1.75,
						'stops': [[12, 5], [22, 10]]
					# 'circle-color':
					# 	property: 'Gender',
					# 	type: 'categorical',
					# 	stops: [
					# 		['Male', 'blue'],
					# 		['Female', 'pink'],
					# 		['Transgender (MTF)', 'green'],
					# 		['Transgender (FTM)', 'green']
					# 	]

			dataLayer = map.getLayer('data')
			dataBounds = map.getBounds(dataLayer).toArray()
			map.fitBounds dataBounds,
				padding:
					top: 200
					bottom: 200
					left: 200
					right: 200
				animate: false

			paddedBounds = map.getBounds()
			map.setMaxBounds(paddedBounds)

	# map.on 'sourcedata', (e) ->
	# 	if e.sourceId == 'data'
	# 		dataPoints = map.queryRenderedFeatures({layers:['data']})
	# 		dataPoints = getUniqueFeatures dataPoints, 'ResponseID'
			# for point in dataPoints
				# console.log point

	updatePaintProperty = (prop) ->
		styles = 
			property: prop,
			type: 'categorical',
			stops: [
				['0', 'rgba(0,0,0,.1)'],
				['1', 'rgba(0,0,0,.2)'],
				['2', 'rgba(0,0,0,.4)'],
				['3', 'rgba(0,0,0,.6)'],
				['4', 'rgba(0,0,0,.8)']
				['5', 'rgba(0,0,0,1)']
			]
		map.setPaintProperty('data', 'circle-color', styles);

	
	loadDataset = () ->
		$.ajax
			url: apiBase+'/features',
			data:
				access_token: accessToken
			success: (response) ->
				window.keys = Object.keys(response.features[0].properties)
				window.dataset = response
				filters = {}
				# for feature in dataset.features
				# 	props = feature.properties
				# 	keys = Object.keys(props)
				# 	for prop in keys
				# 		value = props[prop]
				# 		if !filters[prop]
				# 			filters[prop] = [value]
				# 		else if filters[prop].indexOf(value) < 0
				# 			filters[prop].push(value)

				# for prop in Object.keys(filters)
				# 	allowedProps = ['Income', 'Race', 'Age']
					# if allowedProps.indexOf(prop) > -1
						# addFilters(filters, prop)
					# else if prop.match(/\d+/g)
					# 	addPhenomena(prop)

	whiteList = ['Income', 'Race', 'Age']
	addFilters = (filters, prop) ->
		vals = filters[prop]
		$filterList = $('#filters .filter[data-prop="'+prop+'"]')
		if !$filterList.length
			$filter = $('<div></div>')
			$filter.attr('data-prop', prop)
			$filterList = $('<ul></ul>')
			$filter.append('<h3>'+prop+'</h3>')
			$filter.append($filterList)
			$('#filters').append($filter)
		for val in vals
			$filterItem = $filterList.find('li[data-value="'+val+'"]')
			if !$filterItem.length
				$filterItem = $('<li></li>')
				$filterItem.attr('data-val', val).html(val)
				$filter.find('ul').append($filterItem)

	translator = {
		'PR_1125': 'The car needs washed'
		'CG_1025.1': 'I was afraid you might couldn’t find it'
		'PI_1160': 'John plays guitar, but so don’t I'
		'PI_1171': 'Here’s you a piece of pizza'
		'CG_1026.1': 'This seat reclines hella'
		'PI_1161': 'When I don\'t have hockey and I\'m done my homework, I go there and skate'
		'PI_1172': 'I’m SO not going to study tonight'
		'PR_1116': 'Every time you ask me not to hum, I’ll hum more louder'
	}
	addPhenomena = (val) ->
		sentence = translator[val]
		if !sentence
			return
		$phenList = $('#phenomena .filter[data-prop="phenomena"]')
		if !$filterList.length
			$phen = $('<div></div>')
			$phen.attr('data-prop', prop)
			$phenList = $('<ul></ul>')
			$phen.append('<h3>'+prop+'</h3>')
			$phen.append($phenList)
			$('#filters').append($phen)
		$phenItem = $phenList.find('li[data-val="'+val+'"]')
		if !$phenItem.length
			$phenItem = $('<li></li>')
			$phenItem.attr('data-val', val).html(sentence)
			$phen.find('ul').append($phenItem)				

	getUniqueFeatures = (array, comparatorProperty) ->
		existingFeatureKeys = {}
		uniqueFeatures = array.filter (el) ->
			if(existingFeatureKeys[el.properties[comparatorProperty]])
				return false
			else
				existingFeatureKeys[el.properties[comparatorProperty]] = true
				return true
		return uniqueFeatures


	togglePhenomena = (e) ->
		$side = $(this).parents('aside')
		$side.toggleClass('close')
		$('#sentence').toggleClass('show')

	selectSentence = () ->	
		$sentence = $(this)
		$filter = $sentence.parents('.filter')
		$side = $filter.parents('aside')
		val = $sentence.attr('data-val')
		text = $sentence.find('span').text()
		$side.find('.selected').removeClass('selected')
		$sentence.toggleClass('selected')
		$accFilter = $filters.find('.filter.acceptance')
		$accLabel = $filters.find('.label.acceptance')
		$accFilter.attr('data-prop', val)
		$accLabel.attr('data-prop', val)

		if $sentence.is('.selected')
			$('#sentence h1').text(text)
			updatePaintProperty(val)
		else
			$('#sentence h1').text('')


	toggleFilter = (e) ->
		$label = $(this)
		$filter = $label.parents('.filter')
		$filter.toggleClass('open')

	selectFilter = (e) ->
		$li = $(this)
		$filter = $li.parents('.filter')
		$side = $filter.parents('aside')
		prop = $filter.attr('data-prop')
		val = $li.attr('data-val')
		$selected = $filter.find('.selected')
		if $li.is('.all')
			$selected.filter(':not(.all)').removeClass('selected')
		else if $filter.is('.radio')
			$selected.removeClass('selected')
		else
			$selected.filter('.all').removeClass('selected')

		if $li.is('.selected:not(.all)')
			$li.removeClass('selected')
			if !$filter.find('.selected').lenght
				$filter.find('.all').addClass('selected')
		else
			$li.addClass('selected')



		filterMarkers()

	filterMarkers = () ->
		vals = {}
		$selected = $filters.find('li.selected')
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
				if _prop.indexOf('_') > -1 && _vals[0]
					_vals = _vals[0].split(',')
				args = [cond, _prop]
				for __val in _vals
					args.push(__val)
				filter.push(args)
		else
			filter = clearFilter(prop)
		map.setFilter('data', filter)

	clearFilter = (prop) ->
		filter = map.getFilter('data')
		if filter
			arrs = filter.slice(0)
			arrs.shift()
			for arr, i in arrs
				if arr.indexOf(prop) > -1
					filter.splice(i+1)
			return filter

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

		filter = clearFilter(prop)
		if !filter
			filter = ['any']

		if type == 'scale'
			val = ui.value.toString()
			filter.push(['==', prop, val])
			map.setFilter('data', filter)
		else if type == 'range'
			vals = ui.values
			minVal = vals[0]
			maxVal = vals[1]
			filter.push(['>=', prop, minVal])
			filter.push(['<=', prop, maxVal])
			map.setFilter('data', filter)


	$('body').on 'click', 'aside .label', toggleFilter
	$('body').on 'click', 'aside#filters ul li', selectFilter
	$('.slider').on 'slidechange', changeSlider

	$('body').on 'click', '.hamburger', togglePhenomena
	$('body').on 'click', 'aside#phenomena ul li', selectSentence

	createMap()
	loadDataset()
	setUpSliders()

		