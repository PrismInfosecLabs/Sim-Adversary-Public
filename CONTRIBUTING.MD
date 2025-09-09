# Contributing to Sim-Adversary

Thank you for your interest in contributing to Sim-Adversary! This project aims to provide realistic cybersecurity training through gamification, and community contributions are essential to its success.

## 🤝 Ways to Contribute

### 🐛 Bug Reports
- Use GitHub Issues to report bugs
- Include detailed reproduction steps
- Specify browser/OS versions
- Attach screenshots if applicable

### 💡 Feature Requests
- Suggest new attack scenarios
- Propose gameplay improvements
- Request additional MITRE techniques
- Recommend UI/UX enhancements

### 📝 Code Contributions
- Fix bugs and improve performance
- Add new attack scenarios
- Enhance existing game mechanics
- Improve documentation

### 🎓 Educational Content
- Add new MITRE ATT&CK technique mappings
- Create realistic attack scenarios
- Improve technique descriptions
- Enhance learning materials

## 🚀 Getting Started

### Prerequisites
- Node.js 14+
- Git
- Basic knowledge of JavaScript, HTML, CSS
- Understanding of cybersecurity concepts

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/AdverSim.git`
3. Run setup: `./setup.sh` (Unix) or `setup.bat` (Windows)
4. Create a branch: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Test thoroughly
7. Commit and push
8. Create a Pull Request

## 📋 Development Guidelines

### Code Style
- Use consistent indentation (2 spaces)
- Add comments for complex logic
- Follow existing naming conventions
- Keep functions focused and small

### File Organization
```
Sim-Adversary/
├── public/
│   ├── game-data/          # Scenario JSON files
│   ├── events/             # Event JSON files
│   ├── assets/             # game asset files
│   ├── images/             # images files
│   ├── *.js                # Frontend modules
│   └── index.html          # Main interface
├── models/
│   ├── GamePath.js         # Database structure
├── server.js               # Express server
├── datavbase.js            # database setup
├── routes.js               # API endpoints
└── docs/                   # Documentation
└── tools/                  # tools
```

### Adding New Scenarios

1. **Create Scenario Folder**
   ```bash
   mkdir public/game-data/[scenario-number]
   ```

2. **Define Scenario Steps**
   Create JSON files for each step:
   ```json
   {
     "key": "step-name",
     "title": "Step Title",
     "description": ["Step description text"],
     "choices": [
       {
         "label": "Action description",
         "mitreId": "T1234.001",
         "hourCost": 2,
         "detectionChance": 15,
         "successChance": 85,
         "next": "next-step",
         "rewards": ["Item Name"]
       }
     ]
   }
   ```

3. **Update Configuration**
   Add scenario to `gameConfig.js`:
   ```javascript
   gameModes: {
     "4": {
       key: "new-scenario",
       label: "New Scenario Name",
       description: "Scenario description",
       scoreMultiplier: 1.0
     }
   }
   ```

### MITRE ATT&CK Integration
- Use official MITRE technique IDs
- Include sub-techniques when applicable
- Verify links to MITRE documentation
- Ensure realistic probability values

### Testing Guidelines
- Test all scenario paths manually
- Verify database operations
- Check cross-browser compatibility
- Validate MITRE links
- Test scoring calculations

## 📚 Scenario Design Best Practices

### Realistic Progression
- Start with reconnaissance
- Progress through MITRE kill chain
- Include decision points and consequences
- Balance difficulty and learning value

### Educational Value
- Map to real-world techniques
- Include multiple solution paths
- Provide meaningful feedback
- Balance success/failure rates

### Game Balance
- Consider time costs
- Set appropriate detection chances
- Provide meaningful rewards
- Avoid unwinnable scenarios

## 🔍 Code Review Process

### Pull Request Requirements
- Clear description of changes
- Reference related issues
- Include test results
- Update documentation if needed

### Review Criteria
- Code quality and style
- Functionality testing
- Educational accuracy
- MITRE compliance
- Game balance impact

## 🎯 Priority Areas

### High Priority
- Bug fixes and stability
- Cross-browser compatibility
- Performance improvements
- Educational accuracy

### Medium Priority
- New attack scenarios
- UI/UX improvements
- Additional MITRE techniques
- Analytics enhancements

### Low Priority
- Visual enhancements
- Advanced features
- Platform-specific optimizations

## 📖 Documentation Standards

### Code Comments
- Explain complex algorithms
- Document function parameters
- Clarify business logic
- Note security considerations

### README Updates
- Keep installation instructions current
- Update feature lists
- Maintain troubleshooting guides
- Include screenshots for new features

## 🔒 Security Guidelines

### Educational Focus
- All content must be educational
- No actual exploit code
- Simulated environments only
- Responsible disclosure emphasis

### Code Security
- Validate all user inputs
- Sanitize database queries
- Use secure coding practices
- Regular dependency updates

## 📞 Getting Help

### Communication Channels
- GitHub Issues for bugs/features
- GitHub Discussions for questions
- Pull Request reviews for code help

### Documentation
- README.md for setup and usage
- Code comments for implementation
- MITRE documentation for techniques

## 🏆 Recognition

Contributors will be recognized through:
- GitHub contributor graphs
- Acknowledgments in documentation
- Feature attribution in commit messages

Thank you for helping make cybersecurity education more accessible and engaging!