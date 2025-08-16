import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

interface ConnectionManagerProps {
  socket: Socket | null;
  playerId: string | null;
  onReconnectionSuccess: (gameState: any) => void;
  onReconnectionFailed: (error: string) => void;
}

const ConnectionManager: React.FC<ConnectionManagerProps> = ({
  socket,
  playerId,
  onReconnectionSuccess,
  onReconnectionFailed
}) => {
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [reconnectionAttempts, setReconnectionAttempts] = useState(0);
  const [reconnectionToken, setReconnectionToken] = useState<string | null>(null);
  const [showReconnectionModal, setShowReconnectionModal] = useState(false);

  const MAX_RECONNECTION_ATTEMPTS = 3;

  useEffect(() => {
    if (!socket) return;

    // Guardar token de reconexión en localStorage
    const handleDisconnect = () => {
      console.log('📡 Desconectado del servidor');
      setIsDisconnected(true);
      setShowReconnectionModal(true);
      
      // Guardar datos para reconexión
      if (playerId) {
        localStorage.setItem('torre_pecados_player_id', playerId);
        if (reconnectionToken) {
          localStorage.setItem('torre_pecados_reconnection_token', reconnectionToken);
        }
      }
    };

    const handleConnect = () => {
      console.log('✅ Reconectado al servidor');
      setIsDisconnected(false);
      setReconnectionAttempts(0);
      setShowReconnectionModal(false);
    };

    const handleReconnectionSuccess = (data: any) => {
      console.log('✅ Reconexión exitosa');
      setIsDisconnected(false);
      setShowReconnectionModal(false);
      onReconnectionSuccess(data.gameState);
      
      // Limpiar datos de reconexión
      localStorage.removeItem('torre_pecados_player_id');
      localStorage.removeItem('torre_pecados_reconnection_token');
    };

    const handleReconnectionFailed = (data: any) => {
      console.log('❌ Reconexión fallida:', data.message);
      onReconnectionFailed(data.message);
      setReconnectionAttempts(prev => prev + 1);
    };

    const handlePlayerDisconnected = (data: any) => {
      console.log(`📡 ${data.playerName} se desconectó`);
    };

    const handlePlayerReconnected = (data: any) => {
      console.log(`✅ ${data.playerName} se reconectó`);
    };

    const handlePlayerInactive = (data: any) => {
      console.log(`⏰ ${data.playerName} removido por inactividad`);
    };

    const handlePlayerRemoved = (data: any) => {
      console.log(`🧹 ${data.playerName} removido por desconexión prolongada`);
    };

    // Event listeners
    socket.on('disconnect', handleDisconnect);
    socket.on('connect', handleConnect);
    socket.on('reconnectionSuccess', handleReconnectionSuccess);
    socket.on('reconnectionFailed', handleReconnectionFailed);
    socket.on('playerDisconnected', handlePlayerDisconnected);
    socket.on('playerReconnected', handlePlayerReconnected);
    socket.on('playerInactive', handlePlayerInactive);
    socket.on('playerRemoved', handlePlayerRemoved);

    // Intentar reconexión automática al cargar
    attemptAutoReconnection();

    return () => {
      socket.off('disconnect', handleDisconnect);
      socket.off('connect', handleConnect);
      socket.off('reconnectionSuccess', handleReconnectionSuccess);
      socket.off('reconnectionFailed', handleReconnectionFailed);
      socket.off('playerDisconnected', handlePlayerDisconnected);
      socket.off('playerReconnected', handlePlayerReconnected);
      socket.off('playerInactive', handlePlayerInactive);
      socket.off('playerRemoved', handlePlayerRemoved);
    };
  }, [socket, playerId, reconnectionToken, onReconnectionSuccess, onReconnectionFailed]);

  const attemptAutoReconnection = () => {
    const savedPlayerId = localStorage.getItem('torre_pecados_player_id');
    const savedToken = localStorage.getItem('torre_pecados_reconnection_token');

    if (savedPlayerId && savedToken && socket) {
      console.log('🔄 Intentando reconexión automática...');
      socket.emit('reconnect', {
        playerId: savedPlayerId,
        token: savedToken
      });
    }
  };

  const handleManualReconnection = () => {
    if (!socket || reconnectionAttempts >= MAX_RECONNECTION_ATTEMPTS) return;

    const savedPlayerId = localStorage.getItem('torre_pecados_player_id');
    const savedToken = localStorage.getItem('torre_pecados_reconnection_token');

    if (savedPlayerId && savedToken) {
      console.log('🔄 Intentando reconexión manual...');
      socket.emit('reconnect', {
        playerId: savedPlayerId,
        token: savedToken
      });
    }
  };

  const handleGiveUp = () => {
    setShowReconnectionModal(false);
    setIsDisconnected(false);
    
    // Limpiar datos de reconexión
    localStorage.removeItem('torre_pecados_player_id');
    localStorage.removeItem('torre_pecados_reconnection_token');
    
    // Redirigir al lobby
    window.location.href = '/';
  };

  if (!showReconnectionModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📡</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Conexión Perdida
          </h2>
          <p className="text-gray-600 mb-6">
            Se ha perdido la conexión con el servidor. ¿Deseas intentar reconectarte?
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleManualReconnection}
              disabled={reconnectionAttempts >= MAX_RECONNECTION_ATTEMPTS}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {reconnectionAttempts >= MAX_RECONNECTION_ATTEMPTS 
                ? 'Máximo de intentos alcanzado' 
                : `Reconectar (${reconnectionAttempts + 1}/${MAX_RECONNECTION_ATTEMPTS})`
              }
            </button>
            
            <button
              onClick={handleGiveUp}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Volver al Lobby
            </button>
          </div>
          
          {reconnectionAttempts > 0 && (
            <p className="text-sm text-gray-500 mt-4">
              Intentos de reconexión: {reconnectionAttempts}/{MAX_RECONNECTION_ATTEMPTS}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionManager;
