# 🛠️ Torre de los Pecados - Guía para Desarrolladores

## 📋 Descripción del Proyecto

Este proyecto implementa el juego de cartas chileno "Torre de los Pecados" como una aplicación web multijugador en tiempo real, utilizando una arquitectura moderna con backend en Node.js y frontend en Next.js.

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    WebSocket     ┌─────────────────┐
│   Frontend      │ ◄──────────────► │    Backend      │
│   (Next.js)     │                  │   (Node.js)     │
│                 │                  │                 │
│ - React         │                  │ - Express       │
│ - TypeScript    │                  │ - Socket.io     │
│ - Tailwind CSS  │                  │ - Game Logic    │
│ - Framer Motion │                  │ - Game State    │
└─────────────────┘                  └─────────────────┘
```

## 🎯 Características Técnicas

### Backend (API)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Comunicación en tiempo real**: Socket.io
- **Seguridad**: Helmet, CORS, Rate Limiting
- **Arquitectura**: MVC con servicios especializados

### Frontend (Web)
- **Framework**: Next.js 14 con App Router
- **UI Library**: React 18
- **Lenguaje**: TypeScript
- **Styling**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React

## 📁 Estructura del Código

### Backend (`/api`)
```
api/
├── server.js                 # Servidor principal
├── package.json             # Dependencias
├── .env                     # Variables de entorno
└── src/
    ├── models/
    │   ├── Card.js          # Modelo de carta
    │   ├── Player.js        # Modelo de jugador
    │   └── Game.js          # Modelo de partida
    ├── services/
    │   └── GameService.js   # Lógica del juego
    └── routes/
        └── gameRoutes.js    # Rutas HTTP
```

### Frontend (`/web`)
```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx         # Página principal
│   │   ├── game/page.tsx    # Página del juego
│   │   ├── rules/page.tsx   # Página de reglas
│   │   ├── layout.tsx       # Layout principal
│   │   └── globals.css      # Estilos globales
│   └── components/
│       ├── GameCard.tsx     # Componente de carta
│       └── PlayerArea.tsx   # Área del jugador
├── package.json
├── tailwind.config.js
└── next.config.js
```

## 🔧 Configuración del Entorno

### Requisitos Previos
- Node.js 18+ 
- npm 8+

### Variables de Entorno

#### Backend (`.env`)
```env
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NODE_ENV=development
```

## 🚀 Comandos de Desarrollo

### Instalación
```bash
# Instalación automática
./install.sh

# Instalación manual
cd api && npm install
cd ../web && npm install
```

### Desarrollo
```bash
# Backend (puerto 5001)
cd api && npm run dev

# Frontend (puerto 3000)
cd web && npm run dev
```

### Producción
```bash
# Build del frontend
cd web && npm run build

# Iniciar producción
cd web && npm start
cd api && npm start
```

## 🎮 Lógica del Juego

### Estados del Juego
1. **`waiting`**: Lobby, esperando jugadores
2. **`playing`**: Juego en progreso
3. **`finished`**: Juego terminado

### Flujo de Datos
1. **Conexión**: Cliente se conecta via Socket.io
2. **Crear/Unirse**: Cliente crea o se une a una sala
3. **Lobby**: Jugadores marcan "listo"
4. **Inicio**: Todos listos → juego comienza
5. **Turnos**: Jugadores juegan cartas en turnos
6. **Fin**: Último jugador con cartas pierde

### Eventos Socket.io

#### Cliente → Servidor
- `createRoom`: Crear nueva sala
- `joinRoom`: Unirse a sala existente
- `setPlayerReady`: Marcar como listo
- `startGame`: Iniciar juego
- `playCard`: Jugar carta

#### Servidor → Cliente
- `roomCreated`: Sala creada exitosamente
- `roomJoined`: Unido a sala exitosamente
- `gameStateUpdated`: Estado del juego actualizado
- `gameStarted`: Juego iniciado
- `cardPlayed`: Carta jugada
- `playerJoined`: Nuevo jugador se unió
- `playerLeft`: Jugador se desconectó
- `allPlayersReady`: Todos listos para jugar
- `error`: Error en el servidor

## 🎨 Sistema de Cartas

### Tipos de Cartas
- **Criatura**: Se coloca en el campo
- **Hechizo**: Efecto inmediato
- **Trampa**: Protección

### Estructura de Carta
```javascript
{
  id: number,
  name: string,
  type: 'criatura' | 'hechizo' | 'trampa',
  power: number,
  effect: Function | null,
  description: string,
  image: string | null
}
```

## 🔒 Seguridad

### Backend
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Control de acceso cross-origin
- **Rate Limiting**: Límite de requests por IP
- **Input Validation**: Validación de datos de entrada

### Frontend
- **TypeScript**: Tipado estático
- **Environment Variables**: Variables de entorno seguras
- **Input Sanitization**: Limpieza de datos de entrada

## 🧪 Testing

### Backend
```bash
cd api && npm test
```

### Frontend
```bash
cd web && npm run lint
```

## 📊 Monitoreo y Logs

### Logs del Servidor
- Conexiones de jugadores
- Eventos del juego
- Errores y excepciones
- Estado de las salas

### Métricas
- Número de jugadores activos
- Partidas en curso
- Tiempo promedio de partida
- Cartas jugadas por minuto

## 🔄 CI/CD

### GitHub Actions (Recomendado)
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd api && npm install
          cd ../web && npm install
      - name: Build
        run: cd web && npm run build
      - name: Deploy
        run: echo "Deploy to your hosting service"
```

## 🐛 Debugging

### Backend
```bash
# Modo debug con nodemon
cd api && DEBUG=* npm run dev

# Logs detallados
NODE_ENV=development LOG_LEVEL=debug npm run dev
```

### Frontend
```bash
# Modo desarrollo con logs
cd web && npm run dev

# Build con análisis
cd web && npm run build && npm run analyze
```

## 📈 Optimizaciones

### Performance
- **Lazy Loading**: Componentes cargados bajo demanda
- **Code Splitting**: División automática de código
- **Image Optimization**: Optimización automática de imágenes
- **Caching**: Cache de Socket.io y Next.js

### Escalabilidad
- **Room-based Architecture**: Salas independientes
- **Memory Management**: Limpieza automática de salas inactivas
- **Horizontal Scaling**: Múltiples instancias del servidor

## 🤝 Contribución

### Flujo de Trabajo
1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código
- **ESLint**: Configuración estándar
- **Prettier**: Formateo automático
- **TypeScript**: Tipado estricto
- **Conventional Commits**: Formato de commits

## 📚 Recursos Adicionales

- [Documentación de Socket.io](https://socket.io/docs/)
- [Guía de Next.js](https://nextjs.org/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)

## 🆘 Soporte

Para reportar bugs o solicitar nuevas funcionalidades:
1. Crear un Issue en GitHub
2. Incluir pasos para reproducir el problema
3. Adjuntar logs y capturas de pantalla si es necesario

---

*¡Feliz desarrollo! 🚀*
