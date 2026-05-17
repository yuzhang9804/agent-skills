# Agent Skills Repository

This repository contains skills for AI coding agents. Each skill in the `skills/` directory provides specialized capabilities.

## Available Skills

- **code-review** - Review code changes with multi-dimension analysis and test suggestions
- **react-best-practices** - Opinionated React/React Native business-code ruleset (usePersistFn, useDerivedValue, effect/component/store conventions)

## How to Use

When working in a project with these skills installed, the agent will automatically apply relevant skills based on user requests.

For code review tasks, the agent will:
1. Diff current branch against target branch (default: master/main)
2. Analyze changed files and provide structured feedback
3. Suggest test cases for risky changes

## Skill Format

Each skill follows the standard structure:
- `SKILL.md` - Main instructions
- `references/` - Framework-specific guidelines (loaded on demand)
