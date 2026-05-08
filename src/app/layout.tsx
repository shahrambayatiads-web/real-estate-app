import type { Metadata } from 'next'
import Link from 'next/link'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SlimWoning',
  description: 'Slim vastgoed platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '14px',
  }

  return (
    <html lang="nl" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body
        style={{
          margin: 0,
          background: 'black',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <nav
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '15px',
            padding: '15px 20px',
            borderBottom: '1px solid #222',
            position: 'sticky',
            top: 0,
            background: 'black',
            zIndex: 1000,
          }}
        >
          <Link
            href="/"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '22px',
              fontWeight: 'bold',
            }}
          >
            SlimWoning 🏠
          </Link>

          <div
            style={{
              display: 'flex',
              gap: '14px',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}
          >
            <Link href="/" style={linkStyle}>Home</Link>
            <Link href="/properties" style={linkStyle}>Woningen</Link>
            <Link href="/favorites" style={linkStyle}>Favorieten</Link>
            <Link href="/dashboard" style={linkStyle}>Dashboard</Link>
            <Link href="/add-property" style={linkStyle}>Toevoegen</Link>

            <Link
              href="/login"
              style={{
                color: 'black',
                background: 'white',
                padding: '8px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              Inloggen
            </Link>
          </div>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  )
}