# ⚡ Comandos Rápidos - Torre de los Pecados

## 🚨 Comandos Críticos para Workflows CI/CD

### Evitar Emails Excesivos de GitHub

```bash
# 🚨 DESHABILITAR monitoreo automático (OBLIGATORIO para desarrollo)
./scripts/manage-workflows.sh disable-monitoring

# ✅ Habilitar monitoreo automático (solo para producción)
./scripts/manage-workflows.sh enable-monitoring

# 🔒 DESHABILITAR CodeQL automático (RECOMENDADO para desarrollo)
./scripts/manage-workflows.sh disable-codeql

# ✅ Habilitar CodeQL automático (solo para producción)
./scripts/manage-workflows.sh enable-codeql

# 📊 Ver estado de workflows activos
./scripts/manage-workflows.sh status

# 🧹 Limpiar workflows fallidos
./scripts/manage-workflows.sh cleanup
```

## 🚀 Comandos de Desarrollo

### Iniciar el Proyecto
```bash
# Instalar dependencias y configurar
./install.sh

# Iniciar servicios
./start.sh
```

### Gestión de Workflows
```bash
# Ver todos los comandos disponibles
./scripts/manage-workflows.sh help

# Probar workflow específico
./scripts/manage-workflows.sh test-workflow monitoring

# Actualizar URLs para producción
./scripts/manage-workflows.sh update-urls production [backend-url] [frontend-url]
```

## 📁 Comandos de Git

```bash
# Ver estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "mensaje"

# Push
git push origin main
```

## 🔧 Comandos de Troubleshooting

### Problemas con Workflows
```bash
# Limpiar workflows fallidos
./scripts/manage-workflows.sh cleanup

# Ver logs de workflows
gh run list
gh run view [RUN_ID]
```

### Problemas con Servicios
```bash
# Verificar puertos
lsof -i :3000
lsof -i :3001

# Matar procesos
pkill -f "node"
pkill -f "npm"
```

## 📚 Documentación

- 📖 [Guía Completa de Workflows](.github/README-WORKFLOWS.md)
- 📋 [Correcciones de Workflows](WORKFLOW_CORRECTIONS_SUMMARY.md)
- 🔧 [Implementación CI/CD](CI_CD_IMPLEMENTATION_SUMMARY.md)
- 🛠️ [Guía del Desarrollador](README_DEVELOPER.md)

---

*¡Guarda este archivo para referencia rápida! 📌*
