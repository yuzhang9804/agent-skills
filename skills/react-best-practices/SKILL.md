---
name: react-best-practices
description: A team-internal React best-practices ruleset for business code. MUST trigger when (1) designing or modifying React/React Native components (creating, refactoring, restructuring, or editing component files, props, hooks, or file organization), or (2) creating or modifying complex business logic in a React/React Native project (stores, cross-component state, async flows, side-effect orchestration). Provides ready-to-copy `usePersistFn` and `useDerivedValue` hooks plus five rules covering useCallback/useEffect/useMemo replacements, component file structure, top-level scope hygiene, and store/type organization. Do NOT trigger for read-only code explanation, trivial style/typo/bug fixes, or non-React tasks.
---

# React Best Practices (Team Ruleset)

This skill encodes a team-internal set of opinionated rules for writing maintainable React (and React Native) business code. It is designed to reduce the cognitive overhead of `useCallback` / `useMemo` / `useEffect` and to keep component files clean and predictable. The ruleset does not depend on `ahooks` or any third-party hook library.

When applying this skill, first ensure the two foundational hooks are available in the target project, then enforce the rules below in order.

## Foundational Hooks

The skill ships two zero-dependency hooks that must be installed into the target project before the rules can be applied. Copy them verbatim from `templates/hooks/` into the project (typical location: `src/hooks/`).

| Hook | Purpose | Source file |
| --- | --- | --- |
| `usePersistFn` | Replaces `useCallback`; returns a function whose identity never changes but whose body always reads the latest closure | `templates/hooks/usePersistFn.ts` |
| `useDerivedValue` | Replaces most `useMemo` and bare derived calculations; expresses "this is a derived value" while keeping intermediate variables out of the component's top-level scope | `templates/hooks/useDerivedValue.ts` |

Both hooks are intentionally minimal. `usePersistFn` uses two refs to provide a stable function reference that always invokes the latest implementation. `useDerivedValue` is literally `return fn()` — its value is semantic (it documents intent and creates a fresh scope for intermediate variables), not runtime memoization.

## Rules

### Rule 1 — Replace `useCallback` with `usePersistFn`

In business code, `useCallback` is the wrong default. Its identity stability is conditional on the dependency array, which forces every developer to reason about when the function will be rebuilt and which closures will go stale. The desired contract for almost every business callback is the opposite: the reference should never change, and the body should always see the latest state and props. `usePersistFn` provides exactly that contract with no dependency array, so it must be used in place of `useCallback` everywhere except for rare low-level cases where a downstream `useMemo` legitimately needs to react to a function reference changing.

```tsx
// Bad: deps array is a maintenance hazard, and a stale dep silently breaks the closure.
const handleSubmit = useCallback(() => {
  api.submit(formValue, userId)
}, [formValue, userId])

// Good: identity is stable forever, closure is always fresh, no deps to maintain.
const handleSubmit = usePersistFn(() => {
  api.submit(formValue, userId)
})
```

### Rule 2 — Split `useEffect` strictly into `init` and `watch` shapes

Every `useEffect` in the codebase must fall into exactly one of two shapes, and the two shapes must never be mixed inside a single effect. Mixing them (for example via a `firstRender` ref or by adding a state to the dep array of a "mount-only" effect) is the single largest source of subtle bugs and is forbidden.

**Dependency Array Rule:** All effects must strictly follow the `eslint-plugin-react-hooks` `exhaustive-deps` rule. Any function called inside an effect must be wrapped with `usePersistFn` at its declaration site and then included in the effect's dependency array. Because `usePersistFn` guarantees a stable reference, including it in the dependencies satisfies the linter without ever triggering an accidental re-run.

The **init** shape runs once on mount. Its dependency array contains only the `usePersistFn` callables it invokes. Because those references never change, the effect behaves exactly like a `[]` dependency array, but without violating lint rules.

The **watch** shape exists to react to a specific value changing. Its dependency array contains the values being watched plus any `usePersistFn` callables it invokes. The skill does not impose extra constraints on the watched values (such as forcing primitive-only deps or mandating `useDeepCompareEffect`); developers are expected to follow standard React rules for the watched values.

