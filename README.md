# Agent Skills

A collection of skills for AI coding agents. Skills are packaged instructions and scripts that extend agent capabilities.

Skills follow the [Agent Skills](https://agentskills.io/) format.

## Available Skills

### code-review

Review code changes by comparing current branch against a target branch. Provides structured feedback with change summary, logic analysis, issue detection with severity levels, and test case suggestions.

**Use when:**
- "Review my code"
- "Check this PR"
- "Review my changes"
- "Find issues in my code"
- "帮我 review 代码"

**Review dimensions:**
- Logic correctness (incorrect conditions, wrong algorithms)
- Boundary conditions (null handling, array bounds, error catching)
- Security (hardcoded secrets, injection risks, auth checks)
- Type safety (TypeScript `any` abuse, incorrect types)
- Performance (unnecessary loops, missing memoization)
- Code style (naming, readability, organization)

**Framework-specific checks:**
- React (hooks rules, re-render optimization, performance)
- Vue (reactivity, composition API, template best practices)
- Node.js (async/error handling, security, memory)
- TypeScript (type safety, generics, common pitfalls)

**Output format:**
- 🔴 **Blocker** - Must fix, causes bugs or security issues
- 🟡 **Warning** - Should fix, affects code quality
- 🟢 **Suggestion** - Optional improvement
- 🧪 **Test suggestions** - Risk points with example test cases

## Installation

```bash
npx skills add <your-username>/agent-skills
```

## Usage

Skills are automatically available once installed. The agent will use them when relevant tasks are detected.

**Examples:**
```
Review my code changes
```
```
帮我检查一下这次的改动
```
```
Check this PR for issues
```

## Skill Structure

Each skill contains:
- `SKILL.md` - Instructions for the agent
- `references/` - Supporting documentation (optional)

## License

MIT
