# Torre de los Pecados 🃏

Un juego de cartas chileno ambientado en un universo de fantasía donde el objetivo es deshacerse de todas tus criaturas mágicas para no ser el último pecador.

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)
```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd "Torre de los Pecados"

# Instalar dependencias
./install.sh

# Iniciar el proyecto
./start.sh
```

### Opción 2: Manual
```bash
# 1. Instalar dependencias del backend
cd api
npm install

# 2. Instalar dependencias del frontend
cd ../web
npm install

# 3. Iniciar el backend (en una terminal)
cd ../api
npm run dev

# 4. Iniciar el frontend (en otra terminal)
cd ../web
npm run dev
```

## 🌐 Acceso

- **Frontend**: http://localhost:3000
- **Página del Juego**: http://localhost:3000/game
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/health

## 🎮 Cómo Jugar

1. **Crear o Unirse a una Sala**:
   - Ve a http://localhost:3000/game
   - Ingresa tu nombre
   - Deja vacío el ID de sala para crear una nueva, o ingresa un ID para unirte a una existente

2. **Preparación**:
   - Marca tu estado como "Listo"
   - Espera a que todos los jugadores estén listos
   - El anfitrión puede iniciar el juego

3. **Objetivo**:
   - Deshazte de todas tus criaturas mágicas
   - No seas el último pecador

## 🛠️ Tecnologías

### Backend
- **Node.js** con Express
- **Socket.io** para comunicación en tiempo real
- **MongoDB** (opcional, para persistencia)

### Frontend
- **Next.js 14** con App Router
- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- **Socket.io Client** para comunicación

## 📁 Estructura del Proyecto

```
Torre de los Pecados/
├── api/                 # Backend (Node.js + Express + Socket.io)
│   ├── src/
│   │   ├── models/      # Modelos de datos
│   │   ├── routes/      # Rutas de la API
│   │   └── services/    # Lógica de negocio
│   └── server.js        # Servidor principal
├── web/                 # Frontend (Next.js + React)
│   ├── src/
│   │   ├── app/         # Páginas (App Router)
│   │   ├── components/  # Componentes React
│   │   └── types/       # Tipos TypeScript
│   └── public/          # Archivos estáticos
├── install.sh           # Script de instalación
├── start.sh            # Script de inicio
└── README.md           # Este archivo
```

## 🔧 Configuración

### Variables de Entorno

#### Backend (api/.env)
```env
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (web/.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NODE_ENV=development
```

## 🐛 Solución de Problemas

### Error: "Conectando... Esperando conexión al servidor"
- Verifica que el backend esté corriendo en el puerto 5001
- Revisa los logs del backend: `tail -f backend.log`

### Error: "Puerto ocupado"
- Detén otros servicios que usen los puertos 3000 o 5001
- O cambia los puertos en los archivos de configuración

### Error: "Módulo no encontrado"
- Ejecuta `./install.sh` para reinstalar las dependencias
- Verifica que Node.js y npm estén instalados

## 📝 Scripts Disponibles

- `./install.sh` - Instala todas las dependencias
- `./start.sh` - Inicia ambos servidores automáticamente
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run start` - Inicia en modo producción

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🎯 Estado del Proyecto

- ✅ Backend funcional con Socket.io
- ✅ Frontend con Next.js y TypeScript
- ✅ Sistema de salas y jugadores
- ✅ Interfaz de juego básica
- 🔄 En desarrollo: Lógica completa del juego
- 🔄 Pendiente: Imágenes de cartas
- 🔄 Pendiente: Persistencia de datos

---

¡Que disfrutes jugando Torre de los Pecados! 🃏✨

## 🚀 Gestión de CI/CD

### Comandos Rápidos para Workflows

Para evitar emails excesivos de GitHub y gestionar los workflows de CI/CD:

```bash
# Deshabilitar monitoreo automático (RECOMENDADO para desarrollo)
./scripts/manage-workflows.sh disable-monitoring

# Habilitar monitoreo automático (para producción)
./scripts/manage-workflows.sh enable-monitoring

# Deshabilitar CodeQL automático (RECOMENDADO para desarrollo)
./scripts/manage-workflows.sh disable-codeql

# Habilitar CodeQL automático (para producción)
./scripts/manage-workflows.sh enable-codeql

# Ver estado de workflows activos
./scripts/manage-workflows.sh status

# Limpiar workflows fallidos
./scripts/manage-workflows.sh cleanup
```

### Documentación Completa

- 📖 [Guía de Workflows CI/CD](.github/README-WORKFLOWS.md)
- 📋 [Resumen de Correcciones](WORKFLOW_CORRECTIONS_SUMMARY.md)
- 🔧 [Resumen de Implementación CI/CD](CI_CD_IMPLEMENTATION_SUMMARY.md)
