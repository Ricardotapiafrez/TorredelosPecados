import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 via-red-900/20 to-black relative overflow-hidden">
      {/* Atmospheric Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,0,0,0.1)_0%,_transparent_70%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,0,0,0.15)_0%,_transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(75,0,130,0.1)_0%,_transparent_50%)] pointer-events-none"></div>
      
      {/* Fog Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-800/5 to-gray-900/10 pointer-events-none"></div>
      
      {/* Header */}
      <header className="relative z-10">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-800 to-red-900 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/50 border border-red-700/50">
                <span className="text-red-100 font-bold text-xl drop-shadow-lg">T</span>
              </div>
              <h1 className="text-2xl font-bold text-red-100 drop-shadow-lg">Torre de los Pecados</h1>
            </div>
            <div className="hidden md:flex space-x-6">
              <Link href="/game" className="text-gray-400 hover:text-red-200 transition-colors font-medium">
                Jugar
              </Link>
              <Link href="/rules" className="text-gray-400 hover:text-red-200 transition-colors font-medium">
                Reglas
              </Link>
              <Link href="/about" className="text-gray-400 hover:text-red-200 transition-colors font-medium">
                Acerca de
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 z-10">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-bold text-red-100 mb-6 drop-shadow-lg">
              Torre de los{' '}
              <span className="bg-gradient-to-r from-red-400 via-red-300 to-red-200 bg-clip-text text-transparent drop-shadow-lg">
                Pecados
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed font-medium">
              Sumérgete en un mundo medieval donde la estrategia y la traición se encuentran.
              Construye tu torre, domina los pecados y conquista el reino.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/game"
                className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-red-100 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-xl shadow-red-900/50 border border-red-600/50 hover:shadow-2xl hover:shadow-red-800/70 hover:border-red-500/70"
              >
                Jugar Ahora
              </Link>
              <Link 
                href="/rules"
                className="bg-transparent border-2 border-red-600/50 text-red-100 font-bold py-4 px-8 rounded-lg text-lg hover:bg-red-900/20 hover:border-red-500/70 transition-all duration-300 shadow-lg shadow-red-900/30"
              >
                Ver Reglas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-black bg-opacity-30 relative z-10">
        <div className="container mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-red-100 text-center mb-16 drop-shadow-lg">
            Características del Juego
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 p-8 rounded-lg border border-gray-700/50 backdrop-blur-sm shadow-xl shadow-black/50 hover:shadow-2xl hover:shadow-red-900/20 hover:border-red-700/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-red-800 to-red-900 rounded-lg flex items-center justify-center mb-6 mx-auto shadow-lg shadow-red-900/50 border border-red-700/50">
                <span className="text-red-100 text-2xl drop-shadow-lg">⚔️</span>
              </div>
              <h4 className="text-xl font-bold text-red-100 mb-4 text-center drop-shadow-md">Estrategia Profunda</h4>
              <p className="text-gray-300 text-center font-medium">
                Planifica tus movimientos, construye tu torre y domina el campo de batalla con tácticas inteligentes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 p-8 rounded-lg border border-gray-700/50 backdrop-blur-sm shadow-xl shadow-black/50 hover:shadow-2xl hover:shadow-red-900/20 hover:border-red-700/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-800 to-purple-900 rounded-lg flex items-center justify-center mb-6 mx-auto shadow-lg shadow-purple-900/50 border border-purple-700/50">
                <span className="text-purple-100 text-2xl drop-shadow-lg">🎴</span>
              </div>
              <h4 className="text-xl font-bold text-red-100 mb-4 text-center drop-shadow-md">Mazos Únicos</h4>
              <p className="text-gray-300 text-center font-medium">
                Elige entre diferentes facciones, cada una con cartas y habilidades únicas para dominar el juego.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 p-8 rounded-lg border border-gray-700/50 backdrop-blur-sm shadow-xl shadow-black/50 hover:shadow-2xl hover:shadow-red-900/20 hover:border-red-700/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-900/50 border border-blue-700/50">
                <span className="text-blue-100 text-2xl drop-shadow-lg">🏰</span>
              </div>
              <h4 className="text-xl font-bold text-red-100 mb-4 text-center drop-shadow-md">Construcción de Torres</h4>
              <p className="text-gray-300 text-center font-medium">
                Construye y fortifica tu torre mientras luchas contra tus oponentes en batallas épicas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Game Modes Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="container mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-red-100 text-center mb-16 drop-shadow-lg">
            Modos de Juego
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Link href="/solo" className="group">
              <div className="bg-gradient-to-br from-green-900/80 to-green-800/60 p-6 rounded-lg text-center hover:from-green-800/80 hover:to-green-700/60 transition-all duration-300 transform group-hover:scale-105 border border-green-700/50 backdrop-blur-sm shadow-xl shadow-green-900/30 hover:shadow-2xl hover:shadow-green-800/50">
                <div className="text-4xl mb-4 drop-shadow-lg">👤</div>
                <h4 className="text-xl font-bold text-green-100 mb-2 drop-shadow-md">Solo</h4>
                <p className="text-green-200 font-medium">Juega contra la IA</p>
              </div>
            </Link>

            <Link href="/multiplayer" className="group">
              <div className="bg-gradient-to-br from-blue-900/80 to-blue-800/60 p-6 rounded-lg text-center hover:from-blue-800/80 hover:to-blue-700/60 transition-all duration-300 transform group-hover:scale-105 border border-blue-700/50 backdrop-blur-sm shadow-xl shadow-blue-900/30 hover:shadow-2xl hover:shadow-blue-800/50">
                <div className="text-4xl mb-4 drop-shadow-lg">👥</div>
                <h4 className="text-xl font-bold text-blue-100 mb-2 drop-shadow-md">Multijugador</h4>
                <p className="text-blue-200 font-medium">Juega con amigos</p>
              </div>
            </Link>

            <Link href="/challenge" className="group">
              <div className="bg-gradient-to-br from-red-900/80 to-red-800/60 p-6 rounded-lg text-center hover:from-red-800/80 hover:to-red-700/60 transition-all duration-300 transform group-hover:scale-105 border border-red-700/50 backdrop-blur-sm shadow-xl shadow-red-900/30 hover:shadow-2xl hover:shadow-red-800/50">
                <div className="text-4xl mb-4 drop-shadow-lg">🏆</div>
                <h4 className="text-xl font-bold text-red-100 mb-2 drop-shadow-md">Desafío</h4>
                <p className="text-red-200 font-medium">Modo competitivo</p>
              </div>
            </Link>

            <Link href="/coop" className="group">
              <div className="bg-gradient-to-br from-purple-900/80 to-purple-800/60 p-6 rounded-lg text-center hover:from-purple-800/80 hover:to-purple-700/60 transition-all duration-300 transform group-hover:scale-105 border border-purple-700/50 backdrop-blur-sm shadow-xl shadow-purple-900/30 hover:shadow-2xl hover:shadow-purple-800/50">
                <div className="text-4xl mb-4 drop-shadow-lg">🤝</div>
                <h4 className="text-xl font-bold text-purple-100 mb-2 drop-shadow-md">Cooperativo</h4>
                <p className="text-purple-200 font-medium">Juega en equipo</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black bg-opacity-60 py-8 px-6 relative z-10 border-t border-gray-800/50">
        <div className="container mx-auto text-center">
          <p className="text-gray-400 font-medium">
            © 2024 Torre de los Pecados. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </main>
  )
}
