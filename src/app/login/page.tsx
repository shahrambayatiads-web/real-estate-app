'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSignup() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Account created 🚀')
    }
  }

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Logged in ✅')

      router.push('/properties')
    }
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://real-estate-app-two-ruby.vercel.app',
      },
    })

    if (error) {
      alert(error.message)
    }
  }

  return (
    <div
      style={{
        background: 'black',
        minHeight: '100vh',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
        }}
      >
        <h1 style={{ fontSize: '40px' }}>
          Login 🔐
        </h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: '15px',
            fontSize: '16px',
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: '15px',
            fontSize: '16px',
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            padding: '15px',
            fontSize: '18px',
            cursor: 'pointer',
          }}
        >
          Login
        </button>

        <button
          onClick={handleSignup}
          style={{
            padding: '15px',
            fontSize: '18px',
            cursor: 'pointer',
          }}
        >
          Sign Up
        </button>

        <button
          onClick={signInWithGoogle}
          style={{
            padding: '15px',
            fontSize: '18px',
            cursor: 'pointer',
            background: 'white',
            color: 'black',
            border: 'none',
            borderRadius: '10px',
          }}
        >
          Continue with Google
        </button>
      </div>
    </div>
  )
}