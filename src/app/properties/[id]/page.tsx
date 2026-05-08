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

  function yesNo(value: boolean | null) {
    if (value === true) return 'Ja'
    if (value === false) return 'Nee'
    return 'Niet opgegeven'
  }

  function InfoRow({ label, value }: { label: string; value: any }) {
    return (
      <div className="flex justify-between gap-4 border-b border-gray-800 py-3">
        <span className="text-gray-400">{label}</span>
        <span className="text-right font-bold">
          {value || 'Niet opgegeven'}
        </span>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-3xl text-white">
        Laden...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-5 py-8 text-white md:px-10">
      <Link
        href="/properties"
        className="mb-8 inline-block text-white no-underline"
      >
        ← Terug naar woningen
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <img
            src={property.image}
            alt={property.title}
            className="h-72 w-full rounded-3xl object-cover md:h-[480px]"
          />

          <div className="mt-8">
            <h1 className="text-4xl font-bold md:text-6xl">
              {property.title}
            </h1>

            <p className="mt-4 text-3xl font-bold">
              € {property.price}
            </p>

            <p className="mt-2 text-2xl text-gray-400">
              {property.city}
            </p>
          </div>

          <div className="mt-8 rounded-3xl bg-[#111] p-6">
            <h2 className="mb-4 text-2xl font-bold">
              Beschrijving
            </h2>

            <p className="leading-8 text-gray-300">
              {property.description || 'Geen beschrijving beschikbaar.'}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-[#111] p-6">
              <h2 className="mb-4 text-2xl font-bold">
                Pluspunten
              </h2>
              <p className="leading-8 text-gray-300">
                {property.pluspunten || 'Niet opgegeven'}
              </p>
            </div>

            <div className="rounded-3xl bg-[#111] p-6">
              <h2 className="mb-4 text-2xl font-bold">
                Minpunten
              </h2>
              <p className="leading-8 text-gray-300">
                {property.minpunten || 'Niet opgegeven'}
              </p>
            </div>
          </div>
        </div>

        <div className="h-fit rounded-3xl bg-[#111] p-6 lg:sticky lg:top-28">
          <h2 className="mb-5 text-2xl font-bold">
            Woningdetails
          </h2>

          <InfoRow label="Type woning" value={property.woning_type} />
          <InfoRow label="Slaapkamers" value={property.slaapkamers} />
          <InfoRow label="Badkamers" value={property.badkamers} />
          <InfoRow
            label="Bewoonbare oppervlakte"
            value={
              property.bewoonbare_oppervlakte
                ? `${property.bewoonbare_oppervlakte} m²`
                : ''
            }
          />
          <InfoRow
            label="Grondoppervlakte"
            value={
              property.grondoppervlakte
                ? `${property.grondoppervlakte} m²`
                : ''
            }
          />
          <InfoRow label="Bouwjaar" value={property.bouwjaar} />
          <InfoRow label="EPC" value={property.epc} />
          <InfoRow label="Verwarmingstype" value={property.verwarmingstype} />
          <InfoRow label="Parking" value={yesNo(property.parking)} />
          <InfoRow label="Tuin" value={yesNo(property.tuin)} />
          <InfoRow label="Terras" value={yesNo(property.terras)} />
          <InfoRow label="Lift" value={yesNo(property.lift)} />
          <InfoRow label="Gemeubeld" value={yesNo(property.gemeubeld)} />
          <InfoRow label="Dubbel glas" value={yesNo(property.dubbel_glas)} />

          <button className="mt-6 w-full rounded-2xl bg-white p-4 font-bold text-black">
            Vergelijk slim
          </button>

          {userId === property.user_id && (
            <div className="mt-4 grid grid-cols-1 gap-3">
              <Link href={`/edit-property/${property.id}`}>
                <button className="w-full rounded-2xl bg-gray-800 p-4 font-bold text-white">
                  Bewerken ✏️
                </button>
              </Link>

              <button
                onClick={handleDelete}
                className="w-full rounded-2xl bg-red-600 p-4 font-bold text-white"
              >
                Verwijderen 🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}