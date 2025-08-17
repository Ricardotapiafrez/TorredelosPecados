class Player {
  constructor(id, name, socketId, selectedDeck = 'angels') {
    this.id = id;
    this.name = name;
    this.socketId = socketId;
    this.selectedDeck = selectedDeck; // Mazo seleccionado por el jugador
    
    // Fase 1: Mano (12 cartas iniciales)
    this.hand = []; // Cartas en mano (máximo 3 durante el juego)
    
    // Fase 2: Criaturas boca arriba (3 cartas)
    this.faceUpCreatures = []; // Criaturas visibles
    
    // Fase 3: Criaturas boca abajo (3 cartas)
    this.faceDownCreatures = []; // Criaturas ocultas
    
    // Pozo de Almas (mazo de robo)
    this.soulWell = []; // Cartas restantes para robar
    
    // Estado del juego
    this.currentPhase = 'hand'; // 'hand', 'faceUp', 'faceDown'
    this.health = 20;
    this.hasShield = false;
    this.isReady = false;
    this.isAlive = true;
    this.score = 0;
    this.isSinner = false; // Si es el perdedor (pecador)
    this.isDisconnected = false; // Estado de conexión
    this.isBot = false; // Si es un bot
  }

  // Inicializar el jugador con 12 cartas
  initializeWithCards(cards) {
    this.hand = cards.slice(0, 12);
    this.organizeCreatures();
  }

  // Organizar las criaturas según las reglas
  organizeCreatures() {
    console.log(`🎮 Organizando criaturas para ${this.name}...`);
    
    // Tomar 3 cartas de la mano y ponerlas boca arriba
    this.faceUpCreatures = this.hand.splice(0, 3);
    console.log(`📋 Criaturas boca arriba: ${this.faceUpCreatures.map(c => c.name).join(', ')}`);
    
    // Tomar otras 3 cartas y ponerlas boca abajo
    this.faceDownCreatures = this.hand.splice(0, 3);
    console.log(`🃏 Criaturas boca abajo: ${this.faceDownCreatures.length} cartas ocultas`);
    
    // Las 6 cartas restantes van al Pozo de Almas
    this.soulWell = this.hand.splice(0, 6);
    console.log(`💎 Pozo de Almas: ${this.soulWell.length} cartas`);
    
    // El jugador debe tener 3 cartas en la mano para comenzar
    // Robar 3 cartas del Pozo de Almas para la mano inicial
    for (let i = 0; i < 3 && this.soulWell.length > 0; i++) {
      this.hand.push(this.soulWell.pop());
    }
    
    console.log(`✋ Mano inicial: ${this.hand.map(c => c.name).join(', ')}`);
    console.log(`🎯 Fase actual: ${this.currentPhase}`);
  }

  // Agregar carta a la mano
  addCardToHand(card) {
    this.hand.push(card);
  }

  // Robar carta del Pozo de Almas
  drawFromSoulWell() {
    if (this.soulWell.length > 0) {
      return this.soulWell.pop();
    }
    return null;
  }

  // Jugar carta según la fase actual
  playCard(cardIndex, targetPlayer = null) {
    let card = null;
    let phaseTransition = null;
    
    console.log(`🎯 ${this.name} jugando carta en fase ${this.currentPhase} (índice: ${cardIndex})`);
    
    switch (this.currentPhase) {
      case 'hand':
        // Fase 1: Jugar de la mano
        if (cardIndex >= 0 && cardIndex < this.hand.length) {
          card = this.hand.splice(cardIndex, 1)[0];
          console.log(`✋ Carta jugada de la mano: ${card.name}`);
          
          // Robar una carta del Pozo de Almas para mantener 3 cartas
          const drawnCard = this.drawFromSoulWell();
          if (drawnCard) {
            this.hand.push(drawnCard);
            console.log(`💎 Robada del Pozo de Almas: ${drawnCard.name}`);
          } else {
            console.log(`⚠️ Pozo de Almas vacío - no se puede robar`);
          }
          
          // Verificar transición de fase
          if (this.hand.length === 0 && this.soulWell.length === 0) {
            this.currentPhase = 'faceUp';
            phaseTransition = 'faceUp';
            console.log(`🔄 Transición a fase: Criaturas Boca Arriba`);
          }
        }
        break;
        
      case 'faceUp':
        // Fase 2: Jugar criatura boca arriba
        if (cardIndex >= 0 && cardIndex < this.faceUpCreatures.length) {
          card = this.faceUpCreatures.splice(cardIndex, 1)[0];
          console.log(`📋 Carta jugada boca arriba: ${card.name}`);
          
          // NO se roba del Pozo de Almas en esta fase
          
          // Verificar transición de fase
          if (this.faceUpCreatures.length === 0) {
            this.currentPhase = 'faceDown';
            phaseTransition = 'faceDown';
            console.log(`🔄 Transición a fase: Criaturas Boca Abajo`);
          }
        }
        break;
        
      case 'faceDown':
        // Fase 3: Jugar criatura boca abajo (sin verla)
        if (cardIndex >= 0 && cardIndex < this.faceDownCreatures.length) {
          card = this.faceDownCreatures.splice(cardIndex, 1)[0];
          console.log(`🃏 Carta jugada boca abajo: ${card.name} (sin verla previamente)`);
          
          // Si la carta no es válida, el jugador debe tomar la Torre de los Pecados
          // y regresar a la fase de mano (esto se maneja en el GameService)
        }
        break;
    }
    
    if (card) {
      console.log(`✅ ${this.name} jugó ${card.name} en fase ${this.currentPhase}`);
      if (phaseTransition) {
        console.log(`🎯 ${this.name} cambió a fase: ${phaseTransition}`);
      }
    }
    
    return card;
  }

  // Tomar toda la Torre de los Pecados
  takeDiscardPile(discardPile) {
    console.log(`📥 ${this.name} tomando Torre de los Pecados (${discardPile.length} cartas)`);
    
    // Agregar todas las cartas a la mano
    this.hand.push(...discardPile);
    console.log(`✋ Cartas agregadas a la mano: ${discardPile.map(c => c.name).join(', ')}`);
    
    // Si estaba en fase boca abajo, regresar a fase de mano
    if (this.currentPhase === 'faceDown') {
      this.currentPhase = 'hand';
      console.log(`🔄 ${this.name} regresa a fase: Mano (por carta inválida boca abajo)`);
    }
    
    console.log(`📊 Estado final: ${this.hand.length} cartas en mano, fase: ${this.currentPhase}`);
  }

  // Verificar si debe cambiar de fase
  checkPhaseTransition() {
    const previousPhase = this.currentPhase;
    
    // Transición de mano a boca arriba
    if (this.currentPhase === 'hand' && this.hand.length === 0 && this.soulWell.length === 0) {
      this.currentPhase = 'faceUp';
      console.log(`🔄 ${this.name} transición automática: Mano → Boca Arriba`);
      return 'faceUp';
    }
    
    // Transición de boca arriba a boca abajo
    if (this.currentPhase === 'faceUp' && this.faceUpCreatures.length === 0) {
      this.currentPhase = 'faceDown';
      console.log(`🔄 ${this.name} transición automática: Boca Arriba → Boca Abajo`);
      return 'faceDown';
    }
    
    // Verificar si el jugador ganó
    if (this.hasWon()) {
      console.log(`🏆 ${this.name} ha ganado! Se quedó sin cartas en todas las fases`);
    }
    
    return this.currentPhase;
  }

  // Verificar si el jugador ganó (se quedó sin cartas)
  hasWon() {
    const totalCards = this.hand.length + 
                      this.faceUpCreatures.length + 
                      this.faceDownCreatures.length + 
                      this.soulWell.length;
    
    const hasWon = totalCards === 0;
    
    if (hasWon) {
      console.log(`🏆 ¡${this.name} ha ganado! Se quedó sin cartas en todas las fases`);
    }
    
    return hasWon;
  }

  // Verificar si el jugador perdió
  hasLost() {
    return this.health <= 0;
  }

  // Obtener información pública del jugador
  getPublicInfo() {
    return {
      id: this.id,
      name: this.name,
      selectedDeck: this.selectedDeck,
      faceUpCreatures: this.faceUpCreatures,
      faceDownCreatures: this.faceDownCreatures.map(() => ({ hidden: true })), // Solo mostrar que hay cartas ocultas
      currentPhase: this.currentPhase,
      phaseInfo: this.getPhaseInfo(),
      health: this.health,
      hasShield: this.hasShield,
      isReady: this.isReady,
      isAlive: this.isAlive,
      score: this.score,
      isSinner: this.isSinner,
      isBot: this.isBot,
      handSize: this.hand.length,
      soulWellSize: this.soulWell.length,
      totalCardsRemaining: this.getTotalCardsRemaining()
    };
  }

  // Obtener información completa del jugador (para el propio jugador)
  getFullInfo() {
    return {
      id: this.id,
      name: this.name,
      selectedDeck: this.selectedDeck,
      hand: this.hand,
      faceUpCreatures: this.faceUpCreatures,
      faceDownCreatures: this.faceDownCreatures,
      soulWell: this.soulWell,
      currentPhase: this.currentPhase,
      health: this.health,
      hasShield: this.hasShield,
      isReady: this.isReady,
      isAlive: this.isAlive,
      score: this.score,
      isSinner: this.isSinner,
      isBot: this.isBot,
      handSize: this.hand.length,
      soulWellSize: this.soulWell.length
    };
  }

  // Obtener cartas jugables según la fase actual
  getPlayableCards() {
    let playableCards = [];
    
    switch (this.currentPhase) {
      case 'hand':
        playableCards = this.hand;
        console.log(`✋ Cartas jugables en mano: ${playableCards.map(c => c.name).join(', ')}`);
        break;
      case 'faceUp':
        playableCards = this.faceUpCreatures;
        console.log(`📋 Cartas jugables boca arriba: ${playableCards.map(c => c.name).join(', ')}`);
        break;
      case 'faceDown':
        playableCards = this.faceDownCreatures;
        console.log(`🃏 Cartas jugables boca abajo: ${playableCards.length} cartas (ocultas)`);
        break;
      default:
        playableCards = [];
        console.log(`⚠️ Fase no válida: ${this.currentPhase}`);
    }
    
    return playableCards;
  }

  // Obtener información detallada de la fase actual
  getPhaseInfo() {
    const phaseInfo = {
      current: this.currentPhase,
      description: '',
      canDraw: false,
      cardsVisible: false,
      nextPhase: null
    };
    
    switch (this.currentPhase) {
      case 'hand':
        phaseInfo.description = 'Fase de la Mano';
        phaseInfo.canDraw = true;
        phaseInfo.cardsVisible = true;
        phaseInfo.nextPhase = this.soulWell.length === 0 ? 'faceUp' : null;
        break;
      case 'faceUp':
        phaseInfo.description = 'Fase de Criaturas Boca Arriba';
        phaseInfo.canDraw = false;
        phaseInfo.cardsVisible = true;
        phaseInfo.nextPhase = this.faceUpCreatures.length === 0 ? 'faceDown' : null;
        break;
      case 'faceDown':
        phaseInfo.description = 'Fase de Criaturas Boca Abajo';
        phaseInfo.canDraw = false;
        phaseInfo.cardsVisible = false;
        phaseInfo.nextPhase = this.faceDownCreatures.length === 0 ? 'victory' : null;
        break;
    }
    
    return phaseInfo;
  }

  // Obtener el número total de cartas restantes
  getTotalCardsRemaining() {
    return this.hand.length + 
           this.faceUpCreatures.length + 
           this.faceDownCreatures.length + 
           this.soulWell.length;
  }

  // Resetear estado para nueva partida
  reset() {
    this.hand = [];
    this.faceUpCreatures = [];
    this.faceDownCreatures = [];
    this.soulWell = [];
    this.currentPhase = 'hand';
    this.health = 20;
    this.hasShield = false;
    this.isReady = false;
    this.isAlive = true;
    this.isSinner = false;
    this.isBot = false;
  }

  // Marcar como pecador (perdedor)
  markAsSinner() {
    this.isSinner = true;
    console.log(`😈 ${this.name} ha sido marcado como PECADOR - Debe cargar con la Torre de los Pecados`);
  }

  // Cambiar mazo seleccionado
  setSelectedDeck(deckType) {
    const validDecks = ['angels', 'demons', 'dragons', 'mages', 'dwarves', 'elves', 'dark_elves', 'orcs'];
    if (validDecks.includes(deckType)) {
      this.selectedDeck = deckType;
      console.log(`🎴 ${this.name} cambió su mazo a: ${deckType}`);
      return true;
    } else {
      console.log(`⚠️ ${this.name} intentó cambiar a mazo inválido: ${deckType}`);
      return false;
    }
  }

  // Obtener información del mazo seleccionado
  getDeckInfo() {
    const deckInfo = {
      angels: { name: 'Mazo de Ángeles', icon: '👼', description: 'La Luz Divina - Pureza, justicia y orden divino' },
      demons: { name: 'Mazo de Demonios', icon: '😈', description: 'La Oscuridad del Abismo - Los siete pecados capitales' },
      dragons: { name: 'Mazo de Dragones', icon: '🐉', description: 'Los Señores del Cielo - Poder primitivo y sabiduría ancestral' },
      mages: { name: 'Mazo de Magos', icon: '🧙‍♂️', description: 'Los Maestros del Arcano - Conocimiento arcano y manipulación de la realidad' },
      dwarves: { name: 'Mazo de Enanos', icon: '⚒️', description: 'Forja, Runas, Máquinas de Guerra, Fortaleza - Civilización forjadora' },
      elves: { name: 'Mazo de Elfos del Bosque', icon: '🌿', description: 'Ciclo Natural, Armonía, Crecimiento - Reino de la Naturaleza' },
      dark_elves: { name: 'Mazo de Elfos Oscuros', icon: '🖤', description: 'Sombras, Sacrificio, Venenos, Magia Prohibida - Imperio de la Corrupción' },
      orcs: { name: 'Mazo de Orcos', icon: '🪖', description: 'Fuerza Bruta, Hordas, Tambores de Guerra, Berserkers - El Poder de la Masa' }
    };
    
    return deckInfo[this.selectedDeck] || deckInfo.angels;
  }
}

module.exports = Player;
