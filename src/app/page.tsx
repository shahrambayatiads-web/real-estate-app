import Link from 'next/link'

export default function Home() {
  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center px-6">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          Slim vergelijken. Slimmer kopen.
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl">
          Vergelijk woningen op prijs, ligging, kenmerken en plus- en minpunten.
          Maak sneller een slimme keuze met SlimWoning.
        </p>

        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <Link href="/properties">
            <button className="px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition font-bold">
              Woningen bekijken
            </button>
          </Link>

          <Link href="/add-property">
            <button className="px-6 py-3 border border-gray-600 rounded-xl hover:bg-gray-800 transition">
              Woning toevoegen
            </button>
          </Link>
        </div>
      </main>

      <section className="bg-black text-white py-20 px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="p-6 border border-gray-800 rounded-2xl hover:border-white transition">
            <h3 className="text-xl font-semibold mb-3">
              🏠 Woningdetails
            </h3>
            <p className="text-gray-400">
              Bekijk prijs, oppervlakte, EPC, kamers, tuin, terras en meer.
            </p>
          </div>

          <div className="p-6 border border-gray-800 rounded-2xl hover:border-white transition">
            <h3 className="text-xl font-semibold mb-3">
              ❤️ Favorieten
            </h3>
            <p className="text-gray-400">
              Bewaar interessante woningen en bekijk ze later opnieuw.
            </p>
          </div>

          <div className="p-6 border border-gray-800 rounded-2xl hover:border-white transition">
            <h3 className="text-xl font-semibold mb-3">
              ⚖️ Slim vergelijken
            </h3>
            <p className="text-gray-400">
              Vergelijk meerdere woningen naast elkaar en maak een betere keuze.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}