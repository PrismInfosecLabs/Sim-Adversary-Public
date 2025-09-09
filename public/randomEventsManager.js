// randomEventsManager.js - Random events system for Sim-Adversary

class RandomEventsManager {
  constructor(config, gameMode, teamType = null, options = {}) {
    this.config = config;
    this.gameMode = gameMode;
    this.options = options;
    
    if (!teamType && config.getTeamTypeForMode) {
      this.teamType = config.getTeamTypeForMode(gameMode);
    } else {
      this.teamType = teamType || 'red';
    }
    
    this.activeEvents = new Map();
    this.triggeredEvents = new Set();
    this.eventHistory = [];
    this.timers = new Map();
    
    this.gameStartTime = Date.now();
    this.detectionCount = 0;
    this.stepCount = 0;
    this.lastEventTime = Date.now();

    // Event rate limiting
    this.eventCooldownTime = 3; // Minimum steps between events
    this.lastEventStep = -this.eventCooldownTime; // Allow first event immediately
    this.maxEventsPerGame = 4; // Maximum total events in one game
    this.eventCount = 0; // Track total events triggered
    
    // Global probability modifiers
    this.globalEventProbabilityModifier = 1.0; // Starts at 100%
    this.probabilityDecayRate = 0.85; // Reduce by 15% after each event
    this.minGlobalProbability = 0.3; // Don't go below 30%
    
    this.loadedEvents = [];
    this.eventsLoaded = false;
    
    // Common filenames to try in each folder
    this.commonFilenames = {
      'red-team': ['infrastructure', 'detection', 'defensive', 'opportunity', 'operational', 'persistence', 'evasion'],
      'blue-team': ['threat-comms', 'external', 'intelligence', 'pressure', 'forensics', 'incident-response'],
      'common': ['technical', 'environmental', 'third-party', 'communications', 'legal']
    };
    
    this.loadEvents();
  }

