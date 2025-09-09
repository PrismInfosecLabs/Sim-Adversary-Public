// uiHelpers.js - UI helper functions for the cybersecurity game

class UIHelpers {
  constructor(config) {
    this.config = config;
  }

  getTestOutcomeLabel(testType, outcome) {
    if (!testType || !outcome || !this.config.testTypes) {
      return outcome;
    }
    const testConfig = this.config.testTypes[testType];
    if (!testConfig?.outcomes) return outcome;
    
    const outcomeConfig = testConfig.outcomes[outcome];
    return outcomeConfig?.item || outcome;
  }

  /**
   * Display feedback message to the player
   * @param {string} message - Message to display
   * @param {string} type - Type of message ('info', 'warning', 'error', 'success')
   */
  displayFeedback(message, type = 'info') {
    const feedbackDisplay = document.getElementById("gameFeedback");
    if (feedbackDisplay) {
      feedbackDisplay.textContent = message;
      
      // Apply styling based on message type
      feedbackDisplay.className = 'feedback-message';
      switch(type) {
        case 'warning':
          feedbackDisplay.classList.add('text-yellow-400');
          break;
        case 'error':
          feedbackDisplay.classList.add('text-red-400');
          break;
        case 'success':
          feedbackDisplay.classList.add('text-green-400');
          break;
        default:
          feedbackDisplay.classList.add('text-yellow-400'); // Default info color
      }
    } else {
      console.warn("Feedback display element not found:", message);
    }
  }

  /**
   * Update sidebar statistics display
   * @param {Object} player - Player object with current stats
   */
  updateSidebarStats(player) {
    const elements = {
      hours: document.getElementById("hours-remaining"),
      contingencies: document.getElementById("contingencies-remaining"),
      mode: document.getElementById("mode-display"),
      skill: document.getElementById("skill-display"),
      defence: document.getElementById("defence-display")
    };

    if (elements.hours) {
      elements.hours.textContent = player.hours;
    }
    
    if (elements.contingencies) {
      elements.contingencies.textContent = player.contingencies;
    }
    
    if (elements.mode) {
      elements.mode.textContent = this.config.gameModes[player.mode]?.label || player.mode;
    }
    
    if (elements.skill) {
      elements.skill.textContent = this.config.skillLevels[player.skillLevel]?.label || player.skillLevel;
    }
    
    if (elements.defence) {
      elements.defence.textContent = this.config.defenceMaturity[player.defenceMaturity]?.label || player.defenceMaturity;
    }
  }

  /**
   * Populate game option dropdowns
   */
  populateGameOptions() {
    this.populateSkillLevels();
    this.populateDefenseMaturity();
    this.populateGameModes();
  }

  /**
   * Populate skill level dropdown
   */
  populateSkillLevels() {
    const skillSelect = document.getElementById("playerSkill");
    if (skillSelect) {
      skillSelect.innerHTML = '';
      Object.entries(this.config.skillLevels).forEach(([numericKey, config]) => {
        const option = document.createElement("option");
        option.value = numericKey;
        option.textContent = config.label;
        option.title = config.description;
        if (numericKey === this.config.player.defaultSkillLevel) {
          option.selected = true;
        }
        skillSelect.appendChild(option);
      });
    }
  }

  /**
   * Populate defense maturity dropdown
   */
  populateDefenseMaturity() {
    const defenseSelect = document.getElementById("defenceMaturity");
    if (defenseSelect) {
      defenseSelect.innerHTML = '';
      Object.entries(this.config.defenceMaturity).forEach(([numericKey, config]) => {
        const option = document.createElement("option");
        option.value = numericKey;
        option.textContent = config.label;
        option.title = config.description;
        if (numericKey === this.config.player.defaultdefenceMaturity) {
          option.selected = true;
        }
        defenseSelect.appendChild(option);
      });
    }
  }

