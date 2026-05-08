'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login')
      return
    }

    getProperties(session.user.id)
  }

  async function getProperties(userId: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.log(error)
    } else {
      setProperties(data)
    }

    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()

    router.push('/login')
  }

  if (loading) {
    return (
      <div
        style={{
          background: 'black',
          minHeight: '100vh',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '30px',
        }}
      >
        Loading...
      </div>
    )
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
      <h1 style={{ fontSize: '50px', marginBottom: '40px' }}>
        Dashboard 📊
      </h1>

      <div style={{ marginBottom: '30px' }}>
        <Link href="/add-property">
          <button
            style={{
              padding: '15px',
              cursor: 'pointer',
            }}
          >
            Add Property
          </button>
        </Link>

        <button
          onClick={handleLogout}
          style={{
            padding: '15px',
            marginLeft: '10px',
            cursor: 'pointer',
            background: 'red',
            color: 'white',
            border: 'none',
          }}
        >
          Logout
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}
      >
        {properties.map((property) => (
          <div
            key={property.id}
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

            <Link href={`/properties/${property.id}`}>
              <button
                style={{
                  marginTop: '10px',
                  padding: '10px',
                  cursor: 'pointer',
                }}
              >
                View Property
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}