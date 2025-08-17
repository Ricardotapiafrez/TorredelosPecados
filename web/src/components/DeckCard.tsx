import Image from 'next/image'

interface DeckCardProps {
  id: string
  name: string
  color: string
  icon: string
  isSelected: boolean
  onClick: () => void
}

export default function DeckCard({ id, name, color, icon, isSelected, onClick }: DeckCardProps) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
        isSelected
          ? 'border-purple-500 bg-purple-600 bg-opacity-20 shadow-lg shadow-purple-500/25'
          : 'border-gray-600 bg-gray-800 bg-opacity-50 hover:border-purple-400'
      }`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h4 className="text-lg font-bold text-white mb-2">{name}</h4>
      
      {/* Preview de cartas del mazo */}
      <div className="flex justify-center space-x-1 mb-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative w-8 h-12 bg-gray-700 rounded border border-gray-600">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-600 to-gray-800 rounded"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-gray-300">{i}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className={`w-full h-2 rounded ${color}`}></div>
      
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">✓</span>
        </div>
      )}
    </button>
  )
}
