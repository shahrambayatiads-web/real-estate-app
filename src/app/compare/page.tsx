'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import jsPDF from 'jspdf'
import { supabase } from '@/lib/supabase'

export default function ComparePage() {
  const searchParams = useSearchParams()

  const ids = useMemo(
    () => searchParams.get('ids')?.split(',').filter(Boolean) || [],
    [searchParams]
  )

  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProperties()
  }, [])

  async function getProperties() {
    if (ids.length === 0) {
      setProperties([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('id', ids)

    if (error) {
      console.log(error)
      setLoading(false)
      return
    }

    setProperties(data || [])
    setLoading(false)
  }

  async function downloadPDF() {
    const pdf = new jsPDF()
    let y = 20

    pdf.setFontSize(20)
    pdf.text('SlimWoning - Vergelijkingsrapport', 20, y)

    y += 12
    pdf.setFontSize(11)
    pdf.text(`Aantal woningen: ${properties.length}`, 20, y)

    properties.forEach((property, index) => {
      y += 16

      if (y > 270) {
        pdf.addPage()
        y = 20
      }

      pdf.setFontSize(15)
      pdf.text(`${index + 1}. ${property.title || '-'}`, 20, y)

      y += 9
      pdf.setFontSize(11)

      const lines = [
        `Prijs: ${formatPrice(property.price)}`,
        `Stad: ${property.city || '-'}`,
        `Slaapkamers: ${property.slaapkamers || '-'}`,
        `Badkamers: ${property.badkamers || '-'}`,
        `Bewoonbare oppervlakte: ${property.bewoonbare_oppervlakte || '-'} m²`,
        `Grondoppervlakte: ${property.grondoppervlakte || '-'} m²`,
        `Bouwjaar: ${property.bouwjaar || '-'}`,
        `EPC: ${property.epc || '-'}`,
        `Type woning: ${property.woning_type || '-'}`,
        `Verwarming: ${property.verwarmingstype || '-'}`,
        `Pluspunten: ${property.pluspunten || '-'}`,
        `Minpunten: ${property.minpunten || '-'}`,
      ]

      lines.forEach((line) => {
        if (y > 280) {
          pdf.addPage()
          y = 20
        }

        const wrapped = pdf.splitTextToSize(line, 170)
        pdf.text(wrapped, 20, y)
        y += wrapped.length * 6
      })
    })

    pdf.save('slimwoning-vergelijkingsrapport.pdf')
  }

  function numberValue(value: any) {
    return Number(String(value || '').replace(/[^\d.]/g, '')) || 0
  }

  function formatPrice(value: any) {
    const number = numberValue(value)

    if (!number) return '-'

    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(number)
  }

  function scoreRuimte(property: any) {
    const oppervlakte = numberValue(property.bewoonbare_oppervlakte)
    const slaapkamers = numberValue(property.slaapkamers)

    return Math.min(100, Math.round(oppervlakte / 2 + slaapkamers * 8))
  }

  function scoreComfort(property: any) {
    return Math.min(
      100,
      (property.parking ? 18 : 0) +
        (property.tuin ? 18 : 0) +
        (property.terras ? 16 : 0) +
        (property.lift ? 14 : 0) +
        (property.gemeubeld ? 12 : 0) +
        (property.dubbel_glas ? 22 : 0)
    )
  }

  function scoreVoorzieningen(property: any) {
    return Math.min(
      100,
      (property.parking ? 20 : 0) +
        (property.tuin ? 20 : 0) +
        (property.terras ? 20 : 0) +
        (property.lift ? 15 : 0) +
        (property.gemeubeld ? 10 : 0) +
        (property.dubbel_glas ? 15 : 0)
    )
  }

  function scoreEnergie(property: any) {
    const epc = String(property.epc || '').toUpperCase()

    if (epc.includes('A')) return 95
    if (epc.includes('B')) return 82
    if (epc.includes('C')) return 68
    if (epc.includes('D')) return 52
    if (epc.includes('E')) return 38
    if (epc.includes('F')) return 25

    return property.dubbel_glas ? 70 : 50
  }

  const lowestPrice = properties.reduce((best, item) => {
    if (!best) return item
    return numberValue(item.price) < numberValue(best.price) ? item : best
  }, null)

  const largestSurface = properties.reduce((best, item) => {
    if (!best) return item
    return numberValue(item.bewoonbare_oppervlakte) >
      numberValue(best.bewoonbare_oppervlakte)
      ? item
      : best
  }, null)

  const mostFeatures = properties.reduce((best, item) => {
    if (!best) return item
    return scoreVoorzieningen(item) > scoreVoorzieningen(best) ? item : best
  }, null)

  if (ids.length === 0) {
    return (
      <div className="min-h-screen bg-black px-5 py-10 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl bg-[#111] p-8 text-center">
          <h1 className="text-3xl font-bold">Geen woningen geselecteerd</h1>
          <p className="mt-3 text-gray-400">
            Selecteer eerst minimaal twee woningen om een vergelijking te maken.
          </p>
          <Link href="/properties" className="mt-6 inline-block rounded-xl bg-white px-5 py-3 font-bold text-black">
            Naar woningen
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Laden...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.25em] text-gray-500">
              SlimWoning
            </p>
            <h1 className="text-4xl font-bold md:text-5xl">
              Vergelijkingsrapport
            </h1>
            <p className="mt-3 max-w-3xl text-gray-400">
              Vergelijk woningen op basis van prijs, woonoppervlakte,
              voorzieningen, energieprestaties en algemene kenmerken.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadPDF}
              className="rounded-xl border border-gray-700 px-5 py-3 font-bold text-white transition hover:bg-[#1a1a1a]"
            >
              Download PDF
            </button>

            <Link href="/properties" className="rounded-xl bg-white px-5 py-3 font-bold text-black">
              Terug naar woningen
            </Link>
          </div>
        </div>

        <section className="mb-10 rounded-3xl border border-gray-800 bg-[#111] p-6 md:p-8">
          <h2 className="text-3xl font-bold">Kernverschillen</h2>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <InfoCard label="Laagste prijs" title={lowestPrice?.title} text="Deze woning heeft binnen deze vergelijking de laagste aankoopprijs." />
            <InfoCard label="Grootste woonoppervlakte" title={largestSurface?.title} text="Deze woning beschikt over de grootste opgegeven bewoonbare oppervlakte." />
            <InfoCard label="Meeste voorzieningen" title={mostFeatures?.title} text="Deze woning bevat het hoogste aantal voorzieningen binnen de vergelijking." />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {properties.map((property) => (
              <div key={property.id} className="rounded-2xl border border-gray-800 bg-black p-5">
                <h3 className="text-xl font-bold">{property.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{property.city}</p>

                <div className="mt-5 space-y-4">
                  <ScoreBar label="Ruimtescore" score={scoreRuimte(property)} />
                  <ScoreBar label="Comfortscore" score={scoreComfort(property)} />
                  <ScoreBar label="Voorzieningen" score={scoreVoorzieningen(property)} />
                  <ScoreBar label="Energie" score={scoreEnergie(property)} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-black p-6 leading-8 text-gray-300">
            <h3 className="mb-5 text-2xl font-bold text-white">Samenvatting</h3>
            <p>
              Binnen deze vergelijking valt vooral het verschil op tussen prijs,
              woonoppervlakte en aanwezige voorzieningen.
            </p>
            <p className="mt-5">
              <strong>{lowestPrice?.title}</strong> heeft de laagste aankoopprijs,
              terwijl <strong>{largestSurface?.title}</strong> de grootste woonoppervlakte biedt.
            </p>
            <p className="mt-5">
              De visuele scores hierboven geven een indicatie van ruimte, comfort,
              energieprestaties en voorzieningen op basis van de ingevoerde gegevens.
            </p>
          </div>
        </section>

        <section className="mb-10 rounded-3xl border border-gray-800 bg-[#111] p-6 md:p-8">
          <h2 className="mb-6 text-3xl font-bold">Vergelijkingstabel</h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="p-4 text-gray-400">Kenmerk</th>
                  {properties.map((property) => (
                    <th key={property.id} className="p-4 text-white">
                      {property.title}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <CompareRow label="Prijs" values={properties.map((p) => formatPrice(p.price))} />
                <CompareRow label="Stad" values={properties.map((p) => p.city || '-')} />
                <CompareRow label="Slaapkamers" values={properties.map((p) => p.slaapkamers || '-')} />
                <CompareRow label="Badkamers" values={properties.map((p) => p.badkamers || '-')} />
                <CompareRow label="Bewoonbare oppervlakte" values={properties.map((p) => p.bewoonbare_oppervlakte ? `${p.bewoonbare_oppervlakte} m²` : '-')} />
                <CompareRow label="Grondoppervlakte" values={properties.map((p) => p.grondoppervlakte ? `${p.grondoppervlakte} m²` : '-')} />
                <CompareRow label="Bouwjaar" values={properties.map((p) => p.bouwjaar || '-')} />
                <CompareRow label="EPC" values={properties.map((p) => p.epc || '-')} />
                <CompareRow label="Type woning" values={properties.map((p) => p.woning_type || '-')} />
                <CompareRow label="Verwarming" values={properties.map((p) => p.verwarmingstype || '-')} />
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-x-auto">
          <div
            className="grid min-w-[900px] gap-5"
            style={{
              gridTemplateColumns: `repeat(${properties.length}, minmax(280px, 1fr))`,
            }}
          >
            {properties.map((property) => (
              <div key={property.id} className="rounded-3xl bg-[#111] p-5">
                <img src={property.image} alt={property.title} className="h-56 w-full rounded-2xl object-cover" />
                <h2 className="mt-5 text-3xl font-bold">{property.title}</h2>
                <p className="mt-2 text-2xl font-semibold">{formatPrice(property.price)}</p>
                <p className="text-gray-400">{property.city}</p>

                <div className="mt-6 space-y-4">
                  <Detail label="Pluspunten" value={property.pluspunten || '-'} />
                  <Detail label="Minpunten" value={property.minpunten || '-'} />

                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-sm text-gray-400">Voorzieningen</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {property.parking && <Badge text="Parking" />}
                      {property.tuin && <Badge text="Tuin" />}
                      {property.terras && <Badge text="Terras" />}
                      {property.lift && <Badge text="Lift" />}
                      {property.gemeubeld && <Badge text="Gemeubeld" />}
                      {property.dubbel_glas && <Badge text="Dubbel glas" />}
                    </div>
                  </div>

                  <Link href={`/properties/${property.id}`} className="block rounded-2xl bg-white p-4 text-center font-bold text-black transition hover:opacity-90">
                    Bekijk woning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function InfoCard({ label, title, text }: { label: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-black p-5">
      <p className="text-gray-400">{label}</p>
      <p className="mt-2 text-xl font-bold">{title || '-'}</p>
      <p className="mt-2 text-gray-300">{text}</p>
    </div>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-sm font-bold text-white">{score}/100</p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#222]">
        <div className="h-full rounded-full bg-white" style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="border-b border-gray-900">
      <td className="p-4 font-bold text-gray-300">{label}</td>
      {values.map((value, index) => (
        <td key={index} className="p-4 text-gray-200">
          {value}
        </td>
      ))}
    </tr>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-1 text-sm leading-7 text-gray-300">{value}</p>
    </div>
  )
}

function Badge({ text }: { text: string }) {
  return (
    <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-black">
      {text}
    </span>
  )
}