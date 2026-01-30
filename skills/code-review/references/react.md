# React Review Checklist

## Hooks Rules

- Hooks must be called at top level, not inside conditions/loops
- `useEffect` dependencies must be complete and accurate
- Missing cleanup in `useEffect` (subscriptions, timers, event listeners)
- `useMemo`/`useCallback` with empty or incorrect dependencies
- Custom hooks must start with `use` prefix

## Performance

- Components re-rendering unnecessarily (missing `React.memo`)
- Inline object/array/function in JSX causing re-renders
- Large lists without virtualization
- Missing `key` prop or using index as key in dynamic lists
- Expensive calculations not memoized

## State Management

- Derived state that should be computed during render
- State updates not batched properly
- Stale closure in event handlers or effects
- Unnecessary state (can be derived from props or other state)

## Common Pitfalls

- Direct DOM manipulation instead of refs
- `dangerouslySetInnerHTML` without sanitization
- Missing error boundaries for async components
- Uncontrolled to controlled component switch
- Memory leaks from uncleared async operations
