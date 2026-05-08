'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    getProperties()
  }, [])

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

  return (
    <div
      style={{
        background: 'black',
        minHeight: '100vh',
        color: 'white',
        padding: '40px',
      }}
    >
      <h1
        style={{
          fontSize: '50px',
          marginBottom: '40px',
        }}
      >
        Properties 🏠
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}
      >
        {properties.map((property) => (
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
                alt=""
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                }}
              />

              <h2>{property.title}</h2>

              <p>{property.price} €</p>

              <p>{property.city}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}