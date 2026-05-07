export default function Home() {
  return (
    <>
      {/* Navbar */}
      <header className="w-full flex justify-between items-center px-8 py-4 bg-black text-white border-b border-gray-800">
        <h2 className="text-xl font-bold">Fixox</h2>

        <nav className="flex gap-6">
          <a href="#" className="hover:text-gray-400">Home</a>
          <a href="#" className="hover:text-gray-400">Features</a>
          <a href="#" className="hover:text-gray-400">Pricing</a>
        </nav>
      </header>

      {/* Hero */}
      <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center px-6">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          Build your future with Fixox 🚀
        </h1>

        <p className="text-lg text-gray-400 max-w-xl">
          A powerful platform to manage, scale and grow your digital business.
        </p>

        <div className="mt-8 flex gap-4">
          <button className="px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition">
            Get Started
          </button>

          <button className="px-6 py-3 border border-gray-600 rounded-xl hover:bg-gray-800 transition">
            Learn More
          </button>
        </div>
      </main>

      {/* Features */}
      <section className="bg-black text-white py-20 px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          
          <div className="p-6 border border-gray-800 rounded-2xl hover:border-white transition">
            <h3 className="text-xl font-semibold mb-3">⚡ Fast</h3>
            <p className="text-gray-400">
              Lightning fast performance for your platform.
            </p>
          </div>

          <div className="p-6 border border-gray-800 rounded-2xl hover:border-white transition">
            <h3 className="text-xl font-semibold mb-3">🔒 Secure</h3>
            <p className="text-gray-400">
              Built with top-level security and protection.
            </p>
          </div>

          <div className="p-6 border border-gray-800 rounded-2xl hover:border-white transition">
            <h3 className="text-xl font-semibold mb-3">🚀 Scalable</h3>
            <p className="text-gray-400">
              Grow without limits as your business expands.
            </p>
          </div>

        </div>
      </section>
    </>
  );
}