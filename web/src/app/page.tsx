import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="relative z-10">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Torre de los Pecados</h1>
            </div>
            <div className="hidden md:flex space-x-6">
              <Link href="/game" className="text-gray-300 hover:text-white transition-colors">
                Jugar
              </Link>
              <Link href="/rules" className="text-gray-300 hover:text-white transition-colors">
                Reglas
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                Acerca de
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Torre de los{' '}
              <span className="bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
                Pecados
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Sumérgete en un mundo medieval donde la estrategia y la traición se encuentran.
              Construye tu torre, domina los pecados y conquista el reino.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/game"
                className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Jugar Ahora
              </Link>
              <Link 
                href="/rules"
                className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
              >
                Ver Reglas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-black bg-opacity-20">
        <div className="container mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            Características del Juego
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-gray-800 bg-opacity-50 p-8 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-300">
              <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <span className="text-white text-2xl">⚔️</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-4 text-center">Estrategia Profunda</h4>
              <p className="text-gray-300 text-center">
                Planifica tus movimientos, construye tu torre y domina el campo de batalla con tácticas inteligentes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800 bg-opacity-50 p-8 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <span className="text-white text-2xl">🎴</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-4 text-center">Mazos Únicos</h4>
              <p className="text-gray-300 text-center">
                Elige entre diferentes facciones, cada una con cartas y habilidades únicas para dominar el juego.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800 bg-opacity-50 p-8 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <span className="text-white text-2xl">🏰</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-4 text-center">Construcción de Torres</h4>
              <p className="text-gray-300 text-center">
                Construye y fortifica tu torre mientras luchas contra tus oponentes en batallas épicas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Game Modes Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            Modos de Juego
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Link href="/solo" className="group">
              <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-lg text-center hover:from-green-700 hover:to-green-900 transition-all duration-300 transform group-hover:scale-105">
                <div className="text-4xl mb-4">👤</div>
                <h4 className="text-xl font-bold text-white mb-2">Solo</h4>
                <p className="text-green-100">Juega contra la IA</p>
              </div>
            </Link>

            <Link href="/multiplayer" className="group">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg text-center hover:from-blue-700 hover:to-blue-900 transition-all duration-300 transform group-hover:scale-105">
                <div className="text-4xl mb-4">👥</div>
                <h4 className="text-xl font-bold text-white mb-2">Multijugador</h4>
                <p className="text-blue-100">Juega con amigos</p>
              </div>
            </Link>

            <Link href="/challenge" className="group">
              <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-lg text-center hover:from-red-700 hover:to-red-900 transition-all duration-300 transform group-hover:scale-105">
                <div className="text-4xl mb-4">🏆</div>
                <h4 className="text-xl font-bold text-white mb-2">Desafío</h4>
                <p className="text-red-100">Modo competitivo</p>
              </div>
            </Link>

            <Link href="/coop" className="group">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg text-center hover:from-purple-700 hover:to-purple-900 transition-all duration-300 transform group-hover:scale-105">
                <div className="text-4xl mb-4">🤝</div>
                <h4 className="text-xl font-bold text-white mb-2">Cooperativo</h4>
                <p className="text-purple-100">Juega en equipo</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black bg-opacity-50 py-8 px-6">
        <div className="container mx-auto text-center">
          <p className="text-gray-400">
            © 2024 Torre de los Pecados. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </main>
  )
}
