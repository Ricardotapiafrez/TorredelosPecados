'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Target, AlertCircle, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

interface DropZoneProps {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  isActive?: boolean
  isHighlighted?: boolean
  isValidDrop?: boolean
  onDrop?: (card: any, zoneId: string) => void
  onDragOver?: (event: React.DragEvent) => void
  onDragEnter?: (event: React.DragEvent) => void
  onDragLeave?: (event: React.DragEvent) => void
  className?: string
  children?: React.ReactNode
}

export default function DropZone({
  id,
  title,
  description,
  icon = <Target className="w-5 h-5" />,
  isActive = true,
  isHighlighted = false,
  isValidDrop = true,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  className = '',
  children
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
    onDragOver?.(event)
  }

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
    onDragEnter?.(event)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    // Solo establecer isDragOver en false si realmente salimos del elemento
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragOver(false)
    }
    onDragLeave?.(event)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    
    try {
      const cardData = event.dataTransfer.getData('application/json')
      const card = JSON.parse(cardData)
      onDrop?.(card, id)
    } catch (error) {
      console.error('Error parsing dropped card data:', error)
    }
  }

  const getZoneStyles = () => {
    if (!isActive) {
      return 'bg-gray-700/50 border-gray-600/50 text-gray-500'
    }
    
    if (isDragOver && isValidDrop) {
      return 'bg-accent-500/20 border-accent-400 ring-2 ring-accent-400/50'
    }
    
    if (isDragOver && !isValidDrop) {
      return 'bg-red-500/20 border-red-400 ring-2 ring-red-400/50'
    }
    
    if (isHighlighted) {
      return 'bg-primary-500/20 border-primary-400 ring-1 ring-primary-400/30'
    }
    
    return 'bg-gray-800/80 border-gray-600 hover:border-gray-500 hover:bg-gray-800'
  }

  return (
    <motion.div
      className={clsx(
        'relative rounded-lg border-2 border-dashed transition-all duration-200',
        'min-h-[120px] flex flex-col items-center justify-center p-4',
        getZoneStyles(),
        className
      )}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={isActive ? { scale: 1.02 } : {}}
      animate={{
        scale: isDragOver ? 1.05 : 1,
        borderColor: isDragOver 
          ? (isValidDrop ? 'rgb(34 197 94)' : 'rgb(239 68 68)')
          : undefined
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Contenido existente */}
      {children && (
        <div className="w-full h-full">
          {children}
        </div>
      )}

      {/* Overlay de drag & drop */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            className="absolute inset-0 bg-black/20 rounded-lg flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 10 }}
            >
              {isValidDrop ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-semibold">Soltar aquí</p>
                  <p className="text-green-300 text-sm">{title}</p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-red-400 font-semibold">Zona inválida</p>
                  <p className="text-red-300 text-sm">No puedes soltar aquí</p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de zona cuando no hay contenido */}
      {!children && (
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            {icon}
          </div>
          <h3 className="font-semibold text-gray-300 mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}

      {/* Indicador de estado */}
      {!isActive && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        </div>
      )}
      
      {isHighlighted && (
        <div className="absolute top-2 right-2">
          <motion.div 
            className="w-2 h-2 bg-primary-400 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      )}
    </motion.div>
  )
}
