# 🔧 Gestión de Workflows CI/CD - Torre de los Pecados

## 📋 Resumen

Este documento explica cómo gestionar los workflows de CI/CD y evitar problemas comunes como emails excesivos de GitHub.

## 🚨 Problema Resuelto: Emails Excesivos

### ¿Qué causaba los emails excesivos?

1. **Frecuencia muy alta**: El workflow de monitoreo se ejecutaba cada 5 minutos
2. **Fallos constantes**: Los health checks fallaban porque las URLs no existían
3. **Alertas automáticas**: Se enviaban alertas en cada fallo automático

### ✅ Soluciones Implementadas

1. **Reducción de frecuencia**: Cambiado de cada 5 minutos a cada hora
2. **Tolerancia a fallos**: Los jobs no fallan si los servicios no están disponibles
3. **Alertas manuales**: Solo se envían alertas en ejecución manual
4. **URLs de desarrollo**: Configuradas URLs de localhost para desarrollo

## 🛠️ Herramientas de Gestión

### Script de Gestión

Se ha creado un script para facilitar la gestión de workflows:

```bash
# Desde el directorio raíz del proyecto
./scripts/manage-workflows.sh [COMANDO]
```

### Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `status` | Mostrar estado de workflows activos |
| `disable-monitoring` | Deshabilitar monitoreo automático |
| `enable-monitoring` | Habilitar monitoreo automático |
| `update-urls` | Actualizar URLs en workflows |
| `test-workflow` | Probar workflow específico |
| `cleanup` | Limpiar workflows fallidos |

### Ejemplos de Uso

```bash
# Ver estado actual
./scripts/manage-workflows.sh status

# Deshabilitar monitoreo automático (recomendado para desarrollo)
./scripts/manage-workflows.sh disable-monitoring

# Actualizar URLs cuando despliegues a producción
./scripts/manage-workflows.sh update-urls production https://api.example.com https://app.example.com

# Probar workflow de monitoreo
./scripts/manage-workflows.sh test-workflow monitoring
```

## 📁 Estructura de Workflows

```
.github/workflows/
├── project-ci.yml           # Workflow coordinador principal
├── backend-ci.yml           # CI/CD del backend
├── frontend-ci.yml          # CI/CD del frontend
├── integration-tests.yml    # Tests de integración
├── release.yml              # Gestión de releases
├── monitoring.yml           # Monitoreo continuo (CORREGIDO)
├── codeql-analysis.yml      # Análisis de seguridad
└── monitoring-config.yml    # Configuración de monitoreo
```

## 🔧 Configuración de Monitoreo

### Frecuencia de Ejecución

- **Automática**: Cada hora (`0 * * * *`)
- **Manual**: En cualquier momento desde GitHub Actions

### URLs Configuradas

| Ambiente | Backend | Frontend |
|----------|---------|----------|
| Development | `http://localhost:3001` | `http://localhost:3000` |
| Staging | `https://staging-api.example.com` | `https://staging.example.com` |
| Production | `https://api.example.com` | `https://app.example.com` |

### Comportamiento de Fallos

- **Health Checks**: No fallan si los servicios no están disponibles
- **Performance Checks**: Solo warnings si los servicios están lentos
- **Security Checks**: Informativos, no bloqueantes
- **Uptime Checks**: Informativos, no bloqueantes

## 🚀 Preparación para Producción

### 1. Actualizar URLs

Cuando despliegues a producción, actualiza las URLs:

```bash
./scripts/manage-workflows.sh update-urls production \
  https://api.torredelospecados.com \
  https://torredelospecados.com
```

### 2. Configurar Secrets

Asegúrate de tener configurados estos secrets en GitHub:

```bash
# Notificaciones (opcionales)
SLACK_WEBHOOK_URL
DISCORD_WEBHOOK

# Monitoreo (opcionales)
MONITORING_API_KEY
```

### 3. Habilitar Monitoreo Automático

```bash
./scripts/manage-workflows.sh enable-monitoring
```

## 📊 Monitoreo de Estado

### Ver Estado de Workflows

```bash
# Usando el script
./scripts/manage-workflows.sh status

# Usando GitHub CLI
gh run list --limit 10

# Desde GitHub Web
https://github.com/[usuario]/[repo]/actions
```

### Logs de Workflows

```bash
# Ver logs de un workflow específico
gh run view [RUN_ID]

# Descargar artifacts
gh run download [RUN_ID]
```

## 🛡️ Prevención de Problemas

### 1. Deshabilitar Monitoreo en Desarrollo

```bash
./scripts/manage-workflows.sh disable-monitoring
```

### 2. Limpiar Workflows Fallidos

```bash
./scripts/manage-workflows.sh cleanup
```

### 3. Probar Antes de Desplegar

```bash
./scripts/manage-workflows.sh test-workflow monitoring
```

## 📧 Gestión de Notificaciones

### Configuración de Alertas

- **Automáticas**: Deshabilitadas por defecto
- **Manuales**: Solo en ejecución manual
- **Canales**: Slack y Discord (opcionales)

### Deshabilitar Notificaciones

Si no quieres recibir emails de GitHub:

1. Ve a GitHub Settings → Notifications
2. Desmarca "Workflow runs"
3. O configura filtros específicos

## 🔍 Troubleshooting

### Problema: Workflow no se ejecuta

```bash
# Verificar configuración
./scripts/manage-workflows.sh status

# Probar manualmente
./scripts/manage-workflows.sh test-workflow monitoring
```

### Problema: URLs incorrectas

```bash
# Actualizar URLs
./scripts/manage-workflows.sh update-urls production [backend-url] [frontend-url]
```

### Problema: Workflows fallidos acumulados

```bash
# Limpiar workflows fallidos
./scripts/manage-workflows.sh cleanup
```

## 📝 Notas Importantes

### Para Desarrollo

- ✅ Monitoreo automático deshabilitado por defecto
- ✅ URLs configuradas para localhost
- ✅ Fallos no bloquean el workflow
- ✅ Alertas solo en ejecución manual

### Para Producción

- ⚠️ Actualizar URLs antes de desplegar
- ⚠️ Configurar secrets de notificaciones
- ⚠️ Habilitar monitoreo automático
- ⚠️ Revisar logs regularmente

### Configuración Recomendada

```bash
# Para desarrollo
./scripts/manage-workflows.sh disable-monitoring

# Para producción
./scripts/manage-workflows.sh update-urls production [urls]
./scripts/manage-workflows.sh enable-monitoring
```

---

## 🎯 Resumen de Cambios

### ✅ Corregido

1. **Frecuencia reducida**: De 5 minutos a 1 hora
2. **Tolerancia a fallos**: Jobs no fallan si servicios no están disponibles
3. **Alertas manuales**: Solo en ejecución manual
4. **URLs de desarrollo**: Configuradas para localhost
5. **Script de gestión**: Facilita la administración

### 🚀 Beneficios

- ✅ No más emails excesivos
- ✅ Workflows más estables
- ✅ Fácil gestión y configuración
- ✅ Preparado para producción
- ✅ Herramientas de troubleshooting

---

*¡Los workflows ahora están optimizados y no causarán más problemas de emails excesivos! 🎉*
