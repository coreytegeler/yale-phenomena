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

			addListeners(map)
			getQuery()

	updatePaintProperty = (prop) ->
		styles = 
			property: prop,
			type: 'categorical',
			stops: [
				['0', '#ffffff'],
				['1', '#d1d2d4'],
				['2', '#a7a9ab'],
				['3', '#808284'],
				['4', '#58585b']
				['5', '#000000']
			]
		map.setPaintProperty('data', 'circle-color', styles);

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

	addPhenomena = (val) ->
		sentence = humanize(val)
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


	toggleSide = (e) ->
		$side = $(this).parents('aside')
		$side.toggleClass('closed')
		if $side.is('#phenomena')
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

	clickFilter = (e) ->
		$option = $(this)
		$filter = $option.parents('.filter')
		$side = $filter.parents('aside')
		prop = $filter.attr('data-prop')
		val = $option.attr('data-val')
		selectFilter(prop, val)
		updateUrl()

	selectFilter = (prop, val) ->
		$filter = $filters.find('.filter[data-prop="'+prop+'"]')
		$selected = $filter.find('.selected')
		if !val
			$option = $filter.find('.option.all')
		else
			$option = $filter.find('.option[data-val="'+val+'"]')
		if $option.is('.all')
			$selected.filter(':not(.all)').removeClass('selected')
		else if !$option.length
			return
		else if $filter.is('.radio')
			$selected.removeClass('selected')
		else
			$selected.filter('.all').removeClass('selected')

		if $option.is('.selected:not(.all)')
			$option.removeClass('selected')
			if !$filter.find('.selected').length
				$filter.find('.all').addClass('selected')
		else
			$option.addClass('selected')
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
				if _prop.indexOf('_') > -1 && _vals[0] && _prop != 'Age_Bin'
					_vals = _vals[0].split(',')
				args = [cond, _prop]
				for __val in _vals
					args.push(__val)
				filter.push(args)
		else
			filter = clearFilter(prop)
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
		$('body').on 'click', 'aside .label', toggleFilter
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
				gender: props['Gender']
				race: props['Race']
				raised: props['RaisedPlace']
				edu: props['Education']
				income: '$'+props['Income']+'/yr'
			description = ''
			prop_keys = Object.keys(props)
			for prop, i in prop_keys
				val = props[prop].replace('_','')
				description += props[prop]
				if i < prop_keys.length - 1
					description += ', '
			popup.setLngLat(marker.geometry.coordinates)
				.setHTML(description)
				.addTo(map)

		map.on 'mouseleave', 'data', (e) ->
			popup.remove()

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

		