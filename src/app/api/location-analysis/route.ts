import { NextResponse } from 'next/server'

const API_KEY = process.env.GOOGLE_MAPS_SERVER_API_KEY
const SEARCH_RADIUS_METERS = 3000
const MAKELAAR_SEARCH_RADIUS_METERS = 10000

type NearbyPlace = {
  name: string
  vicinity: string
  rating: number | null
  distanceMeters: number | null
  distanceText: string
}

async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  if (!API_KEY || !address.trim()) return null

  const params = new URLSearchParams({
    address,
    components: 'country:BE',
    key: API_KEY,
  })

  const url =
    'https://maps.googleapis.com/maps/api/geocode/json?' +
    params.toString()

  const response = await fetch(url)
  const data = await response.json()

  const location = data.results?.[0]?.geometry?.location

  if (typeof location?.lat !== 'number' || typeof location?.lng !== 'number') {
    return null
  }

  return {
    latitude: location.lat,
    longitude: location.lng,
  }
}

async function findPlace(
  latitude: number,
  longitude: number,
  type: string,
  keyword: string,
  radiusMeters = SEARCH_RADIUS_METERS
): Promise<NearbyPlace | null> {
  if (!API_KEY) return null

  const params = new URLSearchParams({
    location: `${latitude},${longitude}`,
    radius: String(radiusMeters),
    keyword,
    key: API_KEY,
  })

  if (type) {
    params.append('type', type)
  }

  const url =
    'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' +
    params.toString()

  const response = await fetch(url)
  const data = await response.json()

  if (!data.results?.length) {
    return null
  }

  const place = data.results[0]
  const placeLat = place.geometry?.location?.lat
  const placeLng = place.geometry?.location?.lng

  const distanceMeters =
    typeof placeLat === 'number' && typeof placeLng === 'number'
      ? calculateDistanceMeters(latitude, longitude, placeLat, placeLng)
      : null

  return {
    name: place.name,
    vicinity: place.vicinity || '',
    rating: place.rating || null,
    distanceMeters,
    distanceText: formatDistance(distanceMeters),
  }
}