  /**
   * Load event files using dynamic discovery
   */
  async loadEvents() {
    try {
      const eventFiles = await this.discoverEventFiles();
      const loadPromises = eventFiles.map(file => this.loadEventFile(file));
      
      const eventSets = await Promise.allSettled(loadPromises);
      
      this.loadedEvents = [];
      eventSets.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          this.loadedEvents.push(...result.value);
        }
      });
      
      this.eventsLoaded = true;
      console.log(`Loaded ${this.loadedEvents.length} random events for mode ${this.gameMode}, team ${this.teamType}`);
      
    } catch (error) {
      console.error('Error loading event files:', error);
      this.loadedEvents = [];
      this.eventsLoaded = true;
    }
  }

  /**
   * Discover all event files that should be loaded
   */
  async discoverEventFiles() {
    const files = [];

    // 1. Discover team-specific files
    if (this.config.events.basePaths[this.teamType]) {
      const teamFiles = await this.discoverFilesInFolder(
        this.config.events.basePaths[this.teamType],
        this.commonFilenames[`${this.teamType}-team`] || []
      );
      files.push(...teamFiles);
    }

    // 2. Discover common files
    if (this.config.events.basePaths.common) {
      const commonFiles = await this.discoverFilesInFolder(
        this.config.events.basePaths.common,
        this.commonFilenames.common || []
      );
      files.push(...commonFiles);
    }

    // 3. Add scenario-specific file
    const scenarioFileName = this.config.events.scenarioFileMap[this.gameMode];
    if (scenarioFileName) {
      const scenarioFile = `${this.config.events.scenarioPaths.specific}${scenarioFileName}.json`;
      files.push(scenarioFile);
    }

    // 4. Add industry-specific file if specified
    if (this.options.industry) {
      const industryFile = `${this.config.events.scenarioPaths.industry}${this.options.industry}.json`;
      files.push(industryFile);
    }

    // 5. Add difficulty-specific file if specified
    if (this.options.difficulty) {
      const difficultyFile = `${this.config.events.scenarioPaths.difficulty}${this.options.difficulty}.json`;
      files.push(difficultyFile);
    }

    return files;
  }

  /**
   * Discover files in a specific folder by trying common filenames
   */
  async discoverFilesInFolder(folderPath, commonNames = []) {
    const files = [];
    const extensions = this.config.events.fileExtensions || ['.json'];

    // Try each common filename with each extension
    for (const name of commonNames) {
      for (const ext of extensions) {
        const filePath = `${folderPath}${name}${ext}`;
        
        // Check if file exists by attempting to fetch it
        if (await this.fileExists(filePath)) {
          files.push(filePath);
        }
      }
    }

    return files;
  }

  /**
   * Check if a file exists by attempting to fetch it
   */
  async fileExists(filePath) {
    try {
      const response = await fetch(filePath, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Load a single event file (unchanged from original)
   */
  async loadEventFile(filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        console.warn(`Event file not found: ${filePath}`);
        return [];
      }
      
      const eventData = await response.json();
      const validEvents = this.validateAndFilterEvents(eventData.events || [], eventData);
      
      console.log(`Loaded ${validEvents.length} events from ${filePath}`);
      return validEvents;
      
    } catch (error) {
      console.warn(`Failed to load event file ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Alternative method for servers that can provide directory listings
   */
  async discoverFilesFromDirectory(folderPath) {
    try {
      // Try to get directory listing (if server supports it)
      const response = await fetch(`${folderPath}?list=json`);
      if (response.ok) {
        const fileList = await response.json();
        return fileList
          .filter(file => this.config.events.fileExtensions.some(ext => file.endsWith(ext)))
          .map(file => `${folderPath}${file}`);
      }
    } catch (error) {
      // Fall back to common filename approach
    }
    
    return [];
  }

  /**
   * Get debug info about discovered files
   */
  async getDiscoveredFiles() {
    const files = await this.discoverEventFiles();
    const results = {
      total: files.length,
      byCategory: {},
      files: files
    };

    // Categorize files
    files.forEach(file => {
      if (file.includes('/red-team/')) {
        results.byCategory['red-team'] = (results.byCategory['red-team'] || 0) + 1;
      } else if (file.includes('/blue-team/')) {
        results.byCategory['blue-team'] = (results.byCategory['blue-team'] || 0) + 1;
      } else if (file.includes('/common/')) {
        results.byCategory['common'] = (results.byCategory['common'] || 0) + 1;
      } else if (file.includes('/scenario-specific/')) {
        results.byCategory['scenario-specific'] = (results.byCategory['scenario-specific'] || 0) + 1;
      } else if (file.includes('/industry/')) {
        results.byCategory['industry'] = (results.byCategory['industry'] || 0) + 1;
      } else if (file.includes('/difficulty/')) {
        results.byCategory['difficulty'] = (results.byCategory['difficulty'] || 0) + 1;
      }
    });

    return results;
  }

  /**
   * Add a new common filename to try for a team/category
   */
  addCommonFilename(category, filename) {
    if (!this.commonFilenames[category]) {
      this.commonFilenames[category] = [];
    }
    if (!this.commonFilenames[category].includes(filename)) {
      this.commonFilenames[category].push(filename);
    }
  }

  /**
   * Check and potentially trigger random events based on game state
   * @param {string} trigger - Type of trigger ('detection', 'step', 'time', 'success', 'failure')
   * @param {Object} context - Additional context (player, currentStep, etc.)
   * @param {Function} gameStateCallback - Callback to modify game state
   * @param {Function} uiCallback - Callback to update UI
   */
  async checkForEvents(trigger, context, gameStateCallback, uiCallback) {
    // Wait for events to load if they haven't yet
    await this.waitForEventsLoaded();
    
    if (this.loadedEvents.length === 0) {
      return null;
    }

    const availableEvents = this.getAvailableEvents(trigger, context);
    
    if (availableEvents.length === 0) return null;

    // Check each available event for trigger probability
    for (const eventConfig of availableEvents) {
      if (this.shouldTriggerEvent(eventConfig, context)) {
        return this.triggerEvent(eventConfig, context, gameStateCallback, uiCallback);
      }
    }

    return null;
  }

  /**
   * Validate and filter events based on applicability
   */
  validateAndFilterEvents(events, eventSetMetadata) {
    return events.filter(event => {
      // Check if event applies to current scenario
      if (eventSetMetadata.applicableScenarios && 
          !eventSetMetadata.applicableScenarios.includes(this.gameMode) &&
          !eventSetMetadata.applicableScenarios.includes('all')) {
        return false;
      }
      
      // Check if event applies to current team
      if (eventSetMetadata.applicableTeams && 
          !eventSetMetadata.applicableTeams.includes(this.teamType) &&
          !eventSetMetadata.applicableTeams.includes('all')) {
        return false;
      }
      
      // Validate required event properties
      if (!event.id || !event.title || !event.triggers || !Array.isArray(event.triggers)) {
        console.warn('Invalid event structure:', event);
        return false;
      }
      
     return true;  //events were triggering far too frequently, so added the following in to reduce it - remove everything after return true to end of function if you want to restore this
      }).map(event => {
        const adjustedEvent = { ...event };
        
        if (event.baseProbability) {
          // Reduce probability based on event type
          if (event.triggers.includes('step')) {
            // Step events are checked most frequently - reduce more
            adjustedEvent.baseProbability = event.baseProbability * 0.3; // 70% reduction
          } else if (event.triggers.includes('detection')) {
            // Detection events - moderate reduction
            adjustedEvent.baseProbability = event.baseProbability * 0.5; // 50% reduction
          } else {
            // Other events - standard reduction
            adjustedEvent.baseProbability = event.baseProbability * 0.4; // 60% reduction
          }
          
          // Ensure minimum probability isn't too low
          adjustedEvent.baseProbability = Math.max(0.01, adjustedEvent.baseProbability);
          
          console.log(`Adjusted ${event.id}: ${event.baseProbability} -> ${adjustedEvent.baseProbability}`);
        }
        
        return adjustedEvent;
      });
    }

  /**
   * Wait for events to finish loading before checking
   */
  async waitForEventsLoaded() {
    if (this.eventsLoaded) return;
    
    // Poll until loaded or timeout
    const timeout = 5000; // 5 seconds
    const start = Date.now();
    
    while (!this.eventsLoaded && (Date.now() - start) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!this.eventsLoaded) {
      console.warn('Event loading timed out');
      this.eventsLoaded = true; // Prevent further blocking
    }
  }

  /**
   * Get events that could be triggered based on current conditions
   * @private
   */
  getAvailableEvents(trigger, context) {
    return this.loadedEvents.filter(event => {
      // Check if event matches trigger type
      if (!event.triggers.includes(trigger)) return false;
      
      // Check if event was already triggered (for one-time events)
      if (event.oneTime && this.triggeredEvents.has(event.id)) return false;
      
      // Check conditions
      return this.checkEventConditions(event, context);
    });
  }

  /**
   * Check if event conditions are met
   * @private
   */
  checkEventConditions(event, context) {
    const conditions = event.conditions || {};
    
    // Check minimum step count
    if (conditions.minSteps && this.stepCount < conditions.minSteps) return false;
    
    // Check maximum step count
    if (conditions.maxSteps && this.stepCount > conditions.maxSteps) return false;
    
    // Check minimum detections
    if (conditions.minDetections && this.detectionCount < conditions.minDetections) return false;
    
    // Check player resources
    if (conditions.minHours && context.player.hours < conditions.minHours) return false;
    if (conditions.maxHours && context.player.hours > conditions.maxHours) return false;
    
    // Check inventory requirements
    if (conditions.requiredItems) {
      const hasRequired = conditions.requiredItems.every(item => 
        context.player.inventory.includes(item)
      );
      if (!hasRequired) return false;
    }

    // Check forbidden items
    if (conditions.forbiddenItems) {
      const hasForbidden = conditions.forbiddenItems.some(item => 
        context.player.inventory.includes(item)
      );
      if (hasForbidden) return false;
    }

    // Check skill level
    if (conditions.skillLevels && !conditions.skillLevels.includes(context.player.skillLevel)) {
      return false;
    }

    // Check defense maturity
    if (conditions.defenseMaturity && !conditions.defenseMaturity.includes(context.player.defenceMaturity)) {
      return false;
    }

    // Check current step
    if (conditions.allowedSteps && !conditions.allowedSteps.includes(context.currentStep?.key)) {
      return false;
    }

    return true;
  }

  /**
   * Determine if an event should trigger based on probability
   * @private
   */
  shouldTriggerEvent(eventConfig, context) {
    let probability = eventConfig.baseProbability;
    
    // Apply modifiers
    if (eventConfig.modifiers) {
      // Skill level modifiers
      if (eventConfig.modifiers.skillLevel) {
        const skillModifier = eventConfig.modifiers.skillLevel[context.player.skillLevel];
        if (skillModifier) probability *= skillModifier;
      }
      
      // Defense maturity modifiers
      if (eventConfig.modifiers.defenseMaturity) {
        const defenseModifier = eventConfig.modifiers.defenseMaturity[context.player.defenceMaturity];
        if (defenseModifier) probability *= defenseModifier;
      }
      
      // Detection count modifiers (more detections = higher chance of some events)
      if (eventConfig.modifiers.detectionMultiplier) {
        probability *= (1 + (this.detectionCount * eventConfig.modifiers.detectionMultiplier));
      }
    }

    // Cap probability
    probability = Math.min(probability, eventConfig.maxProbability || 1.0);
    
    return Math.random() < probability;
  }

  /**
   * Trigger a random event
   * @private
   */
    triggerEvent(eventConfig, context, gameStateCallback, uiCallback) {
    try {
      const eventInstance = {
        id: eventConfig.id,
        triggeredAt: Date.now(),
        config: eventConfig,
        context: { ...context },
        resolved: false,
        uiElementsCreated: []
      };

      if (eventConfig.oneTime) {
        this.triggeredEvents.add(eventConfig.id);
      }

      this.activeEvents.set(eventConfig.id, eventInstance);
      
      // ENHANCED - Capture rich context from your room/choice structure
      const historyEntry = {
        ...eventInstance,
        gameStep: this.stepCount,
        detectionCount: this.detectionCount,
        
        stepContext: {
          stepTitle: context.currentStep?.title || 'Unknown Step',
          stepKey: context.currentStep?.key || 'unknown',
          stepDescription: context.currentStep?.description || '',
          choiceLabel: context.choice?.label || 'Unknown Choice',
          choiceMitreId: context.choice?.mitreId || 'N/A',
          choiceHourCost: context.choice?.hourCost || 0,
          choiceDetectionChance: context.choice?.detectionChance || 0,
          choiceSuccessChance: context.choice?.successChance || 100
        },
        
        gameContext: {
          playerHours: context.player?.hours || 0,
          playerContingencies: context.player?.contingencies || 0,
          detectionLevel: this.detectionCount || 0,
          skillLevel: context.player?.skillLevel || '2',
          defenseMaturity: context.player?.defenceMaturity || '2'
        }
      };
      
      this.eventHistory.push(historyEntry);

      // ENHANCED - Better console logging
      console.log(`🎯 EVENT TRIGGERED: ${eventConfig.title}`);
      console.log(`   Step ${this.stepCount}: ${historyEntry.stepContext.stepTitle} (${historyEntry.stepContext.stepKey})`);
      console.log(`   Choice: ${historyEntry.stepContext.choiceLabel} (${historyEntry.stepContext.choiceMitreId})`);
      console.log(`   Category: ${eventConfig.category} | Player: ${historyEntry.gameContext.playerHours}h, ${historyEntry.gameContext.playerContingencies}c`);

      this.executeEventEffects(eventConfig, context, gameStateCallback, uiCallback);

      if (eventConfig.delayedEffects) {
        this.scheduleDelayedEffects(eventConfig, context, gameStateCallback, uiCallback);
      }

      return eventInstance;
      
    } catch (error) {
      console.error('Error triggering event:', eventConfig.id, error);
      return null;
    }
  }


  /**
   * Execute immediate event effects
   * @private
   */
  executeEventEffects(eventConfig, context, gameStateCallback, uiCallback) {
    try {
      const effects = eventConfig.effects || {};

      // Resource changes
      if (effects.hours) {
        gameStateCallback('adjustHours', effects.hours);
      }
      
      if (effects.contingencies) {
        gameStateCallback('adjustContingencies', effects.contingencies);
      }

      // Inventory changes
      if (effects.addItems) {
        effects.addItems.forEach(item => {
          gameStateCallback('addInventoryItem', item);
        });
      }

      if (effects.removeItems) {
        effects.removeItems.forEach(item => {
          gameStateCallback('removeInventoryItem', item);
        });
      }

      // Forced delays
      if (effects.waitTime) {
        this.handleWaitTime(effects.waitTime, eventConfig, uiCallback);
      }

      // Display event message with enhanced error handling
      if (eventConfig.message) { // Removed '|| additionalMessage'
        const messageData = {
          id: eventConfig.id, // Add unique ID for tracking
          title: eventConfig.title,
          message: eventConfig.message, // Removed '+ additionalMessage'
          type: eventConfig.messageType || 'warning',
          effects: effects,
          timestamp: Date.now() // Add timestamp for debugging
        };
        
        console.log('Showing event message:', messageData);
        
        // Wrap UI callback in try-catch
        try {
          uiCallback('showEventMessage', messageData);
        } catch (uiError) {
          console.error('UI callback error for event:', eventConfig.id, uiError);
          // Don't crash the game, just log the error
        }
      }

      // Game state modifications
      if (effects.gameState) {
        Object.entries(effects.gameState).forEach(([key, value]) => {
          try {
            gameStateCallback('setState', key, value);
            // Removed specific message logic here, now handled by game.js
          } catch (stateError) {
            console.error('Game state error:', key, value, stateError);
          }
        });
      }
      
    } catch (error) {
      console.error('Error executing event effects for:', eventConfig.id, error);
      // Don't let event errors crash the game
    }
  }

  /**
   * Handle wait time events (like C2 blocking)
   * @private
   */
  handleWaitTime(waitTime, eventConfig, uiCallback) {
    const waitEndTime = Date.now() + (waitTime * 1000);
    
    // Show countdown timer
    uiCallback('showWaitTimer', {
      duration: waitTime,
      message: eventConfig.waitMessage || `Waiting for ${waitTime} seconds...`,
      eventId: eventConfig.id
    });

    // Set timer for when wait ends
    const timerId = setTimeout(() => {
      uiCallback('hideWaitTimer', eventConfig.id);
      uiCallback('showMessage', {
        message: eventConfig.waitEndMessage || "Wait period has ended. You may continue.",
        type: 'success'
      });
      this.timers.delete(eventConfig.id);
    }, waitTime * 1000);

    this.timers.set(eventConfig.id, timerId);
  }

  /**
   * Schedule delayed effects
   * @private
   */
  scheduleDelayedEffects(eventConfig, context, gameStateCallback, uiCallback) {
    eventConfig.delayedEffects.forEach(delayedEffect => {
      const timerId = setTimeout(() => {
        this.executeEventEffects(
          { effects: delayedEffect.effects, message: delayedEffect.message, title: delayedEffect.title },
          context,
          gameStateCallback,
          uiCallback
        );
      }, delayedEffect.delay * 1000);
      
      this.timers.set(`${eventConfig.id}_delayed_${delayedEffect.delay}`, timerId);
    });
  }

  /**
   * Update tracking variables
   */
  updateTracking(type, value) {
    switch (type) {
      case 'detection':
        this.detectionCount++;
        break;
      case 'step':
        this.stepCount++;
        break;
      case 'lastEventTime':
        this.lastEventTime = Date.now();
        break;
    }
  }

  /**
   * Check for time-based events
   */
  async checkTimeBasedEvents(context, gameStateCallback, uiCallback) {
    // Wait for events to load if they haven't yet
    await this.waitForEventsLoaded();
    
    if (this.loadedEvents.length === 0) {
      return;
    }

    const currentTime = Date.now();
    const timeSinceStart = currentTime - this.gameStartTime;
    const timeSinceLastEvent = currentTime - this.lastEventTime;

    // Check for events that should trigger based on time
    const timeEvents = this.getAvailableEvents('time', {
      ...context,
      timeSinceStart: timeSinceStart / 1000,
      timeSinceLastEvent: timeSinceLastEvent / 1000
    });

    for (const event of timeEvents) {
      if (event.timeConditions) {
        const conditions = event.timeConditions;
        
        // Check minimum time since start
        if (conditions.minTimeSinceStart && timeSinceStart < conditions.minTimeSinceStart * 1000) {
          continue;
        }
        
        // Check minimum time since last event
        if (conditions.minTimeSinceLastEvent && timeSinceLastEvent < conditions.minTimeSinceLastEvent * 1000) {
          continue;
        }
        
        if (this.shouldTriggerEvent(event, context)) {
          this.triggerEvent(event, context, gameStateCallback, uiCallback);
          break; // Only trigger one time-based event per check
        }
      }
    }
  }

  createDebugUICallback(originalUICallback) {
    const callCount = new Map();
    
    return (action, data) => {
      // Track callback usage
      const count = callCount.get(action) || 0;
      callCount.set(action, count + 1);
      
      console.log(`UI Callback #${count + 1}: ${action}`, data);
      
      try {
        // Add timeout to detect hanging callbacks
        const timeoutId = setTimeout(() => {
          console.warn(`UI callback timeout for action: ${action}`);
        }, 5000);
        
        const result = originalUICallback(action, data);
        
        clearTimeout(timeoutId);
        return result;
        
      } catch (error) {
        console.error(`UI callback error for action ${action}:`, error);
        console.error('Error stack:', error.stack);
        console.error('Callback data:', data);
        
        // Don't rethrow - let the game continue
        return null;
      }
    };
  }

//added to clean up events
  cleanupEvent(eventId) {
    try {
      // Remove from active events
      const eventInstance = this.activeEvents.get(eventId);
      if (eventInstance) {
        // Clean up any UI elements created by this event
        if (eventInstance.uiElementsCreated) {
          eventInstance.uiElementsCreated.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
              element.remove();
            }
          });
        }
        
        this.activeEvents.delete(eventId);
      }
      
      // Clear any timers for this event
      const timersToDelete = [];
      this.timers.forEach((timerId, key) => {
        if (key.includes(eventId)) {
          clearTimeout(timerId);
          timersToDelete.push(key);
        }
      });
      
      timersToDelete.forEach(key => this.timers.delete(key));
      
      console.log(`Cleaned up event: ${eventId}`);
      
    } catch (error) {
      console.error(`Error cleaning up event ${eventId}:`, error);
    }
  }


  /**
   * Get event history for analysis
   */
  getEventHistory() {
    return this.eventHistory;
  }

  /**
   * Get active events
   */
  getActiveEvents() {
    return Array.from(this.activeEvents.values());
  }

  /**
   * Clear all timers (for game end/reset)
   */
  clearAllTimers() {
    try {
      let clearedCount = 0;
      this.timers.forEach((timerId, key) => {
        try {
          clearTimeout(timerId);
          clearedCount++;
        } catch (error) {
          console.warn(`Failed to clear timer ${key}:`, error);
        }
      });
      
      this.timers.clear();
      console.log(`Cleared ${clearedCount} timers`);
      
      // Also clean up any active events
      this.activeEvents.forEach((event, eventId) => {
        this.cleanupEvent(eventId);
      });
      
    } catch (error) {
      console.error('Error clearing timers:', error);
    }
  }

