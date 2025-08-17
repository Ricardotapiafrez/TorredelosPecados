interface Room {
  name: string
  players: number
  maxPlayers: number
  isPrivate: boolean
  gameType: 'multiplayer' | 'bot'
}

interface RoomSelectorProps {
  rooms: Room[]
  selectedRoom: string
  onRoomSelect: (roomName: string) => void
  onRoomCreate: (roomName: string) => void
}

export default function RoomSelector({ rooms, selectedRoom, onRoomSelect, onRoomCreate }: RoomSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
        <h4 className="text-lg font-bold text-white mb-3">Salas disponibles</h4>
        <div className="space-y-2">
          {rooms.map((room) => (
            <button
              key={room.name}
              onClick={() => onRoomSelect(room.name)}
              className={`w-full p-3 rounded text-left transition-colors ${
                selectedRoom === room.name
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span>{room.name}</span>
                  {room.isPrivate && (
                    <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Privada</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">
                    {room.players}/{room.maxPlayers} jugadores
                  </span>
                  <div className="flex space-x-1">
                    {Array.from({ length: room.maxPlayers }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < room.players ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-2">
          ¿No encuentras la sala que buscas?
        </p>
        <button
          onClick={() => onRoomCreate('Nueva Sala')}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Crear Nueva Sala
        </button>
      </div>
    </div>
  )
}
