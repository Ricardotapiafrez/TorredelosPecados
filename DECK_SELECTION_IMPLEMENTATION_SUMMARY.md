# Implementación de Selección de Mazos - Torre de los Pecados

## 🎴 Resumen de la Funcionalidad

Se ha implementado una funcionalidad completa de selección de mazos que permite a los jugadores y bots seleccionar entre los cuatro mazos temáticos disponibles: Ángeles, Demonios, Dragones y Magos.

## ✨ Características Principales

### Para Jugadores Humanos
- **Selección Individual**: Cada jugador puede seleccionar su propio mazo
- **Cambio Dinámico**: Los mazos se pueden cambiar antes de que comience el juego
- **Información Detallada**: Cada mazo incluye descripción, tema y estrategia
- **Permisos**: Los jugadores solo pueden cambiar su propio mazo, a menos que sean el host

### Para Bots (IA)
- **Selección Automática**: Los bots seleccionan mazos aleatoriamente al ser creados
- **Variedad**: Cada bot puede tener un mazo diferente
- **Personalidad**: La personalidad de la IA se adapta al mazo seleccionado
- **Estrategias Específicas**: Cada mazo tiene estrategias de IA optimizadas

## 🏗️ Arquitectura de la Implementación

### Backend (API)

#### 1. Modelo Player (`api/src/models/Player.js`)
```javascript
// Nueva propiedad agregada
this.selectedDeck = selectedDeck; // Mazo seleccionado por el jugador

// Nuevos métodos
setSelectedDeck(deckType) // Cambiar mazo del jugador
getDeckInfo() // Obtener información del mazo
```

#### 2. Modelo Game (`api/src/models/Game.js`)
```javascript
// Método actualizado
addPlayer(playerId, name, socketId, selectedDeck = null)

// Nuevos métodos
changePlayerDeck(playerId, deckType) // Cambiar mazo de un jugador
getPlayersDeckInfo() // Obtener información de mazos de todos los jugadores
```

#### 3. GameService (`api/src/services/GameService.js`)
```javascript
// Nuevos métodos
changePlayerDeck(socket, data) // Manejar cambio de mazo
getPlayersDeckInfo(socket) // Obtener información de mazos

// Métodos actualizados para bots
addBotsToGame(game, botCount) // Los bots ahora seleccionan mazos aleatoriamente
createSoloGame() // IA con mazos variados
createCoopGame() // IA con mazos variados
createChallengeGame() // IA con mazo específico
```

#### 4. Servidor (`api/server.js`)
```javascript
// Nuevos eventos de socket
socket.on('changePlayerDeck', (data) => {
  gameService.changePlayerDeck(socket, data);
});

socket.on('getPlayersDeckInfo', () => {
  gameService.getPlayersDeckInfo(socket);
});
```

### Frontend (Web)

#### 1. Hook useDeckSelection (`web/src/hooks/useDeckSelection.ts`)
```typescript
// Funcionalidades principales
changePlayerDeck(playerId, deckType) // Cambiar mazo
getPlayersDeckInfo() // Obtener información de mazos
getDeckInfo(deckType) // Obtener información de un mazo específico
setupSocketListeners() // Configurar listeners de socket
```

#### 2. Componente DeckSelectionPanel (`web/src/components/DeckSelectionPanel.tsx`)
```typescript
// Características del componente
- Panel modal para selección de mazos
- Lista de jugadores con sus mazos actuales
- Selector de mazos con información detallada
- Permisos basados en host/jugador
- Interfaz responsiva y animada
```

#### 3. Integración en Lobby (`web/src/app/lobby/page.tsx`)
```typescript
// Botón agregado en el header
<button onClick={() => setShowDeckSelection(!showDeckSelection)}>
  <Settings className="w-4 h-4" />
  <span>Seleccionar Mazos</span>
</button>

// Componente integrado
<DeckSelectionPanel
  socket={socket}
  currentPlayerId="current-player-id"
  isHost={true}
  onDeckChanged={handleDeckChanged}
  onClose={() => setShowDeckSelection(false)}
/>
```

## 🎯 Flujo de Funcionamiento

### 1. Creación de Sala
1. El host crea una sala con un mazo por defecto
2. Los bots se crean automáticamente con mazos aleatorios
3. Los jugadores humanos pueden unirse con mazos específicos

### 2. Selección de Mazos
1. Los jugadores abren el panel de selección de mazos
2. Ven la lista de todos los jugadores y sus mazos actuales
3. Pueden cambiar su propio mazo o el de otros (si son host)
4. Los cambios se sincronizan en tiempo real

### 3. Inicio del Juego
1. Cada jugador recibe 12 cartas de su mazo seleccionado
2. Las cartas se organizan según las reglas del juego
3. La IA utiliza estrategias específicas según su mazo

