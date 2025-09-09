// gameConfig.js - Configuration file for the cybersecurity game

const GAME_CONFIG = {
  // Player starting values
  player: {
    defaultHours: 160,
    defaultContingencies: 3,
    detectionThreshold: 50,
    defaultSkillLevel: "2", // Default to "Organised Crime" (numeric key)
    defaultdefenceMaturity: "2" // Default to "Medium" (numeric key)
  },

  // Game timer settings
  timer: {
    defaultSeconds: 30 * 60, // 30 minutes
    displayWarningAt: 5 * 60 // Show warning at 5 minutes remaining
  },

  // Scoring system
  scoring: {
    baseScore: 100,
    winBonus: 100,
    detectionPenalty: 20,
    contingencyBonus: 20,
    
    // Inventory item bonuses
    inventoryBonuses: {
      "Persistence": 30,
      "credentials": 10,
      "Kerberostable account": 10,
      "User credentials": 20,
      "Developer credentials": 25,
      "Workstation Admin credentials": 30,
      "Server Admin credentials": 40,
      "SCCM Admin credentials": 50,
      "Domain Administrator credentials": 50,
      "Target system credentials": 50,
      "AD Snapshot": 30,
      "Server Admin Token": 40,
      "SCCM Admin Token": 40,
      "Foothold Workstation Machine Account": 30,
      "Workstation Machine Account": 30,
      "Server Machine Account": 40,
      "Bastion Machine Account": 40,
      "Domain Controller Machine Account": 50,
      "Target System Machine Account": 50,
      "Foothold Session List": 10,
      "NAA credentials": 40,
      "Workstation Admin Hash": 30,
      "Server Admin Hash": 30,
      "Domain Admin Hash": 30,
      "SCCM Admin Hash": 30,
      "Target System Admin Hash": 30,
      "NAA Password Hash": 10,
      "ACL Misconfiguration": 30,
      "RBCD Misconfiguration": 30,
      "ADCS Misconfiguration": 30,
      "Target System Foothold": 30,
      "Workstation Foothold": 30,
      "Server Foothold": 30,
      "Bastion Foothold": 30,
      "Domain Controller Foothold": 30,
      "Network Map": 20,
      "Vulnerability Report": 40,
      "Service Information": 30,
      "NTDS.dit": 80,
      // New items for blue team scenarios
      "Internal IP List": 25,
      "Domain Information": 30,
      "Honeypot Traffic": -10, // Penalty for trap
      "Malware Signature": 35,
      "Encryption Keys": 45,
      "Network Configuration": 30,
      "User Activity Log": 25,
      "Forensic Alert": -15, // Penalty for trap
      "Network Capture": 20,
      "Suspicious File": 15
    }
  },

  // Skill level modifiers (using numeric keys to match HTML values)
  skillLevels: {
    "1": {
      key: "unsophisticated",
      label: "Unskilled",
      description: "Script kiddies or amateur attackers",
      hourMultiplier: 0.75,
      detectionMultiplier: 1.5,
      scoreMultiplier: 1.5
    },
    "2": {
      key: "organised crime",
      label: "Organised Crime",
      description: "Professional cybercriminals with moderate resources",
      hourMultiplier: 1.0,
      detectionMultiplier: 1.0,
      scoreMultiplier: 1.0
    },
    "3": {
      key: "nation state",
      label: "Nation State",
      description: "Highly sophisticated with unlimited resources",
      hourMultiplier: 1.25,
      detectionMultiplier: 0.5,
      scoreMultiplier: 0.25
    }
  },

  // Defense maturity modifiers (using numeric keys to match HTML values)
  defenceMaturity: {
    "1": {
      key: "low",
      label: "Low Maturity",
      description: "Basic security controls, limited monitoring",
      detectionModifier: -20,
      scoreModifier: -50
    },
    "2": {
      key: "medium",
      label: "Medium Maturity", 
      description: "Standard enterprise security controls",
      detectionModifier: 0,
      scoreModifier: 0
    },
    "3": {
      key: "high",
      label: "High Maturity",
      description: "Advanced security controls, comprehensive monitoring",
      detectionModifier: 20,
      scoreModifier: 50
    }
  },

  // Game mode modifiers (using numeric keys to match folder structure)
  gameModes: {
    "1": {
      key: "phishing",
      label: "External Phishing Compromise",
      description: "Email-based attack vector",
      scoreMultiplier: 1.0,
      teamType: "red" // Red team offensive scenario
    },
    "2": {
      key: "supply chain",
      label: "Supply Chain Compromise",
      description: "Compromise through third-party vendors",
      scoreMultiplier: 0.85,
      teamType: "red" // Red team offensive scenario
    },
    "3": {
      key: "insider",
      label: "Insider Attack",
      description: "Malicious insider with existing access",
      scoreMultiplier: 0.85,
      teamType: "red" // Red team offensive scenario
    }
    // Future scenarios can be added here with teamType: "red"
    // "4": {
    //   key: "cloud",
    //   label: "Cloud Compromise",
    //   description: "Attacking a generic cloud deployment",
    //   scoreMultiplier: 1.0,
    //   teamType: "red"
    // }
  },

  // Team type configurations
  teamTypes: {
    red: {
      label: "Red Team",
      description: "Offensive security testing - attacking systems",
      defaultTeam: true // Mark as default team type
    },
    blue: {
      label: "Blue Team", 
      description: "Defensive security operations - detecting and responding to attacks",
      defaultTeam: false
    }
  },

    // Event system configuration
   events: {
      // Base folder structure for automatic discovery
      basePaths: {
        red: '/events/red-team/',
        blue: '/events/blue-team/',
        common: '/events/common/'
      },

      // Scenario-specific paths
      scenarioPaths: {
        specific: '/events/scenario-specific/',
        industry: '/events/industry/',      // future
        difficulty: '/events/difficulty/'   // future
      },

      // File extensions to load
      fileExtensions: ['.json'],

      // Scenario filename mapping (gameMode -> filename)
      scenarioFileMap: {
        "1": "phishing",        // phishing.json
        "2": "supply-chain",    // supply-chain.json  
        "3": "insider",         // insider.json
        "4": "cloud",           // cloud.json (future)
        "5": "ics",             // ics.json (future)
        "6": "mobile",          // mobile.json (future)
        "7": "iot"              // iot.json (future)
      }
    },

  // testing system configuration
  testTypes: {
    credentials: { //"testType": "credentials" in room.json files
      name: "Credential Testing",
      description: "Test captured credentials to determine their privilege level",
      requiredItem: "credentials", //what is needed to do these tests
      outcomes: {
        userCredentials: {
          probability: 40, //chance it is this sort of credential
          item: "User credentials", //what you get at a 40% chance
          feedbackMessage: "Credentials validated: User credentials.", //message stored in feedback
          isTrap: false //will this trigger an alert?
        },
        developerCredentials: {
          probability: 30,
          item: "Developer credentials", 
          feedbackMessage: "Credentials validated: Developer credentials.",
          isTrap: false
        },
        adminCredentials: {
          probability: 20, //20% chance it is an admin cred of some sort...
          item: null, // Will be determined by secondary test
          feedbackMessage: null, // Will be determined by secondary test
          isTrap: false,
          hasSecondaryTest: true, //we have a secondary test to determine what sort of admin creds
          secondaryOutcomes: {
            serverAdmin: {
              probability: 50, 
              item: "Server Admin credentials",
              feedbackMessage: "Credentials validated: Server Admin credentials."
            },
            workstationAdmin: {
              probability: 50,
              item: "Workstation Admin credentials", 
              feedbackMessage: "Credentials validated: Workstation Admin credentials."
            }
          }
        },
        domainAdminCredentials: {
          probability: 5,
          item: "Domain Administrator credentials",
          feedbackMessage: "Credentials validated: Domain Administrator credentials.",
          isTrap: false
        },
        targetSystemCredentials: {
          probability: 4,
          item: "Target system credentials",
          feedbackMessage: "Credentials validated: Target system credentials.",
          isTrap: false
        },
        canaryCredentials: {
          probability: 1, //1% chance its a canary and will trigger detection....
          item: "Canary credentials",
          feedbackMessage: "⚠️ Trap triggered! Canary credentials detected.",
          isTrap: true
        }
      }
    }
  },

  // Detection and retry settings
  detection: {
    persistencePenalty: 5, // Hours lost when using persistence
    retryDetectionIncrease: 10, // Additional detection chance on retry
    canaryDetectionChance: 1 // Chance of hitting canary credentials (out of 100)
  },

  // UI settings
  ui: {
    feedbackDisplayDuration: 5000
  },

  // Credential types
  credentials: {
    GENERIC: "credentials",
    CANARY: "Canary credentials",
    USER: "User credentials",
    DEVELOPER: "Developer credentials",
    WORKSTATION_ADMIN: "Workstation Admin credentials",
    SERVER_ADMIN: "Server Admin credentials",
    SCCM_ADMIN: "SCCM Admin credentials",
    DOMAIN_ADMIN: "Domain Administrator credentials",
    TARGET_SYSTEM: "Target system credentials",
  },

  item_links: {
    "Network Map": "/assets/network_map.png"
  },

  // API endpoints
  api: {
    savePathEndpoint: "/api/save-path",
    getPathsEndpoint: "/api/paths", 
    clearPathsEndpoint: "/api/clear-paths",
    gameDataPath: "/game-data"
  },

  // Helper function to get team type for a given game mode
  getTeamTypeForMode: function(gameMode) {
    const mode = this.gameModes[gameMode];
    if (mode && mode.teamType) {
      return mode.teamType;
    }
    
    // Fallback to default team type (red)
    const defaultTeam = Object.keys(this.teamTypes).find(key => this.teamTypes[key].defaultTeam);
    return defaultTeam || 'red';
  },

  // Helper function to get all event files for a scenario dynamically
  getEventFilesForScenario: function(gameMode, teamType = null, options = {}) {
    // This is now just used by the RandomEventsManager for discovery
    // The actual file discovery happens automatically
    return {
      gameMode,
      teamType: teamType || this.getTeamTypeForMode(gameMode),
      options
    };
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAME_CONFIG;
} else if (typeof window !== 'undefined') {
  window.GAME_CONFIG = GAME_CONFIG;
}