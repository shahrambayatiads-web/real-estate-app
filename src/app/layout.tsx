import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'SlimWoning',
  description: 'Slim vastgoed platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className="bg-[#f6f8fb] text-[#111827]">
        <header className="sticky top-0 z-50 bg-[#0B1F4D] text-white shadow-sm">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-10 px-8">
            <Link href="/" className="flex items-center transition hover:opacity-90">
              <img
                src="/logo.png"
                alt="SlimWoning"
                className="h-20 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <nav className="flex items-center gap-9 text-[18px] font-semibold tracking-[-0.01em]">
              <Link href="/properties" className="transition hover:opacity-80">
                Kopen
              </Link>

              <Link href="/properties" className="transition hover:opacity-80">
                Huren
              </Link>

              <Link href="/properties" className="transition hover:opacity-80">
                Verkopen
              </Link>

              <Link href="/properties" className="transition hover:opacity-80">
                Nieuwbouw
              </Link>
            </nav>

            <nav className="flex items-center gap-8 text-[18px] font-semibold tracking-[-0.01em]">
              <Link href="/login" className="flex items-center gap-2 transition hover:opacity-80">
                <span className="text-2xl leading-none">♡</span>
                <span>Favorieten</span>
              </Link>

              <Link href="/login" className="flex items-center gap-2 transition hover:opacity-80">
                <span className="text-2xl leading-none">◎</span>
                <span>Inloggen</span>
              </Link>
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  )
}