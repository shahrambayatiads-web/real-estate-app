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
      'Are you sure you want to delete this property?'
    )

    if (!confirmDelete) return

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', params.id)

    if (error) {
      alert('Error deleting property')
      console.log(error)
    } else {
      alert('Property deleted 🗑️')

      router.push('/dashboard')
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
      <img
        src={property.image}
        alt=""
        style={{
          width: '100%',
          maxWidth: '700px',
          height: '400px',
          objectFit: 'cover',
          borderRadius: '20px',
        }}
      />

      <h1
        style={{
          fontSize: '50px',
          marginTop: '20px',
        }}
      >
        {property.title}
      </h1>

      <p style={{ fontSize: '30px' }}>
        {property.price} €
      </p>

      <p style={{ fontSize: '25px' }}>
        {property.city}
      </p>

      {userId === property.user_id && (
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '20px',
          }}
        >
          <Link href={`/edit-property/${property.id}`}>
            <button
              style={{
                padding: '15px',
                cursor: 'pointer',
              }}
            >
              Edit ✏️
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
            }}
          >
            Delete 🗑️
          </button>
        </div>
      )}
    </div>
  )
}