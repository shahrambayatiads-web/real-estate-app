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
      router.push('/properties')
    }
  }

  function yesNo(value: boolean | null) {
    if (value === true) return 'Ja'
    if (value === false) return 'Nee'
    return 'Niet opgegeven'
  }

  function formatPrice(value: any) {
    const number = Number(String(value || '').replace(/[^\d.]/g, '')) || 0

    if (!number) return '-'

    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(number)
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] text-2xl font-bold text-[#111827]">
        Laden...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-5 py-8 text-[#111827] md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/properties"
            className="rounded-2xl bg-white px-5 py-3 font-bold text-[#111827] shadow-sm"
          >
            ← Terug naar woningen
          </Link>

          <Link
            href="/properties"
            className="hidden rounded-2xl bg-blue-700 px-5 py-3 font-bold text-white md:block"
          >
            Vergelijk woningen
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl">
              <img
                src={property.image}
                alt={property.title}
                className="h-80 w-full object-cover md:h-[520px]"
              />
            </div>

            <div className="mt-8 rounded-[2rem] bg-white p-7 shadow-lg">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-blue-700">
                    {property.city || 'Locatie niet opgegeven'}
                  </p>

                  <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                    {property.title}
                  </h1>
                </div>

                <div className="rounded-2xl bg-[#eef2ff] px-5 py-4 text-right">
                  <p className="text-sm font-bold text-blue-700">
                    Vraagprijs
                  </p>

                  <p className="mt-1 text-3xl font-bold text-blue-700">
                    {formatPrice(property.price)}
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
                <QuickStat
                  label="Slaapkamers"
                  value={property.slaapkamers || '-'}
                />

                <QuickStat
                  label="Badkamers"
                  value={property.badkamers || '-'}
                />

                <QuickStat
                  label="Oppervlakte"
                  value={
                    property.bewoonbare_oppervlakte
                      ? `${property.bewoonbare_oppervlakte} m²`
                      : '-'
                  }
                />

                <QuickStat
                  label="EPC"
                  value={property.epc || '-'}
                />
              </div>
            </div>

            <SectionCard title="Beschrijving">
              <p className="leading-8 text-gray-600">
                {property.description || 'Geen beschrijving beschikbaar.'}
              </p>
            </SectionCard>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <SectionCard title="Pluspunten">
                <p className="leading-8 text-gray-600">
                  {property.pluspunten || 'Niet opgegeven'}
                </p>
              </SectionCard>

              <SectionCard title="Minpunten">
                <p className="leading-8 text-gray-600">
                  {property.minpunten || 'Niet opgegeven'}
                </p>
              </SectionCard>
            </div>
          </div>

          <div className="h-fit rounded-[2rem] bg-white p-6 shadow-xl lg:sticky lg:top-8">
            <h2 className="mb-5 text-2xl font-bold">
              Woningdetails
            </h2>

            <div className="space-y-1">
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
              <InfoRow label="Verwarming" value={property.verwarmingstype} />
              <InfoRow label="Parking" value={yesNo(property.parking)} />
              <InfoRow label="Tuin" value={yesNo(property.tuin)} />
              <InfoRow label="Terras" value={yesNo(property.terras)} />
              <InfoRow label="Lift" value={yesNo(property.lift)} />
              <InfoRow label="Gemeubeld" value={yesNo(property.gemeubeld)} />
              <InfoRow label="Dubbel glas" value={yesNo(property.dubbel_glas)} />
            </div>

            <Link
              href="/properties"
              className="mt-6 block w-full rounded-2xl bg-blue-700 p-4 text-center font-bold text-white transition hover:bg-blue-800"
            >
              Vergelijk met andere woningen
            </Link>

            {userId === property.user_id && (
              <div className="mt-4 grid grid-cols-1 gap-3">
                <Link href={`/edit-property/${property.id}`}>
                  <button className="w-full rounded-2xl bg-[#111827] p-4 font-bold text-white">
                    Bewerken
                  </button>
                </Link>

                <button
                  onClick={handleDelete}
                  className="w-full rounded-2xl bg-red-600 p-4 font-bold text-white"
                >
                  Verwijderen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-[#f6f8fb] p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mt-6 rounded-[2rem] bg-white p-7 shadow-lg">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      {children}
    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: any
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-bold">
        {value || 'Niet opgegeven'}
      </span>
    </div>
  )
}