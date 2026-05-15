'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function MakelaarProfielPage() {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setSaved(false)
    setErrorMessage('')

    const formData = new FormData(event.currentTarget)

    const profile = {
      kantoor_naam: String(formData.get('kantoor_naam') || ''),
      email: String(formData.get('email') || ''),
      telefoon: String(formData.get('telefoon') || ''),
      regio: String(formData.get('regio') || ''),
      jaren_ervaring: String(formData.get('jaren_ervaring') || ''),
      verkochte_woningen: Number(formData.get('verkochte_woningen') || 0),
      verkooptijd: String(formData.get('verkooptijd') || ''),
      review_score: String(formData.get('review_score') || ''),
      commissie: String(formData.get('commissie') || ''),
      specialisatie: String(formData.get('specialisatie') || ''),
      pitch: String(formData.get('pitch') || ''),
    }

    const { error } = await supabase
      .from('makelaar_profiles')
      .insert(profile)

    setSaving(false)

    if (error) {
      console.error(error)
      setErrorMessage('Profiel kon niet worden opgeslagen. Controleer Supabase.')
      return
    }

    setSaved(true)
    window.location.href = '/makelaar-dashboard?profile=saved'
  }

  return (
    <main className="min-h-screen bg-[#F6F8FC] px-6 py-12 text-[#071B4D] md:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-700">
              SlimWoning Pro
            </p>
            <h1 className="mt-3 text-5xl font-black tracking-[-0.04em] md:text-6xl">
              Makelaar profiel
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-500">
              Vul je pitch in zodat verkopers beter begrijpen waarom jouw kantoor de juiste keuze is.
            </p>
          </div>

          <button
            type="button"
            onClick={() => (window.location.href = '/makelaar-dashboard')}
            className="rounded-2xl bg-[#071B4D] px-7 py-4 text-sm font-black text-white shadow-xl transition hover:scale-[1.02]"
          >
            Terug naar dashboard
          </button>
        </div>

        {saved && (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
            <p className="font-black">Profiel opgeslagen</p>
            <p className="mt-1 text-sm">
              Je makelaar pitch is klaar om aan verkopers te tonen.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            <p className="font-black">Opslaan mislukt</p>
            <p className="mt-1 text-sm">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={saveProfile} className="rounded-[2.5rem] bg-white p-8 shadow-2xl">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ProfileField name="kantoor_naam" label="Kantoor naam" defaultValue="SlimWoning Makelaars" />
            <ProfileField name="email" label="Contact e-mail" defaultValue="makelaar@email.com" />
            <ProfileField name="telefoon" label="Telefoon" defaultValue="+32 456 78 90 12" />
            <ProfileField name="regio" label="Regio" defaultValue="Gent" />
            <ProfileField name="jaren_ervaring" label="Jaren ervaring" defaultValue="12 jaar" />
            <ProfileField name="verkochte_woningen" label="Verkochte woningen" defaultValue="148" />
            <ProfileField name="verkooptijd" label="Gemiddelde verkooptijd" defaultValue="21 dagen" />
            <ProfileField name="review_score" label="Review score" defaultValue="4.9/5" />
            <ProfileField name="commissie" label="Verkoop commissie (excl. btw)" defaultValue="1.5%" />
            <ProfileField name="specialisatie" label="Specialisatie" defaultValue="Appartementen en gezinswoningen" />
          </div>

          <div className="mt-6">
            <label className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">
              Waarom kiezen verkopers jou?
            </label>
            <textarea
              name="pitch"
              defaultValue="Ik ken de markt in Gent zeer goed en kan jouw woning snel en professioneel onder de aandacht brengen bij de juiste kopers."
              rows={6}
              className="mt-3 w-full rounded-2xl border border-[#DCE7F7] bg-[#F8FAFC] p-5 text-base font-bold text-[#071B4D] outline-none transition focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div className="mt-8 rounded-[2rem] border border-[#DCE7F7] bg-[#F8FBFF] p-6">
            <p className="text-lg font-black">Zo ziet de verkoper jouw pitch</p>
            <div className="mt-5 rounded-2xl bg-white p-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">
                Premium makelaar aanvraag
              </p>
              <h2 className="mt-3 text-2xl font-black">SlimWoning Makelaars</h2>
              <p className="mt-3 text-gray-600">
                12 jaar ervaring · 148 woningen verkocht · 4.9/5 reviews
              </p>
              <p className="mt-4 leading-7 text-gray-600">
                Ik ken de markt in Gent zeer goed en kan jouw woning snel en professioneel onder de aandacht brengen bij de juiste kopers.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-[#071B4D] px-8 py-5 text-sm font-black text-white shadow-xl transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {saving ? 'Opslaan...' : 'Profiel opslaan'}
            </button>

            <button
              type="button"
              onClick={() => (window.location.href = '/makelaar-dashboard')}
              className="rounded-2xl border border-[#DCE7F7] bg-white px-8 py-5 text-sm font-black text-[#071B4D] transition hover:bg-[#F1F5FF]"
            >
              Annuleren
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

function ProfileField({
  name,
  label,
  defaultValue,
}: {
  name: string
  label: string
  defaultValue: string
}) {
  return (
    <div>
      <label className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">
        {label}
      </label>
      <input
        name={name}
        defaultValue={defaultValue}
        className="mt-3 w-full rounded-2xl border border-[#DCE7F7] bg-[#F8FAFC] p-5 text-base font-bold text-[#071B4D] outline-none transition focus:border-blue-600 focus:bg-white"
      />
    </div>
  )
}