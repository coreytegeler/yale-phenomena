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

		property = 'CU_1060.1'
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
					'circle-color':
						property: 'Gender',
						type: 'categorical',
						stops: [
							['Male', 'blue'],
							['Female', 'pink'],
							['Transgender (MTF)', 'green'],
							['Transgender (FTM)', 'green']
						]

			dataLayer = map.getLayer('data')
			dataBounds = map.getBounds(dataLayer).toArray()
			map.fitBounds dataBounds,
				padding: 100
				animate: false

	# map.on 'sourcedata', (e) ->
	# 	if e.sourceId == 'data'
	# 		dataPoints = map.queryRenderedFeatures({layers:['data']})
	# 		dataPoints = getUniqueFeatures dataPoints, 'ResponseID'
			# for point in dataPoints
				# console.log point

	updatePaintProperty = (property) ->
		console.log property
		styles = 
			property: property,
			type: 'categorical',
			stops: [
				['0', 'rgba(0,0,0,.1)'],
				['1', 'rgba(0,0,0,.2)'],
				['2', 'rgba(0,0,0,.4)'],
				['3', 'rgba(0,0,0,.6)'],
				['4', 'rgba(0,0,0,.8)']
				['5', 'rgba(0,0,0,1)']
			]
		console.log styles
		map.setPaintProperty('data', 'circle-color', styles);

	
	loadDataset = () ->
		$.ajax
			url: apiBase+'/features',
			data:
				access_token: accessToken
			success: (response) ->
				window.keys = Object.keys(response.features[0].properties)
				window.dataset = response
				phenomena = keys.filter (key) ->
					return key.match(/\d+/g)
				for phenomenon in phenomena
					$('#filters ul.phenomena').append('<li>'+phenomenon+'</li>')
				

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

	$('body').on 'click', '#filters ul li', () ->
		value = $(this).text()
		updatePaintProperty(value)
		
# Compare two maps with different filters
# https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-compare/