async function findPlaces(
  latitude: number,
  longitude: number,
  type: string,
  keyword: string,
  radiusMeters = SEARCH_RADIUS_METERS,
  limit = 8
): Promise<NearbyPlace[]> {
  if (!API_KEY) return []

  const params = new URLSearchParams({
    location: `${latitude},${longitude}`,
    radius: String(radiusMeters),
    keyword,
    key: API_KEY,
  })

  if (type) {
    params.append('type', type)
  }

  let allResults: any[] = []
  let nextPageToken: string | undefined

  do {
    const pagedParams = new URLSearchParams(params)

    if (nextPageToken) {
      pagedParams.append('pagetoken', nextPageToken)

      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    const pagedUrl =
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' +
      pagedParams.toString()

    const response = await fetch(pagedUrl)
    const data = await response.json()

    if (data.results?.length) {
      allResults = [...allResults, ...data.results]
    }

    nextPageToken = data.next_page_token
  } while (nextPageToken && allResults.length < limit * 3)

  if (!allResults.length) {
    return []
  }

  return allResults
    .map((place: any) => {
      const placeLat = place.geometry?.location?.lat
      const placeLng = place.geometry?.location?.lng

      const distanceMeters =
        typeof placeLat === 'number' && typeof placeLng === 'number'
          ? calculateDistanceMeters(latitude, longitude, placeLat, placeLng)
          : null

      return {
        name: place.name,
        vicinity: place.vicinity || '',
        rating: place.rating || null,
        distanceMeters,
        distanceText: formatDistance(distanceMeters),
      }
    })
    .filter((place: NearbyPlace) => place.name && place.vicinity)
    .sort((a: NearbyPlace, b: NearbyPlace) => {
      const distanceA = a.distanceMeters ?? Number.MAX_SAFE_INTEGER
      const distanceB = b.distanceMeters ?? Number.MAX_SAFE_INTEGER
      return distanceA - distanceB
    })
    .slice(0, limit)
}

async function textSearchPlaces(
  latitude: number,
  longitude: number,
  query: string,
  radiusMeters = SEARCH_RADIUS_METERS,
  limit = 8
): Promise<NearbyPlace[]> {
  if (!API_KEY) return []

  const params = new URLSearchParams({
    query,
    location: `${latitude},${longitude}`,
    radius: String(radiusMeters),
    key: API_KEY,
  })

  let allResults: any[] = []
  let nextPageToken: string | undefined

  do {
    const pagedParams = new URLSearchParams(params)

    if (nextPageToken) {
      pagedParams.append('pagetoken', nextPageToken)

      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    const pagedUrl =
      'https://maps.googleapis.com/maps/api/place/textsearch/json?' +
      pagedParams.toString()

    const response = await fetch(pagedUrl)
    const data = await response.json()

    if (data.results?.length) {
      allResults = [...allResults, ...data.results]
    }

    nextPageToken = data.next_page_token
  } while (nextPageToken && allResults.length < limit * 3)

  if (!allResults.length) return []

  return allResults
    .map((place: any) => {
      const placeLat = place.geometry?.location?.lat
      const placeLng = place.geometry?.location?.lng

      const distanceMeters =
        typeof placeLat === 'number' && typeof placeLng === 'number'
          ? calculateDistanceMeters(latitude, longitude, placeLat, placeLng)
          : null

      return {
        name: place.name,
        vicinity: place.formatted_address || place.vicinity || '',
        rating: place.rating || null,
        distanceMeters,
        distanceText: formatDistance(distanceMeters),
      }
    })
    .filter((place: NearbyPlace) => place.name && place.vicinity)
    .sort((a: NearbyPlace, b: NearbyPlace) => {
      const distanceA = a.distanceMeters ?? Number.MAX_SAFE_INTEGER
      const distanceB = b.distanceMeters ?? Number.MAX_SAFE_INTEGER
      return distanceA - distanceB
    })
    .slice(0, limit)
}

function mergePlaces(placeGroups: NearbyPlace[][], limit = 15) {
  const map = new Map<string, NearbyPlace>()

  placeGroups.flat().forEach((place) => {
    const key = `${place.name}-${place.vicinity}`.toLowerCase()

    if (!map.has(key)) {
      map.set(key, place)
    }
  })

  return Array.from(map.values())
    .sort((a, b) => {
      const distanceA = a.distanceMeters ?? Number.MAX_SAFE_INTEGER
      const distanceB = b.distanceMeters ?? Number.MAX_SAFE_INTEGER
      return distanceA - distanceB
    })
    .slice(0, limit)
}

async function findMakelaarPlaces(
  latitude: number,
  longitude: number,
  city: string,
  radiusMeters = MAKELAAR_SEARCH_RADIUS_METERS
) {
  const locationName = city ? ` ${city}` : ''

  const results = await Promise.allSettled([
    findPlaces(
      latitude,
      longitude,
      'real_estate_agency',
      'real estate agency',
      radiusMeters,
      50
    ),
    findPlaces(
      latitude,
      longitude,
      'real_estate_agency',
      'immo makelaar vastgoedkantoor vastgoed immobiliën',
      radiusMeters,
      50
    ),
    textSearchPlaces(latitude, longitude, `immo${locationName}`, radiusMeters, 25),
    textSearchPlaces(latitude, longitude, `makelaar${locationName}`, radiusMeters, 25),
    textSearchPlaces(latitude, longitude, `vastgoedkantoor${locationName}`, radiusMeters, 25),
  ])

  const successfulResults = results
    .filter((result): result is PromiseFulfilledResult<NearbyPlace[]> => result.status === 'fulfilled')
    .map((result) => result.value)

  return mergePlaces(successfulResults, 50)
}

function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadius = 6371000
  const toRadians = (value: number) => (value * Math.PI) / 180

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return Math.round(earthRadius * c)
}

function formatDistance(meters: number | null) {
  if (!meters) return '-'
  if (meters < 1000) return `${meters} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export async function POST(req: Request) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        {
          error: 'Google Maps server API key ontbreekt',
        },
        { status: 500 }
      )
    }

    const body = await req.json()

    let latitude = Number(body.latitude)
    let longitude = Number(body.longitude)

    const hasUsableAddress = Boolean(
      String(body.address || '').trim() ||
        String(body.street || '').trim() ||
        String(body.postcode || '').trim()
    )

    const fullAddress = [body.address, body.postcode, body.city, 'België']
      .filter(Boolean)
      .join(', ')

    if (hasUsableAddress) {
      const geocoded = await geocodeAddress(fullAddress)

      if (geocoded) {
        latitude = geocoded.latitude
        longitude = geocoded.longitude
      }
    }

    if (!latitude || !longitude) {
      return NextResponse.json(
        {
          error: 'Latitude en longitude zijn verplicht',
        },
        { status: 400 }
      )
    }

    const [
      supermarket,
      hospital,
      school,
      trainStation,
      pharmacy,
      gym,
      shopping,
      park,
      busStation,
      makelaars,
    ] = await Promise.all([
      findPlace(
        latitude,
        longitude,
        'supermarket',
        'Carrefour Delhaize Colruyt Aldi Lidl supermarket'
      ),
      findPlace(latitude, longitude, 'hospital', 'hospital ziekenhuis'),
      findPlace(latitude, longitude, 'school', 'school'),
      findPlace(latitude, longitude, 'train_station', 'train station station'),
      findPlace(latitude, longitude, 'pharmacy', 'pharmacy apotheek'),
      findPlace(latitude, longitude, 'gym', 'fitness gym'),
      findPlace(latitude, longitude, 'shopping_mall', 'shopping mall winkelcentrum'),
      findPlace(latitude, longitude, 'park', 'park'),
      findPlace(latitude, longitude, 'bus_station', 'bus station bus stop'),
      hasUsableAddress
        ? findMakelaarPlaces(
            latitude,
            longitude,
            String(body.city || ''),
            MAKELAAR_SEARCH_RADIUS_METERS
          ).catch((error) => {
            console.log('Makelaar search failed:', error)
            return []
          })
        : Promise.resolve([]),
    ])

    return NextResponse.json({
      supermarket,
      hospital,
      school,
      trainStation,
      pharmacy,
      gym,
      shopping,
      park,
      busStation,
      makelaar: makelaars[0] || null,
      aanbevolenMakelaar: makelaars[0] || null,
      makelaars,
    })
  } catch (error) {
    console.log(error)

    return NextResponse.json(
      {
        error: 'Location analysis failed',
      },
      { status: 500 }
    )
  }
}