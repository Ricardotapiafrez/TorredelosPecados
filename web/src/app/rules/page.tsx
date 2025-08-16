'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Users, Clock, Target, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

export default function RulesPage() {
  const rules = [
    {
      title: 'Objetivo del Juego',
      description: 'El primer jugador en deshacerse de todas sus criaturas (de la mano, las boca arriba y las boca abajo) gana la partida. El último jugador en quedarse con criaturas es el perdedor, el **"Pecador"**, y debe cargar con la "Torre de los Pecados" hasta la próxima partida.',
      icon: Target
    },
    {
      title: 'Jugadores',
      description: 'El juego se puede jugar con 2 a 6 jugadores.  Se reparten 12 cartas a cada jugador.',
      icon: Users
    },
    {
      title: 'Turnos',
      description: 'En tu turno, puedes jugar una carta de tu mano. Después de jugar una carta, robas una nueva carta del mazo.',
      icon: Clock
    },
    {
      title: 'Tipos de Cartas',
      description: 'Existen tres tipos de cartas: Criaturas, Hechizos y Trampas. Cada tipo tiene efectos diferentes.',
      icon: BookOpen
    }
  ]

  const preparacion = [
    {
      paso: 1,
      descripcion: 'Se usa una baraja de 52 cartas, donde cada naipe representa una criatura mágica con un valor (del 1 al 13, siendo el 1 el As y el 13 el Rey). No se usan los Jokers.'
    },
    {
      paso: 2,
      descripcion: 'Se reparten 12 cartas (criaturas) a cada jugador.'
    },
    {
      paso: 3,
      descripcion: 'Cada jugador toma 3 criaturas de su mano y las coloca boca arriba frente a él. Luego, coloca otras 3 criaturas boca abajo encima de las anteriores. Las criaturas restantes forman el mazo de robo, o el "Pozo de Almas", y se colocan boca abajo en el centro de la mesa.'
    }
  ]

  const cardTypes = [
    {
      type: 'Criatura',
      description: 'Se colocan en tu campo de batalla. Tienen poder de ataque y pueden ser atacadas por otras criaturas o hechizos.',
      icon: '🐉',
      color: 'border-primary-500'
    },
    {
      type: 'Hechizo',
      description: 'Tienen efectos especiales inmediatos. Pueden eliminar criaturas, curar, o causar daño directo.',
      icon: '✨',
      color: 'border-accent-500'
    },
    {
      type: 'Trampa',
      description: 'Protegen contra ataques y pueden activarse en momentos específicos para defenderte.',
      icon: '🛡️',
      color: 'border-secondary-500'
    }
  ]

  const gameFlow = [
    'Cada jugador recibe 5 cartas al inicio del juego',
    'Los jugadores se turnan para jugar cartas',
    'Las criaturas se colocan en el campo de batalla',
    'Los hechizos y trampas se activan inmediatamente',
    'Después de jugar una carta, roba una nueva del mazo',
    'El juego continúa hasta que solo quede un jugador con criaturas',
    'El último jugador con criaturas se convierte en el "pecador"'
  ]

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="btn-secondary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Menú
        </Link>
        <h1 className="text-3xl font-bold text-primary-400">Reglas del Juego</h1>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Basic Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {rules.map((rule, index) => (
            <motion.div
              key={rule.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <rule.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white">{rule.title}</h3>
                  <p className="text-secondary-300 leading-relaxed">{rule.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Preparación del Juego */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Preparación del Juego</h2>
          <ol className="list-decimal list-inside space-y-2 text-secondary-300">
            {preparacion.map((paso) => (
              <li key={paso.paso}>{paso.descripcion}</li>
            ))}
          </ol>
        </motion.div>


        {/* Card Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Tipos de Cartas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cardTypes.map((cardType, index) => (
              <motion.div
                key={cardType.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`border-2 rounded-lg p-6 text-center ${cardType.color} bg-gradient-to-br from-secondary-800/50 to-secondary-700/50`}
              >
                <div className="text-4xl mb-4">{cardType.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-white">{cardType.type}</h3>
                <p className="text-secondary-300 text-sm leading-relaxed">{cardType.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Game Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Flujo del Juego</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gameFlow.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="flex items-start space-x-3"
              >
                <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                <p className="text-secondary-300 leading-relaxed">{step}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Victory Conditions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-8 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-600"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-red-400">Condiciones de Victoria</h2>
          <div className="text-center">
            <p className="text-lg text-secondary-300 mb-4">
              El objetivo es <strong className="text-white">NO</strong> ser el último jugador con criaturas en el campo.
            </p>
            <p className="text-secondary-300">
              El último jugador que se quede con criaturas se convierte en el <strong className="text-red-400">"Pecador"</strong> y pierde la partida.
            </p>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="card p-8 bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-600"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-green-400">Consejos Estratégicos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <p className="text-secondary-300 text-sm">Usa hechizos para eliminar criaturas poderosas de tus oponentes</p>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <p className="text-secondary-300 text-sm">Las trampas pueden protegerte de ataques inesperados</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <p className="text-secondary-300 text-sm">Prioriza eliminar criaturas de jugadores con más cartas</p>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <p className="text-secondary-300 text-sm">Gestiona tu mano para no quedarte sin opciones</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
