'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Users, BookOpen, Settings, Crown } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function HomePage() {
  const [isHovered, setIsHovered] = useState<string | null>(null)

  const menuItems = [
    {
      id: 'play',
      title: 'Jugar',
      description: 'Crear o unirse a una partida',
      icon: Play,
      href: '/game',
      color: 'from-primary-600 to-primary-700'
    },
    {
      id: 'rooms',
      title: 'Salas',
      description: 'Ver salas disponibles',
      icon: Users,
      href: '/rooms',
      color: 'from-accent-600 to-accent-700'
    },
    {
      id: 'rules',
      title: 'Reglas',
      description: 'Aprender a jugar',
      icon: BookOpen,
      href: '/rules',
      color: 'from-secondary-600 to-secondary-700'
    },
    {
      id: 'leaderboard',
      title: 'Ranking',
      description: 'Ver mejores jugadores',
      icon: Crown,
      href: '/leaderboard',
      color: 'from-yellow-600 to-yellow-700'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <div className="flex justify-center mb-6">
          <Logo size="xl" />
        </div>
        <h1 className="text-6xl md:text-8xl font-fantasy font-bold text-shadow text-glow text-primary-400 mb-4">
          Torre de los Pecados
        </h1>
        <p className="text-xl md:text-2xl text-secondary-300 max-w-2xl mx-auto">
          Un juego de cartas chileno ambientado en un universo de fantasía
        </p>
      </motion.div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href={item.href}>
              <div
                className={`card card-hover p-8 h-full cursor-pointer group relative overflow-hidden`}
                onMouseEnter={() => setIsHovered(item.id)}
                onMouseLeave={() => setIsHovered(null)}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2 text-white group-hover:text-primary-300 transition-colors duration-300">
                    {item.title}
                  </h2>
                  
                  <p className="text-secondary-300 group-hover:text-secondary-200 transition-colors duration-300">
                    {item.description}
                  </p>
                </div>

                {/* Hover effect */}
                {isHovered === item.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-12 text-center text-secondary-400"
      >
        <p className="text-sm">
          Deshazte de todas tus criaturas mágicas para no ser el último pecador
        </p>
      </motion.div>
    </div>
  )
}
