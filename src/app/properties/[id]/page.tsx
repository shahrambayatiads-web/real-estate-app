'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function PropertyDetailsPage() {
  const params = useParams()
  const router = useRouter()

  const [property, setProperty] = useState<any>(null)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    getProperty()
    getUser()
  }, [])

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      setUserId(user.id)
    }
  }

  async function getProperty() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.log(error)
    } else {
      setProperty(data)
    }
  }

  async function handleDelete() {
    const confirmDelete = confirm(
      'Weet je zeker dat je deze woning wilt verwijderen?'
    )

    if (!confirmDelete) return

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', params.id)

    if (error) {
      alert('Fout bij verwijderen van woning')
      console.log(error)
    } else {
      alert('Woning verwijderd 🗑️')
      router.push('/properties')
    }
  }

  if (!property) {
    return (
      <div
        style={{
          background: 'black',
          minHeight: '100vh',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        Laden...
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
      <Link
        href="/properties"
        style={{
          color: 'white',
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: '30px',
        }}
      >
        ← Terug naar woningen
      </Link>

      <img
        src={property.image}
        alt={property.title}
        style={{
          width: '100%',
          maxWidth: '800px',
          height: '450px',
          objectFit: 'cover',
          borderRadius: '20px',
        }}
      />

      <h1
        style={{
          fontSize: '50px',
          marginTop: '25px',
          marginBottom: '10px',
        }}
      >
        {property.title}
      </h1>

      <p style={{ fontSize: '30px', marginBottom: '10px' }}>
        € {property.price}
      </p>

      <p style={{ fontSize: '25px', color: '#ccc' }}>
        {property.city}
      </p>

      <div
        style={{
          marginTop: '30px',
          maxWidth: '800px',
          background: '#111',
          padding: '25px',
          borderRadius: '15px',
        }}
      >
        <h2 style={{ marginBottom: '15px' }}>
          Beschrijving
        </h2>

        <p
          style={{
            color: '#ccc',
            fontSize: '18px',
            lineHeight: '1.6',
          }}
        >
          {property.description || 'Geen beschrijving beschikbaar.'}
        </p>
      </div>

      {userId === property.user_id && (
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '25px',
          }}
        >
          <Link href={`/edit-property/${property.id}`}>
            <button
              style={{
                padding: '15px',
                cursor: 'pointer',
                borderRadius: '10px',
                border: 'none',
              }}
            >
              Bewerken ✏️
            </button>
          </Link>

          <button
            onClick={handleDelete}
            style={{
              padding: '15px',
              cursor: 'pointer',
              background: 'red',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
            }}
          >
            Verwijderen 🗑️
          </button>
        </div>
      )}
    </div>
  )
}