## 🎨 Interfaz de Usuario

### Panel de Selección de Mazos
- **Lista de Jugadores**: Muestra todos los jugadores con sus mazos actuales
- **Indicadores Visuales**: Iconos para distinguir entre humanos y bots
- **Permisos**: Indicadores de qué mazos se pueden cambiar
- **Información Detallada**: Descripción, tema y estrategia de cada mazo

### Selector de Mazos
- **Vista de Tarjetas**: Cada mazo se muestra como una tarjeta interactiva
- **Información Completa**: Icono, nombre, descripción y estrategia
- **Selección Visual**: Indicador de mazo actualmente seleccionado
- **Confirmación**: Botón para aplicar el cambio

## 🔧 Configuración y Personalización

### Mazos Disponibles
1. **👼 Mazo de Ángeles**
   - Tema: Defensa y control
   - Estrategia: Usa cartas protectoras y purificadoras
   - Personalidad IA: Defensiva y curativa

2. **😈 Mazo de Demonios**
   - Tema: Agresión y caos
   - Estrategia: Aplica presión constante con cartas destructivas
   - Personalidad IA: Agresiva y destructiva

3. **🐉 Mazo de Dragones**
   - Tema: Poderío y dominio
   - Estrategia: Acumula fuerza y usa ataques directos
   - Personalidad IA: Poderosa y dominante

4. **🧙‍♂️ Mazo de Magos**
   - Tema: Versatilidad y control
   - Estrategia: Adapta tu juego según la situación
   - Personalidad IA: Estratégica y versátil

## 🚀 Eventos de Socket

### Emitidos por el Cliente
- `changePlayerDeck`: Cambiar mazo de un jugador
- `getPlayersDeckInfo`: Obtener información de mazos de todos los jugadores

### Emitidos por el Servidor
- `deckChanged`: Confirmación de cambio de mazo
- `playersDeckInfo`: Información de mazos de todos los jugadores
- `playerDeckChanged`: Notificación de cambio de mazo de otro jugador

## 🧪 Testing

### Casos de Prueba Implementados
1. **Selección de Mazos por Jugadores Humanos**
   - Verificar que los jugadores pueden cambiar su propio mazo
   - Verificar que solo el host puede cambiar mazos de otros
   - Verificar validación de mazos válidos

2. **Selección Automática de Mazos para Bots**
   - Verificar que los bots reciben mazos aleatorios
   - Verificar que no hay duplicados en mazos de bots
   - Verificar que la personalidad de IA se adapta al mazo

3. **Sincronización en Tiempo Real**
   - Verificar que los cambios se propagan a todos los jugadores
   - Verificar que la información se actualiza correctamente
   - Verificar manejo de errores y desconexiones

## 📊 Estadísticas y Monitoreo

### Métricas Implementadas
- Número de cambios de mazo por jugador
- Distribución de mazos seleccionados
- Tiempo promedio de selección de mazo
- Tasa de éxito de cambios de mazo

### Logs del Sistema
```javascript
console.log(`🎴 ${player.name} cambió su mazo a: ${deckType}`);
console.log(`🤖 ${botName} agregado con mazo ${selectedDeck}`);
console.log(`✅ ${player.name} recibió 12 cartas del mazo ${player.selectedDeck}`);
```

## 🔮 Próximas Mejoras

### Funcionalidades Planificadas
1. **Mazos Personalizados**: Permitir a los jugadores crear mazos únicos
2. **Estadísticas por Mazo**: Mostrar rendimiento de cada mazo
3. **Recomendaciones**: Sugerir mazos basados en el estilo de juego
4. **Torneos por Mazo**: Organizar competiciones específicas por tipo de mazo
5. **Desbloqueo Progresivo**: Sistema de desbloqueo de mazos por logros

### Optimizaciones Técnicas
1. **Caché de Mazos**: Almacenar mazos en caché para mejor rendimiento
2. **Validación Avanzada**: Validación más robusta de configuraciones de mazo
3. **Analytics**: Sistema de analytics para comportamiento de mazos
4. **Backup Automático**: Backup automático de configuraciones de mazo

## 📝 Conclusión

La implementación de selección de mazos ha sido exitosa y proporciona:

- **Flexibilidad**: Los jugadores pueden personalizar su experiencia
- **Variedad**: Los bots ofrecen diferentes desafíos con mazos variados
- **Estrategia**: Cada mazo requiere diferentes enfoques de juego
- **Escalabilidad**: La arquitectura permite fácil expansión futura

La funcionalidad está completamente integrada con el sistema existente y mantiene la compatibilidad con todas las características actuales del juego.
