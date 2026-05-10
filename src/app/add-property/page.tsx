'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useJsApiLoader } from '@react-google-maps/api'

export default function AddPropertyPage() {
  const router = useRouter()

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')

  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)

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

  const [parking, setParking] = useState(false)
  const [tuin, setTuin] = useState(false)
  const [terras, setTerras] = useState(false)
  const [lift, setLift] = useState(false)
  const [gemeubeld, setGemeubeld] = useState(false)
  const [dubbelGlas, setDubbelGlas] = useState(false)

  const inputClass =
    'rounded-xl border border-gray-700 bg-[#111] p-4 text-white placeholder-gray-500 outline-none'

  function onlyNumbers(value: string) {
    return value.replace(/[^\d]/g, '')
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
      alert(`Upload fout: ${error.message}`)
      return
    }

    const { data } = supabase.storage
      .from('properties')
      .getPublicUrl(fileName)

    setImage(data.publicUrl)
  }

  async function getCoordinates() {
    if (!isLoaded) return

    const fullAddress = `${address}, ${city}, Belgium`

    const geocoder = new window.google.maps.Geocoder()

    geocoder.geocode(
      {
        address: fullAddress,
      },
      (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const location = results[0].geometry.location

          setLatitude(location.lat())
          setLongitude(location.lng())
        } else {
          console.log('Geocode fout:', status)
        }
      }
    )
  }

  async function handleAddProperty() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Je moet eerst inloggen')
      return
    }

    if (!title.trim()) {
      alert('Titel is verplicht')
      return
    }

    if (!price.trim()) {
      alert('Prijs is verplicht')
      return
    }

    if (!city.trim()) {
      alert('Stad is verplicht')
      return
    }

    if (!address.trim()) {
      alert('Adres is verplicht')
      return
    }

    if (!woningType.trim()) {
      alert('Type woning is verplicht')
      return
    }

    const { error } = await supabase
      .from('properties')
      .insert([
        {
          title: title.trim(),
          price: onlyNumbers(price),
          city: city.trim(),
          address: address.trim(),
          description: description.trim(),
          image,
          user_id: user.id,

          latitude,
          longitude,

          slaapkamers: onlyNumbers(slaapkamers),
          badkamers: onlyNumbers(badkamers),

          bewoonbare_oppervlakte:
            onlyNumbers(bewoonbareOppervlakte),

          grondoppervlakte:
            onlyNumbers(grondoppervlakte),

          bouwjaar: onlyNumbers(bouwjaar),

          epc: epc.trim().toUpperCase(),

          woning_type: woningType,

          verwarmingstype:
            verwarmingstype.trim(),

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

    router.push('/properties')
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

          <h2 className="mb-4 text-2xl font-bold">
            Basisinformatie
          </h2>

          <div className="grid grid-cols-1 gap-4">

            <input
              className={inputClass}
              placeholder="Titel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              className={inputClass}
              placeholder="Prijs"
              inputMode="numeric"
              value={price}
              onChange={(e) =>
                setPrice(onlyNumbers(e.target.value))
              }
            />

            <input
              className={inputClass}
              placeholder="Stad"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            <input
              className={inputClass}
              placeholder="Adres"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={getCoordinates}
            />

            <textarea
              className="min-h-36 rounded-xl border border-gray-700 bg-[#111] p-4 text-white placeholder-gray-500 outline-none"
              placeholder="Beschrijving"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />

          </div>

        </section>

        <section className="rounded-3xl bg-[#0f0f0f] p-5 md:p-7">

          <h2 className="mb-4 text-2xl font-bold">
            Woningdetails
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <input
              className={inputClass}
              placeholder="Aantal slaapkamers"
              inputMode="numeric"
              value={slaapkamers}
              onChange={(e) =>
                setSlaapkamers(
                  onlyNumbers(e.target.value)
                )
              }
            />

            <input
              className={inputClass}
              placeholder="Aantal badkamers"
              inputMode="numeric"
              value={badkamers}
              onChange={(e) =>
                setBadkamers(
                  onlyNumbers(e.target.value)
                )
              }
            />

            <input
              className={inputClass}
              placeholder="Bewoonbare oppervlakte (m²)"
              inputMode="numeric"
              value={bewoonbareOppervlakte}
              onChange={(e) =>
                setBewoonbareOppervlakte(
                  onlyNumbers(e.target.value)
                )
              }
            />

            <input
              className={inputClass}
              placeholder="Grondoppervlakte (m²)"
              inputMode="numeric"
              value={grondoppervlakte}
              onChange={(e) =>
                setGrondoppervlakte(
                  onlyNumbers(e.target.value)
                )
              }
            />

            <input
              className={inputClass}
              placeholder="Bouwjaar"
              inputMode="numeric"
              maxLength={4}
              value={bouwjaar}
              onChange={(e) =>
                setBouwjaar(
                  onlyNumbers(e.target.value).slice(0, 4)
                )
              }
            />

            <select
              className={inputClass}
              value={epc}
              onChange={(e) => setEpc(e.target.value)}
            >
              <option value="">EPC-score</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
            </select>

            <select
              className={inputClass}
              value={woningType}
              onChange={(e) =>
                setWoningType(e.target.value)
              }
            >
              <option value="">Type woning</option>

              <option value="Appartement">
                Appartement
              </option>

              <option value="Huis">
                Huis
              </option>

              <option value="Studio">
                Studio
              </option>

              <option value="Commercieel">
                Commercieel
              </option>

              <option value="Garage">
                Garage
              </option>

              <option value="Grond">
                Grond
              </option>

              <option value="Opbrengsteigendom">
                Opbrengsteigendom
              </option>

              <option value="Appartementsblok">
                Appartementsblok
              </option>

            </select>

            <select
              className={inputClass}
              value={verwarmingstype}
              onChange={(e) =>
                setVerwarmingstype(e.target.value)
              }
            >
              <option value="">
                Verwarmingstype
              </option>

              <option value="Gas">
                Gas
              </option>

              <option value="Elektrisch">
                Elektrisch
              </option>

              <option value="Warmtepomp">
                Warmtepomp
              </option>

              <option value="Mazout">
                Mazout
              </option>

              <option value="Vloerverwarming">
                Vloerverwarming
              </option>

              <option value="Niet opgegeven">
                Niet opgegeven
              </option>

            </select>

          </div>

        </section>

        <section className="rounded-3xl bg-[#0f0f0f] p-5 md:p-7">

          <h2 className="mb-4 text-2xl font-bold">
            Voorzieningen
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={parking}
                onChange={(e) =>
                  setParking(e.target.checked)
                }
              />
              Parking
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={tuin}
                onChange={(e) =>
                  setTuin(e.target.checked)
                }
              />
              Tuin
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={terras}
                onChange={(e) =>
                  setTerras(e.target.checked)
                }
              />
              Terras
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={lift}
                onChange={(e) =>
                  setLift(e.target.checked)
                }
              />
              Lift
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={gemeubeld}
                onChange={(e) =>
                  setGemeubeld(e.target.checked)
                }
              />
              Gemeubeld
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={dubbelGlas}
                onChange={(e) =>
                  setDubbelGlas(e.target.checked)
                }
              />
              Dubbel glas
            </label>

          </div>

        </section>

        <section className="rounded-3xl bg-[#0f0f0f] p-5 md:p-7">

          <h2 className="mb-4 text-2xl font-bold">
            Foto
          </h2>

          <input
            type="file"
            onChange={handleImageUpload}
            className="w-full rounded-xl border border-gray-700 bg-[#111] p-4 text-white"
          />

          {image && (
            <img
              src={image}
              alt=""
              className="mt-5 h-72 w-full rounded-2xl object-cover"
            />
          )}

        </section>

        <button
          onClick={handleAddProperty}
          className="rounded-2xl bg-white p-5 text-lg font-bold text-black transition hover:scale-[1.01]"
        >
          Woning toevoegen
        </button>

      </div>
    </div>
  )
}