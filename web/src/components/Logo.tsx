'use client'

import Image from 'next/image'
import { useState } from 'react'

interface LogoProps {
  variant?: 'default' | 'white' | 'black' | 'square'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function Logo({ 
  variant = 'default', 
  size = 'md', 
  className = '' 
}: LogoProps) {
  const [imageError, setImageError] = useState(false)

  const getLogoPath = () => {
    if (imageError) {
      return null
    }

    switch (variant) {
      case 'white':
        return '/images/logos/logo_white.png'
      case 'black':
        return '/images/logos/logo_black.png'
      case 'square':
        return '/images/logos/logo_square.png'
      default:
        return '/images/logos/logo_principal.png'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-24 h-8'
      case 'md':
        return 'w-32 h-10'
      case 'lg':
        return 'w-40 h-12'
      case 'xl':
        return 'w-48 h-16'
      default:
        return 'w-32 h-10'
    }
  }

  const logoPath = getLogoPath()

  if (!logoPath) {
    // Fallback text logo
    return (
      <div className={`flex items-center ${getSizeClasses()} ${className}`}>
        <div className="text-center">
          <h1 className="text-lg font-fantasy font-bold text-primary-400">
            Torre de los Pecados
          </h1>
          <p className="text-xs text-secondary-400">
            Juego de Cartas
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${getSizeClasses()} ${className}`}>
      <Image
        src={logoPath}
        alt="Torre de los Pecados"
        fill
        className="object-contain"
        onError={() => setImageError(true)}
        priority={size === 'xl'}
      />
    </div>
  )
}
