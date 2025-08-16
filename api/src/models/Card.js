class Card {
  constructor(id, name, type, power, effect, description, image, deck = null, value = null) {
    this.id = id;
    this.name = name;
    this.type = type; // 'criatura', 'hechizo', 'trampa'
    this.power = power || 0;
    this.value = value || power; // Valor para comparaciones (1-13)
    this.effect = effect || null;
    this.description = description;
    this.image = image || null;
    this.deck = deck; // 'angels', 'demons', 'dragons', 'mages'
    this.isSpecial = this.value === 2 || this.value === 8 || this.value === 10;
  }

  // Aplicar efecto de la carta según las reglas del juego
  applyEffect(gameState, playerId, targetId = null) {
    // Aplicar efectos especiales primero (2, 8, 10)
    switch (this.value) {
      case 2: // Poder Universal
        return this.applyUniversalPower(gameState, playerId);
      case 8: // Poder de Salto
        return this.applySkipPower(gameState, playerId);
      case 10: // Poder de Purificación
        return this.applyPurificationPower(gameState, playerId);
    }
    
    // Aplicar efectos personalizados si existen
    if (this.effect && typeof this.effect === 'function') {
      return this.effect(gameState, playerId, targetId);
    }
    
    return gameState;
  }

  // Efecto del 2 - Poder Universal
  applyUniversalPower(gameState, playerId) {
    // El 2 se puede jugar sobre cualquier carta
    // El siguiente jugador puede jugar lo que quiera
    gameState.lastPlayedCard = this;
    gameState.nextPlayerCanPlayAnything = true;
    return gameState;
  }

  // Efecto del 8 - Poder de Salto
  applySkipPower(gameState, playerId) {
    // Salta al siguiente jugador
    const currentIndex = gameState.players.findIndex(p => p.id === playerId);
    const nextIndex = (currentIndex + 1) % gameState.players.length;
    const skipIndex = (nextIndex + 1) % gameState.players.length;
    
    gameState.skippedPlayer = gameState.players[skipIndex].id;
    gameState.currentPlayerIndex = skipIndex;
    return gameState;
  }

  // Efecto del 10 - Poder de Purificación
  applyPurificationPower(gameState, playerId) {
    // Purifica la Torre de los Pecados
    gameState.discardPile = [];
    gameState.lastPlayedCard = null;
    gameState.nextPlayerCanPlayAnything = false;
    return gameState;
  }

  // Verificar si la carta puede ser jugada según las reglas
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

  // Verificar si la carta purifica el mazo (mismo valor)
  willPurifyPile(gameState) {
    const lastCard = gameState.lastPlayedCard;
    
    // Si es una carta 10, siempre purifica
    if (this.value === 10) return true;
    
    if (!lastCard) return false;
    
    // Si es el mismo valor que la última carta jugada, purifica
    if (this.value === lastCard.value) return true;
    
    // Si hay 4 cartas del mismo valor en el mazo (incluyendo la actual)
    const sameValueCards = gameState.discardPile.filter(card => card.value === this.value);
    return sameValueCards.length >= 3; // + la carta actual = 4
  }

  // Obtener información pública de la carta (sin revelar efectos)
  getPublicInfo() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      power: this.power,
      value: this.value,
      deck: this.deck,
      isSpecial: this.isSpecial,
      image: this.image
    };
  }
}

// Definir cartas del juego
const CARD_TYPES = {
  CRIATURA: 'criatura',
  HECHIZO: 'hechizo',
  TRAMPA: 'trampa'
};

// Mazos temáticos según las reglas completas
const THEMATIC_DECKS = {
  ANGELS: 'angels',
  DEMONS: 'demons',
  DRAGONS: 'dragons',
  MAGES: 'mages'
};

