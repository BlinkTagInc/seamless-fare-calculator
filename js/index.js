let map
let autocomplete_origin
let autocomplete_destination
let directionsService
let directionsRenderer
let farezones
let farezoneMatrix
let transitDirections
let transitLegs
let renderMap = true
let origin
let destination
let editedFare

const agencies = {
  'AC Transit': {
    single: 1,
    daily: 2.2,
    monthly: 36,
    faresUrl: 'http://www.actransit.org/actrealtime/fares-tickets-passes/'
  },
  'Bay Area Rapid Transit': {
    single: 1,
    daily: 3,
    monthly: 36,
    faresUrl: 'https://www.bart.gov/tickets/calculator'
  },
  'Caltrain': {
    single: 1,
    daily: 2,
    monthly: 27,
    faresUrl: 'https://www.caltrain.com/Fares/farechart.html'
  },
  'County Connection': {
    single: 1,
    daily: 1.9,
    monthly: 30,
    faresUrl: 'https://countyconnection.com/fares/fare-types-prices/'
  },
  'Dumbarton Express': {
    single: 1,
    daily: 2.2,
    monthly: 36,
    faresUrl: 'https://dumbartonexpress.com/db_fares/'
  },
  'Fairfield and Suisun Transit': {
    single: 1,
    daily: 3,
    monthly: 34,
    faresUrl: 'https://fasttransit.org/fares-passes/'
  },
  'Golden Gate Transit': {
    single: 1,
    daily: 3,
    monthly: 36,
    faresUrl: 'https://www.goldengate.org/bus/bus-fares-payment/fare-tables/'
  },
  'Marin Transit': {
    single: 1,
    daily: 2.8,
    monthly: 22,
    faresUrl: 'https://marintransit.org/fares'
  },
  'San Francisco Municipal Transportation Agency': {
    single: 1,
    daily: 7.6,
    monthly: 27,
    faresUrl: 'https://www.sfmta.com/getting-around/muni/fares'
  },
  'Petaluma Transit': {
    single: 1,
    daily: 3,
    monthly: 20,
    faresUrl: 'https://transit.cityofpetaluma.net/fares/'
  },
  'SamTrans': {
    single: 1,
    daily: 3,
    monthly: 29,
    faresUrl: 'https://www.samtrans.com/fares/farechart.html'
  },
  'Santa Rosa CityBus': {
    single: 1,
    daily: 2.7,
    monthly: 33,
    faresUrl: 'https://srcity.org/1658/Fares'
    },
  'San Francisco Bay Ferry': {
    single: 1,
    daily: 3,
    monthly: 36,
    faresUrl: 'https://sanfranciscobayferry.com/fares-and-tickets'
  },
  'Sonoma Marin Area Rail Transit': {
    single: 1,
    daily: 3.1,
    monthly: 27,
    faresUrl: 'https://www.sonomamarintrain.org/fares'
  },
  'SolTrans': {
    single: 1,
    daily: 2.3,
    monthly: 32,
    faresUrl: 'https://soltrans.org/fares/fare-table/'
  },
  'Sonoma County Transit': {
    single: 1,
    daily: 3,
    monthly: 28,
    faresUrl: 'https://sctransit.com/fares/'
  },
  'Tri Delta Transit': {
    single: 1,
    daily: 1.9,
    monthly: 29,
    faresUrl: 'http://trideltatransit.com/fares.aspx'
  },
  'Union City Transit': {
    single: 1,
    daily: 3,
    monthly: 28,
    faresUrl: 'https://www.unioncity.org/170/Union-City-Transit'
  },
  'Vacaville City Coach': {
    single: 1,
    daily: 3,
    monthly: 24,
    faresUrl: 'http://www.citycoach.com/fares/'
  },
  'Napa': {
    single: 1,
    daily: 3,
    monthly: 40,
    faresUrl: 'https://vinetransit.com/fares/'
  },
  'VTA': {
    single: 1,
    daily: 3,
    monthly: 35,
    faresUrl: 'https://www.vta.org/go/fares'
  },
  'WestCat (Western Contra Costa)': {
    single: 1,
    daily: 2.1,
    monthly: 23,
    faresUrl: 'https://www.westcat.org/home/FaresAll'
  },
  'Livermore Amador Valley Transit Authority': {
    single: 1,
    daily: 1.9,
    monthly: 30,
    faresUrl: 'https://www.wheelsbus.com/fares/'
  }
}

