# 🏆 Sistema de Victoria y Derrota - Torre de los Pecados

## 📋 Resumen

El sistema de victoria y derrota determina quién gana la partida y quién se convierte en el "Pecador" que debe cargar con la Torre de los Pecados hasta la próxima partida.

---

## 🏆 Condiciones de Victoria

### 🎯 Victoria Individual
Un jugador gana cuando se queda **completamente sin cartas** en todas las fases:

```javascript
hasWon() {
  const totalCards = this.hand.length + 
                    this.faceUpCreatures.length + 
                    this.faceDownCreatures.length + 
                    this.soulWell.length;
  
  return totalCards === 0;
}
```

### 📊 Fases para Victoria
1. **Fase de Mano**: Debe quedarse sin cartas en mano
2. **Fase Boca Arriba**: Debe jugar todas las criaturas visibles
3. **Fase Boca Abajo**: Debe jugar todas las criaturas ocultas
4. **Pozo de Almas**: Debe agotar todas las cartas del pozo

### 🔄 Progresión de Victoria
```
Fase 1 (Mano) → Fase 2 (Boca Arriba) → Fase 3 (Boca Abajo) → 🏆 Victoria
```

---

## 😈 Condiciones de Derrota

### 🎯 El Pecador
El **último jugador** que se queda con cartas se convierte en el "Pecador":

- Debe cargar con la Torre de los Pecados hasta la próxima partida
- Es marcado con `isSinner = true`
- Recibe un castigo simbólico en el juego

### 📊 Determinación del Pecador
```javascript
// El último jugador activo se convierte en pecador
const activePlayers = this.players.filter(p => !p.hasWon());
if (activePlayers.length > 0) {
  this.sinner = activePlayers[0];
  this.sinner.markAsSinner();
}
```

---

## 🎮 Lógica de Fin de Juego

### 🔍 Verificación Automática
El juego termina automáticamente cuando:

1. **Hay al menos un ganador** Y **solo queda un jugador activo** (o ninguno)
2. **Todos los jugadores ganan** (caso especial)

### 📋 Método checkGameEnd()
```javascript
checkGameEnd() {
  const winners = this.players.filter(p => p.hasWon());
  const activePlayers = this.players.filter(p => !p.hasWon());
  
  // Caso 1: Ganador + último jugador activo
  if (winners.length > 0 && activePlayers.length <= 1) {
    const winner = winners[0];
    const sinner = activePlayers.length > 0 ? activePlayers[0] : null;
    this.endGame(winner, sinner);
    return true;
  }
  
  // Caso 2: Todos ganan (no hay pecador)
  if (winners.length === this.players.length) {
    this.endGame(winners[0], null);
    return true;
  }
  
  return false;
}
```

---

## 🏁 Finalización del Juego

### 🎯 Método endGame()
```javascript
endGame(winner = null, sinner = null) {
  this.gameState = 'finished';
  
  // Limpiar timer del turno
  if (this.turnTimer) {
    clearTimeout(this.turnTimer);
    this.turnTimer = null;
  }

  // Asignar ganador
  if (winner) {
    this.winner = winner;
    winner.score += 100; // Bonus por victoria
  }
  
  // Asignar pecador
  if (sinner) {
    this.sinner = sinner;
    sinner.markAsSinner();
  }
  
  // Mostrar resumen final
  this.showGameSummary();
}
```

### 📊 Resumen Final
```javascript
showGameSummary() {
  console.log(`📊 RESUMEN FINAL DEL JUEGO`);
  console.log(`🎮 Estado: ${this.gameState}`);
  console.log(`🔄 Total de turnos: ${this.turnNumber}`);
  console.log(`📊 Torre de los Pecados final: ${this.discardPile.length} cartas`);
  
  if (this.winner) {
    console.log(`🏆 GANADOR: ${this.winner.name} (Score: ${this.winner.score})`);
  }
  
  if (this.sinner) {
    console.log(`😈 PECADOR: ${this.sinner.name} - Debe cargar con la Torre de los Pecados`);
  }
}
```

---

## 🎯 Casos Especiales

### 🏆🏆 Múltiples Ganadores
Cuando varios jugadores ganan en la misma partida:

- **Primer ganador**: Se considera el ganador oficial
- **Otros ganadores**: También reciben puntos pero no el título
- **Pecador**: El último jugador que queda con cartas

### 🎉 Victoria Simultánea
Cuando **todos los jugadores ganan** al mismo tiempo:

- **No hay pecador**: Todos son ganadores
- **Ganador oficial**: El primer jugador que ganó
- **Puntos**: Todos reciben puntos de victoria

### ⏰ Timeout de Juego
Si el juego se prolonga demasiado:

- Se puede implementar un límite de turnos
- El jugador con menos cartas gana
- El jugador con más cartas se convierte en pecador

---

## 📢 Notificaciones en Tiempo Real