// Mazo base de cartas
const BASE_DECK = [
  new Card(1, 'Dragón de Fuego', CARD_TYPES.CRIATURA, 8, null, 'Una poderosa criatura que escupe fuego'),
  new Card(2, 'Goblin Ladrón', CARD_TYPES.CRIATURA, 2, null, 'Un pequeño goblin que roba cartas'),
  new Card(3, 'Mago Oscuro', CARD_TYPES.CRIATURA, 6, null, 'Un mago que domina las artes oscuras'),
  new Card(4, 'Bola de Fuego', CARD_TYPES.HECHIZO, 0, (gameState, playerId, targetId) => {
    // Efecto: Eliminar una criatura del oponente
    if (targetId && gameState.players[targetId]) {
      const targetPlayer = gameState.players[targetId];
      if (targetPlayer.creatures.length > 0) {
        targetPlayer.creatures.pop(); // Eliminar última criatura
      }
    }
    return gameState;
  }, 'Elimina una criatura del oponente'),
  new Card(5, 'Escudo Mágico', CARD_TYPES.TRAMPA, 0, (gameState, playerId) => {
    // Efecto: Proteger contra el próximo ataque
    gameState.players[playerId].hasShield = true;
    return gameState;
  }, 'Protege contra el próximo ataque'),
  new Card(6, 'Gigante de Piedra', CARD_TYPES.CRIATURA, 7, null, 'Un gigante inmune a hechizos'),
  new Card(7, 'Hada Curandera', CARD_TYPES.CRIATURA, 3, (gameState, playerId) => {
    // Efecto: Curar una criatura
    const player = gameState.players[playerId];
    if (player.creatures.length > 0) {
      player.creatures[player.creatures.length - 1].healed = true;
    }
    return gameState;
  }, 'Cura una criatura herida'),
  new Card(8, 'Rayo', CARD_TYPES.HECHIZO, 0, (gameState, playerId, targetId) => {
    // Efecto: Daño directo
    if (targetId && gameState.players[targetId]) {
      const targetPlayer = gameState.players[targetId];
      if (targetPlayer.creatures.length > 0) {
        targetPlayer.creatures.pop();
      }
    }
    return gameState;
  }, 'Inflige daño directo a una criatura')
];

// Mazo de Ángeles
const ANGELS_DECK = [
  new Card(1, 'El Querubín de la Esperanza', CARD_TYPES.CRIATURA, 1, null, 'Un ángel pequeño pero lleno de luz, símbolo del nuevo comienzo', '/images/cards/angels/angel_1.png', THEMATIC_DECKS.ANGELS, 1),
  new Card(2, 'El Serafín del Juicio', CARD_TYPES.CRIATURA, 2, null, 'Un ser de luz que puede purificar el mazo de descarte, reiniciando el orden', '/images/cards/angels/angel_2.png', THEMATIC_DECKS.ANGELS, 2),
  new Card(3, 'El Guardián del Paraíso', CARD_TYPES.CRIATURA, 3, null, 'Un ángel protector que defiende con su escudo de fe', '/images/cards/angels/angel_3.png', THEMATIC_DECKS.ANGELS, 3),
  new Card(4, 'La Legión Celestial', CARD_TYPES.CRIATURA, 4, null, 'Un grupo de ángeles que luchan juntos, representando la unidad', '/images/cards/angels/angel_4.png', THEMATIC_DECKS.ANGELS, 4),
  new Card(5, 'La Lira Sagrada', CARD_TYPES.CRIATURA, 5, null, 'Un ángel que calma los espíritus, su música es su arma', '/images/cards/angels/angel_5.png', THEMATIC_DECKS.ANGELS, 5),
  new Card(6, 'El Arcángel de la Espada', CARD_TYPES.CRIATURA, 6, null, 'Un guerrero formidable, usa una espada de luz para purgar la oscuridad', '/images/cards/angels/angel_6.png', THEMATIC_DECKS.ANGELS, 6),
  new Card(7, 'La Llama Pura', CARD_TYPES.CRIATURA, 7, null, 'Un ángel de fuego, cuyo resplandor ilumina el camino', '/images/cards/angels/angel_7.png', THEMATIC_DECKS.ANGELS, 7),
  new Card(8, 'El Emisario Divino', CARD_TYPES.CRIATURA, 8, null, 'Un mensajero que puede saltarse los turnos, transmitiendo mensajes solo a los que elige', '/images/cards/angels/angel_8.png', THEMATIC_DECKS.ANGELS, 8),
  new Card(9, 'El Serafín de la Justicia', CARD_TYPES.CRIATURA, 9, null, 'Un ángel poderoso que impone el orden con su balanza', '/images/cards/angels/angel_9.png', THEMATIC_DECKS.ANGELS, 9),
  new Card(10, 'El Trono del Creador', CARD_TYPES.CRIATURA, 10, null, 'Un ángel tan poderoso que puede limpiar la Torre de los Pecados de una vez', '/images/cards/angels/angel_10.png', THEMATIC_DECKS.ANGELS, 10),
  new Card(11, 'El Arcángel de la Batalla', CARD_TYPES.CRIATURA, 11, null, 'Un líder de legiones, experto en estrategia', '/images/cards/angels/angel_11.png', THEMATIC_DECKS.ANGELS, 11),
  new Card(12, 'La Bendición Eterna', CARD_TYPES.CRIATURA, 12, null, 'Un ángel con el poder de curar y bendecir, un pilar de fuerza', '/images/cards/angels/angel_12.png', THEMATIC_DECKS.ANGELS, 12),
  new Card(13, 'El Cielor de la Creación', CARD_TYPES.CRIATURA, 13, null, 'El ser más poderoso de la jerarquía, el que todo lo creó', '/images/cards/angels/angel_13.png', THEMATIC_DECKS.ANGELS, 13)
];

