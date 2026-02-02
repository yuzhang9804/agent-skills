# Code Review

Review code changes by comparing current branch against a target branch. Provides structured feedback with change summary, logic analysis, issue detection with severity levels, and test case suggestions.

## Use When

- "Review my code"
- "Check this PR"
- "Review my changes"
- "Find issues in my code"
- "帮我 review 代码"

## Review Dimensions

| Dimension | Focus |
|-----------|-------|
| Logic | Incorrect conditions, wrong algorithms, missing cases |
| Boundary | Null/undefined handling, array bounds, error catching |
| Security | Hardcoded secrets, injection risks, missing auth checks |
| Types | TypeScript `any` abuse, incorrect types, missing null checks |
| Performance | Unnecessary loops, missing memoization, memory leaks |
| Style | Naming, readability, code organization |

## Framework-Specific Checks

- **React** - Hooks rules, re-render optimization, performance patterns
- **Vue** - Reactivity pitfalls, composition API, template best practices
- **Node.js** - Async/error handling, security vulnerabilities, memory management
- **TypeScript** - Type safety, generics, common type pitfalls

## Output Format

Findings are categorized by severity:

- 🔴 **Blocker** - Must fix, causes bugs or security issues
- 🟡 **Warning** - Should fix, affects code quality
- 🟢 **Suggestion** - Optional improvement

Each finding includes:
- File and line number
- Issue description with code snippet
- Suggested fix

## Test Suggestions

For risky changes, the skill provides:
1. Risk point identification
2. Test scenarios (normal/boundary/error cases)
3. Example test code snippets

## Structure

```
code-review/
├── SKILL.md              # Main instructions
└── references/
    ├── react.md          # React-specific rules
    ├── vue.md            # Vue-specific rules
    ├── nodejs.md         # Node.js-specific rules
    └── typescript.md     # TypeScript-specific rules
```
