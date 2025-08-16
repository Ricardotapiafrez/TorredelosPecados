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
      description: this.description,
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
  new Card(1, 'El Querubín de la Esperanza', CARD_TYPES.CRIATURA, 1, null, 'El primer destello de luz, guía en los comienzos inciertos. Siempre abre camino hacia la fe y la confianza.', '/images/cards/angels/angel_1.png', THEMATIC_DECKS.ANGELS, 1),
  new Card(2, 'El Serafín de la Fe', CARD_TYPES.CRIATURA, 2, null, 'Su pureza refuerza el corazón de los justos. Al desplegarse, refuerza a cualquier criatura aliada en juego.', '/images/cards/angels/angel_2.png', THEMATIC_DECKS.ANGELS, 2),
  new Card(3, 'El Guardián de la Caridad', CARD_TYPES.CRIATURA, 3, null, 'Un ángel que protege a los más débiles, dispuesto a sacrificarse para sostener a otro aliado.', '/images/cards/angels/angel_3.png', THEMATIC_DECKS.ANGELS, 3),
  new Card(4, 'La Cohorte de la Prudencia', CARD_TYPES.CRIATURA, 4, null, 'Una legión sabia que planea cada movimiento, capaz de anticipar los ataques enemigos.', '/images/cards/angels/angel_4.png', THEMATIC_DECKS.ANGELS, 4),
  new Card(5, 'El Portador de la Justicia', CARD_TYPES.CRIATURA, 5, null, 'Porta la balanza divina, equilibrando las fuerzas en juego. Castiga el exceso y premia la rectitud.', '/images/cards/angels/angel_5.png', THEMATIC_DECKS.ANGELS, 5),
  new Card(6, 'El Arcángel de la Fortaleza', CARD_TYPES.CRIATURA, 6, null, 'Su armadura resplandece con una fuerza inquebrantable. Resiste incluso los golpes de los más oscuros.', '/images/cards/angels/angel_6.png', THEMATIC_DECKS.ANGELS, 6),
  new Card(7, 'La Llama de la Templanza', CARD_TYPES.CRIATURA, 7, null, 'Un ángel sereno que modera los excesos. Neutraliza habilidades extremas y restaura el equilibrio.', '/images/cards/angels/angel_7.png', THEMATIC_DECKS.ANGELS, 7),
  new Card(8, 'El Emisario de la Fe y la Caridad', CARD_TYPES.CRIATURA, 8, null, 'Porta mensajes que fortalecen la unión entre aliados, reforzando su vínculo y permitiendo coordinar acciones.', '/images/cards/angels/angel_8.png', THEMATIC_DECKS.ANGELS, 8),
  new Card(9, 'El Serafín de la Justicia Suprema', CARD_TYPES.CRIATURA, 9, null, 'Su balanza brilla más que cualquier otra, imponiendo un juicio final sobre criaturas corrompidas.', '/images/cards/angels/angel_9.png', THEMATIC_DECKS.ANGELS, 9),
  new Card(10, 'El Trono de la Virtud', CARD_TYPES.CRIATURA, 10, null, 'La máxima expresión de la perfección celestial, capaz de restaurar todo el orden en el campo.', '/images/cards/angels/angel_10.png', THEMATIC_DECKS.ANGELS, 10),
  new Card(11, 'El Arcángel de la Estrategia', CARD_TYPES.CRIATURA, 11, null, 'Dirige legiones con sabiduría y valor, inclinando la batalla a favor del bien.', '/images/cards/angels/angel_11.png', THEMATIC_DECKS.ANGELS, 11),
  new Card(12, 'La Bendición de la Caridad', CARD_TYPES.CRIATURA, 12, null, 'Irradia luz sanadora, protegiendo y levantando a los caídos. Pilar esencial en cualquier ejército celestial.', '/images/cards/angels/angel_12.png', THEMATIC_DECKS.ANGELS, 12),
  new Card(13, 'El Creador de la Luz', CARD_TYPES.CRIATURA, 13, null, 'La divinidad suprema, origen de todo. Su sola presencia transforma la batalla en victoria.', '/images/cards/angels/angel_13.png', THEMATIC_DECKS.ANGELS, 13)
];