// Mazo de Demonios
const DEMONS_DECK = [
  new Card(1, 'El Larva de la Avaricia', CARD_TYPES.CRIATURA, 1, null, 'Un demonio pequeño, pero que crece con cada pecado que consume', '/images/cards/demons/demon_1.png', THEMATIC_DECKS.DEMONS, 1),
  new Card(2, 'El Archidemonio de la Ira', CARD_TYPES.CRIATURA, 2, null, 'Un ser de furia pura, su poder es tan incontrolable que puede jugar sobre cualquier criatura', '/images/cards/demons/demon_2.png', THEMATIC_DECKS.DEMONS, 2),
  new Card(3, 'El Demonio Menor de la Envidia', CARD_TYPES.CRIATURA, 3, null, 'Un ser que roba el poder de otros', '/images/cards/demons/demon_3.png', THEMATIC_DECKS.DEMONS, 3),
  new Card(4, 'El Súcubo Seductor', CARD_TYPES.CRIATURA, 4, null, 'Un demonio que atrae a sus víctimas con engaños, manipulando la mente', '/images/cards/demons/demon_4.png', THEMATIC_DECKS.DEMONS, 4),
  new Card(5, 'El Goliat de la Pereza', CARD_TYPES.CRIATURA, 5, null, 'Un demonio gigante y lento, su fuerza se manifiesta en los momentos más inesperados', '/images/cards/demons/demon_5.png', THEMATIC_DECKS.DEMONS, 5),
  new Card(6, 'El Demonio de la Gula', CARD_TYPES.CRIATURA, 6, null, 'Un ser insaciable que devora todo a su paso', '/images/cards/demons/demon_6.png', THEMATIC_DECKS.DEMONS, 6),
  new Card(7, 'El Demonio de la Lujuria', CARD_TYPES.CRIATURA, 7, null, 'Un ser que se alimenta de los deseos oscuros de los mortales', '/images/cards/demons/demon_7.png', THEMATIC_DECKS.DEMONS, 7),
  new Card(8, 'El Demonio de la Pestilencia', CARD_TYPES.CRIATURA, 8, null, 'Un ser que propaga enfermedades, saltándose a sus víctimas', '/images/cards/demons/demon_8.png', THEMATIC_DECKS.DEMONS, 8),
  new Card(9, 'El Demonio de la Soberbia', CARD_TYPES.CRIATURA, 9, null, 'Un ser que se cree superior a todos', '/images/cards/demons/demon_9.png', THEMATIC_DECKS.DEMONS, 9),
  new Card(10, 'El Señor del Abismo', CARD_TYPES.CRIATURA, 10, null, 'Un ser tan poderoso que puede destruir la Torre de los Pecados con una palabra', '/images/cards/demons/demon_10.png', THEMATIC_DECKS.DEMONS, 10),
  new Card(11, 'El Barón de las Sombras', CARD_TYPES.CRIATURA, 11, null, 'Un maestro de la manipulación, experto en el sigilo', '/images/cards/demons/demon_11.png', THEMATIC_DECKS.DEMONS, 11),
  new Card(12, 'La Bruja del Caos', CARD_TYPES.CRIATURA, 12, null, 'Un ser que controla el desorden y la destrucción', '/images/cards/demons/demon_12.png', THEMATIC_DECKS.DEMONS, 12),
  new Card(13, 'El Emperador del Infierno', CARD_TYPES.CRIATURA, 13, null, 'El demonio más poderoso de todos, cuyo poder no tiene límites', '/images/cards/demons/demon_13.png', THEMATIC_DECKS.DEMONS, 13)
];

