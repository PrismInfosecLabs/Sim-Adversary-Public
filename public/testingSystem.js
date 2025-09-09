// testingSystem.js - Generic testing system for cybersecurity game

class TestingSystem {
  constructor(config) {
    this.config = config;
    this.testResults = new Map(); // Store test results for tracking
  }

  /**
   * Performs a test on an item and returns results
   * @param {string} testType - Type of test (e.g., 'credentials', 'pcap', 'file')
   * @param {Object} player - Player object with inventory
   * @param {Function} addToInventory - Function to add items to inventory
   * @param {Function} removeFromInventory - Function to remove items from inventory
   * @param {Function} displayFeedback - Function to display feedback to player
   * @returns {Promise<Object>} Test result object
   */
  async performTest(testType, player, addToInventory, removeFromInventory, displayFeedback) {
    const testConfig = this.config.testTypes[testType];
    if (!testConfig) {
      throw new Error(`Unknown test type: ${testType}`);
    }

    // Check if player has required item
    const requiredItem = testConfig.requiredItem;
    if (!player.inventory.includes(requiredItem)) {
      displayFeedback(`You need '${requiredItem}' in your inventory to perform this test.`);
      return { success: false, reason: 'missing_item' };
    }

    // Perform the test
    const outcome = Math.random() * 100;
    let cumulativeProbability = 0;
    let selectedOutcome = null;

    // Find which outcome range this falls into
    for (const outcomeKey in testConfig.outcomes) {
      const outcomeConfig = testConfig.outcomes[outcomeKey];
      cumulativeProbability += outcomeConfig.probability;
      
      if (outcome < cumulativeProbability) {
        selectedOutcome = outcomeConfig;
        selectedOutcome.key = outcomeKey;
        break;
      }
    }

    if (!selectedOutcome) {
      throw new Error(`No outcome found for test type: ${testType}`);
    }

    // Handle the outcome
    const result = await this.handleTestOutcome(
      testType, 
      selectedOutcome, 
      player, 
      addToInventory, 
      removeFromInventory, 
      displayFeedback
    );

    // Store result for tracking
    const testId = `${testType}_${Date.now()}`;
    this.testResults.set(testId, {
      testType,
      outcome: selectedOutcome.key,
      timestamp: new Date().toISOString(),
      playerId: player.name
    });

    return result;
  }

  /**
   * Handles the outcome of a test
   * @private
   */
  async handleTestOutcome(testType, outcome, player, addToInventory, removeFromInventory, displayFeedback) {
    const testConfig = this.config.testTypes[testType];
    
    // Remove the consumed item
    removeFromInventory(testConfig.requiredItem);

    // Handle special outcomes (traps, failures, etc.)
    if (outcome.isTrap) {
      displayFeedback(outcome.feedbackMessage);
      
      // Add the trap item if specified
      if (outcome.item) {
        addToInventory(outcome.item);
      }

      return {
        success: false,
        trapped: true,
        outcome: outcome.key,
        message: outcome.feedbackMessage,
        item: outcome.item
      };
    }

    // Handle secondary outcomes (for complex tests like credentials with admin subtypes)
    let finalItem = outcome.item;
    let finalMessage = outcome.feedbackMessage;

    if (outcome.hasSecondaryTest) {
      const secondaryOutcome = Math.random() * 100;
      let cumulativeSecondary = 0;
      
      for (const secondaryKey in outcome.secondaryOutcomes) {
        const secondaryConfig = outcome.secondaryOutcomes[secondaryKey];
        cumulativeSecondary += secondaryConfig.probability;
        
        if (secondaryOutcome < cumulativeSecondary) {
          finalItem = secondaryConfig.item;
          finalMessage = secondaryConfig.feedbackMessage;
          break;
        }
      }
    }

    // Add the resulting item
    if (finalItem) {
      addToInventory(finalItem);
    }

    // Display feedback
    displayFeedback(finalMessage);

    return {
      success: true,
      trapped: false,
      outcome: outcome.key,
      message: finalMessage,
      item: finalItem
    };
  }

  /**
   * Get all test results for analysis
   */
  getTestResults() {
    return Array.from(this.testResults.values());
  }

  /**
   * Clear test results (useful for new games)
   */
  clearTestResults() {
    this.testResults.clear();
  }

  /**
   * Get available test types
   */
  getAvailableTestTypes() {
    return Object.keys(this.config.testTypes);
  }

  /**
   * Check if a test type is available
   */
  isTestTypeAvailable(testType) {
    return this.config.testTypes.hasOwnProperty(testType);
  }

  /**
   * Get test type configuration
   */
  getTestTypeConfig(testType) {
    return this.config.testTypes[testType] || null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestingSystem;
} else if (typeof window !== 'undefined') {
  window.TestingSystem = TestingSystem;
}