// Mazo de Demonios
const DEMONS_DECK = [
  new Card(1, 'Larva de la Avaricia', CARD_TYPES.CRIATURA, 1, null, 'Un demonio recién nacido que se alimenta del oro y del deseo. Mientras más recursos devora, más crece su poder.', '/images/cards/demons/demon_1.png', THEMATIC_DECKS.DEMONS, 1),
  new Card(2, 'Demonio de la Ira', CARD_TYPES.CRIATURA, 2, null, 'Encarnación del odio ardiente. Puede atacar a cualquier criatura sin restricción, dejando caos a su paso.', '/images/cards/demons/demon_2.png', THEMATIC_DECKS.DEMONS, 2),
  new Card(3, 'Espectro de la Envidia', CARD_TYPES.CRIATURA, 3, null, 'Sombra ladina que drena el poder de los demás, debilitándolos mientras se fortalece.', '/images/cards/demons/demon_3.png', THEMATIC_DECKS.DEMONS, 3),
  new Card(4, 'Súcubo de la Lujuria', CARD_TYPES.CRIATURA, 4, null, 'Un demonio seductor que esclaviza las mentes, manipulando voluntades para desviar la batalla.', '/images/cards/demons/demon_4.png', THEMATIC_DECKS.DEMONS, 4),
  new Card(5, 'Goliat de la Pereza', CARD_TYPES.CRIATURA, 5, null, 'Gigante lento y pesado. Su poder surge solo en los momentos de estancamiento, cuando nadie lo espera.', '/images/cards/demons/demon_5.png', THEMATIC_DECKS.DEMONS, 5),
  new Card(6, 'Glotón del Abismo', CARD_TYPES.CRIATURA, 6, null, 'Una bestia descontrolada que devora aliados y enemigos por igual, generando terror en el campo.', '/images/cards/demons/demon_6.png', THEMATIC_DECKS.DEMONS, 6),
  new Card(7, 'Incubo de la Lujuria', CARD_TYPES.CRIATURA, 7, null, 'Complemento del súcubo: alimenta la corrupción del deseo, fortaleciendo al bando demoníaco.', '/images/cards/demons/demon_7.png', THEMATIC_DECKS.DEMONS, 7),
  new Card(8, 'Portador de la Pestilencia', CARD_TYPES.CRIATURA, 8, null, 'Demonio que siembra plagas. Infecta criaturas a distancia, saltándose defensas con su veneno corrupto.', '/images/cards/demons/demon_8.png', THEMATIC_DECKS.DEMONS, 8),
  new Card(9, 'Tirano de la Soberbia', CARD_TYPES.CRIATURA, 9, null, 'Un demonio que se cree superior incluso a sus iguales. Su mera presencia hace que otros demonios se subordinen o se enfrenten.', '/images/cards/demons/demon_9.png', THEMATIC_DECKS.DEMONS, 9),
  new Card(10, 'Señor del Abismo', CARD_TYPES.CRIATURA, 10, null, 'Un demonio primordial, capaz de congelar y quebrar todo vínculo. Su palabra sola puede destruir la Torre de los Pecados.', '/images/cards/demons/demon_10.png', THEMATIC_DECKS.DEMONS, 10),
  new Card(11, 'Barón de las Sombras', CARD_TYPES.CRIATURA, 11, null, 'Maestro del sigilo y la manipulación. Controla criaturas desde las sombras, fomentando la traición.', '/images/cards/demons/demon_11.png', THEMATIC_DECKS.DEMONS, 11),
  new Card(12, 'La Bruja del Caos', CARD_TYPES.CRIATURA, 12, null, 'Controla la corrupción, el engaño y el desorden. Es la tejedora del sufrimiento de los círculos intermedios.', '/images/cards/demons/demon_12.png', THEMATIC_DECKS.DEMONS, 12),
  new Card(13, 'El Emperador del Infierno', CARD_TYPES.CRIATURA, 13, null, 'El ser supremo del inframundo. Encerrado en hielo eterno, pero aún así el más poderoso de todos. Su poder no tiene límites.', '/images/cards/demons/demon_13.png', THEMATIC_DECKS.DEMONS, 13)
];

