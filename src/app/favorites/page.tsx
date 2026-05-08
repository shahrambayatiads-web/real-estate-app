'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function FavoritesPage() {
  const router = useRouter()

  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFavorites()
  }, [])

  async function getFavorites() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: favoriteRows, error: favoritesError } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', user.id)

    if (favoritesError) {
      console.log(favoritesError)
      setLoading(false)
      return
    }

    const propertyIds = favoriteRows.map((item) => item.property_id)

    if (propertyIds.length === 0) {
      setProperties([])
      setLoading(false)
      return
    }

    const { data: propertyData, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .in('id', propertyIds)

    if (propertiesError) {
      console.log(propertiesError)
    } else {
      setProperties(propertyData)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div style={{
        background: 'black',
        minHeight: '100vh',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '30px',
      }}>
        Laden...
      </div>
    )
  }

  return (
    <div style={{
      background: 'black',
      minHeight: '100vh',
      color: 'white',
      padding: '40px',
    }}>
      <h1 style={{ fontSize: '50px', marginBottom: '40px' }}>
        Favorieten ❤️
      </h1>

      {properties.length === 0 ? (
        <p style={{ color: '#999' }}>
          Geen favoriete woningen.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}>
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              style={{ textDecoration: 'none', color: 'white' }}
            >
              <div style={{
                background: '#111',
                padding: '20px',
                borderRadius: '10px',
              }}>
                <img
                  src={property.image}
                  alt={property.title}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                  }}
                />

                <h2 style={{ marginTop: '15px' }}>
                  {property.title}
                </h2>

                <p>€ {property.price}</p>
                <p>{property.city}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}