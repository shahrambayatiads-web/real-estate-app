'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AddPropertyPage() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [city, setCity] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')

  const [slaapkamers, setSlaapkamers] = useState('')
  const [badkamers, setBadkamers] = useState('')
  const [bewoonbareOppervlakte, setBewoonbareOppervlakte] = useState('')
  const [grondoppervlakte, setGrondoppervlakte] = useState('')
  const [bouwjaar, setBouwjaar] = useState('')
  const [epc, setEpc] = useState('')
  const [woningType, setWoningType] = useState('')
  const [verwarmingstype, setVerwarmingstype] = useState('')
  const [pluspunten, setPluspunten] = useState('')
  const [minpunten, setMinpunten] = useState('')

  const [parking, setParking] = useState(false)
  const [tuin, setTuin] = useState(false)
  const [terras, setTerras] = useState(false)
  const [lift, setLift] = useState(false)
  const [gemeubeld, setGemeubeld] = useState(false)
  const [dubbelGlas, setDubbelGlas] = useState(false)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const fileName = `${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from('properties')
      .upload(fileName, file)

    if (error) {
      alert('Fout bij uploaden van afbeelding')
      console.log(error)
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
        slaapkamers,
        badkamers,
        bewoonbare_oppervlakte: bewoonbareOppervlakte,
        grondoppervlakte,
        bouwjaar,
        epc,
        woning_type: woningType,
        verwarmingstype,
        pluspunten,
        minpunten,
        parking,
        tuin,
        terras,
        lift,
        gemeubeld,
        dubbel_glas: dubbelGlas,
      },
    ])

    if (error) {
      alert('Fout bij toevoegen van woning')
      console.log(error)
    } else {
      alert('Woning succesvol toegevoegd 🚀')
    }
  }

  return (
    <div className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <h1 className="text-4xl font-bold">Woning toevoegen 🏠</h1>

        <input className="rounded-xl p-4 text-black" placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="rounded-xl p-4 text-black" placeholder="Prijs" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input className="rounded-xl p-4 text-black" placeholder="Stad" value={city} onChange={(e) => setCity(e.target.value)} />

        <textarea className="min-h-32 rounded-xl p-4 text-black" placeholder="Beschrijving" value={description} onChange={(e) => setDescription(e.target.value)} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input className="rounded-xl p-4 text-black" placeholder="Slaapkamers" value={slaapkamers} onChange={(e) => setSlaapkamers(e.target.value)} />
          <input className="rounded-xl p-4 text-black" placeholder="Badkamers" value={badkamers} onChange={(e) => setBadkamers(e.target.value)} />
          <input className="rounded-xl p-4 text-black" placeholder="Bewoonbare oppervlakte" value={bewoonbareOppervlakte} onChange={(e) => setBewoonbareOppervlakte(e.target.value)} />
          <input className="rounded-xl p-4 text-black" placeholder="Grondoppervlakte" value={grondoppervlakte} onChange={(e) => setGrondoppervlakte(e.target.value)} />
          <input className="rounded-xl p-4 text-black" placeholder="Bouwjaar" value={bouwjaar} onChange={(e) => setBouwjaar(e.target.value)} />
          <input className="rounded-xl p-4 text-black" placeholder="EPC" value={epc} onChange={(e) => setEpc(e.target.value)} />
          <input className="rounded-xl p-4 text-black" placeholder="Woning type" value={woningType} onChange={(e) => setWoningType(e.target.value)} />
          <input className="rounded-xl p-4 text-black" placeholder="Verwarmingstype" value={verwarmingstype} onChange={(e) => setVerwarmingstype(e.target.value)} />
        </div>

        <textarea className="min-h-24 rounded-xl p-4 text-black" placeholder="Pluspunten" value={pluspunten} onChange={(e) => setPluspunten(e.target.value)} />
        <textarea className="min-h-24 rounded-xl p-4 text-black" placeholder="Minpunten" value={minpunten} onChange={(e) => setMinpunten(e.target.value)} />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <label><input type="checkbox" checked={parking} onChange={(e) => setParking(e.target.checked)} /> Parking</label>
          <label><input type="checkbox" checked={tuin} onChange={(e) => setTuin(e.target.checked)} /> Tuin</label>
          <label><input type="checkbox" checked={terras} onChange={(e) => setTerras(e.target.checked)} /> Terras</label>
          <label><input type="checkbox" checked={lift} onChange={(e) => setLift(e.target.checked)} /> Lift</label>
          <label><input type="checkbox" checked={gemeubeld} onChange={(e) => setGemeubeld(e.target.checked)} /> Gemeubeld</label>
          <label><input type="checkbox" checked={dubbelGlas} onChange={(e) => setDubbelGlas(e.target.checked)} /> Dubbel glas</label>
        </div>

        <input type="file" onChange={handleImageUpload} />

        {image && (
          <img src={image} alt="" className="h-64 w-full rounded-xl object-cover" />
        )}

        <button onClick={handleAddProperty} className="rounded-xl bg-white p-4 font-bold text-black">
          Woning toevoegen
        </button>
      </div>
    </div>
  )
}