fetch('/data/farezones.json')
  .then(result => result.json())
  .then(result => {
    farezones = L.geoJson(result)
  })


fetch('/data/farezones_matrix.json')
  .then(result => result.json())
  .then(result => {
    farezoneMatrix = result
  })

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function arrayToSentence(arr) {
  return arr.join(', ').replace(/,\s([^,]+)$/, ' and $1')
}

function initializeMapServices() {
  const bottom_left_lat = 37.700297
  const bottom_left_lon = -122.400741
  const top_right_lat = 38.058351
  const top_right_lon = -121.587719

  const defaultBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(bottom_left_lat, bottom_left_lon),
    new google.maps.LatLng(top_right_lat, top_right_lon)
  )

  const mapStyles = [{
      "featureType": "administrative",
      "elementType": "all",
      "stylers": [{
        "saturation": "-100"
      }]
    },
    {
      "featureType": "administrative.province",
      "elementType": "all",
      "stylers": [{
        "visibility": "off"
      }]
    },
    {
      "featureType": "landscape",
      "elementType": "all",
      "stylers": [{
          "saturation": -100
        },
        {
          "lightness": 65
        },
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "all",
      "stylers": [{
          "saturation": -100
        },
        {
          "lightness": "50"
        },
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "all",
      "stylers": [{
        "saturation": "-100"
      }]
    },
    {
      "featureType": "road.highway",
      "elementType": "all",
      "stylers": [{
        "visibility": "simplified"
      }]
    },
    {
      "featureType": "road.arterial",
      "elementType": "all",
      "stylers": [{
        "lightness": "30"
      }]
    },
    {
      "featureType": "road.local",
      "elementType": "all",
      "stylers": [{
        "lightness": "40"
      }]
    },
    {
      "featureType": "transit",
      "elementType": "all",
      "stylers": [{
          "saturation": -100
        },
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{
          "hue": "#ffff00"
        },
        {
          "lightness": -25
        },
        {
          "saturation": -97
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels",
      "stylers": [{
          "lightness": -25
        },
        {
          "saturation": -100
        }
      ]
    }
  ];

  const options = {
    bounds: defaultBounds,
    componentRestrictions: {
      country: 'us'
    }
  }

  autocomplete_origin = new google.maps.places.Autocomplete(document.getElementById('start-address'), options)
  autocomplete_destination = new google.maps.places.Autocomplete(document.getElementById('end-address'), options)

  google.maps.event.addDomListener(document.getElementById('start-address'), 'keydown', (event) => { 
    if (event.keyCode === 13) { 
       event.preventDefault()
    }
  })
  google.maps.event.addDomListener(document.getElementById('end-address'), 'keydown', (event) => { 
    if (event.keyCode === 13) { 
       event.preventDefault()
    }
  })

  autocomplete_origin.setFields(['formatted_address', 'geometry'])
  autocomplete_destination.setFields(['formatted_address', 'geometry'])

  directionsService = new google.maps.DirectionsService()

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: {
      lat: 37.7,
      lng: -122.3
    },
    styles: mapStyles
  })

  directionsRenderer = new google.maps.DirectionsRenderer({
    draggable: true,
    map,
    polylineOptions: {
      strokeOpacity: 1,
      strokeWeight: 10,
      strokeColor: '#264586'
    }
  })

  const transitLayer = new google.maps.TransitLayer()
  transitLayer.setMap(map)

  const kmlLayer = new google.maps.KmlLayer({
    url: `https://${location.host}/data/farezones.kml?cache=2021-01-19`,
    preserveViewport: true,
    suppressInfoWindows: true,
    map: map
  })

  kmlLayer.setMap(map)
}

function metersToMiles(meters) {
  return meters / 1609.34
}

function getZoneByPoint(location) {
  var matchedZones = leafletPip.pointInLayer([location.lng(), location.lat()], farezones, true)

  if (matchedZones && matchedZones.length && matchedZones[0].feature) {
    var zoneId = matchedZones[0].feature.properties.name

    if (zoneId) {
      return zoneId
    }
  }
}

function getZoneCount(startZone, endZone) {
  if (!startZone) {
    return alert('Invalid start zone.')
  }
  if (!endZone) {
    return alert('Invalid end zone.')
  }

  return farezoneMatrix[startZone][endZone]
}

function getZoneFare(route) {
  const timeframe = $('#timeframe a.active').data('type');
  const startZone = getZoneByPoint(route.legs[0].start_location)
  const endZone = getZoneByPoint(route.legs[0].end_location)

  const zoneCount = getZoneCount(startZone, endZone)

  if (zoneCount === undefined) {
    return null
  }

  const timeFrameMultipliers = {
    'single': 1,
    'daily': 2.5,
    'monthly': 36
  }

  const minimumFare = 2.2

  return {
    zoneCount,
    fare: Math.max(minimumFare, (zoneCount - 2) + minimumFare) * timeFrameMultipliers[timeframe]
  }
}

function fetchTransitStepDirections(startLocation, endLocation, time, resolve, reject) {
  directionsService.route({
      origin: startLocation,
      destination: endLocation,
      travelMode: 'TRANSIT',
      transitOptions: {
        departureTime: time
      }
    },
    (response, status) => {
      if (status !== 'OK') {
        return reject(new Error(status));
      }

      resolve(response);
    }
  )
}

function fetchTransitDirections() {
  return new Promise((resolve, reject) => {
    const nextMondayMorning = moment().startOf('isoWeek').add(1, 'week').day('monday').hour(8).minute(0).second(0)
      .toDate()
    directionsService.route({
        origin: origin.geometry.location,
        destination: destination.geometry.location,
        travelMode: 'TRANSIT',
        transitOptions: {
          departureTime: nextMondayMorning
        }
      },
      (response, status) => {
        if (status !== 'OK') {
          return reject(new Error(status));
        }

        resolve(response);
      }
    )
  })
}

function applyTimeframeCurrent(transitLegs) {
  const timeframe = $('#timeframe a.active').data('type');

  const defaultAgency =  {
    single: 1,
    daily: 3,
    monthly: 36
  }

  return transitLegs.map(leg => {
    let multiplier = defaultAgency[timeframe]

    if (agencies[leg.agency]) {
      multiplier = agencies[leg.agency][timeframe]
    }

    return  {
      ...leg,
      fare: leg.fare * multiplier
    }
  })
}

function applyFareClassDiscountsCurrent(fare) {
  const fareClass = $('#rider-class').val()

  const fareClasses = {
    toddler: {
      minDiscount: 1,
      maxDiscount: 1
    },
    child: {
      minDiscount: 0,
      maxDiscount: 0.75
    },
    youth: {
      minDiscount: 0,
      maxDiscount: 0.75
    },
    student: {
      minDiscount: 0,
      maxDiscount: 0
    },
    adult: {
      minDiscount: 0,
      maxDiscount: 0
    },
    senior: {
      minDiscount: 0.5,
      maxDiscount: 0.75
    },
    disabled: {
      minDiscount: 0.5,
      maxDiscount: 0.75
    },
    'low-income': {
      minDiscount: 0,
      maxDiscount: 0.5
    }
  }

  const fareClassDiscount = fareClasses[fareClass]

  return {
    min: fare - fare * fareClassDiscount.minDiscount,
    max: fare - fare * fareClassDiscount.maxDiscount
  }
}

function applyFareClassDiscountsFuture(fare) {
  const fareClass = $('#rider-class').val()

  const fareClasses = {
    toddler: {
      discount: 1
    },
    child: {
      discount: 1
    },
    youth: {
      discount: 0.5
    },
    student: {
      discount: 0.5
    },
    adult: {
      discount: 0
    },
    senior: {
      discount: 0.5
    },
    disabled: {
      discount: 0.5
    },
    'low-income': {
      discount: 0.5
    }
  }

  const discount = fareClasses[fareClass].discount
  return fare - fare * discount
}

function formatFareRange(fareRange) {
  if (fareRange.max === fareRange.min) {
    return currencyFormatter.format(fareRange.max)
  }

  return `${currencyFormatter.format(fareRange.max)} - ${currencyFormatter.format(fareRange.min)}`
}

function sumFares(faresForTimeRange) {
  return _.sumBy(_.uniqBy(faresForTimeRange, 'agency'), 'fare')
}

async function renderResults() {
  if (!transitDirections) {
    return  alert('No directions found.')
  }

  const timeframe = $('#timeframe a.active').data('type');
  const fareClass = $('#rider-class').val()
  const currentFareNotes = []
  const currentFareNotesAsterisks = []
  const zoneFareNotes = []
  const overallNotes = []

  if (editedFare) {
    transitLegs = transitLegs.map(leg => {
      return {
        ...leg,
        fare: editedFare / transitLegs.length
      }
    })

    currentFareNotes.push(
      $('<div>').addClass('note').text('Fare manually edited.')
    )
  }

  const faresForTimeRange = applyTimeframeCurrent(transitLegs)
  const totalFare = sumFares(faresForTimeRange)
  const agencyList = _.uniq(_.map(faresForTimeRange, 'agency'))
  const totalDistance = _.sumBy(faresForTimeRange, 'distance')
  const noFareAgencies = _.uniq(_.map(_.filter(faresForTimeRange, leg => leg.noFareAgency), 'agency'))
  const fareRange = applyFareClassDiscountsCurrent(totalFare)
  const zoneFare = getZoneFare(transitDirections.routes[0])

  if (zoneFare === null) {
    return
  }

  currentFareNotes.push($('<div>').text(pluralize('agency', agencyList.length, true)))

  if (noFareAgencies.length > 0) {
    currentFareNotesAsterisks.push('†')
    currentFareNotes.push(
      $('<div>').addClass('note').html([
        '<sup>†</sup>',
        $('<span>').text(`Incomplete fare information from ${_.uniq(noFareAgencies).join(' and ')}.`)
      ])
    )
  }

  if (fareClass === 'student') {
    currentFareNotesAsterisks.push('‡')
    currentFareNotes.push(
      $('<div>').addClass('note').html([
        '<sup>‡</sup>',
        $('<span>').text('Student discounts vary by educational institution and are impossible to predict. Adult fare shown.')
      ])
    )
  }

  currentFareNotes.push(
    $('<div>').addClass('note no-highlight').html(
      '“Current fare“ is the cash fare retrieved from Google Transit Directions. <a href="https://www.seamlessbayarea.org/faq-fare-calculator">Read more »</a>.'
    )
  ) 

  zoneFareNotes.push(
    $('<div>').text(pluralize('zone', zoneFare.zoneCount, true))
  )

  if (timeframe === 'daily') {
    overallNotes.push(
      $('<div>').html('Assumes 3 trips / day; includes cost of any regular passes currently provided by agencies for daily travel.')
    )
  }

  if (timeframe === 'monthly') {
    overallNotes.push(
      $('<div>').html('Assumes 36 trips / month; includes cost of any regular passes currently provided by agencies for daily travel.')
    )
  }

  $('#current-fare-notes').html(currentFareNotes)
  $('#origin').html(origin.formatted_address)
  $('#destination').html(destination.formatted_address)

  $('#current-fare')
    .text(formatFareRange(fareRange))
    .toggleClass('fare-range', fareRange.min !== fareRange.max)
    .append(currentFareNotesAsterisks.map(asterisk => $('<sup>').text(asterisk)))

  const fare = applyFareClassDiscountsFuture(zoneFare.fare)
  $('#zone-fare').text(currencyFormatter.format(fare))
  $('#zone-fare-notes').html(zoneFareNotes)

  $('#overall-notes').html(overallNotes)

  $('#agencies').text(arrayToSentence(agencyList))
  $('#distance').text(Math.round(metersToMiles(totalDistance) * 10) / 10)
  $('#rider-info').text($('#rider-class option:selected').text())

  $('#agency-fare-urls').html(
    _.compact(agencyList.map(agencyName => {
      if (agencies[agencyName]) {
        return $('<a>').attr('href', agencies[agencyName].faresUrl).attr('target', '_blank').text(`${agencyName} Fares`).addClass('d-block mb-1')
      }
    }))
  )

  $('.fare-table-image[data-type="single-fare-table"]').toggle(timeframe === 'single')
  $('.fare-table-image[data-type="daily-cap-table"]').toggle(timeframe === 'daily')
  $('.fare-table-image[data-type="monthly-cap-table"]').toggle(timeframe === 'monthly')

  $('#zone-form').slideUp('fast')
  $('#results').slideDown('fast')
  $('#reset-button').fadeIn('fast')

  if (renderMap === true) {
    directionsRenderer.setMap(map)
    directionsRenderer.setDirections(transitDirections)
    renderMap = false
  }
}

$('#zone-form').submit(async event => {
  event.preventDefault()

  origin = autocomplete_origin.getPlace()
  if (!origin || !origin.geometry) {
    return alert('Please enter a start location, like "San Francisco" or "123 Walnut Street, Walnut Creek"')
  }

  destination = autocomplete_destination.getPlace()
  if (!destination || !destination.geometry) {
    return alert('Please enter an end location, like "San Francisco" or "123 Walnut Street, Walnut Creek"')
  }

  try {
    transitDirections = await fetchTransitDirections()
    renderMap = true
    transitLegs = []

    const agencyFareInfo = {
      'AC Transit': {
        value: 2.5
      },
      'Dumbarton Express Consortium': {
        value: 6
      }
    }

    await Promise.all(transitDirections.routes[0].legs.map(async leg => {
      return Promise.all(leg.steps.map(async step => {
        if (step.travel_mode !== 'TRANSIT') {
          return;
        }

        const stepDirections = await new Promise((resolve, reject) => {
          fetchTransitStepDirections(step.start_location, step.end_location, step.transit.departure_time.value, resolve, reject);
        });

        if (stepDirections && stepDirections.routes && stepDirections.routes.length > 0) {
          const leg = {
            distance: step.distance.value
          }

          stepDirections.routes[0].legs.forEach(routeLeg => routeLeg.steps.forEach(step => {
            if (step.transit) {
              step.transit.line.agencies.forEach(agency => {
                leg.agency = agency.name;
              });
            }
          }));

          if (agencyFareInfo[leg.agency]) {
            leg.fare = agencyFareInfo[leg.agency].value;
            leg.noFareAgency = true
          } else if (stepDirections.routes[0].fare) {
            leg.fare = stepDirections.routes[0].fare.value;
          } else {
            leg.fare = 0;
          }

          transitLegs.push(leg);
        }
      }));
    }));

    renderResults()
  } catch (error) {
    console.error(error)
    $('#results').hide()
    return alert('Unable to compare trip')
  }
})


$('#reset-button').click(event => {
  event.preventDefault()

  $('#zone-form').slideDown('fast')
  $('#results').slideUp('fast')
  $('#reset-button').fadeOut('fast')

  autocomplete_origin.set('place', null);
  autocomplete_destination.set('place', null)

  directionsRenderer.setMap(null)

  $('#start-address').val('')
  $('#end-address').val('')
  $('#rider-class').val('adult')
  $('#timeframe a').each((index, el) => {
    if ($(el).data('type') === 'single') {
      $(el).addClass('active')
    } else {
      $(el).removeClass('active')
    }
  })

  map.panTo({
    lat: 37.7,
    lng: -122.3
  })

  map.setZoom(10)

  window.scrollTo({ top: 0, behavior: 'smooth' })

  editedFare = null
})

$('#timeframe a').on('click', event => {
  event.preventDefault()
  $(event.target).tab('show')

  renderResults()
})

$('#edit-fare').click(event => {
  event.preventDefault()
  const userInput = prompt('Enter correct one-way single fare', '2.00')

  if (userInput === undefined) {
    return
  }

  const processedUserInput = parseFloat(userInput.replace(/\$/g, ''))

  if (isNaN(processedUserInput)) {
    return alert('Fare submitted is not a valid number.')
  } else if (processedUserInput <= 0) {
    return alert('Fare submitted is not a positive number.')
  }

  editedFare = processedUserInput

  renderResults()
})