### 🎮 Evento gameEnded
```javascript
io.to(roomId).emit('gameEnded', {
  winner: game.winner ? game.winner.getPublicInfo() : null,
  sinner: game.sinner ? game.sinner.getPublicInfo() : null,
  gameSummary: {
    totalTurns: game.turnNumber,
    finalDiscardPileSize: game.discardPile.length,
    playersStatus: game.players.map(p => ({
      id: p.id,
      name: p.name,
      status: p.hasWon() ? 'winner' : p.isSinner ? 'sinner' : 'active',
      cardsRemaining: p.getTotalCardsRemaining(),
      score: p.score
    }))
  }
});
```

### 📊 Estado del Juego
```javascript
getGameState(playerId) {
  return {
    gameState: this.gameState,
    winner: this.winner ? this.winner.getPublicInfo() : null,
    sinner: this.sinner ? this.sinner.getPublicInfo() : null,
    // ... resto del estado
  };
}
```

---

## 🧪 Testing y Validación

### 📋 Archivos de Prueba
- `test_victory_defeat.js`: Pruebas completas del sistema de victoria/derrota
- Casos de prueba en otros archivos de testing

### 🎯 Casos de Prueba
1. **Victoria individual**: Un jugador se queda sin cartas
2. **Múltiples ganadores**: Varios jugadores ganan
3. **Victoria simultánea**: Todos ganan al mismo tiempo
4. **Determinación del pecador**: Último jugador con cartas
5. **Información de estado**: Verificar datos de ganador/pecador

### 🚀 Comando de Prueba
```bash
cd api && node test_victory_defeat.js
```

---

## 🎨 Integración con el Frontend

### 📊 Información de Estado
El frontend recibe información detallada sobre victoria/derrota:

```javascript
// En getGameState()
{
  gameState: 'finished',
  winner: {
    id: 'player1',
    name: 'Jugador 1',
    score: 100,
    isSinner: false
  },
  sinner: {
    id: 'player2',
    name: 'Jugador 2',
    score: 0,
    isSinner: true
  },
  gameSummary: {
    totalTurns: 15,
    finalDiscardPileSize: 3,
    playersStatus: [...]
  }
}
```

### 🎮 Interfaz de Usuario
- **Pantalla de victoria**: Mostrar ganador con animaciones
- **Pantalla de derrota**: Mostrar pecador con efectos
- **Resumen del juego**: Estadísticas finales
- **Botón de nueva partida**: Reiniciar el juego

### 🎯 Feedback Visual
1. **Victoria**: Efectos de celebración y confeti
2. **Derrota**: Efectos sombríos para el pecador
3. **Transiciones**: Animaciones suaves entre estados
4. **Estadísticas**: Mostrar información detallada del juego

---

## 📈 Estrategias de Victoria

### 🎯 Gestión de Fases
- **Fase de Mano**: Mantener cartas útiles para fases posteriores
- **Fase Boca Arriba**: Planificar el orden de juego
- **Fase Boca Abajo**: Ser cuidadoso con las cartas ocultas

### 🎯 Uso de Cartas Especiales
- **Carta 2**: Dar libertad al siguiente jugador estratégicamente
- **Carta 8**: Saltar jugadores problemáticos
- **Carta 10**: Purificar en momentos críticos

### 🎯 Observación de Oponentes
- **Cartas boca arriba**: Ver qué tienen los otros jugadores
- **Conteo de cartas**: Llevar la cuenta de cartas jugadas
- **Predicción**: Anticipar movimientos de oponentes

---

## 🐛 Debugging y Logs

### 📝 Logs del Sistema
```javascript
console.log(`🏆 ¡${player.name} ha ganado! Se quedó sin cartas en todas las fases`);
console.log(`😈 ${player.name} ha sido marcado como PECADOR - Debe cargar con la Torre de los Pecados`);
console.log(`🎮 Finalizando juego...`);
console.log(`🏆 Ganador: ${winner.name} (Score: ${winner.score})`);
console.log(`😈 Pecador: ${sinner.name} - Debe cargar con la Torre de los Pecados`);
```

### 🔍 Puntos de Verificación
1. **Detección de victoria**: Logs cuando un jugador gana
2. **Fin del juego**: Logs de finalización
3. **Asignación de roles**: Logs de ganador y pecador
4. **Resumen final**: Logs del estado final del juego
5. **Casos especiales**: Logs de múltiples ganadores

---

## 🚀 Estado del Proyecto

### ✅ Completado
- [x] Detección automática de victoria
- [x] Determinación del pecador
- [x] Manejo de múltiples ganadores
- [x] Caso especial de victoria simultánea
- [x] Resumen final del juego
- [x] Notificaciones en tiempo real
- [x] Testing automatizado
- [x] Documentación completa

### 🎯 Próximos Pasos
- [ ] Integración con animaciones del frontend
- [ ] Sonidos de victoria/derrota
- [ ] Estadísticas de victoria por jugador
- [ ] Sistema de rankings

---

*¡El sistema de victoria y derrota está completamente implementado y listo para el juego! 🚀🏆*
