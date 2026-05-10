import { NextResponse } from 'next/server'

const API_KEY = process.env.GOOGLE_MAPS_SERVER_API_KEY
const SEARCH_RADIUS_METERS = 3000

type NearbyPlace = {
  name: string
  vicinity: string
  rating: number | null
  distanceMeters: number | null
  distanceText: string
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

async function findPlace(
  latitude: number,
  longitude: number,
  type: string,
  keyword: string
): Promise<NearbyPlace | null> {
  if (!API_KEY) return null

  const url =
    'https://maps.googleapis.com/maps/api/place/nearbysearch/json' +
    `?location=${latitude},${longitude}` +
    `&radius=${SEARCH_RADIUS_METERS}` +
    `&type=${type}` +
    `&keyword=${encodeURIComponent(keyword)}` +
    `&key=${API_KEY}`

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

    const latitude = Number(body.latitude)
    const longitude = Number(body.longitude)

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