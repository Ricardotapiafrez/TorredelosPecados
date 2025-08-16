# 🎮 Poderes Especiales de Cartas - Torre de los Pecados

## 📋 Resumen

Este documento describe los poderes especiales implementados para las cartas con valores 2, 8 y 10 en todos los mazos temáticos del juego.

---

## 🃏 Cartas con Poderes Especiales

### 🃏 La Criatura del 2 (Poder Universal)
- Se puede jugar sobre **cualquier criatura**
- El siguiente jugador puede jugar **lo que quiera**
- **Mazos específicos**:
  - **Ángeles**: El Serafín de la Fe - Purifica el mazo de descarte
  - **Demonios**: Demonio de la Ira - Furia incontrolable
  - **Dragones**: El Dragón de la Peste - Escupe veneno
  - **Magos**: El Ilusionista - Conjura cualquier truco

### 🃏 La Criatura del 8 (Poder de Salto)
- **Salta al siguiente jugador**, como en el juego del UNO
- El jugador siguiente al saltado pierde su turno
- **Mazos específicos**:
  - **Ángeles**: El Emisario de la Fe y la Caridad - Transmite mensajes divinos
  - **Demonios**: Portador de la Pestilencia - Propaga enfermedades
  - **Dragones**: El Dragón Etéreo - Atraviesa la realidad
  - **Magos**: El Mago del Tiempo - Manipula el tiempo

### 🃏 La Criatura del 10 (Poder de Purificación)
- Puede **purificar** la "Torre de los Pecados"
- El siguiente jugador comienza una nueva ronda
- **Mazos específicos**:
  - **Ángeles**: El Trono de la Virtud - Limpia la Torre con poder divino
  - **Demonios**: Señor del Abismo - Destruye la Torre con una palabra
  - **Dragones**: El Dragón Dorado - Incinera la Torre con su aliento
  - **Magos**: El Archimago de la Destrucción - Anula toda la Torre con magia

---

## 🎯 Validación de Jugadas

### 📋 Reglas de Validación
1. **Cartas Especiales**: Las cartas 2, 8 y 10 siempre se pueden jugar
2. **Poder Universal**: Cuando está activo, cualquier carta se puede jugar
3. **Regla Normal**: Las cartas deben tener valor igual o mayor a la última carta jugada

### 🎮 Implementación
```javascript
canBePlayed(gameState, playerId) {
  const lastCard = gameState.lastPlayedCard;
  
  // Si es una carta especial (2, 8, 10) siempre se puede jugar
  if (this.isSpecial) return true;
  
  // Si no hay carta anterior, se puede jugar cualquier cosa
  if (!lastCard) return true;
  
  // Si el siguiente jugador puede jugar cualquier cosa (por efecto del 2)
  if (gameState.nextPlayerCanPlayAnything) return true;
  
  // Regla normal: debe ser igual o mayor valor
  return this.value >= lastCard.value;
}
```

---

## 🧪 Testing

### 📋 Archivos de Prueba
- `test_special_powers.js`: Pruebas completas de todos los poderes especiales
- `debug_special_powers.js`: Depuración detallada de efectos
- `debug_card_values.js`: Verificación de valores de cartas

### 🎯 Comandos de Prueba
```bash
# Ejecutar pruebas completas
node test_special_powers.js

# Depurar efectos especiales
node debug_special_powers.js

# Verificar valores de cartas
node debug_card_values.js
```

---

## 🔧 Integración con el Juego

### 📋 Flujo de Integración
1. **Jugada de Carta**: El jugador selecciona una carta para jugar
2. **Validación**: Se verifica si la carta puede ser jugada
3. **Aplicación de Efecto**: Si es una carta especial, se aplica su efecto
4. **Actualización de Estado**: El estado del juego se actualiza según el efecto
5. **Notificación**: Se notifica a todos los jugadores del cambio

### 🎮 Uso en GameService
```javascript
// En el método playCard del GameService
const card = game.playCard(playerId, cardIndex, targetPlayerId);

// El efecto se aplica automáticamente en el modelo Game
// y se notifica a todos los jugadores
```

---

## 📊 Estado del Proyecto

### ✅ Completado
- [x] Implementación de efectos especiales para cartas 2, 8, 10
- [x] Validación de jugadas con poderes especiales
- [x] Integración con el sistema de juego
- [x] Pruebas completas de funcionalidad
- [x] Documentación detallada

### 🎯 Próximos Pasos
- [ ] Integración con la interfaz de usuario
- [ ] Animaciones visuales para efectos especiales
- [ ] Sonidos para poderes especiales
- [ ] Tutorial interactivo de poderes especiales

---

*¡Los poderes especiales están completamente implementados y listos para el juego! 🚀*
