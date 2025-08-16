#!/bin/bash

# Script de Gestión de Workflows - Torre de los Pecados
# Este script ayuda a gestionar los workflows de CI/CD y evitar problemas

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}Script de Gestión de Workflows - Torre de los Pecados${NC}"
    echo ""
    echo "Uso: $0 [COMANDO] [OPCIONES]"
    echo ""
    echo "Comandos disponibles:"
    echo "  status              - Mostrar estado de workflows activos"
    echo "  disable-monitoring  - Deshabilitar monitoreo automático"
    echo "  enable-monitoring   - Habilitar monitoreo automático"
    echo "  update-urls         - Actualizar URLs en workflows"
    echo "  test-workflow       - Probar workflow específico"
    echo "  cleanup             - Limpiar workflows fallidos"
    echo "  help                - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 status"
    echo "  $0 disable-monitoring"
    echo "  $0 update-urls production https://api.example.com https://app.example.com"
    echo "  $0 test-workflow monitoring"
}

# Función para mostrar estado de workflows
show_status() {
    echo -e "${BLUE}📊 Estado de Workflows Activos${NC}"
    echo ""
    
    if command -v gh &> /dev/null; then
        echo "Workflows recientes:"
        gh run list --limit 10
    else
        echo -e "${YELLOW}⚠️ GitHub CLI no está instalado. Instala 'gh' para ver el estado.${NC}"
        echo "Puedes ver el estado en: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/')/actions"
    fi
}

# Función para deshabilitar monitoreo automático
disable_monitoring() {
    echo -e "${YELLOW}🔄 Deshabilitando monitoreo automático...${NC}"
    
    # Comentar la línea de schedule en monitoring.yml
    sed -i.bak 's/^    - cron: '\''0 \* \* \* \*'\''/#    - cron: '\''0 \* \* \* \*'\''/' .github/workflows/monitoring.yml
    
    echo -e "${GREEN}✅ Monitoreo automático deshabilitado${NC}"
    echo "El workflow de monitoreo ahora solo se ejecutará manualmente"
    echo "Para habilitarlo nuevamente, ejecuta: $0 enable-monitoring"
}

# Función para habilitar monitoreo automático
enable_monitoring() {
    echo -e "${YELLOW}🔄 Habilitando monitoreo automático...${NC}"
    
    # Descomentar la línea de schedule en monitoring.yml
    sed -i.bak 's/^#    - cron: '\''0 \* \* \* \*'\''/    - cron: '\''0 \* \* \* \*'\''/' .github/workflows/monitoring.yml
    
    echo -e "${GREEN}✅ Monitoreo automático habilitado${NC}"
    echo "El workflow de monitoreo se ejecutará cada hora"
    echo "Para deshabilitarlo, ejecuta: $0 disable-monitoring"
}

