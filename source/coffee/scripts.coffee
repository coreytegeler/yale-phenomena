$ ->
	tilesetId = 'Yale_GDP'
	datasetId = 'cj5acubfx065v32mmdelcwb71'
	username = 'coreytegeler'
	apiBase = 'https://api.mapbox.com/datasets/v1/'+username+'/'+datasetId
	accessToken = 'pk.eyJ1IjoiY29yZXl0ZWdlbGVyIiwiYSI6ImNpd25xNjU0czAyeG0yb3A3cjdkc2NleHAifQ.EJAjj38qZXzIylzax3EMWg'
	mapboxgl.accessToken = accessToken
	style = 'mapbox://styles/coreytegeler/cj5adbyws0g7l2sqnl74tvzoa'
	style = 'mapbox://styles/mapbox/light-v9'

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
				for feature in dataset.features
					props = feature.properties
					keys = Object.keys(props)
					for prop in keys
						value = props[prop]
						if !filters[prop]
							filters[prop] = [value]
						else if filters[prop].indexOf(value) < 0
							filters[prop].push(value)

				for prop in Object.keys(filters)
					allowedProps = ['Gender', 'Education', 'Income', 'Race', 'Languages', 'Age']
					if allowedProps.indexOf(prop) > 0
						addFilters(filters, prop)
					else if prop.match(/\d+/g)
						addPhenomena(prop)

	addFilters = (filters, prop) ->
		vals = filters[prop]
		$filterList = $('#filters ul[data-prop="'+prop+'"]')
		if !$filterList.length
			$filterList = $('<ul></ul>')
			$filterList.attr('data-prop', prop)
			$('#filters').append('<h3>'+prop+'</h3>')
			$('#filters').append($filterList)
		for val in vals
			$filterItem = $filterList.find('li[data-value="'+val+'"]')
			if !$filterItem.length
				$filterItem = $('<li></li>')
				$filterItem.attr('data-val', val).html(val)
				$filterList.append($filterItem)

	addPhenomena = (val) ->
		$phenList = $('#phenomena ul[data-prop="phenomena"]')
		if !$phenList.length
			$phenList = $('<ul></ul>')
			$phenList.attr('data-prop', 'phenomena')
			$('#phenomena').append('<h3>Phenomena</h3>')
			$('#phenomena').append($phenList)
		$phenItem = $phenList.find('li[data-value="'+val+'"]')
		if !$phenItem.length
			$phenItem = $('<li></li>')
			$phenItem.attr('data-val', val).html(val)
			$phenList.append($phenItem)				

	getUniqueFeatures = (array, comparatorProperty) ->
		existingFeatureKeys = {}
		uniqueFeatures = array.filter (el) ->
			if(existingFeatureKeys[el.properties[comparatorProperty]])
				return false
			else
				existingFeatureKeys[el.properties[comparatorProperty]] = true
				return true
		return uniqueFeatures

	createMap()
	loadDataset()

	$('body').on 'click', 'aside ul li', () ->
		$li = $(this)
		$ul = $li.parents('ul')
		$side = $ul.parents('aside')
		prop = $ul.attr('data-prop')
		val = $li.attr('data-val')
		cond = '=='

		if $li.is('.selected')
			$li.removeClass('selected')
			val = ''
		else
			$ul.find('.selected:not([data-val="'+val+'"])').removeClass('selected')
			$li.addClass('selected')
			

		vals = {}
		$selected = $side.find('li.selected')
		$selected.each (i, li) ->
			_val = $(li).attr('data-val')
			_prop = $(li).parents('ul').attr('data-prop')
			if !vals[_prop]
				vals[_prop] = [_val]
			else
				vals[_prop].push(_val)
		
		if prop == 'phenomena'
			return updatePaintProperty(val)
		
		filter = ['all']
		for _prop in Object.keys(vals)
			_vals = vals[_prop]
			for __val in _vals
				console.log _prop, __val
				filter.push(['==', _prop, __val])

		map.setFilter('data', filter)
		