// Mazo de Dragones
const DRAGONS_DECK = [
  new Card(1, 'El Dragón Bebé', CARD_TYPES.CRIATURA, 1, null, 'Una pequeña criatura que apenas ha salido del cascarón, pero ya tiene un aliento poderoso', '/images/cards/dragons/dragon_1.png', THEMATIC_DECKS.DRAGONS, 1),
  new Card(2, 'El Dragón de la Peste', CARD_TYPES.CRIATURA, 2, null, 'Un dragón que escupe veneno y puede jugar sobre cualquier criatura', '/images/cards/dragons/dragon_2.png', THEMATIC_DECKS.DRAGONS, 2),
  new Card(3, 'El Dragón de Piedra', CARD_TYPES.CRIATURA, 3, null, 'Una criatura rocosa, casi impenetrable', '/images/cards/dragons/dragon_3.png', THEMATIC_DECKS.DRAGONS, 3),
  new Card(4, 'El Dragón de los Hielos', CARD_TYPES.CRIATURA, 4, null, 'Una bestia que congela el campo de batalla a su paso', '/images/cards/dragons/dragon_4.png', THEMATIC_DECKS.DRAGONS, 4),
  new Card(5, 'El Dragón de Bronce', CARD_TYPES.CRIATURA, 5, null, 'Un guerrero noble y honorable que lucha por la justicia', '/images/cards/dragons/dragon_5.png', THEMATIC_DECKS.DRAGONS, 5),
  new Card(6, 'El Dragón de las Colinas', CARD_TYPES.CRIATURA, 6, null, 'Un ser salvaje y territorial que no duda en proteger su hogar', '/images/cards/dragons/dragon_6.png', THEMATIC_DECKS.DRAGONS, 6),
  new Card(7, 'El Dragón del Desierto', CARD_TYPES.CRIATURA, 7, null, 'Una criatura que se camufla entre las arenas, esperando para atacar', '/images/cards/dragons/dragon_7.png', THEMATIC_DECKS.DRAGONS, 7),
  new Card(8, 'El Dragón Etéreo', CARD_TYPES.CRIATURA, 8, null, 'Un dragón fantasma que puede atravesar la realidad, saltándose los turnos', '/images/cards/dragons/dragon_8.png', THEMATIC_DECKS.DRAGONS, 8),
  new Card(9, 'El Dragón de la Nube', CARD_TYPES.CRIATURA, 9, null, 'Un ser que domina los cielos, lanzando rayos desde las alturas', '/images/cards/dragons/dragon_9.png', THEMATIC_DECKS.DRAGONS, 9),
  new Card(10, 'El Dragón de Oro', CARD_TYPES.CRIATURA, 10, null, 'Una criatura que incinera la Torre de los Pecados con su aliento de fuego', '/images/cards/dragons/dragon_10.png', THEMATIC_DECKS.DRAGONS, 10),
  new Card(11, 'El Dragón de Jade', CARD_TYPES.CRIATURA, 11, null, 'Un ser misterioso y ancestral, que domina la sabiduría', '/images/cards/dragons/dragon_11.png', THEMATIC_DECKS.DRAGONS, 11),
  new Card(12, 'La Dracona Guardiana', CARD_TYPES.CRIATURA, 12, null, 'Una dragona protectora, cuyo poder es igual al de un rey', '/images/cards/dragons/dragon_12.png', THEMATIC_DECKS.DRAGONS, 12),
  new Card(13, 'El Dragón Primigenio', CARD_TYPES.CRIATURA, 13, null, 'El dragón más antiguo y poderoso de todos, el origen de todos los dragones', '/images/cards/dragons/dragon_13.png', THEMATIC_DECKS.DRAGONS, 13)
];

