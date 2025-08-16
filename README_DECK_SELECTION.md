# 🎴 Selección de Mazos - Torre de los Pecados

## 📖 Descripción

La funcionalidad de selección de mazos permite a los jugadores y bots elegir entre cuatro mazos temáticos únicos, cada uno con sus propias estrategias, personalidades de IA y estilos de juego.

## 🚀 Características

### ✨ Para Jugadores Humanos
- **Selección Individual**: Cada jugador puede elegir su propio mazo
- **Cambio Dinámico**: Los mazos se pueden cambiar antes del inicio del juego
- **Información Detallada**: Cada mazo incluye descripción, tema y estrategia
- **Permisos Inteligentes**: Los jugadores solo pueden cambiar su propio mazo (a menos que sean host)

### 🤖 Para Bots (IA)
- **Selección Automática**: Los bots eligen mazos aleatoriamente al ser creados
- **Variedad Garantizada**: Cada bot puede tener un mazo diferente
- **Personalidad Adaptativa**: La IA se comporta según el mazo seleccionado
- **Estrategias Optimizadas**: Cada mazo tiene estrategias de IA específicas

## 🎯 Mazos Disponibles

### 👼 Mazo de Ángeles
- **Tema**: Defensa y control
- **Estrategia**: Usa cartas protectoras y purificadoras
- **Personalidad IA**: Defensiva y curativa
- **Ideal para**: Jugadores que prefieren estrategias defensivas

### 😈 Mazo de Demonios
- **Tema**: Agresión y caos
- **Estrategia**: Aplica presión constante con cartas destructivas
- **Personalidad IA**: Agresiva y destructiva
- **Ideal para**: Jugadores que buscan dominar el campo de batalla

### 🐉 Mazo de Dragones
- **Tema**: Poderío y dominio
- **Estrategia**: Acumula fuerza y usa ataques directos
- **Personalidad IA**: Poderosa y dominante
- **Ideal para**: Jugadores que prefieren ataques directos

### 🧙‍♂️ Mazo de Magos
- **Tema**: Versatilidad y control
- **Estrategia**: Adapta tu juego según la situación
- **Personalidad IA**: Estratégica y versátil
- **Ideal para**: Jugadores que valoran la flexibilidad

### ⚒️ Mazo de Enanos
- **Tema**: Construcción y sinergia
- **Estrategia**: Construye desde la base y potencia con máquinas de guerra
- **Personalidad IA**: Metódica y constructiva
- **Ideal para**: Jugadores que disfrutan de estrategias de construcción

### 🌿 Mazo de Elfos del Bosque
- **Tema**: Crecimiento y armonía
- **Estrategia**: Desarrolla gradualmente y equilibra el ciclo natural
- **Personalidad IA**: Pacífica y equilibrada
- **Ideal para**: Jugadores que valoran la armonía y el desarrollo gradual

### 🖤 Mazo de Elfos Oscuros
- **Tema**: Sacrificio y corrupción
- **Estrategia**: Sacrifica a los débiles para invocar la oscuridad absoluta
- **Personalidad IA**: Corrupta y sacrificial
- **Ideal para**: Jugadores que disfrutan de estrategias de sacrificio y poder oscuro

### 🪖 Mazo de Orcos
- **Tema**: Horda y fuerza bruta
- **Estrategia**: Construye hordas masivas y usa tambores para potenciar ataques
- **Personalidad IA**: Agresiva y masiva
- **Ideal para**: Jugadores que prefieren ataques directos y poder en masa

## 🎮 Cómo Usar

### 1. En el Lobby
1. Haz clic en el botón **"Seleccionar Mazos"** en el header
2. Verás la lista de todos los jugadores y sus mazos actuales
3. Haz clic en un jugador para cambiar su mazo
4. Selecciona el nuevo mazo de las opciones disponibles
5. Confirma el cambio

### 2. Al Crear una Sala
1. Al crear una sala, puedes especificar el mazo por defecto
2. Los bots se crearán automáticamente con mazos aleatorios
3. Los jugadores pueden unirse con mazos específicos

### 3. Al Unirse a una Sala
1. Al unirse a una sala, puedes especificar tu mazo preferido
2. Si no especificas un mazo, se usará el mazo por defecto de la sala

## 🔧 Configuración Técnica

### Backend
```bash
# El servidor debe estar ejecutándose en el puerto 5001
cd TorredelosPecados/api
npm start
```

### Frontend
```bash
# El cliente debe estar ejecutándose en el puerto 3000
cd TorredelosPecados/web
npm run dev
```

### Pruebas
```bash
# Ejecutar pruebas de selección de mazos
cd TorredelosPecados
node test_deck_selection.js
```

## 📱 Interfaz de Usuario

### Panel de Selección de Mazos
- **Lista de Jugadores**: Muestra todos los jugadores con sus mazos actuales
- **Indicadores Visuales**: 
  - 👤 Icono de usuario para jugadores humanos
  - 🤖 Icono de bot para jugadores IA
  - 🎴 Icono del mazo seleccionado
