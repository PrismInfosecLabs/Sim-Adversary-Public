// game.js - Main game logic (simplified with modules)

document.addEventListener("DOMContentLoaded", () => {
  // Check if all required modules are loaded
  const requiredModules = ['GAME_CONFIG', 'TestingSystem', 'GameScoring', 'PastPathsManager', 'InventoryManager', 'UIHelpers', 'RandomEventsManager'];
  const missingModules = requiredModules.filter(module => typeof window[module] === 'undefined');
  
  if (missingModules.length > 0) {
    console.error('Missing required modules:', missingModules);
    alert('Game modules failed to load. Please refresh the page.');
    return;
  }

  // Initialize modules
  const testingSystem = new TestingSystem(GAME_CONFIG);
  const gameScoring = new GameScoring(GAME_CONFIG);
  const pastPathsManager = new PastPathsManager(GAME_CONFIG);
  const inventoryManager = new InventoryManager(GAME_CONFIG.credentials, GAME_CONFIG.item_links);
  const uiHelpers = new UIHelpers(GAME_CONFIG);

  // Get DOM element references
  const elements = {
    startBtn: document.getElementById("startGameBtn"),
    gameSidebar: document.getElementById("game-sidebar"),
    playerInput: document.getElementById("playerName"),
    gameContainer: document.getElementById("gameContainer"),
    timerDisplay: document.getElementById("timer"),
    clearPathsBtn: document.getElementById("clearPathsBtn"),
    gameModeElement: document.getElementById("mode"),
    skillSelect: document.getElementById("playerSkill"),
    defenseSelect: document.getElementById("defenceMaturity"),
    introSection: document.getElementById("intro"),
    togglePathsBtn: document.getElementById("togglePathsBtn"),
    gameInfoPanel: document.getElementById("gameInfo"),
    pathsContainer: document.getElementById("pathsContainer"),
    stepContainer: document.getElementById("stepContainer")
  };

  // Game state
  let player = {
    name: "",
    hours: GAME_CONFIG.player.defaultHours,
    contingencies: GAME_CONFIG.player.defaultContingencies,
    detectionThreshold: GAME_CONFIG.player.detectionThreshold,
    currentRoom: "start",
    lateralOrigin: null,
    path: [],
    inventory: [],
    ignoreNextDetection: false,
    mode: "",
    skillLevel: GAME_CONFIG.player.defaultSkillLevel,
    defenceMaturity: GAME_CONFIG.player.defaultdefenceMaturity,
    stats: {
      totalhoursSpent: 0,
      totalContingenciesUsed: 0,
      totalDetections: 0,
    },
    attemptedActions: {},
    score: 0,
  };

  let currentStep = null;
  let timerInterval;
  let stepsTaken = 0;
  let hoursUsed = 0;
  let totalDetections = 0;
  let contingenciesUsed = 0;
  let gameOver = false;
  let disabledChoiceIndices = [];
  let randomEventsManager = null;

  // Initialize UI and event listeners
  uiHelpers.populateGameOptions();
  
  elements.startBtn.addEventListener("click", startGame);
  elements.togglePathsBtn.addEventListener("click", () => {
    pastPathsManager.togglePastPaths(elements.gameInfoPanel, elements.pathsContainer, elements.togglePathsBtn);
  });
  elements.clearPathsBtn.addEventListener("click", () => {
    pastPathsManager.clearPastPaths();
  });

  // Main game functions
  function startGame() {
    const validation = uiHelpers.validateGameStart();
    if (!validation.success) {
      alert(validation.errors.join('\n'));
      return;
    }

    // Set player properties from form
    player.name = elements.playerInput.value.trim();
    player.mode = elements.gameModeElement.value.trim();
    player.skillLevel = elements.skillSelect.value;
    player.defenceMaturity = elements.defenseSelect.value;


    // Get team type from config based on selected game mode
    const teamType = GAME_CONFIG.getTeamTypeForMode(player.mode);
  
    randomEventsManager = new RandomEventsManager(GAME_CONFIG, player.mode, 'red'); // or 'blue' for defensive scenarios

    uiHelpers.updateSidebarStats(player);
    resetGame();

    // Show game UI, hide intro
    elements.gameSidebar.classList.remove("hidden");
    elements.introSection.classList.add("hidden");
    document.getElementById("game-area").classList.remove("hidden");
    document.getElementById("game-info").classList.add("hidden");
    
    pastPathsManager.pastPathsVisible = false;
    elements.pathsContainer.classList.add("hidden");

    timerInterval = uiHelpers.startCountdown(GAME_CONFIG.timer.defaultSeconds, (message) => {
      endGame(false, message);
    });
    
    nextStep("start-here");
    uiHelpers.displayFeedback("", 'info');
  }

  function resetGame() {
    player.hours = GAME_CONFIG.player.defaultHours;
    player.contingencies = GAME_CONFIG.player.defaultContingencies;
    player.path = [];
    player.inventory = [];
    player.stats = {
      totalhoursSpent: 0,
      totalContingenciesUsed: 0,
      totalDetections: 0,
    };
    player.score = 0;
    player.attemptedActions = {};
    
    stepsTaken = 0;
    hoursUsed = 0;
    totalDetections = 0;
    contingenciesUsed = 0;
    gameOver = false;
    
    testingSystem.clearTestResults();
    inventoryManager.updateInventoryDisplay(player.inventory);
    uiHelpers.updateSidebarStats(player);

    if (randomEventsManager) {
      randomEventsManager.reset();
    }
  }

  async function nextStep(stepKey) {
    try {
      const response = await fetch(`/game-data/${player.mode}/${stepKey}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      currentStep = data;
      renderStep(data);
      uiHelpers.displayFeedback("", 'info');
    } catch (err) {
      console.error("Error loading room data:", err);
      uiHelpers.displayFeedback("Failed to load room data. Please try again.", 'error');
    }
  }

  function renderStep(step) {
    const container = elements.stepContainer;
    container.innerHTML = "";

    // Title
    const titleElement = document.createElement("h2");
    titleElement.textContent = step.title;
    container.appendChild(titleElement);

    // Check for exhausted actions and show warning banner
    const exhaustedActions = [];
    step.choices.forEach((choice) => {
      const key = `${step.key}::${choice.label}`;
      const used = player.attemptedActions[key] || 0;
      if (choice.limit && used >= choice.limit && inventoryManager.meetsRequirements(player.inventory, choice.requiredItems)) {
        exhaustedActions.push(choice.label);
      }
    });

    if (exhaustedActions.length > 0) {
      const warningBanner = document.createElement("div");
      warningBanner.classList.add("warning-banner");
      warningBanner.innerHTML = `
        <div style="display: flex; align-items: center;">
          <div style="flex-shrink: 0; margin-right: 0.75rem;">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div>
            <h4>⚠️ EXHAUSTED ACTIONS WARNING</h4>
            <p><strong>${exhaustedActions.join(", ")}</strong> ${exhaustedActions.length === 1 ? 'is' : 'are'} no longer effective</p>
            <p style="font-size: 0.9em; margin-top: 0.5em;">Try different approaches.</p>
          </div>
        </div>
      `;
      container.appendChild(warningBanner);
    }

    // Description
    if (Array.isArray(step.description)) {
      step.description.forEach((paragraph) => {
        const p = document.createElement("p");
        p.textContent = paragraph;
        container.appendChild(p);
      });
    } else if (typeof step.description === "string") {
      const p = document.createElement("p");
      p.textContent = step.description;
      container.appendChild(p);
    }

    // Choices
    const choicesContainer = document.createElement("div");
    choicesContainer.classList.add("choices-container");

    step.choices.forEach((choice, originalIndex) => {
      if (inventoryManager.meetsRequirements(player.inventory, choice.requiredItems)) {
        const key = `${step.key}::${choice.label}`;
        const used = player.attemptedActions[key] || 0;
        const isExhausted = choice.limit && used >= choice.limit;
        const hasLimit = choice.limit && choice.limit > 0;

        const button = document.createElement("button");
        button.dataset.stepKey = currentStep.key;
        button.dataset.choiceIndex = originalIndex;

        let buttonText = `${choice.label} (Hour cost: ${choice.hourCost || 0})`;
        
        if (hasLimit) {
          const remaining = Math.max(0, choice.limit - used);
          buttonText += ` [${remaining}/${choice.limit} attempts remaining]`;
        }

        if (isExhausted) {
          button.classList.add("choice-btn", "exhausted");
          button.disabled = true;
          buttonText += " ❌ EXHAUSTED";
          button.title = `This action has been attempted ${used} times and is no longer effective.`;
        } else if (hasLimit && used > 0) {
          const remaining = choice.limit - used;
          if (remaining <= 1) {
            button.classList.add("choice-btn", "last-attempt");
            button.title = `Warning: Only ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`;
          } else {
            button.classList.add("choice-btn", "limited-warning");
            button.title = `${remaining} attempts remaining.`;
          }
          button.addEventListener("click", handleChoiceClick);
        } else {
          button.classList.add("choice-btn", "active");
          button.addEventListener("click", handleChoiceClick);
        }

        button.textContent = buttonText;
        choicesContainer.appendChild(button);
      }
    });

    container.appendChild(choicesContainer);

  }

  function handleChoiceClick(event) {
    if (gameOver) return;
    const stepKey = event.target.dataset.stepKey;
    const choiceIndex = parseInt(event.target.dataset.choiceIndex);
    handleChoice(stepKey, choiceIndex);
  }

  // Updated handleChoice function
  async function handleChoice(stepKey, choiceIndex) {
    try {
      const step = currentStep;
      const choice = step.choices[choiceIndex];
      const actionKey = `${step.key}::${choice.label}`;

      // Update step tracking for events
      if (randomEventsManager) {
        randomEventsManager.updateTracking('step');
      }

      // Check for step-based random events BEFORE processing the choice
      if (randomEventsManager) {
        await randomEventsManager.checkForEvents('step', {
          player: player,
          currentStep: currentStep,
          choice: choice
        }, handleGameStateChange, handleUICallback);
        
        // Note: No longer blocking for wait times - events now apply immediate penalties
      }

      // Update attempt tracking
      player.attemptedActions[actionKey] = (player.attemptedActions[actionKey] || 0) + 1;
      stepsTaken++;

      // Apply modifiers to costs
      const { hours: adjustedHours, detection: adjustedDetectionChance } =
        gameScoring.applyModifiers(0, choice.hourCost, choice.detectionChance, player.mode, player.skillLevel, player.defenceMaturity);

      player.hours -= adjustedHours;
      hoursUsed += adjustedHours;
      uiHelpers.updateSidebarStats(player);

      // Add to path
      player.path.push({
        step: step.title,
        mitreId: choice.mitreId,
        label: choice.label,
        detected: false,
        success: null,
        originalChoiceIndex: choiceIndex,
        skillLevel: player.skillLevel,
        defenceMaturity: player.defenceMaturity,
        exceededLimit: choice.limit && player.attemptedActions[actionKey] > choice.limit,
      });

      // Check if this is a test action
      const testType = getTestTypeFromChoice(choice);
      if (testType) {
        await handleTestAction(step, choice, testType);
        return;
      }

      // Regular action handling
      const detected = Math.random() * 100 < adjustedDetectionChance;
      const success = choice.successChance !== undefined ? Math.random() * 100 < choice.successChance : true;

     // Check for detection-based events AFTER detection occurs
      if (detected && randomEventsManager) {
        randomEventsManager.updateTracking('detection');
        
        await randomEventsManager.checkForEvents('detection', {
          player: player,
          currentStep: currentStep,
          choice: choice,
          detected: true
        }, handleGameStateChange, handleUICallback);
      }

      // Check for success-based events
      if (success && randomEventsManager) {
        await randomEventsManager.checkForEvents('success', {
          player: player,
          currentStep: currentStep,
          choice: choice
        }, handleGameStateChange, handleUICallback);
      }

      // Check for failure-based events
      if (!success && randomEventsManager) {
        await randomEventsManager.checkForEvents('failure', {
          player: player,
          currentStep: currentStep,
          choice: choice
        }, handleGameStateChange, handleUICallback);
      }

      if (detected) {
        await handleDetection(step, choice);
      } else if (!success) {
        player.path[player.path.length - 1].success = false;
        handleFailure(step, choice);
      } else {
        player.path[player.path.length - 1].success = true;
        
        // Handle rewards
        let rewards = [];
        if (choice.rewards && Array.isArray(choice.rewards)) {
          rewards = choice.rewards;
        } else if (choice.reward) {
          rewards = [choice.reward];
        }

        rewards.forEach((item) => {
          inventoryManager.addToInventory(player.inventory, item);
          if (item === "Persistence" || item === "Persistence achieved") {
            player.ignoreNextDetection = true;
          }
        });

        await proceedToNext(step, choice);
      }

      if (player.hours < 0) {
        endGame(false, "Ran out of hours!");
      }
    } catch (error) {
      console.error("Error handling choice:", error);
      uiHelpers.displayFeedback("An error occurred. Please try again.", 'error');
    }
  }

  function getTestTypeFromChoice(choice) {
    if (choice.testType) return choice.testType;
    if (choice.label.toLowerCase().includes("analyze pcap")) return "pcap";
    if (choice.label.toLowerCase().includes("analyze file")) return "forensicFile";
    return null;
  }

  // Game state change handler for events
  function handleGameStateChange(action, ...args) {
    switch (action) {
      case 'adjustHours':
        player.hours += args[0];
        hoursUsed -= args[0]; // Adjust tracking
        
        // Force update sidebar stats immediately
        uiHelpers.updateSidebarStats(player);
        
        console.log(`Hours adjusted by ${args[0]}. Player now has ${player.hours} hours.`);
        break;

      case 'adjustContingencies':
        player.contingencies += args[0];
        
        // Force update sidebar stats immediately
        uiHelpers.updateSidebarStats(player);
        
        
        console.log(`Contingencies adjusted by ${args[0]}. Player now has ${player.contingencies} contingencies.`);
        break;

      case 'addInventoryItem':
        inventoryManager.addToInventory(player.inventory, args[0]);
        break;

      case 'removeInventoryItem':
        inventoryManager.removeFromInventory(player.inventory, args[0]);
        break;

      case 'setState':
        const [key, value] = args;
        if (!player.gameState) player.gameState = {};
        player.gameState[key] = value;
        
        // Apply global modifiers if needed
        if (key === 'globalDetectionIncrease') {
          console.log(`Global detection increased by ${value}%`);
        } else if (key === 'globalDetectionDecrease') {
          console.log(`Global detection decreased by ${value}%`);
        } else if (key === 'backupFailureActive') {
          console.log(`Backup failure active: ${value}`);
        }
        break;

      default:
        console.warn(`Unknown game state action: ${action}`);
    }
  }

  // UI callback handler for events
  function handleUICallback(action, data) {
    switch (action) {
      case 'showEventMessage':
        showEventModal(data);
        break;

      case 'showMessage':
        uiHelpers.displayFeedback(data.message, data.type);
        break;

      default:
        console.warn(`Unknown UI action: ${action}`);
    }
  }

   // Updated showEventModal to handle immediate penalties instead of wait timers
  function showEventModal(eventData) {
    const modal = document.createElement('div');
    modal.className = 'event-modal-overlay';
    modal.innerHTML = `
      <div class="event-modal">
        <div class="event-header ${eventData.type}">
          <h3>${eventData.title}</h3>
        </div>
        <div class="event-content">
          <p>${eventData.message}</p>
          ${generateEffectsDisplay(eventData.effects)}
        </div>
        <div class="event-actions">
          <button id="acknowledgeEvent" class="event-btn primary">
            Acknowledge
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle acknowledgment - no special wait time handling needed
    document.getElementById('acknowledgeEvent').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }

  // Updated generateEffectsDisplay to show direct effects and specific game state changes without values
  function generateEffectsDisplay(effects) {
    if (!effects) return '';

    let effectsHtml = '';
    let hasEffect = false;

    // Direct resource changes
    if (effects.hours) {
      const sign = effects.hours > 0 ? '+' : '';
      effectsHtml += `<li>⏰ Hours: ${sign}${effects.hours}</li>`;
      hasEffect = true;
    }
    
    if (effects.contingencies) {
      const sign = effects.contingencies > 0 ? '+' : '';
      effectsHtml += `<li>🛡️ Contingencies: ${sign}${effects.contingencies}</li>`;
      hasEffect = true;
    }
    
    if (effects.addItems) {
      effectsHtml += `<li>➕ Gained: ${effects.addItems.join(', ')}</li>`;
      hasEffect = true;
    }
    
    if (effects.removeItems) {
      effectsHtml += `<li>➖ Lost: ${effects.removeItems.join(', ')}</li>`;
      hasEffect = true;
    }
    
    if (effects.waitTime) {
      const hours = Math.floor(effects.waitTime / 3600);
      const minutes = Math.floor((effects.waitTime % 3600) / 60);
      effectsHtml += `<li>⏳ Time Penalty: ${hours}h ${minutes}m (applied immediately)</li>`;
      hasEffect = true;
    }

    // Handle specific game state effects for display in the effects list
    if (effects.gameState) {
      // Generic message for detection changes (without value)
      if (effects.gameState.globalDetectionIncrease !== undefined) {
        if (effects.gameState.globalDetectionIncrease > 0) {
          effectsHtml += `<li>🔍 Detection chances increased.</li>`;
          hasEffect = true;
        } else if (effects.gameState.globalDetectionIncrease < 0) {
          effectsHtml += `<li>🔍 Detection chances decreased.</li>`;
          hasEffect = true;
        }
      }
      
      // Generic message for temporary effects
      // Check if any gameState key ends with 'StepsRemaining'
      for (const key in effects.gameState) {
        if (key.endsWith('StepsRemaining')) {
          effectsHtml += `<li>This is temporary.</li>`;
          hasEffect = true;
          break; // Only add this message once
        }
      }
    }
    
    // Only return the effects container if there are actual effects to display
    if (hasEffect) {
      return `<div class="event-effects"><h4>Effects:</h4><ul>${effectsHtml}</ul></div>`;
    } else {
      return ''; // Return empty string if no effects are present
    }
  }

  async function handleTestAction(step, choice, testType) {
    try {
      const result = await testingSystem.performTest(
        testType, player, 
        (item) => inventoryManager.addToInventory(player.inventory, item),
        (item) => inventoryManager.removeFromInventory(player.inventory, item),
        (msg) => uiHelpers.displayFeedback(msg, 'info')
      );

      player.path[player.path.length - 1].success = result.success;
      player.path[player.path.length - 1].testType = testType;
      player.path[player.path.length - 1].testOutcome = result.outcome;

      if (result.trapped) {
        player.path[player.path.length - 1].detected = true;
        player.path[player.path.length - 1].trapTriggered = true;

        if (testType === "credentials" && result.outcome === "canaryCredentials") {
          await handleDetection(step, choice);
          return;
        }
      }

      await proceedToNext(step, choice);
    } catch (error) {
      console.error("Error handling test action:", error);
      uiHelpers.displayFeedback("Test failed due to an error.", 'error');
    }
  }

  async function proceedToNext(step, choice) {
    if (choice.next === "goal") {
      endGame(true, "Mission accomplished!");
    } else {
      await nextStep(choice.next);
    }
  }

  async function handleDetection(step, choice) {
    if (player.ignoreNextDetection) {
      player.ignoreNextDetection = false;
      const penalty = GAME_CONFIG.detection.persistencePenalty;
      player.hours -= penalty;
      hoursUsed += penalty;
      console.log("hoursUsed updated:", hoursUsed);
      // Remove "persistence achieved" from inventory
      const index = player.inventory.indexOf("Persistence");
      if (index !== -1) {
        player.inventory.splice(index, 1);
        inventoryManager.updateInventoryDisplay(player.inventory);
      }
      // Annotate path entry with persistence usage
      const lastEntry = player.path[player.path.length - 1];
      lastEntry.detected = true;
      lastEntry.persistenceUsed = true;
      alert(
        `Detection occurred, but your persistence saved you.\n⚠️ You lost ${GAME_CONFIG.detection.persistencePenalty} hours and persistence but can continue.`,
      );
      uiHelpers.displayFeedback(
        "Detection ignored due to persistence. 5 hours deducted.",
      );
      await proceedToNext(step, choice);
      return;
    }
    
    totalDetections++;
    console.log(
      `Detection occurred in step: ${step.title}, choice: ${choice.label}`,
    );
    
    const stepContainer = document.getElementById("stepContainer");
    
    // Enhanced detection dialog HTML
    let detectionHtml = `
      <div class="detection-dialog">
        <div class="detection-header">
          <span class="header-icon">🚨</span>
          <div>
            <h3 style="margin: 0; font-size: 1.25rem;">DETECTION ALERT</h3>
            <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 0.25rem;">${step.title}</div>
          </div>
        </div>
        
        <div class="detection-content">
          <div class="detection-warning">
            <strong>⚠️ You were detected performing:</strong> "${choice.label}"
          </div>
          
          <div class="contingency-status">
            <div class="contingency-count ${player.contingencies > 1 ? 'high' : player.contingencies === 1 ? 'medium' : 'low'}">
              <span class="count-icon">🛡️</span>
              <span>Contingencies Available: ${player.contingencies}</span>
            </div>
            <div class="contingency-remaining">
              Hours Remaining: ${player.hours}
            </div>
          </div>
          
          <div class="contingency-cost">
            <div class="cost-breakdown">
              <span class="cost-label">Using this will cost:</span>
              <span class="cost-value negative">1 contingency</span>
            </div>
            <div class="cost-breakdown">
              <span class="cost-label">But allows you to:</span>
              <span class="cost-value positive">Continue mission + gain rewards</span>
            </div>
          </div>
        </div>
        
        <div class="detection-actions">`;

    if (player.contingencies > 0) {
      detectionHtml += `
        <button id="useContingencyBtn" class="contingency-btn">
          <div class="btn-content">
            <span class="btn-icon">🛡️</span>
            <span class="btn-text">Use Contingency</span>
            <span class="btn-cost">(Cost: 1)</span>
          </div>
        </button>`;
    } else {
      detectionHtml += `
        <button class="contingency-btn" disabled>
          <div class="btn-content">
            <span class="btn-icon">🛡️</span>
            <span class="btn-text">No Contingencies Available</span>
          </div>
        </button>`;
    }

    detectionHtml += `
          <button id="continueDetectedBtn" class="alternative-btn">
            <div class="btn-content">
              <span class="btn-icon">⚠️</span>
              <span class="btn-text">Give Up (end scenario)</span>
            </div>
          </button>
        </div>
      </div>
    `;

    stepContainer.innerHTML = detectionHtml;

    // Attach event listeners
    document.getElementById("useContingencyBtn")?.addEventListener("click", async () => {
      player.path[player.path.length - 1].detected = true;
      await handleUseContingency(step, choice);
    });

    document.getElementById("continueDetectedBtn").addEventListener("click", () => {
      player.path[player.path.length - 1].detected = true;
      player.path[player.path.length - 1].success = false;
      if (step.key === "phishing") {
        uiHelpers.displayFeedback(
          "Detected, but no penalty in this room. Try another action or retry.",
        );
        renderStep(step);
      } else {
        endGame(false, "Detection failed the mission!");
      }
    });
  }

  function handleFailure(step, choice) {
    const stepContainer = document.getElementById("stepContainer");
    const key = `${step.key}::${choice.label}`;
    const used = player.attemptedActions[key] || 0;
    const isExhausted = choice.limit && used >= choice.limit;
    
    let failureOptionsHTML;

    if (isExhausted) {
      // Exhausted action failure dialog
      failureOptionsHTML = `
        <div class="contingency-dialog">
          <div class="contingency-header warning">
            <span class="header-icon">❌</span>
            <div>
              <h3 style="margin: 0;">ACTION EXHAUSTED</h3>
              <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 0.25rem;">This approach is no longer viable</div>
            </div>
          </div>
          
          <div class="contingency-content">
            <div class="contingency-message detected">
              <strong>🚫 CRITICAL:</strong> "${choice.label}" has been completely exhausted!
            </div>
            
            <div class="contingency-cost">
              <div class="cost-breakdown">
                <span class="cost-label">Attempts made:</span>
                <span class="cost-value negative">${used}/${choice.limit}</span>
              </div>
              <div class="cost-breakdown">
                <span class="cost-label">Success chance:</span>
                <span class="cost-value negative">0% (was ${choice.successChance || 100}%)</span>
              </div>
              <div class="cost-breakdown">
                <span class="cost-label">Status:</span>
                <span class="cost-value negative">PERMANENTLY INEFFECTIVE</span>
              </div>
            </div>
            
            <div class="contingency-message">
              💡 <strong>Strategy tip:</strong> This approach is no longer viable. Look for alternative methods or different attack vectors.
            </div>
          </div>
          
          <div class="contingency-actions">
            <button id="giveUpButton" class="secondary-btn">
              <div class="btn-content">
                <span class="btn-icon">🔄</span>
                <span class="btn-text">Choose a Different Approach</span>
              </div>
            </button>
          </div>
        </div>
      `;
    } else {
      // Normal failure dialog
      const remainingAttempts = choice.limit ? choice.limit - used : "unlimited";
      const warningText = choice.limit && (choice.limit - used) <= 1 
        ? `⚠️ WARNING: Only ${choice.limit - used} attempt${choice.limit - used === 1 ? '' : 's'} remaining before this action becomes exhausted!`
        : '';
      
      failureOptionsHTML = `
        <div class="contingency-dialog">
          <div class="contingency-header warning">
            <span class="header-icon">❌</span>
            <div>
              <h3 style="margin: 0;">ATTEMPT FAILED</h3>
              <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 0.25rem;">Choose your next action</div>
            </div>
          </div>
          
          <div class="contingency-content">
            <div class="contingency-message">
              <strong>Attempt of "${choice.label}" was unsuccessful.</strong>
              ${choice.limit ? `<br><small>Attempts used: ${used}/${choice.limit} | Remaining: ${choice.limit - used}</small>` : ''}
            </div>
            
            ${warningText ? `
              <div class="contingency-message detected">
                <strong>${warningText}</strong>
              </div>
            ` : ''}
            
            <div class="contingency-status">
              <div class="contingency-count ${player.contingencies > 1 ? 'high' : player.contingencies === 1 ? 'medium' : 'low'}">
                <span class="count-icon">🛡️</span>
                <span>Contingencies: ${player.contingencies}</span>
              </div>
              <div class="contingency-remaining">
                Hours: ${player.hours}
              </div>
            </div>
          </div>
          
          <div class="contingency-actions">
            <button id="retryButton" class="alternative-btn">
              <div class="btn-content">
                <span class="btn-icon">🔄</span>
                <span class="btn-text">Try Again</span>
                <span class="btn-cost">(${choice.hourCost}h, ${choice.detectionChance + GAME_CONFIG.detection.retryDetectionIncrease}% detection)</span>
              </div>
            </button>
            
            ${player.contingencies > 0 ? `
              <button id="contingencyButton" class="contingency-btn">
                <div class="btn-content">
                  <span class="btn-icon">🛡️</span>
                  <span class="btn-text">Use Contingency</span>
                  <span class="btn-cost">(Cost: 1 contingency)</span>
                </div>
              </button>
            ` : `
              <button class="contingency-btn" disabled>
                <div class="btn-content">
                  <span class="btn-icon">🛡️</span>
                  <span class="btn-text">No Contingencies Available</span>
                </div>
              </button>
            `}
            
            <button id="giveUpButton" class="secondary-btn">
              <div class="btn-content">
                <span class="btn-icon">⏭️</span>
                <span class="btn-text">Give Up on This Approach</span>
              </div>
            </button>
          </div>
        </div>
      `;
    }

    stepContainer.innerHTML = failureOptionsHTML;

    // Attach event listeners
    const retryButton = document.getElementById("retryButton");
    const contingencyButton = document.getElementById("contingencyButton");
    const giveUpButton = document.getElementById("giveUpButton");
    
    if (retryButton && !isExhausted) {
      retryButton.addEventListener("click", () =>
        handleRetry(step, choice, choice.hourCost, choice.detectionChance + GAME_CONFIG.detection.retryDetectionIncrease),
      );
    }
    if (contingencyButton && !isExhausted && player.contingencies > 0) {
      contingencyButton.addEventListener("click", () =>
        handleUseContingency(step, choice),
      );
    }
    if (giveUpButton) {
      giveUpButton.addEventListener("click", () => handleGiveUp(step));
    }
  }

  async function handleRetry(step, choice, retryCost, retryDetectionChance) {
    const isPhishingRoom = step.key === "phishing";

    const actionKey = `${step.key}::${choice.label}`;

    if (!inventoryManager.meetsRequirements(player.inventory, choice.requiredItems)) {
      const requiredList = choice.requiredItems
        .map((item) => (Array.isArray(item) ? `(${item.join(" OR ")})` : item))
        .join(", ");
      uiHelpers.displayFeedback(
        `You need the following items to perform this action: ${requiredList}`,
      );
      return;
    }

    player.hours -= choice.hourCost;
    hoursUsed += choice.hourCost;
    uiHelpers.updateSidebarStats(player); // Update after hours change
    console.log("hoursUsed updated:", hoursUsed);

    const usedAttempts = player.attemptedActions[actionKey] || 0;
    const exceededLimit = choice.limit && usedAttempts >= choice.limit;

    player.path.push({
      step: step.title + " (Retry)",
      mitreId: choice.mitreId,
      label: choice.label + " (Retry)",
      detected: false,
      success: null,
      exceededLimit: exceededLimit,
    });

    if (exceededLimit) {
      choice.successChance = 0;
    }

    player.attemptedActions[actionKey] = usedAttempts + 1;

    const retryDetected =
      Math.random() * 100 <
      (isPhishingRoom ? choice.detectionChance : retryDetectionChance);
    const retrySuccess =
      choice.successChance !== undefined
        ? Math.random() * 100 < choice.successChance
        : true;

    if (retryDetected) {
      if (isPhishingRoom) {
        player.path[player.path.length - 1].detected = true;
        player.path[player.path.length - 1].success = false;
        uiHelpers.displayFeedback(
          "Detected, but no penalty in this room. Try another action or retry.",
        );
        renderStep(step);
      } else {
        await handleDetection(step, choice);
        if (player.hours < 0) return endGame(false, "Ran out of hours!");
      }
    } else if (!retrySuccess) {
      player.path[player.path.length - 1].success = false;
      uiHelpers.displayFeedback(
        `Retry of "${choice.label}" was also unsuccessful. Choose again.`,
      );
      handleFailure(step, choice);
    } else {
      player.path[player.path.length - 1].success = true;
      let rewards = [];
      if (choice.rewards && Array.isArray(choice.rewards)) {
        rewards = choice.rewards;
      } else if (choice.rewards) {
        rewards = [choice.rewards];
      }

      if (rewards.length > 0) {
        rewards.forEach((item) => {
          inventoryManager.addToInventory(player.inventory, item);
          console.log(`✅ Reward "${item}" granted via contingency.`);
          if (item === "Persistence" || item === "Persistence achieved") {
            player.ignoreNextDetection = true;
          }
        });
      }

      await proceedToNext(step, choice);
    }

    if (player.hours < 0) return endGame(false, "Ran out of hours!");
  }

  async function handleUseContingency(step, choice) {
    if (player.contingencies > 0) {
      player.contingencies--;
      contingenciesUsed++;

      const lastPathEntry = player.path[player.path.length - 1];
      lastPathEntry.success = true;
      lastPathEntry.bypassed = true;

      uiHelpers.updateSidebarStats(player);

      let rewards = [];

      if (choice.rewards && Array.isArray(choice.rewards)) {
        rewards = choice.rewards;
      } else if (choice.rewards) {
        rewards = [choice.rewards];
      }

      if (rewards.length > 0) {
        rewards.forEach((item) => {
          inventoryManager.addToInventory(player.inventory, item);
          console.log(`✅ Reward "${item}" granted via contingency.`);
          if (item === "Persistence" || item === "Persistence achieved") {
            player.ignoreNextDetection = true;
          }
        });

        uiHelpers.displayFeedback(
          `Contingency used — you acquired: ${rewards.join(", ")} ✅`,
        );
      }

      await proceedToNext(step, choice);
    } else {
      alert("You have no contingencies left.");
      renderStep(step); // Re-render to show current state
    }
  }

  function handleGiveUp(step) {
    const lastPathEntry = player.path[player.path.length - 1];
    const lastLabel = player.path[player.path.length - 1].label;
    const originalChoice = step.choices.find((c) =>
      lastLabel.startsWith(c.label),
    );
    uiHelpers.displayFeedback(
      `You gave up on "${originalChoice ? originalChoice.label : lastLabel}". Consider other options.`,
    );
    renderStep(step); // RE-RENDER THE STEP!
  }


  function endGame(success, message) {
    gameOver = true;
    if (timerInterval) clearInterval(timerInterval);

    // Clean up any active event timers
    if (randomEventsManager) {
      randomEventsManager.clearAllTimers();
    }

    // Calculate final score
    player.score = gameScoring.calculateScore(player, success, totalDetections);

    // Get event summary
    const eventSummary = randomEventsManager ? randomEventsManager.generateEventSummary() : null;

    // Get DOM references
    const gameContainer = elements.gameContainer;
    const gameOverArea = document.getElementById("gameOverArea");
    const gameOverContent = document.getElementById("gameOverContent");

    // Build the main stats HTML
    const statsHtml = `
      <h2>${success ? "Mission Successful!" : "Mission Failed"}</h2>
      <p>${message}</p>
      ${uiHelpers.generateStatsTable({ stepsTaken, hoursUsed, totalDetections, contingenciesUsed })}
      ${gameScoring.generateScoreDisplay(player.score)}
      <h3>Decision Path</h3>
      ${uiHelpers.generatePathTable(player.path)}
      <h3>Player Configuration</h3>
      <p>Skill: ${GAME_CONFIG.skillLevels[player.skillLevel]?.label || player.skillLevel}</p>
      <p>Defense: ${GAME_CONFIG.defenceMaturity[player.defenceMaturity]?.label || player.defenceMaturity}</p>
    `;

    // Add event summary if there were events (ONLY ONCE)
    let finalHtml = statsHtml;
    if (eventSummary && eventSummary.totalEvents > 0) {
      const eventHtml = `
        <div class="events-section">
          <h3>🎲 Random Events Summary</h3>
          <div class="events-overview">
            <p><strong>Total Events:</strong> ${eventSummary.totalEvents}</p>
            <p><strong>Event Rate:</strong> ${(eventSummary.totalEvents / stepsTaken).toFixed(2)} events per step</p>
          </div>
          
          ${generateEventTimelineTable(eventSummary.timeline)}
          
          <div class="event-analysis-section">
            <h4>🔍 Event Analysis</h4>
            <div class="analysis-grid">
              <div class="analysis-card">
                <h5>📈 Event Categories</h5>
                <ul class="analysis-list">
                  ${Object.entries(eventSummary.eventsByCategory || {}).map(([category, count]) => {
                    const percentage = ((count / eventSummary.totalEvents) * 100).toFixed(1);
                    return `<li><span class="category-badge category-${category}">${category}</span>: ${count} (${percentage}%)</li>`;
                  }).join('')}
                </ul>
              </div>
              
              <div class="analysis-card">
                <h5>🎯 MITRE Techniques</h5>
                <ul class="analysis-list">
                  ${Object.entries(eventSummary.mitreAnalysis || {})
                    .sort(([,a], [,b]) => b.count - a.count)
                    .slice(0, 5)
                    .map(([technique, data]) => 
                      `<li><a href="https://attack.mitre.org/techniques/${technique.split('.')[0]}/" target="_blank" class="mitre-link">${technique}</a>: ${data.count} events</li>`
                    ).join('') || '<li class="no-data">No MITRE techniques associated</li>'}
                </ul>
              </div>
              
              <div class="analysis-card">
                <h5>📍 Most Active Steps</h5>
                <ul class="analysis-list">
                  ${Object.entries(eventSummary.stepAnalysis || {})
                    .sort(([,a], [,b]) => b.count - a.count)
                    .slice(0, 5)
                    .map(([stepKey, data]) => 
                      `<li><strong>${data.title}</strong>: ${data.count} events</li>`
                    ).join('') || '<li class="no-data">No step patterns identified</li>'}
                </ul>
              </div>
              
              <div class="analysis-card">
                <h5>⏱️ Timing Patterns</h5>
                <ul class="analysis-list">
                  ${eventSummary.timingPatterns && eventSummary.timingPatterns.averageGap ? `
                    <li>Average gap: <strong>${eventSummary.timingPatterns.averageGap.toFixed(1)} steps</strong></li>
                    <li>Min gap: ${eventSummary.timingPatterns.minGap} steps</li>
                    <li>Max gap: ${eventSummary.timingPatterns.maxGap} steps</li>
                  ` : '<li class="no-data">Insufficient data for timing analysis</li>'}
                </ul>
              </div>
            </div>
          </div>
        </div>
      `;
      finalHtml = statsHtml + eventHtml;
    }

    // Show game over screen
    gameContainer.classList.add("hidden");
    gameOverArea.classList.remove("hidden");

    // Set the complete content (ONLY ONCE)
    gameOverContent.innerHTML = finalHtml;

    // Save the game path
    pastPathsManager.saveGamePath(player, success, randomEventsManager); 
  }

  // Generate event timeline table
  function generateEventTimelineTable(timeline) {
    if (!timeline.length) return '';
    
    let html = `
      <div class="event-timeline-section">
        <table class="event-timeline-table">
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
    
    timeline.forEach(event => {
      const mitreLink = event.choiceMitreId && event.choiceMitreId !== 'N/A' 
        ? `<a href="https://attack.mitre.org/techniques/${event.choiceMitreId.split('.')[0]}${event.choiceMitreId.includes('.') ? '/' + event.choiceMitreId.split('.')[1] : ''}/" target="_blank" class="mitre-link">${event.choiceMitreId}</a>`
        : '<span class="no-mitre">N/A</span>';
      
      html += `
        <tr class="event-timeline-row">
          <td class="step-number">${event.step}</td>
          <td class="step-title">${event.stepTitle}</td>
          <td class="choice-label" title="${event.choiceLabel}">${event.choiceLabel}</td>
          <td class="mitre-cell">${mitreLink}</td>
          <td class="event-title">${event.eventTitle}</td>
          <td class="event-category"><span class="category-badge category-${event.eventCategory}">${event.eventCategory}</span></td>
          <td class="player-state">
            <div class="state-compact">
              <span class="hours">${event.hoursAtTime || 0}h</span>
              <span class="contingencies">${event.contingenciesAtTime || 0}c</span>
              <span class="detections">${event.detectionAtTime || 0}d</span>
            </div>
          </td>
        </tr>
      `;
    });
    
    html += '</tbody></table></div>';
    return html;
  }
});