  /**
   * Populate game mode dropdown
   */
  populateGameModes() {
    const gameModeElement = document.getElementById("mode");
    if (gameModeElement) {
      // Clear existing options except the first placeholder
      const options = gameModeElement.querySelectorAll('option:not(:first-child)');
      options.forEach(option => option.remove());
      
      Object.entries(this.config.gameModes).forEach(([numericKey, config]) => {
        const option = document.createElement("option");
        option.value = numericKey;
        option.textContent = config.label;
        option.title = config.description;
        gameModeElement.appendChild(option);
      });
    }
  }

  /**
   * Start the game countdown timer
   * @param {number} seconds - Duration in seconds
   * @param {Function} endCallback - Callback when timer expires
   * @returns {number} Interval ID
   */
  startCountdown(seconds, endCallback) {
    const timerDisplay = document.getElementById("timer");
    if (!timerDisplay) {
      console.error("Timer display element not found");
      return null;
    }

    const endTime = Date.now() + seconds * 1000;
    
    return setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
      const secs = String(remaining % 60).padStart(2, "0");
      timerDisplay.textContent = `${mins}:${secs}`;
      
      // Add warning styling when time is low
      if (remaining <= this.config.timer.displayWarningAt) {
        timerDisplay.style.color = "#ff6b6b";
        timerDisplay.style.fontWeight = "bold";
      }
      
      if (remaining === 0 && endCallback) {
        endCallback("Time expired!");
      }
    }, 1000);
  }

  /**
   * Generate statistics table HTML with consistent dark theme styling
   * @param {Object} stats - Game statistics
   * @returns {string} HTML string for stats table
   */
  generateStatsTable(stats) {
    return `
      <div class="stats-section">
        <h3 class="stats-header">📊 Game Summary</h3>
        <table class="game-summary-table">
          <thead>
            <tr>
              <th>Statistic</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="stat-icon">🎯</span>Steps Taken</td>
              <td class="stat-value">${stats.stepsTaken}</td>
            </tr>
            <tr>
              <td><span class="stat-icon">⏰</span>Hours Used</td>
              <td class="stat-value">${stats.hoursUsed}</td>
            </tr>
            <tr>
              <td><span class="stat-icon">🚨</span>Total Detections</td>
              <td class="stat-value ${stats.totalDetections > 0 ? 'stat-warning' : ''}">${stats.totalDetections}</td>
            </tr>
            <tr>
              <td><span class="stat-icon">🛡️</span>Contingencies Used</td>
              <td class="stat-value">${stats.contingenciesUsed}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Generate game path table HTML with enhanced styling
   * @param {Array} path - Player's decision path
   * @returns {string} HTML string for path table
   */
  generatePathTable(path) {
    let pathHtml = `
      <div class="path-section">
        <h3 class="path-header">🛤️ Decision Path</h3>
        <div class="path-table-container">
          <table class="decision-path-table">
            <thead>
              <tr>
                <th><span class="header-icon">📍</span>Step</th>
                <th><span class="header-icon">⚡</span>Choice</th>
                <th><span class="header-icon">🔗</span>MITRE ID</th>
                <th><span class="header-icon">👁️</span>Detected</th>
                <th><span class="header-icon">✅</span>Success</th>
                <th><span class="header-icon">📝</span>Notes</th>
              </tr>
            </thead>
            <tbody>
    `;

    path.forEach((step, index) => {
      const detectedClass = step.detected ? "path-detected" : "";
      const successClass = step.success === false ? "path-failed" : 
                         step.success === true ? "path-success" : "";
      
      // Check if this was a bypassed detection (persistence or contingency used)
      const bypassedClass = (step.detected && (step.persistenceUsed || step.bypassed)) ? "path-bypassed" : "";
      
      // Build notes array with all possible annotations
      const notes = [];
      if (step.persistenceUsed) notes.push('<span class="note-badge persistence">🛡️ Persistence</span>');
      if (step.bypassed) notes.push('<span class="note-badge bypassed">🔓 Bypassed</span>');
      if (step.exceededLimit) notes.push('<span class="note-badge exhausted">❌ Exhausted</span>');
      if (step.trapTriggered) notes.push('<span class="note-badge trap">🪤 Trap</span>');
      if (step.testType) notes.push(`<span class="note-badge test">🔍 ${step.testType}</span>`);
      if (step.testOutcome) {
        const readableOutcome = this.getTestOutcomeLabel(step.testType, step.testOutcome);
        notes.push(`<span class="note-badge outcome">📊 ${readableOutcome}</span>`);
      }
      
      pathHtml += `
        <tr class="path-row ${detectedClass} ${successClass} ${bypassedClass}" data-step="${index + 1}">
          <td class="step-number">${step.step}</td>
          <td class="choice-description">${step.label}</td>
          <td class="mitre-cell">${this.generateMitreLink(step.mitreId)}</td>
          <td class="detection-status">
            ${step.detected ? 
              '<span class="status-badge detected">🚨 Yes</span>' : 
              '<span class="status-badge safe">✅ No</span>'
            }
          </td>
          <td class="success-status">
            ${step.success !== null ? 
              (step.success ? 
                '<span class="status-badge success">✅ Yes</span>' : 
                '<span class="status-badge failure">❌ No</span>'
              ) : 
              '<span class="status-badge neutral">➖ N/A</span>'
            }
          </td>
          <td class="notes-cell">${notes.length > 0 ? notes.join(' ') : '<span class="no-notes">—</span>'}</td>
        </tr>
      `;
    });
    
    pathHtml += `
            </tbody>
          </table>
        </div>
      </div>
    `;
    return pathHtml;
  }

  /**
   * Generate MITRE ATT&CK link for a technique ID
   * @param {string} mitreId - MITRE technique ID
   * @returns {string} HTML link or "N/A"
   */
  generateMitreLink(mitreId) {
    if (mitreId && mitreId.startsWith("T")) {
      const [base, sub] = mitreId.split(".");
      return `<a href="https://attack.mitre.org/techniques/${base}${sub ? `/${sub}` : ""}/" target="_blank" rel="noopener noreferrer" class="mitre-link">${mitreId}</a>`;
    }
    return '<span class="no-mitre">N/A</span>';
  }

 /**
   * Show/hide elements with transition effects
   * @param {string} elementId - Element ID to toggle
   * @param {boolean} show - Whether to show (true) or hide (false)
   */
  toggleElementVisibility(elementId, show) {
    const element = document.getElementById(elementId);
    if (element) {
      if (show) {
        element.classList.remove("hidden");
        // Add fade-in effect using CSS custom property
        element.style.opacity = "0";
        element.style.transition = "opacity var(--animation-duration, 300ms) ease-in-out";
        setTimeout(() => {
          element.style.opacity = "1";
        }, 10);
      } else {
        element.style.transition = "opacity var(--animation-duration, 300ms) ease-in-out";
        element.style.opacity = "0";
        // Use the CSS variable value, fallback to 300ms
        const duration = getComputedStyle(document.documentElement).getPropertyValue('--animation-duration') || '300ms';
        const durationMs = parseInt(duration);
        setTimeout(() => {
          element.classList.add("hidden");
        }, durationMs);
      }
    }
  }

  /**
   * Validate form inputs before starting game
   * @returns {Object} Validation result with success flag and error messages
   */
  validateGameStart() {
    const validation = { success: true, errors: [] };
    
    const playerName = document.getElementById("playerName")?.value?.trim();
    const gameMode = document.getElementById("mode")?.value?.trim();
    
    if (!playerName) {
      validation.success = false;
      validation.errors.push("Player name is required");
    }
    
    if (!gameMode) {
      validation.success = false;
      validation.errors.push("Game scenario must be selected");
    }
    
    return validation;
  }

  /**
   * Format time duration for display
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted time string
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Show loading spinner
   * @param {string} message - Loading message
   */
  showLoading(message = "Loading...") {
    const existing = document.getElementById("loading-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "loading-overlay";
    overlay.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
        <div style="background: #444; padding: 2rem; border-radius: 0.5rem; text-align: center;">
          <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto 1rem;"></div>
          <p style="color: #fff; margin: 0;">${message}</p>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(overlay);
  }

  /**
   * Hide loading spinner
   */
  hideLoading() {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) overlay.remove();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIHelpers;
} else if (typeof window !== 'undefined') {
  window.UIHelpers = UIHelpers;
}