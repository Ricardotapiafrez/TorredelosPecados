# 🖼️ Guía de Imágenes de Alta Resolución

## 📐 Especificaciones Actualizadas

### Cartas del Juego
- **Resolución**: 4000x2400 píxeles
- **Ratio**: 5:3 (landscape)
- **Formato**: PNG con transparencia
- **Tamaño máximo**: 2MB por imagen
- **DPI**: 300 DPI mínimo
- **Color Space**: sRGB
- **Compresión**: Sin pérdida

## 🎯 Beneficios de Alta Resolución

### 1. **Zoom sin Pérdida**
- Las cartas mantienen nitidez al hacer zoom
- Detalles finos visibles en dispositivos de alta densidad
- Experiencia visual superior en pantallas 4K

### 2. **Flexibilidad de Uso**
- Escalado automático para diferentes tamaños de pantalla
- Optimización automática por Next.js
- Soporte para múltiples formatos (WebP, AVIF)

### 3. **Futuras Aplicaciones**
- Impresión de alta calidad
- Merchandising y productos físicos
- Aplicaciones móviles nativas

## 🔧 Optimización Técnica

### Next.js Image Component
```tsx
import Image from 'next/image'

<Image
  src="/images/cards/angels/angels_01_querubin_esperanza.png"
  alt="El Querubín de la Esperanza"
  width={400}
  height={240}
  quality={95}
  placeholder="blur"
  sizes="(max-width: 768px) 100px, 150px"
/>
```

### Configuración de Next.js
```javascript
// next.config.js
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,
}
```

## 📱 Responsive Design

### Breakpoints de Imágenes
- **Mobile**: 100px de ancho
- **Tablet**: 150px de ancho
- **Desktop**: 200px de ancho
- **Large Desktop**: 300px de ancho

### Carga Progresiva
- Lazy loading automático
- Placeholder blur durante la carga
- Transiciones suaves

## 🎨 Consideraciones de Diseño

### 1. **Composición**
- Centrar elementos importantes
- Dejar espacio para texto superpuesto
- Considerar recortes en diferentes tamaños

### 2. **Detalles**
- Texturas finas visibles
- Bordes nítidos
- Efectos de iluminación sutiles

### 3. **Transparencia**
- Usar transparencia para integración
- Evitar bordes duros
- Considerar fondos variados

## 📊 Rendimiento

### Optimizaciones Implementadas
- ✅ Lazy loading
- ✅ Formatos modernos (WebP, AVIF)
- ✅ Responsive images
- ✅ Caching optimizado
- ✅ Compresión automática

### Métricas Objetivo
- **Tiempo de carga**: < 2 segundos
- **Tamaño de archivo**: < 2MB por imagen
- **Calidad visual**: 95%+

## 🛠️ Herramientas Recomendadas

### Software de Edición
- **Adobe Photoshop**: Edición profesional
- **Affinity Designer**: Alternativa económica
- **GIMP**: Software libre
- **Figma**: Diseño colaborativo

### Optimización
- **TinyPNG**: Compresión sin pérdida
- **ImageOptim**: Optimización automática
- **Squoosh**: Herramienta de Google

## 📋 Checklist de Calidad

### Antes de Subir
- [ ] Resolución exacta: 4000x2400 píxeles
- [ ] Formato PNG con transparencia
- [ ] Tamaño < 2MB
- [ ] DPI: 300 mínimo
- [ ] Color Space: sRGB
- [ ] Sin bordes duros
- [ ] Elementos centrados
- [ ] Detalles visibles en zoom

### Después de Subir
- [ ] Carga correctamente en la web
- [ ] Zoom funciona sin pérdida
- [ ] Responsive en diferentes dispositivos
- [ ] Lazy loading funciona
- [ ] Placeholder se muestra correctamente

## 🚀 Próximas Mejoras

### Planificadas
- [ ] Soporte para animaciones GIF
- [ ] Variantes de color por mazo
- [ ] Efectos de hover avanzados
- [ ] Modo oscuro optimizado
- [ ] PWA con cache de imágenes

### Investigación
- [ ] WebP animado
- [ ] AVIF con transparencia
- [ ] Compresión neural
- [ ] CDN para imágenes
