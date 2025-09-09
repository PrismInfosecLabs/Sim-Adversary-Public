# Random Events System

The Random Events System adds dynamic, game-progression-based events to the cybersecurity simulation game. Events trigger based on player actions, game state, and progression rather than real-time, ensuring a consistent and strategic gameplay experience.

## Table of Contents
- [Overview](#overview)
- [Event Structure](#event-structure)
- [Trigger Types](#trigger-types)
- [Conditions](#conditions)
- [Effects](#effects)
- [Delayed Effects](#delayed-effects)
- [File Organization](#file-organization)
- [Creating New Events](#creating-new-events)
- [Integration](#integration)
- [Examples](#examples)

## Overview

Random events provide:
- **Dynamic gameplay**: Unpredictable challenges and opportunities
- **Strategic depth**: Players must adapt to changing conditions
- **Realism**: Simulates real-world operational challenges
- **Replayability**: Different events create unique gameplay experiences

**Key Design Principles:**
- **Game-progression based**: Events trigger based on player actions, not real-time
- **Strategic impact**: Events affect resources, detection levels, and gameplay options
- **Balanced**: Events provide both challenges and opportunities
- **Contextual**: Events are relevant to the current scenario and player state

## Event Structure

Each event is defined in JSON format with the following structure:

```json
{
  "id": "unique_event_identifier",
  "title": "🎯 Event Title",
  "message": "Event description that explains what happened.",
  "category": "event_category",
  "triggers": ["trigger_type1", "trigger_type2"],
  "baseProbability": 0.3,
  "maxProbability": 0.8,
  "oneTime": true,
  "messageType": "warning",
  "conditions": {
    "minSteps": 5,
    "maxSteps": 20
  },
  "modifiers": {
    "skillLevel": {
      "1": 1.5,
      "2": 1.0,
      "3": 0.5
    }
  },
  "effects": {
    "hours": -4,
    "contingencies": 1
  }
}
```

### Core Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier for the event |
| `title` | string | ✅ | Display title shown to player |
| `message` | string | ✅ | Detailed description of what happened |
| `category` | string | ✅ | Event category (infrastructure, detection, etc.) |
| `triggers` | array | ✅ | When this event can trigger |
| `baseProbability` | number | ✅ | Base chance (0.0-1.0) of triggering |

### Optional Properties

| Property | Type | Description |
|----------|------|-------------|
| `maxProbability` | number | Maximum probability after modifiers |
| `oneTime` | boolean | Whether event can only trigger once |
| `messageType` | string | UI styling: "warning", "info", "success" |
| `conditions` | object | Requirements for event to trigger |
| `modifiers` | object | Probability adjustments based on game state |
| `effects` | object | Immediate impact on game state |

## Trigger Types

Events can trigger based on specific game events:

### `"detection"`
- Triggers when player is detected
- Most common for infrastructure/defensive events
- Example: C2 infrastructure blocking

### `"step"`
- Triggers when player takes any action
- Used for general operational events
- Checked every time player makes a choice

### `"success"`
- Triggers when an action succeeds
- Used for opportunity or escalation events
- Example: Access to new resources

### `"failure"`
- Triggers when an action fails
- Used for setback or complication events
- Example: Tool malfunction

## Conditions

Conditions determine when an event is eligible to trigger:

### Step-Based Conditions
```json
"conditions": {
  "minSteps": 5,        // Must have taken at least 5 actions
  "maxSteps": 20        // Must have taken no more than 20 actions
}
```

### Detection-Based Conditions
```json
"conditions": {
  "minDetections": 1,   // Must have been detected at least once
  "maxDetections": 3    // Must have been detected no more than 3 times
}
```

### Hours-Based Conditions
```json
"conditions": {
  "minHours": 10,           // Must have spent at least 10 hours
  "maxHours": 50,           // Must have spent no more than 50 hours
  "minPlayerHours": 30,     // Must have at least 30 hours remaining
  "maxPlayerHours": 100     // Must have no more than 100 hours remaining
}
```

### Inventory Conditions
```json
"conditions": {
  "requiredItems": ["credentials", "network_access"],  // Must have these items
  "forbiddenItems": ["detection_alert"]                // Must NOT have these items
}
```

### Player Configuration
```json
"conditions": {
  "skillLevels": ["1", "2"],           // Only for specific skill levels
  "defenseMaturity": ["2", "3"],       // Only for specific defense maturity
  "allowedSteps": ["lateral-movement"] // Only on specific step types
}
```

## Effects

Effects define what happens when an event triggers:

### Resource Effects
```json
"effects": {
  "hours": -4,          // Lose 4 hours (positive values add hours)
  "contingencies": 1    // Gain 1 contingency (negative values remove)
}
```

### Inventory Effects
```json
"effects": {
  "addItems": ["backup_credentials", "alternative_tool"],
  "removeItems": ["compromised_credentials"]
}
```

### Game State Effects
```json
"effects": {
  "gameState": {
    "globalDetectionIncrease": 15,  // Increase detection by 15%
    "networkSegmented": true,       // Set a boolean flag
    "customFlag": "value"           // Custom game state tracking
  }
}
```

## Delayed Effects

Some events have effects that resolve after a certain number of steps:

```json
"effects": {
  "hours": 2,
  "gameState": {
    "globalDetectionDecrease": 20,
    "backupFailureActive": true,
    "backupFailureStepsRemaining": 8  // Will restore after 8 steps
  }
}
```

The system automatically decrements step counters and triggers restoration effects when they reach zero.

## File Organization

Events are organized by team type and category:

```
/events/
├── red-team/
│   ├── infrastructure.json     // Infrastructure failures, C2 blocking
│   ├── detection.json         // Detection-related events
│   ├── defensive.json         // Defensive countermeasures
│   ├── opportunity.json       // Positive events, new resources
│   └── operational.json       // General operational challenges
├── blue-team/
│   ├── threat-comms.json      // Threat intelligence events
│   ├── external.json          // External factors
│   ├── intelligence.json      // Intelligence gathering events
│   └── pressure.json          // Organizational pressure events
├── common/
│   ├── technical.json         // Technical issues affecting both teams
│   ├── environmental.json     // Environmental factors
│   └── third-party.json       // Third-party service issues
└── scenario-specific/
    ├── phishing.json          // Phishing scenario events
    ├── supply-chain.json      // Supply chain scenario events
    └── insider.json           // Insider threat scenario events
```

### Event File Metadata

Each event file includes metadata:

```json
{
  "name": "Infrastructure Events",
  "description": "Events related to technical infrastructure",
  "applicableScenarios": ["1", "2", "3"],  // Which scenarios use these events
  "applicableTeams": ["red"],               // Which teams these apply to
  "events": [
    // ... event definitions
  ]
}
```

## Creating New Events

### 1. Choose Appropriate File
- Determine team type (red/blue/common)
- Select category that best fits the event
- Check if scenario-specific events are needed

### 2. Define Event Structure
```json
{
  "id": "my_new_event",
  "title": "🔧 My Event Title",
  "message": "Clear description of what happened and its impact.",
  "category": "infrastructure",
  "triggers": ["detection"],
  "baseProbability": 0.2,
  "oneTime": true,
  "conditions": {
    "minSteps": 3,
    "minDetections": 1
  },
  "effects": {
    "hours": -2
  }
}
```

### 3. Test Event
- Ensure JSON is valid
- Test probability and conditions
- Verify effects work as expected
- Check message clarity

### 4. Balance Considerations
- **Probability**: Should events be rare (0.05-0.1) or common (0.3-0.5)?
- **Impact**: How significantly should this affect gameplay?
- **Timing**: When in the game should this occur?
- **Recovery**: Can players recover from negative effects?

## Integration

### Game Configuration

Events are automatically loaded based on game mode and team type as defined in `gameConfig.js`:

```javascript
// Team type is determined by game mode
"gameModes": {
  "1": {
    "teamType": "red"  // Loads red team and common events
  }
}
```

### Event Manager Integration

The `RandomEventsManager` handles:
- Loading appropriate event files
- Checking trigger conditions
- Calculating probabilities
- Executing effects
- Managing delayed effects

### Game Integration Points

Events are checked at key points in the game:

```javascript
// After each player action
randomEventsManager.checkForEvents('step', context, gameStateCallback, uiCallback);

// When detection occurs
randomEventsManager.checkForEvents('detection', context, gameStateCallback, uiCallback);

// When actions succeed/fail
randomEventsManager.checkForEvents('success', context, gameStateCallback, uiCallback);
```

## Examples

### Infrastructure Failure
```json
{
  "id": "c2_blocked",
  "title": "🚨 C2 Infrastructure Blocked",
  "message": "Your primary C2 domain has been blocked by network defenses, causing an 8-hour operational delay.",
  "category": "infrastructure",
  "triggers": ["detection"],
  "baseProbability": 0.4,
  "conditions": {
    "minSteps": 3,
    "minDetections": 1
  },
  "modifiers": {
    "skillLevel": {
      "1": 1.5,    // More likely for unskilled attackers
      "3": 0.3     // Less likely for nation-state actors
    },
    "defenseMaturity": {
      "3": 1.8     // More likely in high-maturity environments
    }
  },
  "effects": {
    "hours": -8,
    "gameState": {
      "c2Blocked": true
    }
  }
}
```

### Opportunity Event
```json
{
  "id": "backup_system_failure",
  "title": "💥 Backup System Failure",
  "message": "A critical backup system has failed, providing you with a 2-hour operational advantage.",
  "category": "infrastructure",
  "triggers": ["step"],
  "baseProbability": 0.03,
  "oneTime": true,
  "conditions": {
    "minSteps": 5,
    "maxSteps": 20,
    "minHours": 10
  },
  "effects": {
    "hours": 2,
    "gameState": {
      "globalDetectionDecrease": 20,
      "backupFailureStepsRemaining": 8
    }
  }
}
```

### Detection Event
```json
{
  "id": "network_segmentation",
  "title": "🚧 Network Segmentation Activated",
  "message": "Emergency network segmentation has been activated, limiting your capabilities.",
  "category": "defensive",
  "triggers": ["detection"],
  "baseProbability": 0.3,
  "oneTime": true,
  "conditions": {
    "minDetections": 2,
    "minSteps": 8
  },
  "effects": {
    "hours": -2,
    "gameState": {
      "networkSegmented": true,
      "globalDetectionIncrease": 10
    }
  }
}
```

---

## Contributing

When contributing new events:

1. **Follow naming conventions**: Use descriptive IDs and clear titles
2. **Test thoroughly**: Ensure events trigger appropriately and effects work
3. **Balance gameplay**: Consider impact on game flow and difficulty
4. **Document clearly**: Use clear messages that explain the event's impact
5. **Consider edge cases**: Test with different player configurations

The random events system is designed to be extensible and customizable, allowing for rich, dynamic gameplay experiences that adapt to player actions and game state.