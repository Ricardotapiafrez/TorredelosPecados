#!/bin/bash

echo "🏗️  Instalando Torre de los Pecados..."
echo "======================================"

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm primero."
    exit 1
fi

echo "✅ Node.js y npm encontrados"

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd api
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend instalado correctamente"
else
    echo "❌ Error instalando el backend"
    exit 1
fi
cd ..

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd web
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend instalado correctamente"
else
    echo "❌ Error instalando el frontend"
    exit 1
fi
cd ..

# Crear archivo .env para el backend
echo "🔧 Configurando variables de entorno..."
if [ ! -f api/.env ]; then
    cp api/env.example api/.env
    echo "✅ Archivo .env creado para el backend"
else
    echo "ℹ️  Archivo .env ya existe en el backend"
fi

echo "🚀 Configurando workflows CI/CD..."

# Hacer el script de gestión ejecutable
chmod +x scripts/manage-workflows.sh

# Deshabilitar monitoreo automático para desarrollo
echo "📧 Deshabilitando monitoreo automático para evitar emails excesivos..."
./scripts/manage-workflows.sh disable-monitoring

# Deshabilitar CodeQL automático para desarrollo
echo "🔒 Deshabilitando CodeQL automático para evitar emails excesivos..."
./scripts/manage-workflows.sh disable-codeql

echo "✅ Workflows configurados correctamente"
echo "💡 Para ver el estado de workflows: ./scripts/manage-workflows.sh status"

echo ""
echo "🎉 ¡Instalación completada!"
echo "=========================="
echo ""
echo "Para ejecutar el proyecto:"
echo ""
echo "1. Iniciar el backend:"
echo "   cd api && npm run dev"
echo ""
echo "2. En otra terminal, iniciar el frontend:"
echo "   cd web && npm run dev"
echo ""
echo "3. Abrir http://localhost:3000 en tu navegador"
echo ""
echo "¡Que disfrutes jugando Torre de los Pecados! 🃏"
