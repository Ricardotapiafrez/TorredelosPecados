# 📁 Carpeta Public - Imágenes del Proyecto

Esta carpeta contiene todas las imágenes estáticas del proyecto "Torre de los Pecados".

## 📂 Estructura de Carpetas

```
public/
├── images/
│   ├── cards/           # Imágenes de las cartas del juego
│   │   ├── angels/      # Mazo de Ángeles (13 cartas)
│   │   ├── demons/      # Mazo de Demonios (13 cartas)
│   │   ├── dragons/     # Mazo de Dragones (13 cartas)
│   │   ├── mages/       # Mazo de Magos (13 cartas)
│   │   └── backs/       # Reverso de las cartas
│   └── logos/           # Logos de la empresa y del juego
└── README.md           # Este archivo
```

## 🃏 Convención de Nombres para Cartas

### Formato: `{mazo}_{numero}_{nombre}.{extension}`

### Reverso de Cartas: `card_back_{tipo}.{extension}`

#### Mazo de Ángeles (angels)
- `angels_01_querubin_esperanza.png`
- `angels_02_serafin_fe.png`
- `angels_03_guardian_caridad.png`
- `angels_04_cohorte_prudencia.png`
- `angels_05_portador_justicia.png`
- `angels_06_arcangel_fortaleza.png`
- `angels_07_llama_templanza.png`
- `angels_08_emisario_fe_caridad.png`
- `angels_09_serafin_justicia_suprema.png`
- `angels_10_trono_virtud.png`
- `angels_11_arcangel_estrategia.png`
- `angels_12_bendicion_caridad.png`
- `angels_13_creador_luz.png`

#### Mazo de Demonios (demons)
- `demons_01_larva_avaricia.png`
- `demons_02_demonio_ira.png`
- `demons_03_espectro_envidia.png`
- `demons_04_sucubo_lujuria.png`
- `demons_05_goliat_pereza.png`
- `demons_06_gloton_abismo.png`
- `demons_07_incubo_lujuria.png`
- `demons_08_portador_pestilencia.png`
- `demons_09_tirano_soberbia.png`
- `demons_10_senor_abismo.png`
- `demons_11_baron_sombras.png`
- `demons_12_bruja_caos.png`
- `demons_13_emperador_infierno.png`

#### Mazo de Dragones (dragons)
- `dragons_01_dragon_bebe.png`
- `dragons_02_dragon_peste.png`
- `dragons_03_dragon_piedra.png`
- `dragons_04_dragon_hielo.png`
- `dragons_05_dragon_bronce.png`
- `dragons_06_dragon_colinas.png`
- `dragons_07_dragon_desierto.png`
- `dragons_08_dragon_etereo.png`
- `dragons_09_dragon_tormenta.png`
- `dragons_10_dragon_dorado.png`
- `dragons_11_dragon_jade.png`
- `dragons_12_dracona_guardiana.png`
- `dragons_13_dragon_primigenio.png`

#### Mazo de Magos (mages)
- `mages_01_aprendiz_mago.png`
- `mages_02_ilusionista.png`
- `mages_03_invocador_golems.png`
- `mages_04_alquimista_destino.png`
- `mages_05_nigromante_sombras.png`
- `mages_06_hechicero_tormenta.png`
- `mages_07_vidente_futuro.png`
- `mages_08_mago_tiempo.png`
- `mages_09_maestro_elementos.png`
- `mages_10_archimago_destruccion.png`
- `mages_11_mago_runas.png`
- `mages_12_oraculo_estrellas.png`
- `mages_13_mago_supremo.png`

## 🃏 Reverso de Cartas

### Archivos Principales
- `card_back_default.png` - Reverso estándar
- `card_back_angels.png` - Reverso para mazo de ángeles
- `card_back_demons.png` - Reverso para mazo de demonios
- `card_back_dragons.png` - Reverso para mazo de dragones
- `card_back_mages.png` - Reverso para mazo de magos

### Variantes Especiales
- `card_back_gold.png` - Reverso dorado (edición especial)
- `card_back_silver.png` - Reverso plateado (edición limitada)
- `card_back_dark.png` - Reverso oscuro (modo nocturno)

## 🏢 Logos

### Formato: `{tipo}_{version}.{extension}`

- `logo_principal.png` - Logo principal de la empresa
- `logo_white.png` - Logo en versión blanca (para fondos oscuros)
- `logo_black.png` - Logo en versión negra (para fondos claros)
- `logo_square.png` - Logo en formato cuadrado
- `favicon.ico` - Favicon del sitio web
- `icon_192.png` - Icono para PWA (192x192)
- `icon_512.png` - Icono para PWA (512x512)

## 📐 Especificaciones Técnicas

### Cartas
- **Formato**: PNG con transparencia
- **Resolución**: 4000x2400 píxeles (ratio 5:3)
- **Tamaño máximo**: 2MB por imagen
- **Fondo**: Transparente
- **Calidad**: Máxima (para zoom sin pérdida)
- **DPI**: 300 DPI mínimo
- **Color Space**: sRGB

### Logos
- **Formato**: PNG con transparencia
- **Resolución**: Mínimo 512x512 píxeles
- **Tamaño máximo**: 500KB por imagen
- **Fondo**: Transparente
- **Versiones**: Color, blanco, negro

## 🔧 Uso en el Código

### Next.js Image Component
```tsx
import Image from 'next/image'

// Carta específica
<Image
  src="/images/cards/angels/angels_01_querubin_esperanza.png"
  alt="El Querubín de la Esperanza"
  width={400}
  height={240}
  quality={95}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
/>

// Reverso de carta
<Image
  src="/images/cards/backs/card_back_angels.png"
  alt="Reverso de carta - Ángeles"
  width={400}
  height={240}
  quality={95}
/>

// Logo
<Image
  src="/images/logos/logo_principal.png"
  alt="Torre de los Pecados"
  width={200}
  height={80}
/>
```

### CSS Background
```css
.card-angel {
  background-image: url('/images/cards/angels/angels_01_querubin_esperanza.png');
  background-size: cover;
}

.card-back {
  background-image: url('/images/cards/backs/card_back_default.png');
  background-size: cover;
}
```

## 📝 Notas Importantes

1. **Optimización**: Todas las imágenes deben estar optimizadas para web
2. **Accesibilidad**: Incluir siempre atributos `alt` descriptivos
3. **Responsive**: Las imágenes deben escalar correctamente en diferentes dispositivos
4. **Caching**: Next.js maneja automáticamente el caching de imágenes estáticas
5. **Lazy Loading**: Usar el componente `Image` de Next.js para lazy loading automático
6. **Alta Resolución**: Las cartas usan resolución 4000x2400 para máxima calidad

## 📚 Documentación Adicional

- **[Guía de Alta Resolución](./HIGH_RESOLUTION_GUIDE.md)** - Especificaciones detalladas para imágenes de alta calidad

## 🎨 Paleta de Colores Sugerida

### Mazo de Ángeles
- Dorado: #FFD700
- Blanco: #FFFFFF
- Azul celeste: #87CEEB

### Mazo de Demonios
- Rojo: #DC143C
- Negro: #000000
- Púrpura: #800080

### Mazo de Dragones
- Verde esmeralda: #50C878
- Dorado: #FFD700
- Rojo: #DC143C

### Mazo de Magos
- Azul: #4169E1
- Púrpura: #800080
- Plateado: #C0C0C0