//too many event s can cause a possible memory leak - added to help debug this
  detectMemoryLeaks() {
    const status = {
      activeEvents: this.activeEvents.size,
      activeTimers: this.timers.size,
      eventHistory: this.eventHistory.length,
      triggeredEvents: this.triggeredEvents.size
    };
    
    console.log('Memory status:', status);
    
    // Warn about potential leaks
    if (status.activeEvents > 10) {
      console.warn('High number of active events - possible memory leak');
    }
    
    if (status.activeTimers > 20) {
      console.warn('High number of active timers - possible memory leak');
    }
    
    return status;
  }

  /**
   * Reset the events manager for a new game
   */
  reset() {
    this.clearAllTimers();
    this.activeEvents.clear();
    this.triggeredEvents.clear();
    this.eventHistory = [];
    this.gameStartTime = Date.now();
    this.detectionCount = 0;
    this.stepCount = 0;
    this.lastEventTime = Date.now();
    // Note: We don't reload events on reset, they stay loaded
  }

  /**
   * Reload events (useful if game mode changes or for debugging)
   */
  async reloadEvents(newGameMode = null, newTeamType = null) {
    if (newGameMode) this.gameMode = newGameMode;
    if (newTeamType) this.teamType = newTeamType;
    
    this.eventsLoaded = false;
    this.loadedEvents = [];
    await this.loadEvents();
  }

  /**
   * Get loaded events for debugging/inspection
   */
  getLoadedEvents() {
    return {
      total: this.loadedEvents.length,
      byCategory: this.loadedEvents.reduce((acc, event) => {
        acc[event.category] = (acc[event.category] || 0) + 1;
        return acc;
      }, {}),
      byTrigger: this.loadedEvents.reduce((acc, event) => {
        event.triggers.forEach(trigger => {
          acc[trigger] = (acc[trigger] || 0) + 1;
        });
        return acc;
      }, {}),
      events: this.loadedEvents
    };
  }

  /**
   * Check if events are loaded and ready
   */
  isReady() {
    return this.eventsLoaded;
  }

  /**
   * Generate summary for game end
   */
  generateEventSummary() {
    const summary = {
      totalEvents: this.eventHistory.length,
      eventsByCategory: this.eventHistory.reduce((acc, event) => {
        acc[event.config.category] = (acc[event.config.category] || 0) + 1;
        return acc;
      }, {}),
      eventsByTrigger: this.eventHistory.reduce((acc, event) => {
        event.config.triggers.forEach(trigger => {
          acc[trigger] = (acc[trigger] || 0) + 1;
        });
        return acc;
      }, {}),
      
      // ENHANCED - Add rich timeline data
      timeline: this.eventHistory.map(event => ({
        step: event.gameStep,
        stepTitle: event.stepContext?.stepTitle || 'Unknown',
        stepKey: event.stepContext?.stepKey || 'unknown',
        choiceLabel: event.stepContext?.choiceLabel || 'Unknown',
        choiceMitreId: event.stepContext?.choiceMitreId || 'N/A',
        eventTitle: event.config.title,
        eventCategory: event.config.category,
        triggers: event.config.triggers,
        detectionAtTime: event.detectionCount,
        hoursAtTime: event.gameContext?.playerHours || 0,
        contingenciesAtTime: event.gameContext?.playerContingencies || 0
      })),
      
      // ADD - Analysis data
      mitreAnalysis: this.getMitreAnalysis(),
      stepAnalysis: this.getStepAnalysis(),
      timingPatterns: this.getTimingPatterns()
    };
    
    return summary;
  }

