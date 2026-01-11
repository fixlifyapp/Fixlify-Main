# Fixlify Claude Code Skills & Commands

Enterprise-grade AI development tools for the Fixlify repair shop management system.

## Quick Start

All skills and commands are automatically available when working in this project.

### Skills (Auto-Activated)

Skills are automatically invoked by Claude when the context matches their purpose:

| Skill | Triggers When |
|-------|---------------|
| **frontend-design** | Building UI components, pages, forms, dashboards |
| **qa-expert** | Discussing tests, QA, coverage, TDD |
| **deploy-ops** | Deployment, CI/CD, infrastructure |
| **db-migration** | Database changes, schemas, RLS |
| **security-audit** | Security, vulnerabilities, auth |
| **feature-builder** | Building new features, components |
| **hotfix-handler** | Production bugs, emergencies |

### Slash Commands (Explicit)

Type these commands to trigger specific workflows:

```
/commit              - Smart conventional commit
/deploy staging      - Deploy to staging
/deploy production   - Deploy to production
/fix-issue 123       - Fix GitHub issue #123
/release patch       - Create patch release
/release minor       - Create minor release
/test                - Run all tests
/test coverage       - Run with coverage
/audit               - Full security audit
/audit security      - Security-only audit
/migrate new name    - Create new migration
/migrate push        - Apply migrations
/create-pr           - Create pull request
```

## Directory Structure

```
.claude/
├── skills/                    # Auto-activated skills
│   ├── frontend-design/       # UI/UX design with Fixlify patterns
│   │   └── SKILL.md
│   ├── qa-expert/
│   │   └── SKILL.md
│   ├── deploy-ops/
│   │   └── SKILL.md
│   ├── db-migration/
│   │   └── SKILL.md
│   ├── security-audit/
│   │   └── SKILL.md
│   ├── feature-builder/
│   │   └── SKILL.md
│   └── hotfix-handler/
│       └── SKILL.md
├── commands/                  # Explicit slash commands
│   ├── commit.md
│   ├── deploy.md
│   ├── fix-issue.md
│   ├── release.md
│   ├── test.md
│   ├── audit.md
│   ├── migrate.md
│   └── create-pr.md
├── agents/                    # Subagent configurations
├── marketplace.json           # Plugin metadata
└── README.md                  # This file
```

## Usage Examples

### Daily Development

```
# Start working on a feature
"Build a new client tags feature"
→ Claude activates feature-builder skill

# Run tests
/test

# Create commit
/commit

# Create PR
/create-pr
```

### Database Changes

```
# Create migration
/migrate new add_client_tags

# Apply migrations
/migrate push
```

### Deployment

```
# Deploy to staging
/deploy staging

# After QA approval
/deploy production
```

### Emergency Fix

```
# Production bug reported
"There's a bug in production - jobs aren't loading"
→ Claude activates hotfix-handler skill

# Fix and deploy
/fix-issue 456
/deploy production
```

### Release

```
# Create new version
/release minor
```

## Creating New Skills

1. Create folder: `.claude/skills/skill-name/`
2. Add `SKILL.md` with YAML frontmatter:

```yaml
---
name: skill-name
description: When to activate this skill
version: 1.0.0
tags: [relevant, tags]
---

# Skill Title

Instructions for Claude...
```

3. Update `marketplace.json`

## Creating New Commands

1. Create file: `.claude/commands/command-name.md`
2. Use `$ARGUMENTS` for parameters:

```markdown
# Command Title

## Instructions
1. Step one
2. Use $ARGUMENTS for user input

## Examples
- `/command arg1` - Do something
```

3. Update `marketplace.json`

## Best Practices

### Skills
- Clear, specific descriptions for accurate activation
- Include examples and templates
- Cover error handling and edge cases

### Commands
- Simple, memorable names
- Clear parameter documentation
- Practical examples

## Compatibility

- Claude Code >= 1.0.0
- OpenAI Codex CLI (via SKILL.md standard)
- Any tool supporting Agent Skills format

## Resources

- [Agent Skills Standard](https://agentskills.io)
- [Claude Code Docs](https://code.claude.com/docs)
- [Awesome Claude Skills](https://github.com/travisvn/awesome-claude-skills)

---

Built with ❤️ for Fixlify's billion-dollar future 🚀
