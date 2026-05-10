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
    <html lang="nl" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-[#f6f8fb] font-sans text-[#111827]">
        <header className="sticky top-0 z-50 border-b border-[#e5e7eb] bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex h-28 max-w-7xl items-center justify-between px-8">
            <Link
              href="/"
              className="flex items-center transition hover:opacity-90"
            >
              <img
                src="/logo.png"
                alt="SlimWoning"
                className="h-28 w-auto scale-125 object-contain"
              />
            </Link>

            <nav className="hidden items-center gap-10 md:flex">
              <Link
                href="/"
                className="text-[16px] font-bold text-[#0B1F4D]"
              >
                Home
              </Link>

              <Link
                href="/properties"
                className="text-[16px] font-semibold text-gray-600 transition hover:text-[#0B1F4D]"
              >
                Woningen
              </Link>

              <Link
                href="/favorites"
                className="text-[16px] font-semibold text-gray-600 transition hover:text-[#0B1F4D]"
              >
                Favorieten
              </Link>

              <Link
                href="/dashboard"
                className="text-[16px] font-semibold text-gray-600 transition hover:text-[#0B1F4D]"
              >
                Dashboard
              </Link>

              <Link
                href="/add-property"
                className="text-[16px] font-semibold text-gray-600 transition hover:text-[#0B1F4D]"
              >
                Toevoegen
              </Link>
            </nav>

            <Link
              href="/login"
              className="rounded-2xl bg-[#0B1F4D] px-8 py-3 text-[15px] font-bold text-white shadow-md transition duration-200 hover:scale-[1.03] hover:bg-[#102B66]"
            >
              Inloggen
            </Link>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  )
}