/**
   * Check if we should allow any events to trigger (rate limiting)
   */
  shouldAllowEventCheck() {
    // Check cooldown period
    const stepsSinceLastEvent = this.stepCount - this.lastEventStep;
    if (stepsSinceLastEvent < this.eventCooldownTime) {
      return false;
    }
    
    // Check maximum events per game
    if (this.eventCount >= this.maxEventsPerGame) {
      return false;
    }
    
    return true;
  }

  /**
   * Updated checkForEvents with rate limiting
   */
  async checkForEvents(trigger, context, gameStateCallback, uiCallback) {
    // Wait for events to load if they haven't yet
    await this.waitForEventsLoaded();
    
    if (this.loadedEvents.length === 0) {
      return null;
    }

    // Check rate limiting first
    if (!this.shouldAllowEventCheck()) {
      return null;
    }

    const availableEvents = this.getAvailableEvents(trigger, context);
    
    if (availableEvents.length === 0) return null;

    // Apply global probability modifier to reduce event frequency over time
    const modifiedEvents = availableEvents.map(event => ({
      ...event,
      baseProbability: event.baseProbability * this.globalEventProbabilityModifier
    }));

    // Check each available event for trigger probability
    for (const eventConfig of modifiedEvents) {
      if (this.shouldTriggerEvent(eventConfig, context)) {
        const triggeredEvent = this.triggerEvent(eventConfig, context, gameStateCallback, uiCallback);
        
        // Update rate limiting tracking
        this.lastEventStep = this.stepCount;
        this.eventCount++;
        
        // Reduce global probability for future events
        this.globalEventProbabilityModifier = Math.max(
          this.minGlobalProbability,
          this.globalEventProbabilityModifier * this.probabilityDecayRate
        );
        
        console.log(`Event triggered: ${eventConfig.title} (${this.eventCount}/${this.maxEventsPerGame})`);
        console.log(`Global probability modifier: ${this.globalEventProbabilityModifier.toFixed(2)}`);
        
        return triggeredEvent;
      }
    }

    return null;
  }

  /**
   * Update step tracking with event rate limiting info
   */
  updateTracking(type, value) {
    switch (type) {
      case 'detection':
        this.detectionCount++;
        break;
      case 'step':
        this.stepCount++;
        // Optional: Log event cooldown status
        const stepsSinceLastEvent = this.stepCount - this.lastEventStep;
        if (stepsSinceLastEvent < this.eventCooldownTime) {
          console.log(`Event cooldown: ${this.eventCooldownTime - stepsSinceLastEvent} steps remaining`);
        }
        break;
      case 'lastEventTime':
        this.lastEventTime = Date.now();
        break;
    }
  }

  /**
   * Reset rate limiting for new game
   */
  reset() {
    this.clearAllTimers();
    this.activeEvents.clear();
    this.triggeredEvents.clear();
    this.eventHistory = [];
    this.gameStartTime = Date.now();
    this.detectionCount = 0;
    this.stepCount = 0;
    this.lastEventTime = Date.now();
    
    // Reset rate limiting
    this.lastEventStep = -this.eventCooldownTime;
    this.eventCount = 0;
    this.globalEventProbabilityModifier = 1.0;
  }

  /**
   * Get current rate limiting status for debugging
   */
  getRateLimitingStatus() {
    const stepsSinceLastEvent = this.stepCount - this.lastEventStep;
    return {
      eventCount: this.eventCount,
      maxEventsPerGame: this.maxEventsPerGame,
      stepsSinceLastEvent: stepsSinceLastEvent,
      cooldownRemaining: Math.max(0, this.eventCooldownTime - stepsSinceLastEvent),
      globalProbabilityModifier: this.globalEventProbabilityModifier,
      canTriggerEvents: this.shouldAllowEventCheck()
    };
  }

  /**
   * Configure rate limiting parameters
   */
  configureRateLimiting(options = {}) {
    if (options.cooldownTime !== undefined) {
      this.eventCooldownTime = options.cooldownTime;
    }
    if (options.maxEvents !== undefined) {
      this.maxEventsPerGame = options.maxEvents;
    }
    if (options.probabilityDecayRate !== undefined) {
      this.probabilityDecayRate = options.probabilityDecayRate;
    }
    if (options.minGlobalProbability !== undefined) {
      this.minGlobalProbability = options.minGlobalProbability;
    }
  }

  getMitreAnalysis() {
    const mitreStats = {};
    
    this.eventHistory.forEach(event => {
      const mitreId = event.stepContext?.choiceMitreId;
      if (mitreId && mitreId !== 'N/A') {
        if (!mitreStats[mitreId]) {
          mitreStats[mitreId] = {
            count: 0,
            events: [],
            steps: new Set()
          };
        }
        mitreStats[mitreId].count++;
        mitreStats[mitreId].events.push(event.config.title);
        mitreStats[mitreId].steps.add(event.stepContext?.stepTitle);
      }
    });
    
    Object.keys(mitreStats).forEach(technique => {
      mitreStats[technique].steps = Array.from(mitreStats[technique].steps);
    });
    
    return mitreStats;
  }

  getStepAnalysis() {
    const stepStats = {};
    
    this.eventHistory.forEach(event => {
      const stepKey = event.stepContext?.stepKey || 'unknown';
      const stepTitle = event.stepContext?.stepTitle || 'Unknown';
      
      if (!stepStats[stepKey]) {
        stepStats[stepKey] = {
          title: stepTitle,
          count: 0,
          events: [],
          choices: new Set()
        };
      }
      
      stepStats[stepKey].count++;
      stepStats[stepKey].events.push(event.config.title);
      stepStats[stepKey].choices.add(event.stepContext?.choiceLabel);
    });
    
    Object.keys(stepStats).forEach(step => {
      stepStats[step].choices = Array.from(stepStats[step].choices);
    });
    
    return stepStats;
  }

  getTimingPatterns() {
    if (this.eventHistory.length < 2) return {};
    
    const gaps = [];
    for (let i = 1; i < this.eventHistory.length; i++) {
      gaps.push(this.eventHistory[i].gameStep - this.eventHistory[i-1].gameStep);
    }
    
    return {
      averageGap: gaps.reduce((a, b) => a + b, 0) / gaps.length,
      minGap: Math.min(...gaps),
      maxGap: Math.max(...gaps),
      gaps: gaps
    };
  }
}



// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RandomEventsManager;
} else if (typeof window !== 'undefined') {
  window.RandomEventsManager = RandomEventsManager;
}