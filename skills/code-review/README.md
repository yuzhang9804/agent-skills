# Code Review

A skill for reviewing code changes with multi-dimension analysis and test suggestions.

## Structure

- `SKILL.md` - Main instructions for the agent
- `references/` - Framework-specific review guidelines
  - `react.md` - React hooks, performance, state management
  - `vue.md` - Vue reactivity, composition API, templates
  - `nodejs.md` - Node.js async handling, security, memory
  - `typescript.md` - TypeScript type safety, generics, patterns

## How It Works

1. Diffs current branch against target branch (default: master/main)
2. Analyzes changed files with full context
3. Reviews across multiple dimensions (logic, security, performance, etc.)
4. Provides severity-based findings (🔴 Blocker / 🟡 Warning / 🟢 Suggestion)
5. Suggests test cases for risky changes

## Usage

The skill triggers when users ask to:
- Review code / Check PR
- Find issues in changes
- 帮我 review 代码
- 检查这次的改动

## Customization

To add framework-specific rules, edit the corresponding file in `references/`.
