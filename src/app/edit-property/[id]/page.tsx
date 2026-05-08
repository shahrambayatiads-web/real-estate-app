'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function EditPropertyPage() {
  const params = useParams()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [city, setCity] = useState('')
  const [image, setImage] = useState('')

  useEffect(() => {
    if (params?.id) {
      getProperty()
    }
  }, [params])

  async function getProperty() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.log(error)
    } else {
      setTitle(data.title)
      setPrice(data.price)
      setCity(data.city)
      setImage(data.image)
    }
  }

  async function handleUpdate() {
    const { error } = await supabase
      .from('properties')
      .update({
        title,
        price,
        city,
        image,
      })
      .eq('id', params.id)

    if (error) {
      alert('Error updating property')
      console.log(error)
    } else {
      alert('Property updated ✏️')

      router.push(`/properties/${params.id}`)
    }
  }

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
      <div
        style={{
          width: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
        }}
      >
        <h1 style={{ fontSize: '40px' }}>
          Edit Property ✏️
        </h1>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: '15px' }}
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ padding: '15px' }}
        />

        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ padding: '15px' }}
        />

        <input
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          style={{ padding: '15px' }}
        />

        <button
          onClick={handleUpdate}
          style={{
            padding: '15px',
            fontSize: '18px',
            cursor: 'pointer',
          }}
        >
          Update Property
        </button>
      </div>
    </div>
  )
}