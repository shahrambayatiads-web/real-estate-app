'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function FavoritesPage() {
  const router = useRouter()

  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [compareNotice, setCompareNotice] = useState('')
  const [compareSelection, setCompareSelection] = useState<any[]>([])

  useEffect(() => {
    localStorage.removeItem('selectedProperties')
    localStorage.removeItem('compareProperties')
    setCompareSelection([])
    getFavorites()
  }, [])

  async function getFavorites() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: favoriteRows, error: favoritesError } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', user.id)

    if (favoritesError) {
      console.log(favoritesError)
      setLoading(false)
      return
    }

    const propertyIds = favoriteRows.map((item) => item.property_id)

    if (propertyIds.length === 0) {
      setProperties([])
      setLoading(false)
      return
    }

    const { data: propertyData, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .in('id', propertyIds)

    if (propertiesError) {
      console.log(propertiesError)
    } else {
      setProperties(propertyData)
    }

    setLoading(false)
  }

  function addToCompare(property: any) {
    const alreadySelected = compareSelection.some(
      (item: any) => String(item.id) === String(property.id)
    )

    if (alreadySelected) {
      const filtered = compareSelection.filter(
        (item: any) => String(item.id) !== String(property.id)
      )

      setCompareSelection(filtered)
      localStorage.setItem('selectedProperties', JSON.stringify(filtered))
      localStorage.setItem('compareProperties', JSON.stringify(filtered))
      return
    }

    if (compareSelection.length >= 4) {
      setCompareNotice('Je kan maximaal 4 woningen vergelijken.')
      return
    }

    const nextSelection = [...compareSelection, property]

    setCompareSelection(nextSelection)
    localStorage.setItem('selectedProperties', JSON.stringify(nextSelection))
    localStorage.setItem('compareProperties', JSON.stringify(nextSelection))

    setCompareNotice('')
  }

  function goToCompare() {
    if (compareSelection.length < 2) {
      setCompareNotice('Selecteer minimaal 2 woningen om te vergelijken.')
      return
    }

    localStorage.setItem('selectedProperties', JSON.stringify(compareSelection))
    localStorage.setItem('compareProperties', JSON.stringify(compareSelection))

    router.push('/compare')
  }

  async function removeFavorite(propertyId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', propertyId)

    if (error) {
      console.log(error)
      alert('Kon favoriet niet verwijderen.')
      return
    }

    setProperties((current) => current.filter((property) => property.id !== propertyId))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f9fc] text-3xl font-black text-[#0B1F4D]">
        Laden...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#f6f9fc] px-6 py-14 text-[#111827] md:px-10">
      <div className="mx-auto mb-10 max-w-7xl">
        <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-blue-600">
          SlimWoning
        </p>
        <h1 className="text-4xl font-black tracking-[-0.04em] text-[#0B1F4D] md:text-6xl">
          Mijn favorieten
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
          Bekijk hier de panden die je hebt opgeslagen en vergelijk ze later opnieuw.
        </p>
        {compareNotice && (
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-bold text-blue-700">
            {compareNotice}
          </div>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-blue-100 bg-white p-8 shadow-xl shadow-slate-200/60">
          <h2 className="text-2xl font-black text-[#0B1F4D]">
            Nog geen favorieten
          </h2>
          <p className="mt-3 max-w-xl text-gray-600">
            Sla interessante panden op via het hartje zodat je ze hier makkelijk terugvindt.
          </p>
          <Link
            href="/properties"
            className="mt-6 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-800"
          >
            Woningen bekijken
          </Link>
        </div>
      ) : (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <div
              key={property.id}
              className="group relative overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-xl shadow-slate-200/70 transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <button
                type="button"
                onClick={() => removeFavorite(property.id)}
                className="absolute right-4 top-4 z-20 rounded-full bg-white px-4 py-2 text-xs font-black text-red-600 shadow-xl transition hover:bg-red-600 hover:text-white"
              >
                Verwijderen
              </button>

              <Link
                href={`/properties/${property.id}`}
                className="block text-[#111827] no-underline"
              >
                <div className="relative">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="h-52 w-full object-cover"
                  />
                </div>

                <div className="space-y-3 p-5 pb-20">
                  <div>
                    <h2 className="text-2xl font-black tracking-[-0.04em] text-[#0B1F4D]">
                      {property.title || 'Pand zonder titel'}
                    </h2>

                    <p className="mt-3 text-3xl font-black text-blue-700">
                      € {Number(property.price || 0).toLocaleString('nl-BE')}
                    </p>

                    <div className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                      {property.bewoonbare_oppervlakte
                        ? `± € ${Math.round(Number(property.price || 0) / Number(property.bewoonbare_oppervlakte)).toLocaleString('nl-BE')} / m² op basis van vraagprijs`
                        : 'Prijs per m² niet beschikbaar'}
                    </div>

                    <p className="mt-3 text-base font-medium text-gray-500">
                      {property.address ? `${property.address}, ${property.city || ''}` : property.city || 'Locatie niet opgegeven'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="rounded-full bg-[#f3f5ff] px-3 py-2 text-xs font-black text-blue-700">
                      {property.slaapkamers || '-'} slp.
                    </div>

                    <div className="rounded-full bg-[#f3f5ff] px-3 py-2 text-xs font-black text-blue-700">
                      {property.badkamers || '-'} badk.
                    </div>

                    <div className="rounded-full bg-[#f3f5ff] px-3 py-2 text-xs font-black text-blue-700">
                      {property.bewoonbare_oppervlakte || property.grondoppervlakte || '-'} m²
                    </div>

                    <EpcBadge value={property.epc} />
                  </div>

                </div>
              </Link>
              <div className="absolute bottom-5 left-5 right-5 grid grid-cols-2 gap-3">
                <Link
                  href={`/properties/${property.id}`}
                  className="flex items-center justify-center rounded-xl bg-[#07122F] py-3 text-sm font-black text-white no-underline transition hover:opacity-90"
                >
                  Bekijk
                </Link>

                <button
                  type="button"
                  onClick={() => addToCompare(property)}
                  className={`flex items-center justify-center rounded-xl py-3 text-sm font-black transition ${
                    compareSelection.some((item: any) => String(item.id) === String(property.id))
                      ? 'border border-blue-600 bg-blue-50 text-blue-700'
                      : 'border border-gray-300 bg-white text-[#0B1F4D] hover:bg-gray-50'
                  }`}
                >
                  {compareSelection.some((item: any) => String(item.id) === String(property.id))
                    ? 'Geselecteerd'
                    : 'Vergelijk'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {compareSelection.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex w-[92%] max-w-3xl -translate-x-1/2 items-center justify-between rounded-full bg-[#07122F] px-6 py-4 shadow-2xl">
          <p className="text-base font-black text-white">
            {compareSelection.length} woning{compareSelection.length > 1 ? 'en' : ''} geselecteerd
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCompareSelection([])
                localStorage.removeItem('selectedProperties')
                localStorage.removeItem('compareProperties')
              }}
              className="rounded-full bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/20"
            >
              Wissen
            </button>

            <button
              type="button"
              onClick={goToCompare}
              className="rounded-full bg-white px-6 py-3 text-sm font-black text-[#07122F] transition hover:opacity-90"
            >
              Vergelijk & PDF
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

function EpcBadge({ value }: { value: any }) {
  const epc = String(value || '').trim().toUpperCase()

  if (!epc) return null

  const colorClass =
    epc === 'A+'
      ? 'bg-green-700'
      : epc === 'A'
        ? 'bg-green-600'
        : epc === 'B'
          ? 'bg-lime-500'
          : epc === 'C'
            ? 'bg-yellow-400'
            : epc === 'D'
              ? 'bg-orange-400'
              : epc === 'E'
                ? 'bg-orange-500'
                : 'bg-red-600'

  return (
    <span className="inline-flex items-center overflow-hidden rounded-xl border border-[#0B1F4D] text-xs font-black text-white">
      <span className="bg-[#0B1F4D] px-3 py-2">
        EPC
      </span>
      <span className={`${colorClass} px-3 py-2`}>
        {epc}
      </span>
    </span>
  )
}