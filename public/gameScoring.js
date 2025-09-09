// gameScoring.js - Scoring system for the cybersecurity game

class GameScoring {
  constructor(config) {
    this.config = config;
  }

  /**
   * Calculate the final game score
   * @param {Object} player - Player object
   * @param {boolean} success - Whether the game was won
   * @param {number} totalDetections - Total detections during the game
   * @returns {number} Final calculated score
   */
  calculateScore(player, success, totalDetections) {
    const config = this.config.scoring;
    let score = config.baseScore || 0;
    
    if (success) {
      score += config.winBonus;
    }

    // Apply inventory bonuses from config
    player.inventory.forEach(item => {
      if (config.inventoryBonuses[item]) {
        score += config.inventoryBonuses[item];
      }
    });

    // Apply penalties and bonuses
    score -= totalDetections * config.detectionPenalty;
    score += player.contingencies * config.contingencyBonus;

    // Apply final modifiers (skill level, defense maturity, game mode)
    const { score: finalScore } = this.applyModifiers(
      score,
      0,
      0,
      player.mode,
      player.skillLevel,
      player.defenceMaturity
    );
    
    return Math.max(0, finalScore); // Ensure score doesn't go negative
  }

  /**
   * Apply skill, defense, and mode modifiers to scoring
   * @param {number} baseScore - Base score before modifiers
   * @param {number} baseHours - Base hours (not used for scoring)
   * @param {number} baseDetection - Base detection (not used for scoring)
   * @param {string} mode - Game mode
   * @param {string} skillLevel - Player skill level
   * @param {string} defenceMaturity - Defense maturity level
   * @returns {Object} Modified values
   */
  applyModifiers(baseScore, baseHours, baseDetection, mode, skillLevel, defenceMaturity) {
    let score = baseScore;
    let hours = baseHours;
    let detection = baseDetection;

    // Apply defense maturity modifiers
    const defenseConfig = this.config.defenceMaturity[defenceMaturity];
    if (defenseConfig) {
      detection += defenseConfig.detectionModifier;
      score += defenseConfig.scoreModifier;
    }

    // Apply skill level modifiers
    const skillConfig = this.config.skillLevels[skillLevel];
    if (skillConfig) {
      hours = Math.ceil(hours * skillConfig.hourMultiplier);
      detection = Math.ceil(detection * skillConfig.detectionMultiplier);
      score = Math.floor(score * skillConfig.scoreMultiplier);
    }

    // Apply game mode modifiers
    const modeConfig = this.config.gameModes[mode];
    if (modeConfig) {
      score = Math.floor(score * modeConfig.scoreMultiplier);
    }

    return { score, hours, detection };
  }

  /**
   * Generate score display HTML
   * @param {number} score - Final score to display
   * @returns {string} HTML string for score display
   */
  generateScoreDisplay(score) {
    return `<p class="text-lg font-semibold">Final Score: <span class="text-yellow-400">${score}</span></p>`;
  }

  /**
   * Generate detailed score breakdown for analysis
   * @param {Object} player - Player object
   * @param {boolean} success - Whether the game was won
   * @param {number} totalDetections - Total detections during the game
   * @returns {Object} Detailed score breakdown
   */
  getScoreBreakdown(player, success, totalDetections) {
    const config = this.config.scoring;
    const breakdown = {
      baseScore: config.baseScore || 0,
      winBonus: success ? config.winBonus : 0,
      inventoryBonus: 0,
      detectionPenalty: totalDetections * config.detectionPenalty,
      contingencyBonus: player.contingencies * config.contingencyBonus,
      modifiers: {
        skillMultiplier: this.config.skillLevels[player.skillLevel]?.scoreMultiplier || 1,
        defenseModifier: this.config.defenceMaturity[player.defenceMaturity]?.scoreModifier || 0,
        modeMultiplier: this.config.gameModes[player.mode]?.scoreMultiplier || 1
      }
    };

    // Calculate inventory bonus
    player.inventory.forEach(item => {
      if (config.inventoryBonuses[item]) {
        breakdown.inventoryBonus += config.inventoryBonuses[item];
      }
    });

    // Calculate subtotal before modifiers
    breakdown.subtotal = breakdown.baseScore + breakdown.winBonus + breakdown.inventoryBonus - breakdown.detectionPenalty + breakdown.contingencyBonus;

    // Apply modifiers
    breakdown.afterSkillModifier = Math.floor(breakdown.subtotal * breakdown.modifiers.skillMultiplier);
    breakdown.afterDefenseModifier = breakdown.afterSkillModifier + breakdown.modifiers.defenseModifier;
    breakdown.finalScore = Math.floor(breakdown.afterDefenseModifier * breakdown.modifiers.modeMultiplier);

    return breakdown;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameScoring;
} else if (typeof window !== 'undefined') {
  window.GameScoring = GameScoring;
}