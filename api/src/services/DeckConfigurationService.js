const { THEMATIC_DECKS, ANGELS_DECK, DEMONS_DECK, DRAGONS_DECK, MAGES_DECK } = require('../models/Card');

class DeckConfigurationService {
  constructor() {
    this.deckConfigurations = new Map(); // Map<roomId, DeckConfiguration>
    this.defaultConfigurations = this.createDefaultConfigurations();
  }

  // Crear configuraciones por defecto
  createDefaultConfigurations() {
    return {
      [THEMATIC_DECKS.ANGELS]: {
        id: THEMATIC_DECKS.ANGELS,
        name: 'Mazo de Ángeles',
        description: 'Un mazo sagrado lleno de criaturas celestiales que luchan por la justicia y la pureza.',
        icon: '👼',
        color: '#4A90E2',
        theme: 'light',
        cards: ANGELS_DECK,
        specialRules: [
          'Los ángeles tienen poder de purificación natural',
          'Las cartas pares tienen efectos de protección',
          'El 10 purifica automáticamente la Torre'
        ],
        difficulty: 'easy',
        recommendedPlayers: [2, 4, 6],
        isEnabled: true,
        customizations: {
          allowCardRemoval: false,
          allowCardAddition: false,
          allowPowerModification: false,
          allowEffectModification: false
        }
      },
      [THEMATIC_DECKS.DEMONS]: {
        id: THEMATIC_DECKS.DEMONS,
        name: 'Mazo de Demonios',
        description: 'Un mazo oscuro con criaturas del infierno que buscan corromper y destruir.',
        icon: '😈',
        color: '#E74C3C',
        theme: 'dark',
        cards: DEMONS_DECK,
        specialRules: [
          'Los demonios tienen poder de corrupción',
          'Las cartas impares tienen efectos destructivos',
          'El 2 puede jugarse sobre cualquier carta'
        ],
        difficulty: 'medium',
        recommendedPlayers: [3, 5, 6],
        isEnabled: true,
        customizations: {
          allowCardRemoval: true,
          allowCardAddition: false,
          allowPowerModification: true,
          allowEffectModification: false
        }
      },
      [THEMATIC_DECKS.DRAGONS]: {
        id: THEMATIC_DECKS.DRAGONS,
        name: 'Mazo de Dragones',
        description: 'Un mazo legendario con las criaturas más poderosas del mundo.',
        icon: '🐉',
        color: '#F39C12',
        theme: 'fire',
        cards: DRAGONS_DECK,
        specialRules: [
          'Los dragones tienen poder de destrucción masiva',
          'Las cartas altas (8+) tienen efectos especiales',
          'El 10 incinera la Torre completamente'
        ],
        difficulty: 'hard',
        recommendedPlayers: [2, 3, 4],
        isEnabled: true,
        customizations: {
          allowCardRemoval: true,
          allowCardAddition: true,
          allowPowerModification: true,
          allowEffectModification: true
        }
      },
      [THEMATIC_DECKS.MAGES]: {
        id: THEMATIC_DECKS.MAGES,
        name: 'Mazo de Magos',
        description: 'Un mazo místico con hechiceros que dominan la magia arcana.',
        icon: '🧙‍♂️',
        color: '#9B59B6',
        theme: 'magic',
        cards: MAGES_DECK,
        specialRules: [
          'Los magos tienen poder de transformación',
          'Las cartas múltiplos de 3 tienen efectos mágicos',
          'El 8 puede saltar múltiples turnos'
        ],
        difficulty: 'expert',
        recommendedPlayers: [2, 3, 4, 5],
        isEnabled: true,
        customizations: {
          allowCardRemoval: true,
          allowCardAddition: true,
          allowPowerModification: true,
          allowEffectModification: true
        }
      }
    };
  }

  // Obtener configuración por defecto de un mazo
  getDefaultConfiguration(deckType) {
    return this.defaultConfigurations[deckType] || null;
  }

