'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useJsApiLoader } from '@react-google-maps/api'

export default function AddPropertyPage() {
  const router = useRouter()

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [city, setCity] = useState('')
  const [showCityOptions, setShowCityOptions] = useState(false)
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [makelaarLogo, setMakelaarLogo] = useState('')
  const [makelaarKantoornaam, setMakelaarKantoornaam] = useState('')
  const [makelaarWebsite, setMakelaarWebsite] = useState('')
  const [makelaarTelefoon, setMakelaarTelefoon] = useState('')
  const [makelaarEmail, setMakelaarEmail] = useState('')
  const [makelaarAdres, setMakelaarAdres] = useState('')
  const [premiumPartner, setPremiumPartner] = useState(false)
  const [isMakelaar, setIsMakelaar] = useState(false)

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

  const [beschermdErfgoed, setBeschermdErfgoed] = useState('')
  const [gevelbreedte, setGevelbreedte] = useState('')
  const [asbestcertificaat, setAsbestcertificaat] = useState('')
  const [primairEnergieverbruik, setPrimairEnergieverbruik] = useState('')
  const [renovatieverplichting, setRenovatieverplichting] = useState('')
  const [epcCode, setEpcCode] = useState('')
  const [co2Uitstoot, setCo2Uitstoot] = useState('')
  const [jaarlijksEnergieverbruik, setJaarlijksEnergieverbruik] = useState('')
  const [elektriciteitsattest, setElektriciteitsattest] = useState('')
  const [dagvaarding, setDagvaarding] = useState('')
  const [vlaamsMaatregelenregister, setVlaamsMaatregelenregister] = useState('')
  const [overstromingscertificaat, setOverstromingscertificaat] = useState('')
  const [warmtepomp, setWarmtepomp] = useState('')
  const [zonnepanelen, setZonnepanelen] = useState('')
  const [thermischeZonnepanelen, setThermischeZonnepanelen] = useState('')
  const [bouwvergunning, setBouwvergunning] = useState('')
  const [bebouwbareGrondoppervlakte, setBebouwbareGrondoppervlakte] = useState('')
  const [kadastraalPlan, setKadastraalPlan] = useState('')
  const [voorkeurrechtHuurder, setVoorkeurrechtHuurder] = useState('')
  const [bouwverplichting, setBouwverplichting] = useState('')
  const [verkavelingsvergunning, setVerkavelingsvergunning] = useState('')
  const [voorkooprecht, setVoorkooprecht] = useState('')
  const [stedenbouwkundigeBestemming, setStedenbouwkundigeBestemming] = useState('')
  const [overstromingZonetype, setOverstromingZonetype] = useState('')
  const [pScore, setPScore] = useState('')
  const [gScore, setGScore] = useState('')

  const [contactNaam, setContactNaam] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactTelefoon, setContactTelefoon] = useState('')
  const [contactBericht, setContactBericht] = useState('')
  const [bezoekMogelijk, setBezoekMogelijk] = useState('')
  const [showVisitOptions, setShowVisitOptions] = useState(false)
  const [beschikbareBezoekmomenten, setBeschikbareBezoekmomenten] = useState('')
  const [publicatiestatus, setPublicatiestatus] = useState('Concept')
  const [showPublicationOptions, setShowPublicationOptions] = useState(false)
  const [openSelect, setOpenSelect] = useState<string | null>(null)

  const inputClass =
    'rounded-xl border border-[#CBD5E1] bg-white p-4 text-[#071B4D] placeholder-gray-500 outline-none focus:border-[#071B4D] focus:ring-2 focus:ring-[#071B4D]/10'

  const selectClass = `${inputClass} h-[58px] appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23071B4D'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")] bg-[length:18px_18px] bg-[right_1rem_center] bg-no-repeat pr-12`

  const yesNoOptions = ['Ja', 'Nee', 'Niet gespecificeerd']
  const scoreOptions = ['A', 'B', 'C', 'D', 'Niet gespecificeerd']

  const publicationStatuses = ['Concept', 'Online', 'In optie', 'Verkocht']

  const belgianCities = [
    'Aalst',
    'Aarschot',
    'Antwerpen',
    'Arlon',
    'Asse',
    'Bastogne',
    'Beersel',
    'Beringen',
    'Beveren',
    'Bilzen',
    'Blankenberge',
    'Boom',
    'Brasschaat',
    'Brugge',
    'Brussel',
    'Charleroi',
    'Dendermonde',
    'Diest',
    'Dilbeek',
    'Dinant',
    'Drogenbos',
    'Edegem',
    'Evergem',
    'Genk',
    'Gent',
    'Geraardsbergen',
    'Halle',
    'Hasselt',
    'Herentals',
    'Hoboken',
    'Ieper',
    'Ixelles',
    'Jette',
    'Knokke-Heist',
    'Kortrijk',
    'La Louvière',
    'Leuven',
    'Lier',
    'Liège',
    'Lokeren',
    'Maasmechelen',
    'Malines',
    'Mechelen',
    'Menen',
    'Middelkerke',
    'Mol',
    'Mons',
    'Mortsel',
    'Namur',
    'Ninove',
    'Oostende',
    'Oudenaarde',
    'Roeselare',
    'Ronse',
    'Schaarbeek',
    'Sint-Niklaas',
    'Sint-Truiden',
    'Tienen',
    'Tongeren',
    'Torhout',
    'Turnhout',
    'Uccle',
    'Vilvoorde',
    'Wavre',
    'Wetteren',
    'Zaventem',
    'Zottegem',
  ]

  const filteredBelgianCities = belgianCities.filter((cityName) =>
    cityName.toLowerCase().includes(city.toLowerCase())
  )

  useEffect(() => {
    checkAccountType()
  }, [])

  async function checkAccountType() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const accountType =
      user?.user_metadata?.account_type ||
      user?.user_metadata?.role ||
      user?.app_metadata?.account_type ||
      user?.app_metadata?.role

    setIsMakelaar(accountType === 'makelaar')
  }

  function onlyNumbers(value: string) {
    return value.replace(/[^\d]/g, '')
  }

  function formatPrice(value: string) {
    const cleanValue = onlyNumbers(value)

    if (!cleanValue) {
      return '-'
    }

    return `${Number(cleanValue).toLocaleString('nl-BE')} €`
  }

  function renderSelectField({
    id,
    value,
    placeholder,
    options,
    onChange,
  }: {
    id: string
    value: string
    placeholder: string
    options: string[]
    onChange: (value: string) => void
  }) {
    const isOpen = openSelect === id

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenSelect(isOpen ? null : id)}
          onBlur={() => {
            window.setTimeout(() => setOpenSelect(null), 120)
          }}
          className={`${inputClass} flex h-[58px] w-full items-center justify-between text-left font-semibold ${
            value ? 'text-[#071B4D]' : 'text-gray-500'
          }`}
        >
          <span>{value || placeholder}</span>
          <span className="text-[#071B4D]">⌄</span>
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-64 overflow-y-auto rounded-2xl border border-[#CBD5E1] bg-white p-2 shadow-xl">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onMouseDown={() => {
                  onChange(option)
                  setOpenSelect(null)
                }}
                className={`block w-full rounded-xl px-4 py-3 text-left font-semibold transition hover:bg-[#EFF6FF] ${
                  value === option
                    ? 'bg-[#EFF6FF] text-[#071B4D]'
                    : 'text-[#071B4D]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const fileName = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('properties').upload(fileName, file)

    if (error) {
      alert(`Upload fout: ${error.message}`)
      return
    }

    const { data } = supabase.storage.from('properties').getPublicUrl(fileName)
    setImage(data.publicUrl)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const fileName = `logo-${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('properties').upload(fileName, file)

    if (error) {
      alert(`Logo upload fout: ${error.message}`)
      return
    }

    const { data } = supabase.storage.from('properties').getPublicUrl(fileName)
    setMakelaarLogo(data.publicUrl)
  }

  async function getCoordinates() {
    if (!isLoaded || !address.trim()) return

    const fullAddress = `${address}, ${city}, Belgium`
    const geocoder = new window.google.maps.Geocoder()

    geocoder.geocode({ address: fullAddress }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const location = results[0].geometry.location
        setLatitude(location.lat())
        setLongitude(location.lng())
      } else {
        console.log('Geocode fout:', status)
      }
    })
  }

  async function handleAddProperty() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Je moet eerst inloggen')
      router.push('/login')
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
      alert('Type vastgoed is verplicht')
      return
    }

    const { error } = await supabase.from('properties').insert([
      {
        title: title.trim(),
        price: onlyNumbers(price),
        city: city.trim(),
        address: address.trim(),
        description: description.trim(),
        image,
        makelaar_logo: isMakelaar ? makelaarLogo : null,
        makelaar_kantoornaam: isMakelaar ? makelaarKantoornaam.trim() : null,
        makelaar_website: isMakelaar ? makelaarWebsite.trim() : null,
        makelaar_telefoon: isMakelaar ? makelaarTelefoon.trim() : null,
        makelaar_email: isMakelaar ? makelaarEmail.trim() : null,
        makelaar_adres: isMakelaar ? makelaarAdres.trim() : null,
        premium_partner: isMakelaar ? premiumPartner : false,
        user_id: user.id,
        latitude,
        longitude,
        slaapkamers: onlyNumbers(slaapkamers),
        badkamers: onlyNumbers(badkamers),
        bewoonbare_oppervlakte: onlyNumbers(bewoonbareOppervlakte),
        grondoppervlakte: onlyNumbers(grondoppervlakte),
        bouwjaar: onlyNumbers(bouwjaar),
        epc: epc.trim().toUpperCase(),
        woning_type: woningType,
        verwarmingstype: verwarmingstype.trim(),
        parking,
        tuin,
        terras,
        lift,
        gemeubeld,
        dubbel_glas: dubbelGlas,
        beschermd_erfgoed: beschermdErfgoed,
        gevelbreedte: onlyNumbers(gevelbreedte),
        asbestcertificaat,
        primair_energieverbruik: onlyNumbers(primairEnergieverbruik),
        renovatieverplichting,
        epc_code: epcCode.trim(),
        co2_uitstoot: co2Uitstoot.trim(),
        jaarlijks_energieverbruik: jaarlijksEnergieverbruik.trim(),
        elektriciteitsattest,
        dagvaarding,
        vlaams_maatregelenregister: vlaamsMaatregelenregister,
        overstromingscertificaat,
        warmtepomp,
        zonnepanelen,
        thermische_zonnepanelen: thermischeZonnepanelen,
        bouwvergunning,
        bebouwbare_grondoppervlakte: onlyNumbers(bebouwbareGrondoppervlakte),
        kadastraal_plan: kadastraalPlan,
        voorkeurrecht_huurder: voorkeurrechtHuurder,
        bouwverplichting,
        verkavelingsvergunning,
        voorkooprecht,
        stedenbouwkundige_bestemming: stedenbouwkundigeBestemming,
        overstroming_zonetype: overstromingZonetype,
        p_score: pScore,
        g_score: gScore,
        contact_naam: contactNaam.trim(),
        contact_email: contactEmail.trim(),
        contact_telefoon: contactTelefoon.trim(),
        contact_bericht: contactBericht.trim(),
        bezoek_mogelijk: bezoekMogelijk,
        beschikbare_bezoekmomenten: beschikbareBezoekmomenten.trim(),
        publicatiestatus,
      },
    ])

    if (error) {
      alert(`Database fout: ${error.message}`)
      console.log(error)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white px-5 py-10 text-[#071B4D]">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="text-4xl font-bold md:text-5xl">
            Vastgoed toevoegen
          </h1>

          <p className="mt-3 text-gray-500">
            Vul de gegevens van het vastgoed zo volledig mogelijk in.
          </p>
        </div>

        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm md:p-7">
          <h2 className="mb-4 text-2xl font-bold">Basisinformatie</h2>

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
              onChange={(e) => setPrice(onlyNumbers(e.target.value))}
            />

            <div className="relative">
              <input
                className={`${inputClass} w-full pr-12`}
                placeholder="Stad"
                value={city}
                onFocus={() => setShowCityOptions(true)}
                onChange={(e) => {
                  setCity(e.target.value)
                  setShowCityOptions(true)
                }}
                onBlur={() => {
                  window.setTimeout(() => setShowCityOptions(false), 120)
                }}
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#071B4D]">
               ⌄
              </span>

              {showCityOptions && filteredBelgianCities.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-64 overflow-y-auto rounded-2xl border border-[#CBD5E1] bg-white p-2 shadow-xl">
                  {filteredBelgianCities.map((cityName) => (
                    <button
                      key={cityName}
                      type="button"
                      onMouseDown={() => {
                        setCity(cityName)
                        setShowCityOptions(false)
                      }}
                      className="block w-full rounded-xl px-4 py-3 text-left font-semibold text-[#071B4D] transition hover:bg-[#EFF6FF]"
                    >
                      {cityName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              className={inputClass}
              placeholder="Adres"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={getCoordinates}
            />

            <textarea
              className="min-h-36 rounded-xl border border-[#CBD5E1] bg-white p-4 text-[#071B4D] placeholder-gray-500 outline-none focus:border-[#071B4D] focus:ring-2 focus:ring-[#071B4D]/10"
              placeholder="Beschrijving"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm md:p-7">
          <h2 className="mb-4 text-2xl font-bold">Vastgoeddetails</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              className={inputClass}
              placeholder="Aantal slaapkamers"
              inputMode="numeric"
              value={slaapkamers}
              onChange={(e) => setSlaapkamers(onlyNumbers(e.target.value))}
            />

            <input
              className={inputClass}
              placeholder="Aantal badkamers"
              inputMode="numeric"
              value={badkamers}
              onChange={(e) => setBadkamers(onlyNumbers(e.target.value))}
            />

            <input
              className={inputClass}
              placeholder="Bewoonbare oppervlakte (m²)"
              inputMode="numeric"
              value={bewoonbareOppervlakte}
              onChange={(e) => setBewoonbareOppervlakte(onlyNumbers(e.target.value))}
            />

            <input
              className={inputClass}
              placeholder="Grondoppervlakte (m²)"
              inputMode="numeric"
              value={grondoppervlakte}
              onChange={(e) => setGrondoppervlakte(onlyNumbers(e.target.value))}
            />

            <input
              className={inputClass}
              placeholder="Bouwjaar"
              inputMode="numeric"
              maxLength={4}
              value={bouwjaar}
              onChange={(e) => setBouwjaar(onlyNumbers(e.target.value).slice(0, 4))}
            />

            {renderSelectField({
              id: 'epc',
              value: epc,
              placeholder: 'Energielabel',
              options: ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
              onChange: setEpc,
            })}

            {renderSelectField({
              id: 'woningType',
              value: woningType,
              placeholder: 'Type vastgoed',
              options: ['Appartement', 'Huis', 'Studio', 'Commercieel', 'Garage', 'Grond', 'Opbrengsteigendom', 'Appartementsblok'],
              onChange: setWoningType,
            })}

            {renderSelectField({
              id: 'verwarmingstype',
              value: verwarmingstype,
              placeholder: 'Verwarmingstype',
              options: ['Gas', 'Elektrisch', 'Warmtepomp', 'Mazout', 'Vloerverwarming', 'Niet opgegeven'],
              onChange: setVerwarmingstype,
            })}
          </div>
        </section>

        {isMakelaar && (
        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm md:p-7">
          <h2 className="mb-4 text-2xl font-bold">Makelaar branding</h2>

          <p className="text-sm text-gray-500">
            Upload een makelaar logo dat zichtbaar wordt op de vastgoedkaart.
          </p>

          <input
            type="file"
            onChange={handleLogoUpload}
            className="mt-5 w-full rounded-xl border border-[#CBD5E1] bg-white p-4 text-[#071B4D]"
          />

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              className={inputClass}
              placeholder="Kantoornaam"
              value={makelaarKantoornaam}
              onChange={(e) => setMakelaarKantoornaam(e.target.value)}
            />

            <input
              className={inputClass}
              placeholder="Website"
              value={makelaarWebsite}
              onChange={(e) => setMakelaarWebsite(e.target.value)}
            />

            <input
              className={inputClass}
              placeholder="Telefoon kantoor"
              value={makelaarTelefoon}
              onChange={(e) => setMakelaarTelefoon(e.target.value)}
            />

            <input
              className={inputClass}
              placeholder="E-mail kantoor"
              type="email"
              value={makelaarEmail}
              onChange={(e) => setMakelaarEmail(e.target.value)}
            />

            <textarea
              className="min-h-28 rounded-xl border border-[#CBD5E1] bg-white p-4 text-[#071B4D] placeholder-gray-500 outline-none focus:border-[#071B4D] focus:ring-2 focus:ring-[#071B4D]/10 md:col-span-2"
              placeholder="Kantooradres"
              value={makelaarAdres}
              onChange={(e) => setMakelaarAdres(e.target.value)}
            />
          </div>

          {makelaarLogo && (
            <div className="mt-5 inline-flex overflow-hidden rounded-xl bg-white shadow-lg">
              {premiumPartner && (
                <div className="flex items-center bg-sky-500 px-3 text-xs font-black text-white">
                  Premium partner
                </div>
              )}

              <img
                src={makelaarLogo}
                alt="Makelaar logo"
                className="h-16 max-w-[180px] bg-white px-4 py-3 object-contain"
              />
            </div>
          )}

          <label className="mt-5 flex items-center gap-3 text-sm font-medium text-[#071B4D]">
            <input
              type="checkbox"
              checked={premiumPartner}
              onChange={(e) => setPremiumPartner(e.target.checked)}
            />
            Makelaar zichtbaar als premium partner
          </label>
        </section>
        )}

        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm md:p-7">
          <h2 className="mb-4 text-2xl font-bold">Vastgoedfoto's</h2>

          <p className="mb-5 text-sm text-gray-500">
            Upload duidelijke foto’s van het vastgoed. Deze foto’s zijn zichtbaar voor geïnteresseerde kopers.
          </p>

          <input
            type="file"
            onChange={handleImageUpload}
            className="w-full rounded-xl border border-[#CBD5E1] bg-white p-4 text-[#071B4D]"
          />

          {image && (
            <img
              src={image}
              alt="Vastgoed preview"
              className="mt-5 h-72 w-full rounded-2xl object-cover"
            />
          )}
        </section>

        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm md:p-7">
          <h2 className="mb-4 text-2xl font-bold">Voorzieningen</h2>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              ['Parking', parking, setParking],
              ['Tuin', tuin, setTuin],
              ['Terras', terras, setTerras],
              ['Lift', lift, setLift],
              ['Gemeubeld', gemeubeld, setGemeubeld],
              ['Dubbel glas', dubbelGlas, setDubbelGlas],
            ].map(([label, checked, setter]) => (
              <label key={label as string} className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 font-medium">
                <input
                  type="checkbox"
                  checked={checked as boolean}
                  onChange={(e) => (setter as React.Dispatch<React.SetStateAction<boolean>>)(e.target.checked)}
                />
                {label as string}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm md:p-7">
          <h2 className="mb-4 text-2xl font-bold">Algemeen</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {renderSelectField({
              id: 'beschermdErfgoed',
              value: beschermdErfgoed,
              placeholder: 'Beschermd erfgoed',
              options: yesNoOptions,
              onChange: setBeschermdErfgoed,
            })}

            <input
              className={inputClass}
              placeholder="Gevelbreedte aan de straatkant (m)"
              inputMode="numeric"
              value={gevelbreedte}
              onChange={(e) => setGevelbreedte(onlyNumbers(e.target.value))}
            />

            {renderSelectField({
              id: 'asbestcertificaat',
              value: asbestcertificaat,
              placeholder: 'Asbestcertificaat beschikbaar',
              options: yesNoOptions,
              onChange: setAsbestcertificaat,
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm md:p-7">
          <h2 className="mb-4 text-2xl font-bold">Energie</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              className={inputClass}
              placeholder="Primair energieverbruik (kWh/m²)"
              inputMode="numeric"
              value={primairEnergieverbruik}
              onChange={(e) => setPrimairEnergieverbruik(onlyNumbers(e.target.value))}
            />

            <input
              className={inputClass}
              placeholder="Unieke code EPC/EPB"
              value={epcCode}
              onChange={(e) => setEpcCode(e.target.value)}
            />

            {renderSelectField({
              id: 'renovatieverplichting',
              value: renovatieverplichting,
              placeholder: 'Verplicht renovatiewerken uit te voeren',
              options: yesNoOptions,
              onChange: setRenovatieverplichting,
            })}

            <input
              className={inputClass}
              placeholder="CO₂ uitstoot"
              value={co2Uitstoot}
              onChange={(e) => setCo2Uitstoot(e.target.value)}
            />

            <input
              className={inputClass}
              placeholder="Jaarlijks theoretisch totaal energieverbruik"
              value={jaarlijksEnergieverbruik}
              onChange={(e) => setJaarlijksEnergieverbruik(e.target.value)}
            />

            {renderSelectField({
              id: 'elektriciteitsattest',
              value: elektriciteitsattest,
              placeholder: 'Geldig keuringsattest elektriciteit',
              options: yesNoOptions,
              onChange: setElektriciteitsattest,
            })}

            {renderSelectField({
              id: 'dagvaarding',
              value: dagvaarding,
              placeholder: 'Dagvaarding / herstelmaatregel opgelegd',
              options: yesNoOptions,
              onChange: setDagvaarding,
            })}

            {renderSelectField({
              id: 'vlaamsMaatregelenregister',
              value: vlaamsMaatregelenregister,
              placeholder: 'Vlaamse maatregelenregister geraadpleegd',
              options: yesNoOptions,
              onChange: setVlaamsMaatregelenregister,
            })}

            {renderSelectField({
              id: 'overstromingscertificaat',
              value: overstromingscertificaat,
              placeholder: 'Geldig overstromingscertificaat',
              options: yesNoOptions,
              onChange: setOverstromingscertificaat,
            })}

            {renderSelectField({
              id: 'warmtepomp',
              value: warmtepomp,
              placeholder: 'Warmtepomp',
              options: yesNoOptions,
              onChange: setWarmtepomp,
            })}

            {renderSelectField({
              id: 'zonnepanelen',
              value: zonnepanelen,
              placeholder: 'Fotovoltaïsche zonnepanelen',
              options: yesNoOptions,
              onChange: setZonnepanelen,
            })}

            {renderSelectField({
              id: 'thermischeZonnepanelen',
              value: thermischeZonnepanelen,
              placeholder: 'Thermische zonnepanelen',
              options: yesNoOptions,
              onChange: setThermischeZonnepanelen,
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm md:p-7">
          <h2 className="mb-4 text-2xl font-bold">Stedenbouw en risico's</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {renderSelectField({
              id: 'bouwvergunning',
              value: bouwvergunning,
              placeholder: 'Bouwvergunning',
              options: yesNoOptions,
              onChange: setBouwvergunning,
            })}

            <input
              className={inputClass}
              placeholder="Totale bebouwbare grondoppervlakte (m²)"
              inputMode="numeric"
              value={bebouwbareGrondoppervlakte}
              onChange={(e) => setBebouwbareGrondoppervlakte(onlyNumbers(e.target.value))}
            />

            {renderSelectField({
              id: 'kadastraalPlan',
              value: kadastraalPlan,
              placeholder: 'Kadastraal plan',
              options: yesNoOptions,
              onChange: setKadastraalPlan,
            })}

            {renderSelectField({
              id: 'voorkeurrechtHuurder',
              value: voorkeurrechtHuurder,
              placeholder: 'Voorkeurrecht voor de huurder',
              options: yesNoOptions,
              onChange: setVoorkeurrechtHuurder,
            })}

            {renderSelectField({
              id: 'bouwverplichting',
              value: bouwverplichting,
              placeholder: 'Bouwverplichting',
              options: yesNoOptions,
              onChange: setBouwverplichting,
            })}

            {renderSelectField({
              id: 'verkavelingsvergunning',
              value: verkavelingsvergunning,
              placeholder: 'Verkavelingsvergunning',
              options: yesNoOptions,
              onChange: setVerkavelingsvergunning,
            })}

            {renderSelectField({
              id: 'voorkooprecht',
              value: voorkooprecht,
              placeholder: 'Voorkooprecht',
              options: yesNoOptions,
              onChange: setVoorkooprecht,
            })}

            <input
              className={inputClass}
              placeholder="Meest recente stedenbouwkundige bestemming"
              value={stedenbouwkundigeBestemming}
              onChange={(e) => setStedenbouwkundigeBestemming(e.target.value)}
            />

            <input
              className={inputClass}
              placeholder="Overstroming zonetype"
              value={overstromingZonetype}
              onChange={(e) => setOverstromingZonetype(e.target.value)}
            />

            {renderSelectField({
              id: 'pScore',
              value: pScore,
              placeholder: 'P-score',
              options: scoreOptions,
              onChange: setPScore,
            })}

            {renderSelectField({
              id: 'gScore',
              value: gScore,
              placeholder: 'G-score',
              options: scoreOptions,
              onChange: setGScore,
            })}
          </div>
        </section>

        {/* Contactgegevens en Publicatie */}
        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm md:p-7">
          <h2 className="mb-4 text-2xl font-bold">Contactgegevens</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              className={inputClass}
              placeholder="Naam contactpersoon"
              value={contactNaam}
              onChange={(e) => setContactNaam(e.target.value)}
            />

            <input
              className={inputClass}
              placeholder="E-mailadres"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />

            <input
              className={inputClass}
              placeholder="Telefoonnummer"
              value={contactTelefoon}
              onChange={(e) => setContactTelefoon(e.target.value)}
            />

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowVisitOptions((current) => !current)}
                onBlur={() => {
                  window.setTimeout(() => setShowVisitOptions(false), 120)
                }}
                className={`${inputClass} flex h-[58px] w-full items-center justify-between text-left font-semibold`}
              >
                <span>{bezoekMogelijk || 'Bezoek mogelijk op afspraak'}</span>
                <span className="text-[#071B4D]">⌄</span>
              </button>

              {showVisitOptions && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-2xl border border-[#CBD5E1] bg-white p-2 shadow-xl">
                  {yesNoOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onMouseDown={() => {
                        setBezoekMogelijk(option)
                        setShowVisitOptions(false)
                      }}
                      className={`block w-full rounded-xl px-4 py-3 text-left font-semibold transition hover:bg-[#EFF6FF] ${
                        bezoekMogelijk === option
                          ? 'bg-[#EFF6FF] text-[#071B4D]'
                          : 'text-[#071B4D]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              className={`${inputClass} md:col-span-2`}
              placeholder="Beschikbare bezoekmomenten"
              value={beschikbareBezoekmomenten}
              onChange={(e) => setBeschikbareBezoekmomenten(e.target.value)}
            />

            <textarea
              className="min-h-32 rounded-xl border border-[#CBD5E1] bg-white p-4 text-[#071B4D] placeholder-gray-500 outline-none focus:border-[#071B4D] focus:ring-2 focus:ring-[#071B4D]/10 md:col-span-2"
              placeholder="Extra bericht voor geïnteresseerden"
              value={contactBericht}
              onChange={(e) => setContactBericht(e.target.value)}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm md:p-7">
          <h2 className="mb-4 text-2xl font-bold">Publicatie</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPublicationOptions((current) => !current)}
                onBlur={() => {
                  window.setTimeout(() => setShowPublicationOptions(false), 120)
                }}
                className={`${inputClass} flex h-[58px] w-full items-center justify-between text-left font-semibold`}
              >
                <span>{publicatiestatus}</span>
                <span className="text-[#071B4D]">⌄</span>
              </button>

              {showPublicationOptions && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-2xl border border-[#CBD5E1] bg-white p-2 shadow-xl">
                  {publicationStatuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onMouseDown={() => {
                        setPublicatiestatus(status)
                        setShowPublicationOptions(false)
                      }}
                      className={`block w-full rounded-xl px-4 py-3 text-left font-semibold transition hover:bg-[#EFF6FF] ${
                        publicatiestatus === status
                          ? 'bg-[#EFF6FF] text-[#071B4D]'
                          : 'text-[#071B4D]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm md:p-7">
          <h2 className="mb-4 text-2xl font-bold">Financieel</h2>

          <p className="text-lg text-gray-500">
            Vraagprijs exclusief notariskosten (excl. eventuele registratiekosten)
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-sm font-semibold text-gray-500">Prijs</p>
              <p className="mt-1 text-2xl font-black text-[#071B4D]">
                {formatPrice(price)}
              </p>
            </div>
          </div>
        </section>

        <button
          onClick={handleAddProperty}
          className="rounded-2xl bg-[#071B4D] p-5 text-lg font-bold text-white transition hover:scale-[1.01] hover:opacity-90"
        >
          Vastgoed toevoegen
        </button>
      </div>
    </div>
  )
}