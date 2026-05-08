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
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
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
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 40px',
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
              fontSize: '28px',
              fontWeight: 'bold',
            }}
          >
            SlimWoning 🏠
          </Link>

          <div
            style={{
              display: 'flex',
              gap: '25px',
              alignItems: 'center',
            }}
          >
            <Link
              href="/"
              style={{
                color: 'white',
                textDecoration: 'none',
              }}
            >
              Home
            </Link>

            <Link
              href="/properties"
              style={{
                color: 'white',
                textDecoration: 'none',
              }}
            >
              Woningen
            </Link>

            <Link
              href="/dashboard"
              style={{
                color: 'white',
                textDecoration: 'none',
              }}
            >
              Dashboard
            </Link>

            <Link
              href="/add-property"
              style={{
                color: 'white',
                textDecoration: 'none',
              }}
            >
              Toevoegen
            </Link>

            <Link
              href="/login"
              style={{
                color: 'black',
                background: 'white',
                padding: '10px 18px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 'bold',
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