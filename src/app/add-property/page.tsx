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

  const inputClass =
    'rounded-xl border border-gray-700 bg-[#111] p-4 text-white placeholder-gray-500 outline-none'
  const textareaClass =
    'min-h-28 rounded-xl border border-gray-700 bg-[#111] p-4 text-white placeholder-gray-500 outline-none'

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    if (!file) return

    const fileName = `${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from('properties')
      .upload(fileName, file)

    if (error) {
      alert(`Upload fout: ${error.message}`)
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
      alert(`Database fout: ${error.message}`)
      console.log(error)
      return
    }

    window.location.href = '/properties'
  }

  return (
    <div className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="text-4xl font-bold md:text-5xl">
            Woning toevoegen 🏠
          </h1>

          <p className="mt-3 text-gray-400">
            Vul de gegevens van de woning zo volledig mogelijk in.
          </p>
        </div>

        <section className="rounded-3xl bg-[#0f0f0f] p-5 md:p-7">
          <h2 className="mb-4 text-2xl font-bold">Basisinformatie</h2>

          <div className="grid grid-cols-1 gap-4">
            <input className={inputClass} placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className={inputClass} placeholder="Prijs" value={price} onChange={(e) => setPrice(e.target.value)} />
            <input className={inputClass} placeholder="Stad" value={city} onChange={(e) => setCity(e.target.value)} />
            <textarea className="min-h-36 rounded-xl border border-gray-700 bg-[#111] p-4 text-white placeholder-gray-500 outline-none" placeholder="Beschrijving" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </section>

        <section className="rounded-3xl bg-[#0f0f0f] p-5 md:p-7">
          <h2 className="mb-4 text-2xl font-bold">Woningdetails</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input className={inputClass} placeholder="Aantal slaapkamers" value={slaapkamers} onChange={(e) => setSlaapkamers(e.target.value)} />
            <input className={inputClass} placeholder="Aantal badkamers" value={badkamers} onChange={(e) => setBadkamers(e.target.value)} />
            <input className={inputClass} placeholder="Bewoonbare oppervlakte (m²)" value={bewoonbareOppervlakte} onChange={(e) => setBewoonbareOppervlakte(e.target.value)} />
            <input className={inputClass} placeholder="Grondoppervlakte (m²)" value={grondoppervlakte} onChange={(e) => setGrondoppervlakte(e.target.value)} />
            <input className={inputClass} placeholder="Bouwjaar" value={bouwjaar} onChange={(e) => setBouwjaar(e.target.value)} />
            <input className={inputClass} placeholder="EPC-score" value={epc} onChange={(e) => setEpc(e.target.value)} />
            <input className={inputClass} placeholder="Type woning" value={woningType} onChange={(e) => setWoningType(e.target.value)} />
            <input className={inputClass} placeholder="Verwarmingstype" value={verwarmingstype} onChange={(e) => setVerwarmingstype(e.target.value)} />
          </div>
        </section>

        <section className="rounded-3xl bg-[#0f0f0f] p-5 md:p-7">
          <h2 className="mb-4 text-2xl font-bold">Voorzieningen</h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <label className="flex items-center gap-2"><input type="checkbox" checked={parking} onChange={(e) => setParking(e.target.checked)} />Parking</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={tuin} onChange={(e) => setTuin(e.target.checked)} />Tuin</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={terras} onChange={(e) => setTerras(e.target.checked)} />Terras</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={lift} onChange={(e) => setLift(e.target.checked)} />Lift</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={gemeubeld} onChange={(e) => setGemeubeld(e.target.checked)} />Gemeubeld</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={dubbelGlas} onChange={(e) => setDubbelGlas(e.target.checked)} />Dubbel glas</label>
          </div>
        </section>

        <section className="rounded-3xl bg-[#0f0f0f] p-5 md:p-7">
          <h2 className="mb-4 text-2xl font-bold">Beoordeling</h2>

          <div className="grid grid-cols-1 gap-4">
            <textarea className={textareaClass} placeholder="Pluspunten van de woning" value={pluspunten} onChange={(e) => setPluspunten(e.target.value)} />
            <textarea className={textareaClass} placeholder="Minpunten van de woning" value={minpunten} onChange={(e) => setMinpunten(e.target.value)} />
          </div>
        </section>

        <section className="rounded-3xl bg-[#0f0f0f] p-5 md:p-7">
          <h2 className="mb-4 text-2xl font-bold">Foto</h2>

          <input type="file" onChange={handleImageUpload} className="w-full rounded-xl border border-gray-700 bg-[#111] p-4 text-white" />

          {image && (
            <img src={image} alt="" className="mt-5 h-72 w-full rounded-2xl object-cover" />
          )}
        </section>

        <button onClick={handleAddProperty} className="rounded-2xl bg-white p-5 text-lg font-bold text-black transition hover:scale-[1.01]">
          Woning toevoegen
        </button>
      </div>
    </div>
  )
}