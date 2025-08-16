import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Torre de los Pecados - Juego de Cartas',
  description: 'Un juego de cartas chileno ambientado en un universo de fantasía donde el objetivo es deshacerse de todas tus criaturas mágicas.',
  keywords: ['juego', 'cartas', 'chile', 'torre', 'pecados', 'fantasía'],
  authors: [{ name: 'Torre de los Pecados Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900">
          {children}
        </div>
      </body>
    </html>
  )
}
