# react-best-practices

A team-internal React best-practices ruleset for business code. Reduces the cognitive overhead of `useCallback` / `useMemo` / `useEffect` and keeps component files clean and predictable.

Works for both React and React Native. Zero third-party dependencies.

## What's Inside

### Foundational Hooks

Two zero-dependency hooks that must be installed into the target project before the rules can be applied. Copy them from `templates/hooks/` into the project (typical location: `src/hooks/`).

| Hook | Purpose |
| --- | --- |
| `usePersistFn` | Replaces `useCallback`. Returns a function whose identity never changes but whose body always reads the latest closure. |
| `useDerivedValue` | Replaces most `useMemo` and bare derived calculations. Expresses "this is a derived value" while keeping intermediate variables out of the component's top-level scope. |

### Rules

1. **Replace `useCallback` with `usePersistFn`** — every business callback should have a stable identity and a fresh closure, with no dependency array to maintain.
2. **Split `useEffect` strictly into `init` and `watch` shapes** — never mix the two intents in a single effect. All effects strictly follow `exhaustive-deps`; functions invoked inside effects are wrapped with `usePersistFn` and included in the dependency array.
3. **Keep component files clean and focused** — a component file contains only the exported component and its `Props` interface. Constants, utilities, styles, sub-components, and types each have strict placement rules.
4. **Top-level scope must only contain directly consumed identifiers** — any intermediate variable that exists solely to compute another value must be pushed down into a `useDerivedValue` (or IIFE / extracted pure function) scope.
5. **Organize stores by business domain with dedicated type namespaces** — every store has its own directory containing at minimum the store implementation and a `types.ts` file with all types grouped under a `xxxStoreType` TypeScript namespace.
6. **Actively clean up meaningless variables and dead code when modifying files** — delete unreferenced variables, meaningless bindings, and commented-out code blocks instead of leaving them untouched.
7. **Anti-over-encapsulation: Do not declare variables just to mechanically follow rules** — inline single-line forwarding callbacks and simple `className` concatenations directly in JSX. Reserve `usePersistFn` and `useDerivedValue` for cases where they provide genuine architectural value.
8. **Check shared components before building new ones** — before writing any new UI element, first check the project's shared component directory (`components/`) for existing implementations. Review Props interfaces and documentation, then use existing components directly. Only build from scratch if nothing suitable exists.

## Layout

```
react-best-practices/
├── SKILL.md                          The full ruleset
├── README.md                         This file
└── templates/hooks/
    ├── usePersistFn.ts               Drop-in hook replacing useCallback
    └── useDerivedValue.ts            Drop-in hook replacing most useMemo
```

## When to Use

This skill triggers when writing or reviewing React/React Native components, especially decisions around `useCallback` / `useMemo` / `useEffect`, derived values, callback identity, component file structure, and type organization.
