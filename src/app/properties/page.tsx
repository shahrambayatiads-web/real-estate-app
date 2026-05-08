'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PropertiesPage() {
  const router = useRouter()

  const [properties, setProperties] = useState<any[]>([])
  const [userEmail, setUserEmail] = useState('')
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    checkUser()
    getProperties()
  }, [])

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
    } else {
      setUserEmail(user.email || '')
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert(error.message)
    } else {
      router.push('/login')
    }
  }

  async function getProperties() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')

    if (error) {
      console.log(error)
    } else {
      setProperties(data)
    }
  }

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title?.toLowerCase().includes(search.toLowerCase()) ||
      property.city?.toLowerCase().includes(search.toLowerCase())

    const matchesCity =
      city === '' ||
      property.city?.toLowerCase().includes(city.toLowerCase())

    const matchesPrice =
      maxPrice === '' ||
      Number(property.price) <= Number(maxPrice)

    return matchesSearch && matchesCity && matchesPrice
  })

  return (
    <div
      style={{
        background: 'black',
        minHeight: '100vh',
        color: 'white',
        padding: '40px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '50px',
              marginBottom: '10px',
            }}
          >
            Woningen 🏠
          </h1>

          <p
            style={{
              color: '#999',
              fontSize: '16px',
            }}
          >
            Ingelogd als: {userEmail}
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: '12px 20px',
            background: 'white',
            color: 'black',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          Uitloggen
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '15px',
          marginBottom: '35px',
        }}
      >
        <input
          placeholder="Zoek op titel of stad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '15px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '16px',
          }}
        />

        <input
          placeholder="Stad"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            padding: '15px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '16px',
          }}
        />

        <input
          placeholder="Maximale prijs"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{
            padding: '15px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '16px',
          }}
        />
      </div>

      {filteredProperties.length === 0 ? (
        <p style={{ color: '#999', fontSize: '20px' }}>
          Geen woningen gevonden.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
          }}
        >
          {filteredProperties.map((property) => (
            <Link
              href={`/properties/${property.id}`}
              key={property.id}
              style={{
                textDecoration: 'none',
                color: 'white',
              }}
            >
              <div
                style={{
                  background: '#111',
                  padding: '20px',
                  borderRadius: '10px',
                }}
              >
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

                <h2
                  style={{
                    marginTop: '15px',
                  }}
                >
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