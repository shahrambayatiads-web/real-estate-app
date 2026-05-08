'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AddPropertyPage() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [city, setCity] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')

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
      console.log(error)
      alert('Fout bij uploaden van afbeelding')
      return
    }

    const { data } = supabase.storage
      .from('properties')
      .getPublicUrl(fileName)

    setImage(data.publicUrl)
  }

  async function handleAddProperty() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Je moet eerst inloggen')
      return
    }

    const { error } = await supabase.from('properties').insert([
      {
        title,
        price,
        city,
        description,
        image,
        user_id: user.id,
      },
    ])

    if (error) {
      alert('Fout bij toevoegen van woning')
      console.log(error)
    } else {
      alert('Woning succesvol toegevoegd 🚀')

      setTitle('')
      setPrice('')
      setCity('')
      setDescription('')
      setImage('')
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
          Woning toevoegen 🏠
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
              height: '200px',
              objectFit: 'cover',
              borderRadius: '10px',
            }}
          />
        )}

        <button
          onClick={handleAddProperty}
          style={{
            padding: '15px',
            fontSize: '18px',
            cursor: 'pointer',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 'bold',
          }}
        >
          Woning toevoegen
        </button>
      </div>
    </div>
  )
}