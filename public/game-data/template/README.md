\# Creating Custom Scenarios



\## Quick Start

1\. \*\*Create scenario folder\*\*: Make a new numbered folder in `public/game-data/` (e.g., `4/`, `5/`)

2\. \*\*Start with template\*\*: Copy `start-here.json` and `template.json` from the template folder

3\. \*\*Build your story\*\*: Create additional JSON files for each room/step in your scenario

4\. \*\*Connect the flow\*\*: Link rooms together using the `next` field in choices

5\. \*\*Test and integrate\*\*: Update gameConfig.js and index.html to include your scenario



\## JSON File Structure



\### Required Fields

\- `"key"`: Must match filename (without .json)

\- `"title"`: Room name displayed to players  

\- `"description"`: Array of text paragraphs describing the scene

\- `"choices"`: Array of player options



\### Choice Object Fields

\- `"label"`: Button text shown to player \*(required)\*

\- `"mitreId"`: MITRE ATT\&CK technique ID \*(required)\*

\- `"hourCost"`: Time consumed by this action \*(required)\*

\- `"detectionChance"`: Percentage chance of triggering detection \*(required)\*

\- `"successChance"`: Percentage chance of action succeeding \*(required)\*

\- `"next"`: Filename of next room (without .json) \*(required)\*



\### Optional Choice Fields

\- `"requiredItems"`: Items needed to unlock this choice

\- `"rewards"`: Items given when choice is selected

\- `"limit"`: Maximum attempts before success chance becomes 0%

\- `"isLateralMovement"`: Boolean flag for lateral movement actions

\- `"lateralSafeSources"`: Safe rooms for lateral movement (avoids detection)



\## Key Concepts



\### Items System

Items can be required for certain actions and given as rewards:

```json

"requiredItems": \[

   \["password", "keycard"],  // OR condition (either password OR keycard)

   "admin\_access"            // AND condition (must also have admin\_access)

],

"rewards": \["database\_access", "user\_credentials"]

```



\### Room Flow

\- Start every scenario with `start-here.json`

\- Link rooms using the `"next"` field in choices

\- Use descriptive filenames that match the `"key"` field

\- Create branching paths by having different choices lead to different rooms



\### Special Choice Types

\*\*Test Choices\*\* - For skill/knowledge challenges:

```json

{

   "label": "Attempt to crack password",

   "mitreId": "T1110",

   "testType": "credentials",  // Defined in gameConfig.js

   "hourCost": 2,

   "detectionChance": 15,

   "next": "success-room",

   "requiredItems": \["password\_list"]

}

```



\## Example Scenario Structure

```

4/                          # Your scenario folder

├── start-here.json         # Always the entry point

├── reconnaissance.json     # First real step

├── initial-access.json     # Gaining entry

├── privilege-escalation.json

├── lateral-movement.json

├── data-exfiltration.json

└── success.json           # End state

```



\## Best Practices



\### Balancing

\- \*\*Hour costs\*\*: 1-3 for quick actions, 5-10+ for major operations

\- \*\*Detection chances\*\*: 10-30% for careful actions, 50%+ for risky moves

\- \*\*Success chances\*\*: 70-90% for skilled actions, 40-60% for difficult attempts



\### Story Design

\- Use the `description` array to build atmosphere and provide context

\- Include multiple paths to objectives (stealth vs. aggressive)

\- Balance risk vs. reward in choice design

\- Consider item dependencies to create logical progression



\### File Naming

\- Use descriptive, hyphenated names: `network-scanning.json`

\- Keep names short but clear

\- Ensure `"key"` field exactly matches filename (minus .json)



\## Integration Steps

1\. \*\*Add to dropdown\*\*: Update `index.html` scenario selector

2\. \*\*Configure metadata\*\*: Add scenario info to `gameConfig.js`

3\. \*\*Test thoroughly\*\*: Play through all possible paths

4\. \*\*Validate JSON\*\*: Ensure all files are valid JSON format



\## Testing Checklist

\- \[ ] All rooms are reachable

\- \[ ] No broken `"next"` links

\- \[ ] Required items are obtainable before needed

\- \[ ] JSON syntax is valid

\- \[ ] MITRE IDs are legitimate

\- \[ ] Hour costs and chances are balanced



\## Resources

\- \*\*Template files\*\*: Use provided templates as starting points

\- \*\*MITRE ATT\&CK\*\*: https://attack.mitre.org/ for technique IDs

\- \*\*JSON validator\*\*: Verify syntax before testing in-game

