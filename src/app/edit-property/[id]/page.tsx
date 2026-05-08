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
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')

  useEffect(() => {
    getProperty()
  }, [])

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
      setDescription(data.description || '')
      setImage(data.image)
    }
  }

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]

    if (!file) return

    const fileName = `${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from('properties')
      .upload(fileName, file)

    if (error) {
      alert('Fout bij uploaden afbeelding')
      return
    }

    const { data } = supabase.storage
      .from('properties')
      .getPublicUrl(fileName)

    setImage(data.publicUrl)
  }

  async function handleUpdateProperty() {
    const { error } = await supabase
      .from('properties')
      .update({
        title,
        price,
        city,
        description,
        image,
      })
      .eq('id', params.id)

    if (error) {
      alert('Fout bij updaten woning')
      console.log(error)
    } else {
      alert('Woning bijgewerkt ✅')

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
        padding: '40px',
      }}
    >
      <div
        style={{
          width: '500px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
        }}
      >
        <h1
          style={{
            fontSize: '45px',
            marginBottom: '20px',
          }}
        >
          Woning bewerken ✏️
        </h1>

        <input
          placeholder="Titel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: '15px',
            borderRadius: '10px',
            border: 'none',
          }}
        />

        <input
          placeholder="Prijs"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{
            padding: '15px',
            borderRadius: '10px',
            border: 'none',
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
          }}
        />

        <textarea
          placeholder="Beschrijving"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            padding: '15px',
            borderRadius: '10px',
            border: 'none',
            minHeight: '120px',
          }}
        />

        <input
          type="file"
          onChange={handleImageUpload}
        />

        {image && (
          <img
            src={image}
            alt=""
            style={{
              width: '100%',
              height: '250px',
              objectFit: 'cover',
              borderRadius: '15px',
            }}
          />
        )}

        <button
          onClick={handleUpdateProperty}
          style={{
            padding: '15px',
            fontSize: '18px',
            cursor: 'pointer',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 'bold',
          }}
        >
          Opslaan ✅
        </button>
      </div>
    </div>
  )
}