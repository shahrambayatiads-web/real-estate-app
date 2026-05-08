'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login')
      return
    }

    setUserEmail(session.user.email || '')
    getProperties(session.user.id)
  }

  async function getProperties(userId: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.log(error)
    } else {
      setProperties(data)
    }

    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-3xl text-white">
        Laden...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-5 py-8 text-white md:px-10">
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold md:text-5xl">
            Mijn dashboard 📊
          </h1>

          <p className="text-sm text-gray-400 md:text-base">
            Ingelogd als: {userEmail}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full rounded-xl bg-red-600 px-5 py-3 font-bold text-white md:w-auto"
        >
          Uitloggen
        </button>
      </div>

      <div className="mb-8">
        <Link href="/add-property">
          <button className="w-full rounded-xl bg-white px-5 py-4 font-bold text-black md:w-auto">
            Woning toevoegen
          </button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <p className="text-xl text-gray-400">
          Je hebt nog geen woningen toegevoegd.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div
              key={property.id}
              className="rounded-2xl bg-[#111] p-5"
            >
              <img
                src={property.image}
                alt={property.title}
                className="h-52 w-full rounded-xl object-cover"
              />

              <h2 className="mt-4 text-2xl font-bold">
                {property.title}
              </h2>

              <p className="mt-2">€ {property.price}</p>
              <p className="text-gray-400">{property.city}</p>

              <Link href={`/properties/${property.id}`}>
                <button className="mt-4 w-full rounded-xl bg-white px-4 py-3 font-bold text-black">
                  Bekijk woning
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}