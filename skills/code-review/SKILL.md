| name | description | license | metadata |
| --- | --- | --- | --- |
| code-review | Review code changes by comparing current branch against a target branch (default master/main). Use when user asks to review code, check PR, review changes, or find issues in their code changes. Provides change summary, logic analysis, issue detection with severity levels, and test case suggestions. | MIT | |

# Code Review

Review code changes between current branch and target branch, providing structured feedback with issue severity and test suggestions.

## Workflow

### Step 1: Prepare

```bash
# Confirm target branch (default: master, fallback: main)
git rev-parse --verify master 2>/dev/null || git rev-parse --verify main

# Get changed files
git diff <target_branch>...HEAD --name-status

# Get diff content
git diff <target_branch>...HEAD
```

If user specifies a different target branch, use that instead.

### Step 2: Change Overview

List changed files with statistics:
- Files added/modified/deleted
- Lines added/removed per file
- Total change scope

### Step 3: Logic Summary

Summarize what this change does:
- Core functionality changes
- New features or bug fixes
- Affected modules/components

Keep it concise so user can verify intent matches implementation.

### Step 4: Context Loading

Read full content of changed files (not just diff) to understand context. When needed, also read related unchanged files:
- Imported modules/functions
- Type definitions
- Configuration files
- Parent classes or interfaces

### Step 5: Multi-dimension Review

Check each dimension, report only actual findings:

| Dimension | Focus |
|-----------|-------|
| Logic | Incorrect conditions, wrong algorithms, missing cases |
| Boundary | Null/undefined handling, array bounds, error catching |
| Security | Hardcoded secrets, injection risks, missing auth checks |
| Types | `any` abuse, incorrect types, missing null checks (TS projects) |
| Performance | Unnecessary loops, missing memoization, memory leaks |
| Style | Naming, readability, code organization |

**Framework-specific checks**: Load reference file when project uses specific framework:
- React: See [references/react.md](references/react.md)
- Vue: See [references/vue.md](references/vue.md)
- Node.js: See [references/nodejs.md](references/nodejs.md)
- TypeScript: See [references/typescript.md](references/typescript.md)

### Step 6: Test Suggestions

For risky changes, provide:
1. Risk point identification
2. Test scenarios (normal/boundary/error cases)
3. Example test code snippet

### Step 7: Output Report

Use severity levels:
- 🔴 **Blocker**: Must fix, causes bugs or security issues
- 🟡 **Warning**: Should fix, affects code quality
- 🟢 **Suggestion**: Optional improvement

Report format:

```markdown
## 📋 Change Overview
[File list and statistics]

## 📝 Change Summary
[What this change does]

## 🔍 Review Findings

### 🔴 Blockers
[file:line] Issue description
> Code snippet
**Fix**: Suggested solution

### 🟡 Warnings
...

### 🟢 Suggestions
...

## 🧪 Test Suggestions
[Risk points and test cases]
```

## Notes

- Focus only on changed code, minimize comments on unchanged parts
- Provide actionable fix suggestions, not just problem descriptions
- Include line numbers for easy location
- Skip dimensions with no findings
