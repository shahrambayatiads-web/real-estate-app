'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState('particulier')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleRegister() {
    setErrorMessage('')

    if (!name.trim()) {
      setErrorMessage('Vul je naam in.')
      return
    }

    if (!email.trim()) {
      setErrorMessage('Vul je e-mailadres in.')
      return
    }

    if (!password.trim()) {
      setErrorMessage('Vul je wachtwoord in.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          account_type: accountType,
          role: accountType,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    setLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    router.push('/dashboard')
  }

  async function handleOAuth(provider: 'google' | 'azure') {
    setErrorMessage('')
    window.localStorage.setItem('slimwoning_account_type', accountType)

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f9fc] px-6 py-16 text-[#111827]">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-xl shadow-slate-200/60">

          <h1 className="text-4xl font-black">
            Account aanmaken
          </h1>

          <p className="mt-3 text-gray-500">
            Maak een account aan als particulier of makelaar.
          </p>

          <div className="mt-8 space-y-4">
            <input
              placeholder="Naam"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 outline-none transition focus:border-blue-600"
            />

            <input
              type="email"
              placeholder="E-mailadres"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 outline-none transition focus:border-blue-600"
            />

            <input
              type="password"
              placeholder="Wachtwoord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 outline-none transition focus:border-blue-600"
            />

            <div className="rounded-2xl border border-gray-200 bg-[#f8fafc] p-4">
              <p className="text-sm font-bold">
                Ik registreer als:
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType('particulier')}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                    accountType === 'particulier'
                      ? 'bg-blue-700 text-white'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  Particulier
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('makelaar')}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                    accountType === 'makelaar'
                      ? 'bg-blue-700 text-white'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  Makelaar
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
              className="h-12 w-full rounded-xl bg-blue-700 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Account aanmaken...' : 'Account aanmaken'}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>

              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-400">
                  of
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOAuth('google')}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50"
            >
              <FcGoogle className="text-2xl" />
              Doorgaan met Google
            </button>

            <button
              type="button"
              onClick={() => handleOAuth('azure')}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M11.5 2C7.36 2 4 5.36 4 9.5c0 4.32 3.64 7.09 6.84 11.06a1 1 0 001.32 0C15.36 16.59 19 13.82 19 9.5 19 5.36 15.64 2 11.5 2zm0 10.5A3.5 3.5 0 1115 9a3.5 3.5 0 01-3.5 3.5z" />
              </svg>
              Doorgaan met Microsoft
            </button>

            <p className="pt-2 text-center text-sm text-gray-500">
              Heb je al een account?{' '}
              <Link href="/login" className="font-bold text-blue-400">
                Inloggen
              </Link>
            </p>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-blue-100 bg-white/80 p-8 shadow-xl shadow-slate-200/50">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-700">
            Waarom een account?
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-[#0B1F4D]">
            Alles rond je vastgoed op één plek.
          </h2>

          <p className="mt-4 text-sm leading-7 text-gray-600">
            Met een SlimWoning-account krijg je toegang tot handige functies die je zoektocht eenvoudiger en overzichtelijker maken.
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-[#f8fafc] p-4">
              <p className="font-bold text-[#0B1F4D]">Favorieten bewaren</p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Sla interessante panden op en bekijk ze later opnieuw.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8fafc] p-4">
              <p className="font-bold text-[#0B1F4D]">Zoekopdrachten volgen</p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Bewaar je voorkeuren en ontvang later meldingen over nieuwe panden die passen bij je zoekopdracht.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8fafc] p-4">
              <p className="font-bold text-[#0B1F4D]">Slimmo gebruiken</p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Stel vragen over vastgoed, vergelijken, kopen, huren of verkopen en krijg algemene informatie.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8fafc] p-4">
              <p className="font-bold text-[#0B1F4D]">Voor makelaars</p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Makelaars kunnen panden toevoegen en hun branding zichtbaar maken bij hun aanbod.
              </p>
            </div>
          </div>

        </aside>
      </div>
    </main>
  )
}
