const express = require('express');
const { THEMATIC_DECKS, ANGELS_DECK, DEMONS_DECK, DRAGONS_DECK, MAGES_DECK, DWARVES_DECK, ELVES_DECK, DARK_ELVES_DECK, ORCS_DECK } = require('../models/Card');
const router = express.Router();

// Obtener salas públicas
router.get('/rooms', (req, res) => {
  try {
    // Esta función debería ser accesible desde el GameService
    // Por ahora retornamos un array vacío
    res.json({ rooms: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener información de una sala específica
router.get('/rooms/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    // Aquí se obtendría la información de la sala
    res.json({ 
      roomId,
      message: 'Información de la sala obtenida correctamente'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener estadísticas del juego
router.get('/stats', (req, res) => {
  try {
    res.json({
      totalGames: 0,
      activeGames: 0,
      totalPlayers: 0,
      averageGameTime: 0,
      deckTypes: {
        angels: 0,
        demons: 0,
        dragons: 0,
        mages: 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener reglas completas del juego
router.get('/rules', (req, res) => {
  try {
    res.json({
      title: 'Torre de los Pecados',
      description: 'Un clásico juego de cartas chileno ambientado en un universo de fantasía',
      objective: 'El primer jugador en deshacerse de todas sus criaturas gana. El último se convierte en el "pecador".',
      setup: {
        cardsPerPlayer: 12,
        faceUpCreatures: 3,
        faceDownCreatures: 3,
        soulWell: 6
      },
      phases: [
        {
          name: 'Fase de la Mano',
          description: 'Juegas con las cartas en tu mano y robas del Pozo de Almas'
        },
        {
          name: 'Fase de Criaturas Boca Arriba',
          description: 'Juegas con las 3 criaturas visibles, sin poder robar'
        },
        {
          name: 'Fase de Criaturas Boca Abajo',
          description: 'Juegas las 3 criaturas ocultas sin verlas'
        }
      ],
      specialCards: [
        {
          value: 2,
          name: 'Poder Universal',
          description: 'Se puede jugar sobre cualquier carta. El siguiente jugador puede jugar lo que quiera.'
        },
        {
          value: 8,
          name: 'Poder de Salto',
          description: 'Salta al siguiente jugador, quien pierde su turno.'
        },
        {
          value: 10,
          name: 'Poder de Purificación',
          description: 'Purifica la Torre de los Pecados. El siguiente jugador comienza una nueva ronda.'
        }
      ],
      rules: [
        'Se reparten 12 cartas a cada jugador',
        'Cada jugador organiza 3 cartas boca arriba y 3 boca abajo',
        'Las 6 cartas restantes van al Pozo de Almas',
        'El primer jugador puede descartar cualquier criatura',
        'Los siguientes deben descartar criaturas de igual o mayor valor',
        'Si no puedes jugar, tomas toda la Torre de los Pecados',
        'Cartas del mismo valor purifican el mazo',
        '4 cartas del mismo valor también purifican el mazo',
        'En la fase de mano, robas una carta después de cada descarte',
        'En las fases boca arriba y boca abajo no puedes robar',
        'Si juegas una carta inválida en fase boca abajo, regresas a la fase de mano'
      ],
      victory: 'El primer jugador en deshacerse de todas sus criaturas gana',
      defeat: 'El último jugador con criaturas se convierte en el "pecador"'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener información sobre mazos temáticos
router.get('/decks', (req, res) => {
  try {
    res.json({
      available: [
        {
          id: THEMATIC_DECKS.ANGELS,
          name: 'Mazo de Ángeles',
          description: 'La Luz Divina - Pureza, justicia y orden divino',
          theme: 'Defensa y control',
          strategy: 'Usa cartas protectoras y purificadoras',
          cards: ANGELS_DECK.map(card => ({
            id: card.id,
            name: card.name,
            value: card.value,
            description: card.description,
            isSpecial: card.isSpecial
          }))
        },
        {
          id: THEMATIC_DECKS.DEMONS,
          name: 'Mazo de Demonios',
          description: 'La Oscuridad del Abismo - Los siete pecados capitales',
          theme: 'Agresión y caos',
          strategy: 'Aplica presión constante con cartas destructivas',
          cards: DEMONS_DECK.map(card => ({
            id: card.id,
            name: card.name,
            value: card.value,
            description: card.description,
            isSpecial: card.isSpecial
          }))
        },
        {
          id: THEMATIC_DECKS.DRAGONS,
          name: 'Mazo de Dragones',
          description: 'Los Señores del Cielo - Poder primitivo y sabiduría ancestral',
          theme: 'Poderío y dominio',
          strategy: 'Acumula fuerza y usa ataques directos',
          cards: DRAGONS_DECK.map(card => ({
            id: card.id,
            name: card.name,
            value: card.value,
            description: card.description,
            isSpecial: card.isSpecial
          }))
        },
        {
          id: THEMATIC_DECKS.MAGES,
          name: 'Mazo de Magos',
          description: 'Los Maestros del Arcano - Conocimiento arcano y manipulación',
          theme: 'Versatilidad y control',
          strategy: 'Adapta tu juego según la situación',
          cards: MAGES_DECK.map(card => ({
            id: card.id,
            name: card.name,
            value: card.value,
            description: card.description,
            isSpecial: card.isSpecial
          }))
        },
        {
          id: THEMATIC_DECKS.DWARVES,
          name: 'Mazo de Enanos',
          description: 'Forja, Runas, Máquinas de Guerra, Fortaleza - Civilización forjadora',
          theme: 'Construcción y sinergia',
          strategy: 'Construye desde la base y potencia con máquinas de guerra',
          cards: DWARVES_DECK.map(card => ({
            id: card.id,
            name: card.name,
            value: card.value,
            description: card.description,
            isSpecial: card.isSpecial
          }))
        },
        {
          id: THEMATIC_DECKS.ELVES,
          name: 'Mazo de Elfos del Bosque',
          description: 'Ciclo Natural, Armonía, Crecimiento - Reino de la Naturaleza',
          theme: 'Crecimiento y armonía',
          strategy: 'Desarrolla gradualmente y equilibra el ciclo natural',
          cards: ELVES_DECK.map(card => ({
            id: card.id,
            name: card.name,
            value: card.value,
            description: card.description,
            isSpecial: card.isSpecial
          }))
        },
        {
          id: THEMATIC_DECKS.DARK_ELVES,
          name: 'Mazo de Elfos Oscuros',
          description: 'Sombras, Sacrificio, Venenos, Magia Prohibida - Imperio de la Corrupción',
          theme: 'Sacrificio y corrupción',
          strategy: 'Sacrifica a los débiles para invocar la oscuridad absoluta',
          cards: DARK_ELVES_DECK.map(card => ({
            id: card.id,
            name: card.name,
            value: card.value,
            description: card.description,
            isSpecial: card.isSpecial
          }))
        },
        {
          id: THEMATIC_DECKS.ORCS,
          name: 'Mazo de Orcos',
          description: 'Fuerza Bruta, Hordas, Tambores de Guerra, Berserkers - El Poder de la Masa',
          theme: 'Horda y fuerza bruta',
          strategy: 'Construye hordas masivas y usa tambores para potenciar ataques',
          cards: ORCS_DECK.map(card => ({
            id: card.id,
            name: card.name,
            value: card.value,
            description: card.description,
            isSpecial: card.isSpecial
          }))
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener información de un mazo específico
router.get('/decks/:deckId', (req, res) => {
  try {
    const { deckId } = req.params;
    let deck = null;
    
    switch (deckId) {
      case THEMATIC_DECKS.ANGELS:
        deck = ANGELS_DECK;
        break;
      case THEMATIC_DECKS.DEMONS:
        deck = DEMONS_DECK;
        break;
      case THEMATIC_DECKS.DRAGONS:
        deck = DRAGONS_DECK;
        break;
      case THEMATIC_DECKS.MAGES:
        deck = MAGES_DECK;
        break;
      case THEMATIC_DECKS.DWARVES:
        deck = DWARVES_DECK;
        break;
      case THEMATIC_DECKS.ELVES:
        deck = ELVES_DECK;
        break;
      case THEMATIC_DECKS.DARK_ELVES:
        deck = DARK_ELVES_DECK;
        break;
      case THEMATIC_DECKS.ORCS:
        deck = ORCS_DECK;
        break;
      default:
        return res.status(404).json({ error: 'Mazo no encontrado' });
    }
    
    res.json({
      id: deckId,
      cards: deck.map(card => ({
        id: card.id,
        name: card.name,
        value: card.value,
        power: card.power,
        description: card.description,
        isSpecial: card.isSpecial,
        deck: card.deck
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