```tsx
// init: runs once, never re-runs. fetchInitialData is in deps to satisfy lint,
// but its stable identity ensures the effect only runs on mount.
const fetchInitialData = usePersistFn(async () => {
  const data = await api.list({ userId })
  setList(data)
})
useEffect(() => {
  fetchInitialData()
}, [fetchInitialData])

// watch: explicitly reacts to selectedId changing. handleSelectionChange is in deps
// to satisfy lint, but its stable identity ensures the effect only reacts to selectedId.
const handleSelectionChange = usePersistFn(() => {
  trackEvent('selection_change', { id: selectedId, source: pageSource })
})
useEffect(() => {
  handleSelectionChange()
}, [selectedId, handleSelectionChange])
```

If a single piece of logic genuinely needs both "run on mount" and "react to a value", split it into two effects. Do not gate behavior with `if (firstRender.current)` inside a single effect.

### Rule 3 — Keep component files clean and focused

A component file must contain only the exported component and its `Props` interface. All other declarations must be extracted or inlined according to these strict boundaries:

**Constants:** Constants reused across components must be extracted to `constants.ts`. Literals used only once in the current component must be inlined directly at the usage site.

**Utility Functions:** Pure functions reused across components or lacking conceptual ties to the current component must be extracted to `utils.ts`. Pure functions serving *only* the current component are allowed in the component file, but their placement is governed by Rule 4 (either top-level if directly consumed, or pushed down into a `useDerivedValue` scope if only used for intermediate calculations).

**Styles:** The project uses Tailwind CSS (or similar utility-first approaches), so "style variables" do not exist. `className` strings must be inlined in JSX. If a `className` requires complex conditional concatenation, the concatenation logic must be wrapped in a `useDerivedValue` to prevent intermediate variables from polluting the component scope.

**Sub-components:** A component file must contain at most one top-level component definition. If a sub-component is needed, choose between two valid forms:
- **Form A (Inline Component):** Defined *inside* the parent component's body. Use this only for small, pure-presentation sub-components that have no internal state/effect/ref and heavily rely on the parent's closure.
- **Form B (Separate File):** Extracted to a completely independent file. Use this for any sub-component that holds its own state/effect/ref, performs non-trivial rendering, or might be reused.
- **Forbidden:** Defining a second top-level component outside the main component in the same file.

**Types:** All business domain types must be grouped by store into a TypeScript `namespace` (see Rule 5). Components must import these namespaces individually as needed. The only types allowed inside a component file are its `Props` interface and pure UI types used exclusively by that component (e.g., a union type for tab keys).

### Rule 4 — Top-level scope must only contain directly consumed identifiers

The top-level scope of a component function is its skeleton; it must not contain scaffolding. Every identifier declared in the top-level scope must be directly consumed by JSX, a hook argument, or another top-level identifier's final consumption chain.

Any identifier that exists solely to compute another value (an "intermediate variable") must be pushed down into the scope of its sole consumer. The preferred mechanism for this is `useDerivedValue`, followed by an IIFE, and finally an extracted pure function (if the function has cross-component reuse value).

This rule evaluates whether the *identifier itself* is consumed, regardless of how simple the expression is.

```tsx
// Bad: 'a' is an intermediate variable not consumed by JSX/hooks. It pollutes the top-level scope.
const a = b + c
const d = a + b
return <div>{d}</div>

// Good: 'a' is pushed down into the scope of its consumer via useDerivedValue.
const d = useDerivedValue(() => {
  const a = b + c
  return a + b
})
return <div>{d}</div>
```

**Exemption:** Destructuring assignments from hook returns (e.g., `const { data, loading } = useRequest(...)`) are treated as a single hook invocation boundary. Unused destructured fields do not violate this rule.

### Rule 5 — Organize stores by business domain with dedicated type namespaces

Regardless of the state management framework used (Zustand, Jotai, Redux Toolkit, Context-based, etc.), stores must be organized strictly by business domain (e.g., `auth`, `order`, `user`).

Each business domain must have its own dedicated store directory (e.g., `stores/auth/`). The minimum required structure for a store directory is two files:
1. The store implementation file (e.g., `index.ts`)
2. A `types.ts` file serving as the type contract for the store

All types related to a store (domain models, payloads, state shapes, etc.) must be defined inside a unified TypeScript `namespace` container within its `types.ts` file. The namespace must be named using the lowerCamelCase store name followed by `StoreType` (e.g., `authStoreType`, `orderStoreType`). External consumers must import the namespace and access types via `xxxStoreType.YyySomething`.

**Forbidden:**
- Mixing multiple business domains into a single store.
- Organizing stores by technical dimension (e.g., `uiStore`, `dataStore`).
- Defining business types outside of a `namespace` container.
- Creating a store directory without a dedicated `types.ts` file.
