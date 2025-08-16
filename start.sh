#!/bin/bash

echo "🎮 Iniciando Torre de los Pecados..."
echo "======================================"

# Verificar si los puertos están disponibles
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "✅ Puerto $1 disponible"
        return 0
    else
        echo "❌ Puerto $1 ocupado"
        return 1
    fi
}

# Verificar puertos
echo "🔍 Verificando puertos..."
check_port 3000 || echo "⚠️  El puerto 3000 (frontend) está ocupado"
check_port 5001 || echo "⚠️  El puerto 5001 (backend) está ocupado"

echo ""
echo "🚀 Iniciando servidores..."
echo ""

# Iniciar backend en background
echo "📡 Iniciando backend (puerto 5001)..."
cd api && npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!

# Esperar un momento para que el backend se inicie
sleep 3

# Verificar si el backend está funcionando
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ Backend funcionando correctamente"
else
    echo "❌ Error iniciando el backend"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Iniciar frontend en background
echo "🌐 Iniciando frontend (puerto 3000)..."
cd ../web && npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# Esperar un momento para que el frontend se inicie
sleep 5

# Verificar si el frontend está funcionando
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend funcionando correctamente"
else
    echo "❌ Error iniciando el frontend"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 ¡Proyecto iniciado correctamente!"
echo "======================================"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🎮 Página del juego: http://localhost:3000/game"
echo "📡 Backend API: http://localhost:5001"
echo "🔍 Health check: http://localhost:5001/health"
echo ""
echo "📋 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 Para detener: Ctrl+C"
echo ""

# Función para limpiar al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servidores..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Servidores detenidos"
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Mantener el script corriendo
wait