# Función para actualizar URLs
update_urls() {
    if [ $# -lt 3 ]; then
        echo -e "${RED}❌ Error: Debes especificar ambiente, URL del backend y URL del frontend${NC}"
        echo "Uso: $0 update-urls [ambiente] [backend-url] [frontend-url]"
        echo "Ejemplo: $0 update-urls production https://api.example.com https://app.example.com"
        exit 1
    fi
    
    ENVIRONMENT=$1
    BACKEND_URL=$2
    FRONTEND_URL=$3
    
    echo -e "${YELLOW}🔄 Actualizando URLs para ambiente: $ENVIRONMENT${NC}"
    echo "Backend: $BACKEND_URL"
    echo "Frontend: $FRONTEND_URL"
    
    # Crear backup
    cp .github/workflows/monitoring.yml .github/workflows/monitoring.yml.backup
    
    # Actualizar URLs en el workflow
    if [ "$ENVIRONMENT" = "production" ]; then
        sed -i.bak "s|BACKEND_URL=\"http://localhost:3001\"|BACKEND_URL=\"$BACKEND_URL\"|g" .github/workflows/monitoring.yml
        sed -i.bak "s|FRONTEND_URL=\"http://localhost:3000\"|FRONTEND_URL=\"$FRONTEND_URL\"|g" .github/workflows/monitoring.yml
    elif [ "$ENVIRONMENT" = "staging" ]; then
        sed -i.bak "s|BACKEND_URL=\"http://localhost:3001\"|BACKEND_URL=\"$BACKEND_URL\"|g" .github/workflows/monitoring.yml
        sed -i.bak "s|FRONTEND_URL=\"http://localhost:3000\"|FRONTEND_URL=\"$FRONTEND_URL\"|g" .github/workflows/monitoring.yml
    fi
    
    echo -e "${GREEN}✅ URLs actualizadas${NC}"
    echo "Backup guardado en: .github/workflows/monitoring.yml.backup"
}

# Función para probar workflow
test_workflow() {
    if [ $# -lt 1 ]; then
        echo -e "${RED}❌ Error: Debes especificar el workflow a probar${NC}"
        echo "Workflows disponibles:"
        echo "  - monitoring"
        echo "  - backend-ci"
        echo "  - frontend-ci"
        echo "  - integration-tests"
        exit 1
    fi
    
    WORKFLOW=$1
    
    echo -e "${YELLOW}🧪 Probando workflow: $WORKFLOW${NC}"
    
    if command -v gh &> /dev/null; then
        case $WORKFLOW in
            "monitoring")
                gh workflow run "Monitoring & Alerts" --field environment=development
                ;;
            "backend-ci")
                gh workflow run "Backend CI/CD"
                ;;
            "frontend-ci")
                gh workflow run "Frontend CI/CD"
                ;;
            "integration-tests")
                gh workflow run "Integration Tests"
                ;;
            *)
                echo -e "${RED}❌ Workflow '$WORKFLOW' no reconocido${NC}"
                exit 1
                ;;
        esac
        
        echo -e "${GREEN}✅ Workflow '$WORKFLOW' iniciado${NC}"
        echo "Puedes ver el progreso en: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/')/actions"
    else
        echo -e "${YELLOW}⚠️ GitHub CLI no está instalado${NC}"
        echo "Puedes ejecutar el workflow manualmente desde GitHub Actions"
    fi
}

# Función para limpiar workflows fallidos
cleanup() {
    echo -e "${YELLOW}🧹 Limpiando workflows fallidos...${NC}"
    
    if command -v gh &> /dev/null; then
        # Cancelar workflows en ejecución que han fallado
        gh run list --status failure --limit 50 | while read -r line; do
            RUN_ID=$(echo "$line" | awk '{print $1}')
            echo "Cancelando workflow fallido: $RUN_ID"
            gh run cancel "$RUN_ID" || true
        done
        
        echo -e "${GREEN}✅ Limpieza completada${NC}"
    else
        echo -e "${YELLOW}⚠️ GitHub CLI no está instalado${NC}"
        echo "Puedes limpiar manualmente desde GitHub Actions"
    fi
}

# Función para verificar dependencias
check_dependencies() {
    echo -e "${BLUE}🔍 Verificando dependencias...${NC}"
    
    if ! command -v gh &> /dev/null; then
        echo -e "${YELLOW}⚠️ GitHub CLI no está instalado${NC}"
        echo "Instala GitHub CLI para funcionalidad completa:"
        echo "  macOS: brew install gh"
        echo "  Ubuntu: sudo apt install gh"
        echo "  Windows: winget install GitHub.cli"
    else
        echo -e "${GREEN}✅ GitHub CLI está instalado${NC}"
    fi
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git no está instalado${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Git está instalado${NC}"
    fi
}

# Función principal
main() {
    case "${1:-help}" in
        "status")
            show_status
            ;;
        "disable-monitoring")
            disable_monitoring
            ;;
        "enable-monitoring")
            enable_monitoring
            ;;
        "update-urls")
            update_urls "$2" "$3" "$4"
            ;;
        "test-workflow")
            test_workflow "$2"
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            echo -e "${RED}❌ Comando no reconocido: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Verificar que estamos en el directorio correcto
if [ ! -f ".github/workflows/monitoring.yml" ]; then
    echo -e "${RED}❌ Error: No se encontró el archivo de workflows${NC}"
    echo "Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

# Ejecutar función principal
main "$@"
