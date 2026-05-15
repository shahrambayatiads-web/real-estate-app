'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      alert('Vul je e-mailadres en wachtwoord in.')
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        alert(error.message)
        return
      }

      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      alert(error.message)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f9fc] px-6 py-16 text-[#111827]">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <Link
          href="/"
          className="text-sm font-bold text-blue-600 transition hover:text-blue-500 lg:col-span-2"
        >
          ← Terug naar home
        </Link>

        <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-xl shadow-slate-200/60">
          <h1 className="text-4xl font-black tracking-[-0.04em]">
            Inloggen
          </h1>

          <p className="mt-3 text-sm leading-7 text-gray-500">
            Log in om woningen toe te voegen, favorieten te bewaren en je dashboard te bekijken.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mailadres"
              className="h-12 w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 outline-none transition focus:border-blue-600"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wachtwoord"
              className="h-12 w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 outline-none transition focus:border-blue-600"
            />

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-blue-700 text-sm font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Inloggen...' : 'Inloggen'}
            </button>
          </form>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="mt-4 h-12 w-full rounded-xl border border-gray-200 bg-white text-sm font-black text-[#111827] transition hover:bg-gray-50"
          >
            Doorgaan met Google
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Nog geen account?{' '}
            <Link href="/register" className="font-bold text-blue-400">
              Registreren
            </Link>
          </p>
        </div>

        <aside className="rounded-[2rem] border border-blue-100 bg-white/80 p-8 shadow-xl shadow-slate-200/50">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-700">
            Waarom inloggen?
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-[#0B1F4D]">
            Alles rond je vastgoed op één plek.
          </h2>

          <p className="mt-4 text-sm leading-7 text-gray-600">
            Met je SlimWoning-account krijg je toegang tot handige functies die je zoektocht eenvoudiger en overzichtelijker maken.
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
                Bewaar je voorkeuren en ontvang meldingen over nieuwe panden.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8fafc] p-4">
              <p className="font-bold text-[#0B1F4D]">Slimmo gebruiken</p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Stel vragen over vastgoed, vergelijken, kopen, huren of verkopen.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}