// Mazo de Magos
const MAGES_DECK = [
  new Card(1, 'El Aprendiz de Mago', CARD_TYPES.CRIATURA, 1, null, 'Un joven mago que apenas empieza, pero con un gran potencial', '/images/cards/mages/mage_1.png', THEMATIC_DECKS.MAGES, 1),
  new Card(2, 'El Ilusionista', CARD_TYPES.CRIATURA, 2, null, 'Un mago que puede conjurar cualquier truco, puede jugar sobre cualquier criatura', '/images/cards/mages/mage_2.png', THEMATIC_DECKS.MAGES, 2),
  new Card(3, 'El Invocador de Golems', CARD_TYPES.CRIATURA, 3, null, 'Un mago que puede crear criaturas de piedra para que luchen por él', '/images/cards/mages/mage_3.png', THEMATIC_DECKS.MAGES, 3),
  new Card(4, 'El Alquimista del Destino', CARD_TYPES.CRIATURA, 4, null, 'Un mago que manipula los elementos a su antojo', '/images/cards/mages/mage_4.png', THEMATIC_DECKS.MAGES, 4),
  new Card(5, 'El Nigromante de las Sombras', CARD_TYPES.CRIATURA, 5, null, 'Un mago oscuro que controla a los muertos', '/images/cards/mages/mage_5.png', THEMATIC_DECKS.MAGES, 5),
  new Card(6, 'El Hechicero de la Tormenta', CARD_TYPES.CRIATURA, 6, null, 'Un mago que conjura poderosas tormentas para debilitar a sus enemigos', '/images/cards/mages/mage_6.png', THEMATIC_DECKS.MAGES, 6),
  new Card(7, 'El Vidente del Futuro', CARD_TYPES.CRIATURA, 7, null, 'Un mago que puede predecir los movimientos de los demás', '/images/cards/mages/mage_7.png', THEMATIC_DECKS.MAGES, 7),
  new Card(8, 'El Mago del Tiempo', CARD_TYPES.CRIATURA, 8, null, 'Un mago que puede manipular el tiempo, saltándose los turnos', '/images/cards/mages/mage_8.png', THEMATIC_DECKS.MAGES, 8),
  new Card(9, 'El Maestro de los Elementos', CARD_TYPES.CRIATURA, 9, null, 'Un mago que domina el fuego, el agua, la tierra y el aire', '/images/cards/mages/mage_9.png', THEMATIC_DECKS.MAGES, 9),
  new Card(10, 'El Archmago de la Destrucción', CARD_TYPES.CRIATURA, 10, null, 'Un mago que puede conjurar un hechizo tan poderoso que anula toda la Torre de los Pecados', '/images/cards/mages/mage_10.png', THEMATIC_DECKS.MAGES, 10),
  new Card(11, 'El Mago de las Runas', CARD_TYPES.CRIATURA, 11, null, 'Un mago que invoca el poder de los antiguos símbolos', '/images/cards/mages/mage_11.png', THEMATIC_DECKS.MAGES, 11),
  new Card(12, 'La Oráculo de las Estrellas', CARD_TYPES.CRIATURA, 12, null, 'Una hechicera que lee el futuro en las estrellas, sus poderes son inmensos', '/images/cards/mages/mage_12.png', THEMATIC_DECKS.MAGES, 12),
  new Card(13, 'El Mago Supremo', CARD_TYPES.CRIATURA, 13, null, 'El ser más poderoso de todos los magos, cuya magia no tiene límites', '/images/cards/mages/mage_13.png', THEMATIC_DECKS.MAGES, 13)
];

// Función para obtener un mazo temático
function getThematicDeck(deckType) {
  switch (deckType) {
    case THEMATIC_DECKS.ANGELS:
      return [...ANGELS_DECK];
    case THEMATIC_DECKS.DEMONS:
      return [...DEMONS_DECK];
    case THEMATIC_DECKS.DRAGONS:
      return [...DRAGONS_DECK];
    case THEMATIC_DECKS.MAGES:
      return [...MAGES_DECK];
    default:
      return [...ANGELS_DECK]; // Por defecto
  }
}

// Función para mezclar un mazo
function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

module.exports = {
  Card,
  CARD_TYPES,
  THEMATIC_DECKS,
  ANGELS_DECK,
  DEMONS_DECK,
  DRAGONS_DECK,
  MAGES_DECK,
  getThematicDeck,
  shuffleDeck,
  BASE_DECK
};