  // Obtener todas las configuraciones por defecto
  getAllDefaultConfigurations() {
    return Object.values(this.defaultConfigurations);
  }

  // Obtener configuraciones habilitadas
  getEnabledConfigurations() {
    return Object.values(this.defaultConfigurations).filter(config => config.isEnabled);
  }

  // Crear configuración personalizada para una sala
  createRoomConfiguration(roomId, deckType, customizations = {}) {
    const defaultConfig = this.getDefaultConfiguration(deckType);
    if (!defaultConfig) {
      throw new Error(`Tipo de mazo no válido: ${deckType}`);
    }

    const configuration = {
      ...defaultConfig,
      roomId,
      customizations: {
        ...defaultConfig.customizations,
        ...customizations
      },
      modifiedCards: [],
      customRules: [],
      createdAt: new Date(),
      modifiedAt: new Date()
    };

    this.deckConfigurations.set(roomId, configuration);
    return configuration;
  }

  // Obtener configuración de una sala
  getRoomConfiguration(roomId) {
    return this.deckConfigurations.get(roomId) || null;
  }

  // Actualizar configuración de una sala
  updateRoomConfiguration(roomId, updates) {
    const configuration = this.getRoomConfiguration(roomId);
    if (!configuration) {
      throw new Error(`Configuración no encontrada para la sala: ${roomId}`);
    }

    const updatedConfiguration = {
      ...configuration,
      ...updates,
      modifiedAt: new Date()
    };

    this.deckConfigurations.set(roomId, updatedConfiguration);
    return updatedConfiguration;
  }

  // Modificar una carta específica
  modifyCard(roomId, cardId, modifications) {
    const configuration = this.getRoomConfiguration(roomId);
    if (!configuration) {
      throw new Error(`Configuración no encontrada para la sala: ${roomId}`);
    }

    const card = configuration.cards.find(c => c.id === cardId);
    if (!card) {
      throw new Error(`Carta no encontrada: ${cardId}`);
    }

    // Verificar permisos de modificación
    if (modifications.power !== undefined && !configuration.customizations.allowPowerModification) {
      throw new Error('No se permite modificar el poder de las cartas en este mazo');
    }

    if (modifications.effect !== undefined && !configuration.customizations.allowEffectModification) {
      throw new Error('No se permite modificar los efectos de las cartas en este mazo');
    }

    // Crear carta modificada
    const modifiedCard = {
      ...card,
      ...modifications,
      originalCard: { ...card },
      isModified: true
    };

    // Actualizar configuración
    const cardIndex = configuration.cards.findIndex(c => c.id === cardId);
    configuration.cards[cardIndex] = modifiedCard;
    configuration.modifiedCards.push({
      cardId,
      modifications,
      modifiedAt: new Date()
    });

    this.deckConfigurations.set(roomId, configuration);
    return modifiedCard;
  }

  // Agregar regla personalizada
  addCustomRule(roomId, rule) {
    const configuration = this.getRoomConfiguration(roomId);
    if (!configuration) {
      throw new Error(`Configuración no encontrada para la sala: ${roomId}`);
    }

    const customRule = {
      id: `rule_${Date.now()}`,
      description: rule.description,
      effect: rule.effect,
      conditions: rule.conditions || [],
      createdAt: new Date()
    };

    configuration.customRules.push(customRule);
    this.deckConfigurations.set(roomId, configuration);
    return customRule;
  }

  // Remover regla personalizada
  removeCustomRule(roomId, ruleId) {
    const configuration = this.getRoomConfiguration(roomId);
    if (!configuration) {
      throw new Error(`Configuración no encontrada para la sala: ${roomId}`);
    }

    configuration.customRules = configuration.customRules.filter(rule => rule.id !== ruleId);
    this.deckConfigurations.set(roomId, configuration);
    return true;
  }