// Mazo de Dragones
const DRAGONS_DECK = [
  new Card(1, 'El Dragón Bebé', CARD_TYPES.CRIATURA, 1, null, 'Recién salido del cascarón, débil pero con un aliento que anuncia su destino. Representa los inicios del linaje dracónico.', '/images/cards/dragons/dragon_1.png', THEMATIC_DECKS.DRAGONS, 1),
  new Card(2, 'El Dragón de la Peste', CARD_TYPES.CRIATURA, 2, null, 'Su aliento envenenado corrompe el aire. Puede imponerse sobre cualquier criatura más débil, mostrando el primer despertar del poder.', '/images/cards/dragons/dragon_2.png', THEMATIC_DECKS.DRAGONS, 2),
  new Card(3, 'El Dragón de Piedra', CARD_TYPES.CRIATURA, 3, null, 'De escamas pétreas, casi indestructible. Simboliza la solidez y la resistencia del linaje.', '/images/cards/dragons/dragon_3.png', THEMATIC_DECKS.DRAGONS, 3),
  new Card(4, 'El Dragón de Hielo', CARD_TYPES.CRIATURA, 4, null, 'Congela todo a su paso, ralentizando a aliados y enemigos. Encarnación del control y la espera.', '/images/cards/dragons/dragon_4.png', THEMATIC_DECKS.DRAGONS, 4),
  new Card(5, 'El Dragón de Bronce', CARD_TYPES.CRIATURA, 5, null, 'Noble guerrero que lucha con honor. Su rugido infunde justicia entre los suyos.', '/images/cards/dragons/dragon_5.png', THEMATIC_DECKS.DRAGONS, 5),
  new Card(6, 'El Dragón de las Colinas', CARD_TYPES.CRIATURA, 6, null, 'Salvaje y territorial, protege sus dominios con ferocidad. Representa la naturaleza instintiva de los dragones.', '/images/cards/dragons/dragon_6.png', THEMATIC_DECKS.DRAGONS, 6),
  new Card(7, 'El Dragón del Desierto', CARD_TYPES.CRIATURA, 7, null, 'Astuto y paciente, se oculta bajo las arenas esperando el momento de atacar. Un maestro del engaño y la emboscada.', '/images/cards/dragons/dragon_7.png', THEMATIC_DECKS.DRAGONS, 7),
  new Card(8, 'El Dragón Etéreo', CARD_TYPES.CRIATURA, 8, null, 'Un espectro que atraviesa dimensiones. Su poder le permite saltarse los límites del tiempo y el espacio.', '/images/cards/dragons/dragon_8.png', THEMATIC_DECKS.DRAGONS, 8),
  new Card(9, 'El Dragón de la Tormenta', CARD_TYPES.CRIATURA, 9, null, 'Desde las nubes lanza rayos devastadores. Señor de los cielos, su dominio es la tempestad.', '/images/cards/dragons/dragon_9.png', THEMATIC_DECKS.DRAGONS, 9),
  new Card(10, 'El Dragón Dorado', CARD_TYPES.CRIATURA, 10, null, 'Símbolo de perfección y pureza. Su fuego puede arrasar incluso la Torre de los Pecados, dejando solo cenizas.', '/images/cards/dragons/dragon_10.png', THEMATIC_DECKS.DRAGONS, 10),
  new Card(11, 'El Dragón de Jade', CARD_TYPES.CRIATURA, 11, null, 'Antiguo y sabio, guardián de secretos arcanos. Su consejo influye en el destino de los dragones menores.', '/images/cards/dragons/dragon_11.png', THEMATIC_DECKS.DRAGONS, 11),
  new Card(12, 'La Dracona Guardiana', CARD_TYPES.CRIATURA, 12, null, 'Madre protectora de la estirpe, su poder es equiparable al de un rey. Su instinto es mantener vivo el linaje.', '/images/cards/dragons/dragon_12.png', THEMATIC_DECKS.DRAGONS, 12),
  new Card(13, 'El Dragón Primigenio', CARD_TYPES.CRIATURA, 13, null, 'El primero de todos los dragones. Su aliento creó fuego, hielo, tormentas y tierras. Todos los dragones provienen de él.', '/images/cards/dragons/dragon_13.png', THEMATIC_DECKS.DRAGONS, 13)
];

