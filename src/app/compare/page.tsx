'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import jsPDF from 'jspdf'
import { supabase } from '@/lib/supabase'

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-[#111827]">
          Vergelijking laden...
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  )
}

function CompareContent() {
  const searchParams = useSearchParams()

  const ids = useMemo(
    () => searchParams.get('ids')?.split(',').filter(Boolean) || [],
    [searchParams]
  )

  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [locationData, setLocationData] = useState<any>({})
  const [locationLoading, setLocationLoading] = useState(false)

  useEffect(() => {
    getProperties()
  }, [ids.join(',')])

  useEffect(() => {
    if (properties.length > 0) {
      getLocationAnalysis()
    }
  }, [properties])

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

  async function getLocationAnalysis() {
    setLocationLoading(true)

    const results: any = {}

    await Promise.all(
      properties.map(async (property) => {
        if (!property.latitude || !property.longitude) return

        try {
          const response = await fetch('/api/location-analysis', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              latitude: Number(property.latitude),
              longitude: Number(property.longitude),
            }),
          })

          const data = await response.json()
          results[property.id] = data
        } catch (error) {
          console.log(error)
        }
      })
    )

    setLocationData(results)
    setLocationLoading(false)
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

  function pricePerM2(property: any) {
    const price = numberValue(property.price)
    const surface = numberValue(property.bewoonbare_oppervlakte)

    if (!price || !surface) return 0

    return Math.round(price / surface)
  }

  function epcScore(property: any) {
    const epc = String(property.epc || '').toUpperCase()

    if (epc.includes('A+')) return 100
    if (epc.includes('A')) return 92
    if (epc.includes('B')) return 80
    if (epc.includes('C')) return 65
    if (epc.includes('D')) return 48
    if (epc.includes('E')) return 32
    if (epc.includes('F')) return 18

    return property.dubbel_glas ? 60 : 45
  }

  function comfortScore(property: any) {
    let total = 0

    total += property.parking ? 18 : 0
    total += property.tuin ? 18 : 0
    total += property.terras ? 14 : 0
    total += property.lift ? 12 : 0
    total += property.gemeubeld ? 10 : 0
    total += property.dubbel_glas ? 18 : 0
    total += numberValue(property.badkamers) >= 2 ? 10 : 0

    return Math.min(100, total)
  }

  function spaceScore(property: any) {
    const surface = numberValue(property.bewoonbare_oppervlakte)
    const bedrooms = numberValue(property.slaapkamers)
    const land = numberValue(property.grondoppervlakte)

    let total = 0
    total += Math.min(55, surface / 2)
    total += Math.min(25, bedrooms * 8)
    total += Math.min(20, land / 25)

    return Math.min(100, Math.round(total))
  }

  function countNearbyPlaces(analysis: any) {
    if (!analysis) return 0

    const keys = [
      'supermarket',
      'hospital',
      'school',
      'trainStation',
      'busStation',
      'pharmacy',
      'park',
      'gym',
      'shopping',
    ]

    return keys.filter((key) => analysis[key]).length
  }

  function locationScore(property: any) {
    let total = 45
    const analysis = locationData[property.id]

    if (property.address) total += 10
    if (property.latitude && property.longitude) total += 15

    total += countNearbyPlaces(analysis) * 5

    if (analysis?.supermarket) total += 8
    if (analysis?.trainStation) total += 8
    if (analysis?.busStation) total += 7
    if (analysis?.school) total += 6
    if (analysis?.hospital) total += 5
    if (analysis?.park) total += 5

    return Math.min(100, Math.round(total))
  }

  function totalScore(property: any) {
    const priceScore = Math.max(
      0,
      100 - Math.min(100, pricePerM2(property) / 60)
    )

    return Math.round(
      spaceScore(property) * 0.25 +
        comfortScore(property) * 0.2 +
        epcScore(property) * 0.2 +
        locationScore(property) * 0.2 +
        priceScore * 0.15
    )
  }

  function autoPlus(property: any) {
    const items: string[] = []
    const analysis = locationData[property.id]

    if (epcScore(property) >= 80) items.push('Sterke energieprestatie')
    if (property.parking) items.push('Parking aanwezig')
    if (property.tuin) items.push('Tuin aanwezig')
    if (property.terras) items.push('Terras aanwezig')
    if (property.lift) items.push('Lift aanwezig')
    if (property.dubbel_glas) items.push('Dubbel glas')

    if (numberValue(property.bewoonbare_oppervlakte) >= 120) {
      items.push('Ruime bewoonbare oppervlakte')
    }

    if (pricePerM2(property) > 0 && pricePerM2(property) < 3500) {
      items.push('Interessante prijs per m²')
    }

    if (analysis?.supermarket) items.push('Supermarkt in de buurt')
    if (analysis?.trainStation) items.push('Treinstation in de buurt')
    if (analysis?.busStation) items.push('Bushalte in de buurt')
    if (analysis?.school) items.push('School in de buurt')
    if (analysis?.pharmacy) items.push('Apotheek in de buurt')
    if (analysis?.hospital) items.push('Ziekenhuis in de omgeving')
    if (analysis?.park) items.push('Park in de buurt')
    if (analysis?.gym) items.push('Fitness in de buurt')
    if (analysis?.shopping) items.push('Winkelcentrum in de buurt')

    if (property.address) items.push('Adres beschikbaar voor locatieanalyse')

    return items.length ? items : ['Goede basisgegevens beschikbaar']
  }

  function autoMinus(property: any) {
    const items: string[] = []
    const analysis = locationData[property.id]

    if (epcScore(property) < 50) items.push('Energieprestatie kan beter')
    if (!property.parking) items.push('Geen parking opgegeven')

    if (!property.tuin && property.woning_type === 'Huis') {
      items.push('Geen tuin opgegeven')
    }

    if (numberValue(property.bewoonbare_oppervlakte) < 80) {
      items.push('Beperkte woonoppervlakte')
    }

    if (!property.address) items.push('Geen volledig adres beschikbaar')

    if (!property.latitude || !property.longitude) {
      items.push('Locatiecoördinaten ontbreken')
    }

    if (property.latitude && property.longitude && !analysis && !locationLoading) {
      items.push('Locatieanalyse nog niet beschikbaar')
    }

    if (analysis && !analysis.supermarket) {
      items.push('Geen supermarkt gevonden binnen zoekradius')
    }

    if (analysis && !analysis.trainStation) {
      items.push('Geen treinstation gevonden binnen zoekradius')
    }

    if (analysis && !analysis.busStation) {
      items.push('Geen bushalte gevonden binnen zoekradius')
    }

    if (analysis && !analysis.school) {
      items.push('Geen school gevonden binnen zoekradius')
    }

    if (analysis && !analysis.park) {
      items.push('Geen park gevonden binnen zoekradius')
    }

    return items.length
      ? items
      : ['Geen grote minpunten gevonden op basis van de gegevens']
  }
  function nearbyPdfSummary(analysis: any) {
    if (!analysis) return 'Nog geen locatiegegevens beschikbaar'

    const items = [
      analysis.supermarket
        ? `Supermarkt: ${analysis.supermarket.name} (${analysis.supermarket.distanceText})`
        : '',
      analysis.hospital
        ? `Ziekenhuis: ${analysis.hospital.name} (${analysis.hospital.distanceText})`
        : '',
      analysis.school
        ? `School: ${analysis.school.name} (${analysis.school.distanceText})`
        : '',
      analysis.trainStation
        ? `Treinstation: ${analysis.trainStation.name} (${analysis.trainStation.distanceText})`
        : '',
      analysis.busStation
        ? `Bushalte: ${analysis.busStation.name} (${analysis.busStation.distanceText})`
        : '',
      analysis.pharmacy
        ? `Apotheek: ${analysis.pharmacy.name} (${analysis.pharmacy.distanceText})`
        : '',
      analysis.park
        ? `Park: ${analysis.park.name} (${analysis.park.distanceText})`
        : '',
      analysis.gym
        ? `Fitness: ${analysis.gym.name} (${analysis.gym.distanceText})`
        : '',
      analysis.shopping
        ? `Shopping: ${analysis.shopping.name} (${analysis.shopping.distanceText})`
        : '',
    ].filter(Boolean)

    return items.length
      ? items.join(', ')
      : 'Geen voorzieningen gevonden binnen zoekradius'
  }


  const bestOverall = properties.reduce((best, item) => {
    if (!best) return item
    return totalScore(item) > totalScore(best) ? item : best
  }, null)

  const bestPriceM2 = properties.reduce((best, item) => {
    if (!best) return item
    const current = pricePerM2(item)
    const previous = pricePerM2(best)

    if (!current) return best
    if (!previous) return item

    return current < previous ? item : best
  }, null)

  const bestEnergy = properties.reduce((best, item) => {
    if (!best) return item
    return epcScore(item) > epcScore(best) ? item : best
  }, null)

  const bestLocation = properties.reduce((best, item) => {
    if (!best) return item
    return locationScore(item) > locationScore(best) ? item : best
  }, null)

  async function downloadPDF() {
    const pdf = new jsPDF()
    let y = 20

    pdf.setFontSize(22)
    pdf.text('SlimWoning - Slim Vergelijkingsrapport', 20, y)

    y += 12
    pdf.setFontSize(11)
    pdf.text(`Aantal woningen: ${properties.length}`, 20, y)

    y += 12
    pdf.text(`Beste algemene keuze: ${bestOverall?.title || '-'}`, 20, y)

    properties.forEach((property, index) => {
      if (y > 240) {
        pdf.addPage()
        y = 20
      }

      y += 16
      pdf.setFontSize(16)
      pdf.text(`${index + 1}. ${property.title || '-'}`, 20, y)

      y += 9
      pdf.setFontSize(11)

      const lines = [
        `Prijs: ${formatPrice(property.price)}`,
        `Adres: ${property.address || '-'}, ${property.city || '-'}`,
        `Prijs per m²: ${pricePerM2(property) ? `± € ${pricePerM2(property)} op basis van vraagprijs` : '-'}`,
        `Slaapkamers: ${property.slaapkamers || '-'}`,
        `Badkamers: ${property.badkamers || '-'}`,
        `Oppervlakte: ${property.bewoonbare_oppervlakte || '-'} m²`,
        `EPC: ${property.epc || '-'}`,
        `SlimScore: ${totalScore(property)}/100`,
        `LocatieScore: ${locationScore(property)}/100`,
        `Omgeving: ${nearbyPdfSummary(locationData[property.id])}`,
        `Sterke punten: ${autoPlus(property).join(', ')}`,
        `Aandachtspunten: ${autoMinus(property).join(', ')}`,
      ]

      lines.forEach((line) => {
        const wrapped = pdf.splitTextToSize(line, 170)
        pdf.text(wrapped, 20, y)
        y += wrapped.length * 6
      })
    })

    pdf.save('slimwoning-smart-vergelijking.pdf')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[#111827]">
        Laden...
      </div>
    )
  }

  if (!loading && properties.length === 0) {
    return (
      <div className="min-h-screen bg-white px-5 py-16 text-[#111827] md:px-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">
            Geen woningen geselecteerd
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-[-0.03em] text-[#0B1F4D]">
            Selecteer eerst woningen om te vergelijken.
          </h1>

          <p className="mt-4 text-gray-600">
            Ga terug naar woningen, kies minimaal twee woningen en klik daarna opnieuw op vergelijken.
          </p>

          <Link
            href="/properties"
            className="mt-8 inline-flex rounded-2xl bg-blue-700 px-6 py-4 font-bold text-white transition hover:bg-blue-800"
          >
            Terug naar woningen
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen !bg-white px-5 py-10 !text-[#111827] md:px-10"
      style={{ background: '#ffffff', color: '#111827' }}
    >
      <div
        className="mx-auto max-w-7xl rounded-[2rem] !bg-white p-6"
        style={{ background: '#ffffff' }}
      >
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-blue-400">
              SlimWoning Analyse
            </p>

            <h1 className="text-5xl font-bold">
              Slimme woningvergelijking
            </h1>

            <p className="mt-4 max-w-3xl text-lg text-gray-400">
              Slimme vergelijking op prijs, ruimte, comfort, EPC,
              ligging, voorzieningen in de buurt en prijs per m².
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={downloadPDF}
              className="rounded-2xl border border-gray-200 bg-white px-6 py-4 font-bold text-[#111827] shadow-sm transition hover:bg-gray-50"
            >
              Download PDF
            </button>

            <Link
              href="/properties"
              className="rounded-2xl bg-[#111827] px-6 py-4 font-bold text-white shadow-sm"
            >
              Terug
            </Link>
          </div>
        </div>

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
          <InsightCard
            label="Beste algemene keuze"
            title={bestOverall?.title || '-'}
            text="Hoogste totaalscore op basis van ruimte, comfort, energie, locatie en prijs."
          />

          <InsightCard
            label="Beste prijs per m²"
            title={bestPriceM2?.title || '-'}
            text={
              bestPriceM2
                ? `Ongeveer € ${pricePerM2(bestPriceM2)} per m².`
                : '-'
            }
          />

          <InsightCard
            label="Beste EPC"
            title={bestEnergy?.title || '-'}
            text="Sterkste energieprestatie binnen deze vergelijking."
          />

          <InsightCard
            label="Beste ligging"
            title={bestLocation?.title || '-'}
            text="Beste score op adres, coördinaten en voorzieningen in de buurt."
          />
        </section>

        {locationLoading && (
          <div className="mb-6 rounded-2xl border border-blue-400/30 bg-blue-500/10 p-4 text-blue-200">
            Omgevingsanalyse wordt geladen...
          </div>
        )}

        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${properties.length}, minmax(320px, 1fr))`,
          }}
        >
          {properties.map((property) => {
            const analysis = locationData[property.id]

            return (
            <div
              key={property.id}
              className="flex flex-col overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-xl"
              style={{ background: '#ffffff' }}
            >
              <div className="relative">
                <img
                  src={property.image}
                  alt={property.title}
                  className="h-72 w-full object-cover md:h-80"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-black backdrop-blur">
                  EPC {property.epc || '-'}
                </div>

                <div className="absolute bottom-6 left-6">
                  <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-white drop-shadow-lg">
                    Vraagprijs
                  </p>

                  <p className="mt-1 text-5xl font-extrabold text-blue-400 drop-shadow-xl">
                    {formatPrice(property.price)}
                  </p>
                </div>
              </div>

              <div
                className="flex flex-1 flex-col bg-white p-6"
                style={{ background: '#ffffff' }}
              >
                <div className="mb-6 rounded-2xl bg-[#f8fafc] p-5 ring-1 ring-gray-100">
                  <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-blue-700 md:text-base">
                    {property.address
                      ? `${property.address}, ${property.city}`
                      : property.city || 'Locatie niet opgegeven'}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-[#111827]">
                    {property.title}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {property.woning_type || 'Type woning niet opgegeven'}
                  </p>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-3">
                  <Stat label="SlimScore" value={`${totalScore(property)}/100`} />
                  <Stat
                    label="Prijs per m²"
                    value={
                      pricePerM2(property)
                        ? `± € ${pricePerM2(property)}`
                        : '-'
                    }
                    note={pricePerM2(property) ? 'Op basis van vraagprijs' : undefined}
                  />
                  <Stat
                    label="Ruimte"
                    value={`${spaceScore(property)}/100`}
                  />
                  <Stat
                    label="Locatie"
                    value={`${locationScore(property)}/100`}
                  />
                </div>

                <ScoreBar label="Comfort" score={comfortScore(property)} />
                <ScoreBar label="Energie" score={epcScore(property)} />
                <ScoreBar label="Ruimte" score={spaceScore(property)} />
                <ScoreBar label="Locatie" score={locationScore(property)} />

                <div className="mt-6 flex flex-1 flex-col space-y-4">
                  <Detail
                    label="Sterke punten"
                    value={autoPlus(property).join(' • ')}
                  />

                  <Detail
                    label="Aandachtspunten"
                    value={autoMinus(property).join(' • ')}
                  />

                  <NearbyPlaces analysis={analysis} />

                  <div
                    className="rounded-2xl !bg-white p-4 shadow-sm ring-1 ring-gray-100"
                    style={{ background: '#ffffff' }}
                  >
                    <p className="mb-3 text-sm text-gray-400">
                      Voorzieningen
                    </p>

                    <div className="flex min-h-[48px] flex-wrap items-center justify-center gap-2">
                      {property.parking && <Badge text="Parking" />}
                      {property.tuin && <Badge text="Tuin" />}
                      {property.terras && <Badge text="Terras" />}
                      {property.lift && <Badge text="Lift" />}
                      {property.gemeubeld && <Badge text="Gemeubeld" />}
                      {property.dubbel_glas && <Badge text="Dubbel glas" />}

                      {!property.parking &&
                        !property.tuin &&
                        !property.terras &&
                        !property.lift &&
                        !property.gemeubeld &&
                        !property.dubbel_glas && (
                          <p className="text-sm text-gray-500">
                            Geen voorzieningen beschikbaar
                          </p>
                        )}
                    </div>
                  </div>

                  <Link
                    href={`/properties/${property.id}`}
                    className="mt-auto block rounded-2xl bg-[#111827] p-4 text-center font-bold text-white transition hover:opacity-90"
                  >
                    Bekijk woning
                  </Link>
                </div>
              </div>
            </div>
            )
          })}
        </div>

        <section className="mt-10 rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-3xl font-bold">
            Conclusie
          </h2>

          <p className="mt-4 leading-8 text-gray-600">
            Op basis van de ingevoerde gegevens lijkt{' '}
            <strong className="text-[#111827]">{bestOverall?.title || '-'}</strong>{' '}
            de sterkste algemene keuze. Voor prijsbewuste kopers is{' '}
            <strong className="text-[#111827]">{bestPriceM2?.title || '-'}</strong>{' '}
            interessant door de beste prijs per m². Voor energiezuinig wonen
            scoort{' '}
            <strong className="text-[#111827]">{bestEnergy?.title || '-'}</strong>{' '}
            het beste.
          </p>
        </section>
      </div>
    </div>
  )
}

function InsightCard({
  label,
  title,
  text,
}: {
  label: string
  title: string
  text: string
}) {
  return (
    <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-blue-400">{label}</p>
      <h3 className="mt-2 text-2xl font-bold">{title}</h3>
      <p className="mt-3 text-gray-600">{text}</p>
    </div>
  )
}

function ScoreBar({
  label,
  score,
}: {
  label: string
  score: number
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-sm font-bold">{score}/100</p>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{
            width: `${score}%`,
          }}
        />
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note?: string
}) {
  return (
    <div
      className="rounded-2xl !bg-white p-4 shadow-sm ring-1 ring-gray-100"
      style={{ background: '#ffffff' }}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-[#111827]">{value}</p>
      {note && <p className="mt-1 text-xs font-semibold text-gray-500">{note}</p>}
    </div>
  )
}

function Detail({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      className="rounded-2xl !bg-white p-4 shadow-sm ring-1 ring-gray-100"
      style={{ background: '#ffffff' }}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 leading-7 text-gray-700">{value}</p>
    </div>
  )
}

function Badge({
  text,
}: {
  text: string
}) {
  return (
    <span className="rounded-full bg-[#eef2ff] px-3 py-2 text-sm font-bold text-blue-700">
      {text}
    </span>
  )
}
function NearbyPlaces({ analysis }: { analysis: any }) {
  if (!analysis) {
    return (
      <div
        className="rounded-2xl !bg-white p-4 shadow-sm ring-1 ring-gray-100"
        style={{ background: '#ffffff' }}
      >
        <p className="text-sm text-gray-500">Omgeving</p>
        <p className="mt-2 text-sm leading-7 text-gray-700">
          Nog geen locatiegegevens beschikbaar.
        </p>
      </div>
    )
  }

  const items = [
    { label: 'Supermarkt', value: analysis.supermarket },
    { label: 'Ziekenhuis', value: analysis.hospital },
    { label: 'School', value: analysis.school },
    { label: 'Treinstation', value: analysis.trainStation },
    { label: 'Bushalte', value: analysis.busStation },
    { label: 'Apotheek', value: analysis.pharmacy },
    { label: 'Park', value: analysis.park },
    { label: 'Fitness', value: analysis.gym },
    { label: 'Shopping', value: analysis.shopping },
  ]

  return (
    <div
      className="rounded-2xl !bg-white p-4 shadow-sm ring-1 ring-gray-100"
      style={{ background: '#ffffff' }}
    >
      <p className="text-sm text-gray-500">Omgeving</p>

      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex justify-between gap-3 border-b border-gray-200 pb-2 text-sm last:border-b-0 last:pb-0"
          >
            <span className="text-gray-500">{item.label}</span>
            <span className="text-right font-bold text-[#111827]">
              {item.value
                ? `${item.value.name} (${item.value.distanceText})`
                : '-'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}