- **Permisos**: 
  - Verde: Puedes cambiar este mazo
  - Gris: No tienes permisos para cambiar este mazo
- **Información Detallada**: Descripción, tema y estrategia de cada mazo

### Selector de Mazos
- **Vista de Tarjetas**: Cada mazo se muestra como una tarjeta interactiva
- **Información Completa**: 
  - Icono representativo
  - Nombre del mazo
  - Descripción temática
  - Estrategia recomendada
- **Selección Visual**: Indicador claro del mazo actualmente seleccionado
- **Confirmación**: Cambio inmediato al hacer clic

## 🔄 Flujo de Funcionamiento

### 1. Creación de Sala
```
Host crea sala → Especifica mazo por defecto → Bots se crean con mazos aleatorios
```

### 2. Unión de Jugadores
```
Jugador se une → Especifica mazo preferido → Se asigna mazo individual
```

### 3. Selección de Mazos
```
Abrir panel → Ver mazos actuales → Seleccionar jugador → Elegir nuevo mazo → Confirmar cambio
```

### 4. Inicio del Juego
```
Cada jugador recibe 12 cartas de su mazo → Cartas se organizan → IA usa estrategias específicas
```

## 🧪 Testing

### Casos de Prueba Automatizados
1. **Creación de Sala con Mazo Específico**
2. **Unión con Mazo Específico**
3. **Obtención de Información de Mazos**
4. **Cambio de Mazo de Jugador**
5. **Verificación de Cambio de Mazo**
6. **Creación de Modo Solitario con Bots**
7. **Verificación de Mazos de Bots**
8. **Bloqueo de Cambio Durante el Juego**

### Ejecutar Pruebas
```bash
node test_deck_selection.js
```

## 📊 Eventos de Socket

### Cliente → Servidor
- `changePlayerDeck`: Cambiar mazo de un jugador
- `getPlayersDeckInfo`: Obtener información de mazos de todos los jugadores

### Servidor → Cliente
- `deckChanged`: Confirmación de cambio de mazo
- `playersDeckInfo`: Información de mazos de todos los jugadores
- `playerDeckChanged`: Notificación de cambio de mazo de otro jugador

## 🛠️ Desarrollo

### Archivos Principales

#### Backend
- `api/src/models/Player.js` - Modelo de jugador con selección de mazo
- `api/src/models/Game.js` - Lógica de juego con mazos individuales
- `api/src/services/GameService.js` - Servicio de gestión de mazos
- `api/server.js` - Eventos de socket para selección de mazos

#### Frontend
- `web/src/hooks/useDeckSelection.ts` - Hook para gestión de mazos
- `web/src/components/DeckSelectionPanel.tsx` - Componente de selección
- `web/src/app/lobby/page.tsx` - Integración en el lobby

### Estructura de Datos

#### Player
```typescript
interface Player {
  id: string;
  name: string;
  selectedDeck: string; // 'angels' | 'demons' | 'dragons' | 'mages'
  // ... otras propiedades
}
```

#### DeckInfo
```typescript
interface DeckInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  theme: string;
  strategy: string;
}
```

## 🎨 Personalización

### Agregar Nuevos Mazos
1. Actualizar `THEMATIC_DECKS` en `Card.js`
2. Agregar mazo en `getThematicDeck()`
3. Actualizar `availableDecks` en `useDeckSelection.ts`
4. Agregar estrategias de IA en `AIService.js`

### Modificar Estrategias de IA
1. Editar `deckStrategies` en `AIService.js`
2. Ajustar `generateAIPersonality()` en `GameService.js`
3. Actualizar nombres de bots en `generateAINames()`

## 🔮 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] Mazos personalizados por jugador
- [ ] Estadísticas de rendimiento por mazo
- [ ] Sistema de recomendaciones
- [ ] Torneos específicos por tipo de mazo
- [ ] Desbloqueo progresivo de mazos

### Optimizaciones Técnicas
- [ ] Caché de mazos para mejor rendimiento
- [ ] Validación avanzada de configuraciones
- [ ] Sistema de analytics
- [ ] Backup automático de configuraciones

## 📞 Soporte

### Problemas Comunes
1. **No se puede cambiar mazo**: Verificar permisos de host
2. **Bots con mazos iguales**: Comportamiento normal, se distribuyen aleatoriamente
3. **Error de conexión**: Verificar que el servidor esté ejecutándose

### Logs Útiles
```javascript
console.log(`🎴 ${player.name} cambió su mazo a: ${deckType}`);
console.log(`🤖 ${botName} agregado con mazo ${selectedDeck}`);
console.log(`✅ ${player.name} recibió 12 cartas del mazo ${player.selectedDeck}`);
```

## 📝 Licencia

Esta funcionalidad es parte del proyecto Torre de los Pecados y está sujeta a la misma licencia del proyecto principal.

---

**¡Disfruta explorando los diferentes mazos y estrategias en Torre de los Pecados!** 🎴✨