// Mazo de Magos
const MAGES_DECK = [
  new Card(1, 'El Aprendiz de Mago', CARD_TYPES.CRIATURA, 1, null, 'Inexperto, pero lleno de curiosidad y chispa mágica. Representa el inicio del camino arcano.', '/images/cards/mages/mage_1.png', THEMATIC_DECKS.MAGES, 1),
  new Card(2, 'El Ilusionista', CARD_TYPES.CRIATURA, 2, null, 'Maestro de los engaños y las ilusiones. Puede confundir a cualquier criatura y ocupar su lugar.', '/images/cards/mages/mage_2.png', THEMATIC_DECKS.MAGES, 2),
  new Card(3, 'El Invocador de Golems', CARD_TYPES.CRIATURA, 3, null, 'Canaliza su poder en constructos de piedra, creando guardianes para luchar en su nombre.', '/images/cards/mages/mage_3.png', THEMATIC_DECKS.MAGES, 3),
  new Card(4, 'El Alquimista del Destino', CARD_TYPES.CRIATURA, 4, null, 'Manipula los elementos y transforma la materia. Crea pociones y transmutaciones que alteran el flujo de la partida.', '/images/cards/mages/mage_4.png', THEMATIC_DECKS.MAGES, 4),
  new Card(5, 'El Nigromante de las Sombras', CARD_TYPES.CRIATURA, 5, null, 'Controla a los muertos, invocando ejércitos oscuros desde el inframundo.', '/images/cards/mages/mage_5.png', THEMATIC_DECKS.MAGES, 5),
  new Card(6, 'El Hechicero de la Tormenta', CARD_TYPES.CRIATURA, 6, null, 'Domina rayos, truenos y huracanes. Su magia golpea múltiples objetivos, debilitándolos.', '/images/cards/mages/mage_6.png', THEMATIC_DECKS.MAGES, 6),
  new Card(7, 'El Vidente del Futuro', CARD_TYPES.CRIATURA, 7, null, 'Profeta arcano que ve lo que está por venir. Puede anticipar y contrarrestar jugadas enemigas.', '/images/cards/mages/mage_7.png', THEMATIC_DECKS.MAGES, 7),
  new Card(8, 'El Mago del Tiempo', CARD_TYPES.CRIATURA, 8, null, 'Dueño de las arenas temporales. Puede acelerar o detener turnos, jugando fuera de las reglas normales.', '/images/cards/mages/mage_8.png', THEMATIC_DECKS.MAGES, 8),
  new Card(9, 'El Maestro de los Elementos', CARD_TYPES.CRIATURA, 9, null, 'Control absoluto del fuego, agua, tierra y aire. Equilibra los poderes arcanos con armonía devastadora.', '/images/cards/mages/mage_9.png', THEMATIC_DECKS.MAGES, 9),
  new Card(10, 'El Archimago de la Destrucción', CARD_TYPES.CRIATURA, 10, null, 'Su poder es cataclísmico. Un solo hechizo suyo puede desintegrar la Torre de los Pecados entera.', '/images/cards/mages/mage_10.png', THEMATIC_DECKS.MAGES, 10),
  new Card(11, 'El Mago de las Runas', CARD_TYPES.CRIATURA, 11, null, 'Descifra símbolos ancestrales que multiplican la fuerza de los conjuros. Canaliza la magia de eras pasadas.', '/images/cards/mages/mage_11.png', THEMATIC_DECKS.MAGES, 11),
  new Card(12, 'La Oráculo de las Estrellas', CARD_TYPES.CRIATURA, 12, null, 'Conecta con el cosmos y las constelaciones. Su sabiduría la convierte en guía de todos los magos.', '/images/cards/mages/mage_12.png', THEMATIC_DECKS.MAGES, 12),
  new Card(13, 'El Mago Supremo', CARD_TYPES.CRIATURA, 13, null, 'El origen y cúspide de la magia. Sus conjuros no conocen límites, y su palabra es ley en el mundo arcano.', '/images/cards/mages/mage_13.png', THEMATIC_DECKS.MAGES, 13)
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
