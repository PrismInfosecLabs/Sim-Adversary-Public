// pastPathsManager.js - Past paths display and management for the cybersecurity game

class PastPathsManager {
  constructor(config) {
    this.config = config;
    this.pastPathsVisible = false;
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
   * Toggle visibility of past paths vs game info
   * @param {HTMLElement} gameInfoPanel - Game info panel element
   * @param {HTMLElement} pathsContainer - Paths container element
   * @param {HTMLElement} toggleBtn - Toggle button element
   */
  togglePastPaths(gameInfoPanel, pathsContainer, toggleBtn) {
    if (this.pastPathsVisible) {
      // Currently showing paths, switch back to game info
      gameInfoPanel.classList.remove("hidden");
      pathsContainer.classList.add("hidden");
      toggleBtn.textContent = "View Past Paths";
      this.pastPathsVisible = false;
    } else {
      // Currently showing game info, try to show paths
      this.showPastPaths(gameInfoPanel, pathsContainer, toggleBtn);
    }
  }

  /**
   * Show past paths from the database
   * @param {HTMLElement} gameInfoPanel - Game info panel element
   * @param {HTMLElement} pathsContainer - Paths container element
   * @param {HTMLElement} toggleBtn - Toggle button element
   */
  async showPastPaths(gameInfoPanel, pathsContainer, toggleBtn) {
    try {
      const response = await fetch(this.config.api.getPathsEndpoint);
      const data = await response.json();
      
      if (data && data.length > 0) {
        // SUCCESS - we have data to show
        const container = document.getElementById("pastPathsTableBody");        
        const pathsHtml = this.generatePastPathsTable(data);
        
        container.innerHTML = pathsHtml;
        this.attachPathToggleListeners();
        
        // SUCCESS - Switch to showing paths
        pathsContainer.classList.remove("hidden");
        gameInfoPanel.classList.add("hidden");
        toggleBtn.textContent = "Hide Past Paths";
        this.pastPathsVisible = true;
        
      } else {
        // NO DATA - Show alert but DON'T change the UI state
        alert("No past paths available.");
        // Keep pastPathsVisible = false (already false)
        // Keep button text as "View Past Paths" 
        // Keep gameInfoPanel visible
      }
    } catch (error) {
      console.error("Error fetching past paths:", error);
      alert("Failed to load past paths.");
      // Keep pastPathsVisible = false (already false)
      // Keep button text as "View Past Paths"
      // Keep gameInfoPanel visible
    }
  }

 /**
   * Generate the HTML table for past paths (UPDATED)
   * @param {Array} data - Past paths data from database
   * @returns {string} HTML string for the past paths table
   */
  generatePastPathsTable(data) {
    let pathsHtml = '<table class="past-paths-table">';
    pathsHtml += "<tr><th>Player</th><th>Scenario</th><th>Skill Level</th><th>Defence Maturity</th><th>Timestamp</th><th>Result</th><th>Score</th><th>Events</th><th>Path</th></tr>";
    
    data.forEach((entry, index) => {
      const readablePath = this.generateReadablePath(entry);
      const eventsCount = entry.events ? entry.events.length : 0;
      
      const skillLabel = this.config.skillLevels[entry.skillLevel]?.label || "N/A";
      const defenceLabel = this.config.defenceMaturity[entry.defenceMaturity]?.label || "N/A";
      const scenarioLabel = this.config.gameModes[entry.mode]?.label || "N/A";

      pathsHtml += `
          <tr>
            <td>${entry.player}</td>
            <td>${scenarioLabel}</td>
            <td>${skillLabel}</td>
            <td>${defenceLabel}</td>
            <td>${new Date(entry.timestamp).toLocaleString()}</td>
            <td>${entry.won ? "✅ Success" : "❌ Failed"}</td>
            <td>${entry.score || 0}</td>
            <td>
              ${eventsCount > 0 ? 
                `<button class="show-events-btn" data-events-id="events-${index}">${eventsCount} events</button>` : 
                'No events'
              }
            </td>
            <td><button class="show-path-btn" data-path-id="path-${index}">View Path</button></td>
          </tr>
          ${eventsCount > 0 ? `
          <tr id="events-${index}" class="hidden events-details-row">
            <td colspan="9">${this.generateEventsTable(entry.events)}</td>
          </tr>
          ` : ''}
          <tr id="path-${index}" class="hidden path-details-row">
            <td colspan="9">${readablePath}</td>
          </tr>
        `;
    });
    
    pathsHtml += "</table>";
    return pathsHtml;
  }

  /**
   * Generate events table for a game entry (NEW METHOD)
   * @param {Array} events - Events that occurred during the game
   * @returns {string} HTML string for the events table
   */
    generateEventsTable(events) {
      if (!events || events.length === 0) {
        return '<p class="no-events">No events occurred during this game.</p>';
      }

      let eventsHtml = `
        <div class="events-detail-section">
          <h4 class="events-header">🎯 Random Events Timeline (${events.length} total)</h4>
          <div class="events-table-container">
            <table class="events-detail-table">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Game Step</th>
                  <th>Player Choice</th>
                  <th>MITRE</th>
                  <th>Event</th>
                  <th>Category</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
      `;

      events.forEach((event) => {
        const stepTitle = event.stepContext?.stepTitle || 'Unknown Step';
        const choiceLabel = event.stepContext?.choiceLabel || 'Unknown Choice';
        const mitreId = event.stepContext?.choiceMitreId || 'N/A';
        const eventTitle = event.config?.title || event.id;
        const category = event.config?.category || 'Unknown';
        const hours = event.gameContext?.playerHours || 0;
        const contingencies = event.gameContext?.playerContingencies || 0;
        const detections = event.detectionCount || 0;
        
        const mitreLink = mitreId && mitreId !== 'N/A' 
          ? `<a href="https://attack.mitre.org/techniques/${mitreId.split('.')[0]}${mitreId.includes('.') ? '/' + mitreId.split('.')[1] : ''}/" target="_blank" class="mitre-link">${mitreId}</a>`
          : '<span class="no-mitre">N/A</span>';
        
        eventsHtml += `
          <tr class="event-detail-row">
            <td class="step-number">${event.gameStep || 'N/A'}</td>
            <td class="step-title" title="${stepTitle}">${stepTitle}</td>
            <td class="choice-title" title="${choiceLabel}">${choiceLabel}</td>
            <td class="mitre-cell">${mitreLink}</td>
            <td class="event-title" title="${event.config?.message || ''}">${eventTitle}</td>
            <td class="event-category">
              <span class="category-badge category-${category}">${category}</span>
            </td>
            <td class="player-state">
              <div class="state-compact">
                <span class="hours">${hours}h</span>
                <span class="contingencies">${contingencies}c</span>
                <span class="detections">${detections}d</span>
              </div>
            </td>
          </tr>
        `;
      });

      eventsHtml += '</tbody></table></div></div>';
      return eventsHtml;
    }

  /**
   * Generate readable path table for a single game entry
   * @param {Object} entry - Single past game entry
   * @returns {string} HTML string for the readable path
   */
  generateReadablePath(entry) {
    let readablePath = `
        <table class="decision-path-table">
          <thead>
            <tr>
              <th>Step</th>
              <th>Choice</th>
              <th>MITRE ID</th>
              <th>Detected</th>
              <th>Success</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
      `;

    try {
      const pathArray = Array.isArray(entry.path)
        ? entry.path
        : JSON.parse(entry.path);

      pathArray.forEach((step) => {
        const detected = step.detected ? "Yes" : "No";
        const success =
          step.success === true
            ? "Yes"
            : step.success === false
              ? "No"
              : "N/A";
        
        const notes = [
          step.persistenceUsed ? "🛡️ Persistence Used" : "",
          step.bypassed ? "Bypassed" : "",
          step.exceededLimit ? "❌ Limit Exceeded" : "",
          step.trapTriggered ? "🪤 Trap Triggered" : "",
          step.testType ? `🔍 ${step.testType} test` : "",
          step.testOutcome ? `Result: ${this.getTestOutcomeLabel(step.testType, step.testOutcome)}` : ""
        ].filter(Boolean).join(", ");

        const rowClass = step.detected
          ? 'class="font-semibold"'
          : "";

        readablePath += `
            <tr ${rowClass}>
              <td>${step.step}</td>
              <td>${step.label}</td>        
              <td>${this.generateMitreLink(step.mitreId)}</td>
              <td>${detected}</td>
              <td>${success}</td>
              <td>${notes}</td>
            </tr>
          `;
      });
    } catch (err) {
      console.error("Failed to parse readable path:", err);
      readablePath += `
          <tr><td colspan="6" class="text-red-600">Error reading path data.</td></tr>
        `;
    }

    readablePath += `
          </tbody>
        </table>
      `;

    return readablePath;
  }

  /**
   * Generate MITRE ATT&CK link for a technique ID
   * @param {string} mitreId - MITRE technique ID
   * @returns {string} HTML link or "N/A"
   */
  generateMitreLink(mitreId) {
    if (mitreId && mitreId.startsWith("T")) {
      const [base, sub] = mitreId.split(".");
      return `<a href="https://attack.mitre.org/techniques/${base}${sub ? `/${sub}` : ""}/" target="_blank" rel="noopener noreferrer">${mitreId}</a>`;
    }
    return "N/A";
  }

  /**
   * Attach event listeners to path and events toggle buttons (UPDATED)
   */
  attachPathToggleListeners() {
    setTimeout(() => {
      // Handle path toggle buttons
      document.querySelectorAll(".show-path-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const pathId = btn.getAttribute("data-path-id");
          const row = document.getElementById(pathId);
          const wasOpen = row && !row.classList.contains("hidden");

          // Close all open paths and events
          document.querySelectorAll(".path-details-row, .events-details-row")
            .forEach((row) => row.classList.add("hidden"));
          document.querySelectorAll(".show-path-btn, .show-events-btn")
            .forEach((b) => {
              if (b.classList.contains("show-path-btn")) {
                b.textContent = "View Path";
              } else {
                const eventsCount = b.textContent.split(' ')[0];
                b.textContent = `${eventsCount} events`;
              }
            });

          if (!wasOpen) {
            row.classList.remove("hidden");
            btn.textContent = "Hide Path";
          }
        });
      });

      // Handle events toggle buttons (NEW)
      document.querySelectorAll(".show-events-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const eventsId = btn.getAttribute("data-events-id");
          const row = document.getElementById(eventsId);
          const wasOpen = row && !row.classList.contains("hidden");

          // Close all open paths and events
          document.querySelectorAll(".path-details-row, .events-details-row")
            .forEach((row) => row.classList.add("hidden"));
          document.querySelectorAll(".show-path-btn, .show-events-btn")
            .forEach((b) => {
              if (b.classList.contains("show-path-btn")) {
                b.textContent = "View Path";
              } else {
                const eventsCount = b.textContent.split(' ')[0];
                b.textContent = `${eventsCount} events`;
              }
            });

          if (!wasOpen) {
            row.classList.remove("hidden");
            btn.textContent = "Hide Events";
          }
        });
      });
    }, 0);
  }

  /**
   * Clear all past paths from the database
   */
  async clearPastPaths() {
    if (
      confirm(
        "Are you sure you want to delete all past paths? This cannot be undone.",
      )
    ) {
      try {
        const response = await fetch(this.config.api.clearPathsEndpoint, { 
          method: "DELETE" 
        });
        const result = await response.json();
        alert(result.message);
        
        // Reset visibility state if paths were cleared
        this.pastPathsVisible = false;
        
      } catch (err) {
        console.error("Error clearing paths:", err);
        alert("An error occurred while clearing paths.");
      }
    }
  }

  /**
   * Save a game path to the database (UPDATED)
   * @param {Object} player - Player object
   * @param {boolean} won - Whether the game was won
   */
  async saveGamePath(player, success, randomEventsManager = null) {
    try {
      // Get events data from randomEventsManager
      const eventsData = randomEventsManager ? randomEventsManager.getEventHistory() : [];
      
      const pathData = {
        player: player.name,
        path: player.path,
        won: success,
        timestamp: new Date().toISOString(),
        mode: player.mode,
        skillLevel: player.skillLevel,
        defenceMaturity: player.defenceMaturity,
        score: player.score,
        events: eventsData // Include events data
      };

      const response = await fetch(this.config.api.savePathEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pathData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Save path error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Game path saved successfully:', result);
      
    } catch (error) {
      console.error('Error saving game path:', error);
      // Optionally show user-friendly error message
      alert('Failed to save game path. Please try again.');
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PastPathsManager;
} else if (typeof window !== 'undefined') {
  window.PastPathsManager = PastPathsManager;
}