  // Obtener mazo configurado para una sala
  getConfiguredDeck(roomId) {
    const configuration = this.getRoomConfiguration(roomId);
    if (!configuration) {
      // Si no hay configuración personalizada, usar la por defecto
      return this.getDefaultConfiguration(configuration?.id || THEMATIC_DECKS.ANGELS).cards;
    }

    return configuration.cards;
  }

  // Validar configuración
  validateConfiguration(configuration) {
    const errors = [];

    // Verificar que el mazo tenga al menos 13 cartas
    if (!configuration.cards || configuration.cards.length < 13) {
      errors.push('El mazo debe tener al menos 13 cartas');
    }

    // Verificar que no haya cartas duplicadas
    const cardIds = configuration.cards.map(card => card.id);
    const uniqueIds = new Set(cardIds);
    if (cardIds.length !== uniqueIds.size) {
      errors.push('No puede haber cartas duplicadas en el mazo');
    }

    // Verificar que las cartas especiales (2, 8, 10) estén presentes
    const specialValues = [2, 8, 10];
    const hasSpecialCards = specialValues.every(value => 
      configuration.cards.some(card => card.value === value)
    );
    if (!hasSpecialCards) {
      errors.push('El mazo debe contener las cartas especiales (2, 8, 10)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Obtener estadísticas de configuración
  getConfigurationStats() {
    const stats = {
      totalConfigurations: this.deckConfigurations.size,
      configurationsByDeckType: {},
      mostModifiedCards: [],
      averageCustomizations: 0
    };

    // Contar configuraciones por tipo de mazo
    for (const [roomId, config] of this.deckConfigurations) {
      const deckType = config.id;
      stats.configurationsByDeckType[deckType] = (stats.configurationsByDeckType[deckType] || 0) + 1;
    }

    // Encontrar cartas más modificadas
    const cardModifications = new Map();
    for (const [roomId, config] of this.deckConfigurations) {
      for (const modifiedCard of config.modifiedCards) {
        const count = cardModifications.get(modifiedCard.cardId) || 0;
        cardModifications.set(modifiedCard.cardId, count + 1);
      }
    }

    stats.mostModifiedCards = Array.from(cardModifications.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cardId, count]) => ({ cardId, count }));

    // Calcular promedio de personalizaciones
    const totalCustomizations = Array.from(this.deckConfigurations.values())
      .reduce((sum, config) => sum + config.modifiedCards.length, 0);
    stats.averageCustomizations = this.deckConfigurations.size > 0 
      ? Math.round(totalCustomizations / this.deckConfigurations.size) 
      : 0;

    return stats;
  }

  // Limpiar configuraciones antiguas
  cleanupOldConfigurations(maxAge = 24 * 60 * 60 * 1000) { // 24 horas por defecto
    const now = new Date();
    const oldConfigurations = [];

    for (const [roomId, config] of this.deckConfigurations) {
      const age = now.getTime() - config.modifiedAt.getTime();
      if (age > maxAge) {
        oldConfigurations.push(roomId);
      }
    }

    oldConfigurations.forEach(roomId => {
      this.deckConfigurations.delete(roomId);
    });

    return oldConfigurations.length;
  }

  // Exportar configuración
  exportConfiguration(roomId) {
    const configuration = this.getRoomConfiguration(roomId);
    if (!configuration) {
      throw new Error(`Configuración no encontrada para la sala: ${roomId}`);
    }

    return {
      ...configuration,
      exportDate: new Date(),
      version: '1.0'
    };
  }

  // Importar configuración
  importConfiguration(roomId, importedConfig) {
    // Validar configuración importada
    const validation = this.validateConfiguration(importedConfig);
    if (!validation.isValid) {
      throw new Error(`Configuración inválida: ${validation.errors.join(', ')}`);
    }

    const configuration = {
      ...importedConfig,
      roomId,
      importedAt: new Date(),
      modifiedAt: new Date()
    };

    this.deckConfigurations.set(roomId, configuration);
    return configuration;
  }
}

module.exports = DeckConfigurationService;
