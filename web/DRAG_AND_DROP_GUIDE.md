# Guía del Sistema Drag & Drop

## 📋 Descripción General

El sistema de drag & drop permite a los jugadores arrastrar cartas desde su mano hacia diferentes zonas de juego para realizar acciones. Esto mejora significativamente la experiencia de usuario al proporcionar una interfaz más intuitiva y visual.

## 🎯 Características Implementadas

### ✅ Funcionalidades Principales

1. **Arrastre de Cartas**
   - Las cartas de la mano del jugador son arrastrables durante su turno
   - Efectos visuales durante el arrastre (opacidad reducida)
   - Imagen fantasma personalizada durante el arrastre

2. **Zonas de Destino**
   - **Torre de los Pecados**: Para jugar cartas normalmente
   - **Zona de Juego**: Área específica para jugar cartas
   - **Zona de Tomar Torre**: Para tomar la torre de los pecados

3. **Validación Visual**
   - Zonas válidas se resaltan en verde
   - Zonas inválidas se resaltan en rojo
   - Indicadores visuales de estado activo/inactivo

4. **Feedback de Usuario**
   - Instrucciones contextuales
   - Tooltips informativos
   - Animaciones suaves

## 🏗️ Arquitectura del Sistema

### Componentes Principales

#### 1. `useDragAndDrop` Hook
```typescript
// web/src/hooks/useDragAndDrop.ts
interface UseDragAndDropOptions {
  onDragStart?: (card: any, event: React.DragEvent) => void
  onDragEnd?: (card: any, event: React.DragEvent) => void
  onDrop?: (card: any, target: any, event: React.DragEvent) => void
  onDragOver?: (event: React.DragEvent) => void
  onDragEnter?: (event: React.DragEvent) => void
  onDragLeave?: (event: React.DragEvent) => void
}
```

#### 2. `DropZone` Component
```typescript
// web/src/components/DropZone.tsx
interface DropZoneProps {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  isActive?: boolean
  isHighlighted?: boolean
  isValidDrop?: boolean
  onDrop?: (card: any, zoneId: string) => void
  // ... otros props
}
```

#### 3. `GameCard` Component (Modificado)
```typescript
// web/src/components/GameCard.tsx
interface GameCardProps {
  // ... props existentes
  isDraggable?: boolean
  onDragStart?: (card: Card, event: React.DragEvent) => void
  onDragEnd?: (card: Card, event: React.DragEvent) => void
}
```

## 🎮 Cómo Usar el Sistema

### Para Jugadores

1. **Durante tu turno**, las cartas de tu mano se vuelven arrastrables
2. **Haz clic y arrastra** una carta hacia una zona de destino
3. **Suelta la carta** en la zona deseada:
   - **Zona verde**: Acción válida
   - **Zona roja**: Acción inválida
4. **Cartas especiales** (2, 8, 10) pueden requerir selección adicional de objetivo

### Zonas de Destino Disponibles

| Zona | Descripción | Color | Acción |
|------|-------------|-------|--------|
| `tower-of-sins` | Torre de los Pecados | Verde | Jugar carta |
| `discard-pile` | Zona de Juego | Verde | Jugar carta |
| `take-pile` | Tomar Torre | Rojo | Tomar torre completa |

## 🔧 Implementación Técnica

### Flujo de Datos

1. **Inicio del Arrastre**
   ```typescript
   const handleDragStart = (event: React.DragEvent) => {
     event.dataTransfer.setData('application/json', JSON.stringify(card))
     // Crear imagen fantasma
     // Actualizar estado visual
   }
   ```

2. **Durante el Arrastre**
   ```typescript
   const handleDragOver = (event: React.DragEvent) => {
     event.preventDefault()
     event.dataTransfer.dropEffect = 'move'
     // Resaltar zona de destino
   }
   ```

3. **Soltar Carta**
   ```typescript
   const handleDrop = (event: React.DragEvent) => {
     const cardData = event.dataTransfer.getData('application/json')
     const card = JSON.parse(cardData)
     // Ejecutar acción correspondiente
   }
   ```

### Estados Visuales

- **Normal**: Zona gris con borde punteado
- **Hover**: Zona resaltada con borde sólido
- **Drag Over (Válido)**: Zona verde con anillo de resaltado
- **Drag Over (Inválido)**: Zona roja con anillo de error
- **Activo**: Zona con indicador de punto pulsante

## 🎨 Personalización

### Colores y Estilos

Los colores se pueden personalizar modificando las clases de Tailwind:

```css
/* Zona válida */
.bg-accent-500/20 border-accent-400 ring-2 ring-accent-400/50

/* Zona inválida */
.bg-red-500/20 border-red-400 ring-2 ring-red-400/50

/* Zona normal */
.bg-gray-800/80 border-gray-600 hover:border-gray-500
```

### Animaciones

Las animaciones utilizan Framer Motion:

```typescript
animate={{
  scale: isDragOver ? 1.05 : 1,
  borderColor: isDragOver 
    ? (isValidDrop ? 'rgb(34 197 94)' : 'rgb(239 68 68)')
    : undefined
}}
```

## 🚀 Próximas Mejoras

### Funcionalidades Planificadas

1. **Validación Avanzada**
   - Verificar reglas del juego en tiempo real
   - Mostrar cartas jugables específicas
   - Prevenir jugadas inválidas

2. **Feedback Mejorado**
   - Sonidos de arrastre y soltar
   - Partículas visuales
   - Animaciones más elaboradas

3. **Accesibilidad**
   - Soporte para teclado
   - Lectores de pantalla
   - Navegación por tab

4. **Personalización**
   - Temas visuales
   - Configuración de sensibilidad
   - Preferencias de usuario

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Las cartas no se arrastran**
   - Verificar que `isDraggable={true}`
   - Confirmar que es el turno del jugador
   - Revisar la consola para errores

2. **Las zonas no responden**
   - Verificar que `isActive={true}`
   - Confirmar que los event handlers están conectados
   - Revisar que `onDrop` está implementado

3. **Efectos visuales no aparecen**
   - Verificar que Framer Motion está instalado
   - Confirmar que las clases CSS están aplicadas
   - Revisar el estado de `isDragOver`

### Debugging

```typescript
// Agregar logs para debugging
const handleDragStart = (card: Card, event: React.DragEvent) => {
  console.log('Drag started:', card.name)
  // ... resto del código
}

const handleDrop = (card: Card, targetZone: string) => {
  console.log('Card dropped:', card.name, 'in zone:', targetZone)
  // ... resto del código
}
```

## 📚 Referencias

- [HTML5 Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [React Drag and Drop Best Practices](https://react.dev/learn/responding-to-events#drag-and-drop)
