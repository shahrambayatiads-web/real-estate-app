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
      <div className="flex min-h-screen items-center justify-center bg-black text-3xl text-white">
        Laden...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-5 py-8 text-white md:px-10">
      <h1 className="mb-10 text-4xl font-bold md:text-5xl">
        Favorieten ❤️
      </h1>

      {properties.length === 0 ? (
        <p className="text-gray-400">
          Geen favoriete woningen.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="text-white no-underline"
            >
              <div className="rounded-2xl bg-[#111] p-5">
                <img
                  src={property.image}
                  alt={property.title}
                  className="h-52 w-full rounded-xl object-cover"
                />

                <h2 className="mt-4 text-2xl font-bold">
                  {property.title}
                </h2>

                <p className="mt-2">€ {property.price}</p>
                <p className="text-gray-400">{property.city}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}