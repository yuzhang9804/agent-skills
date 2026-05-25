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

### Rule 6 — Actively clean up meaningless variables and dead code when modifying files

When modifying an existing file, you must actively identify and delete meaningless remnants rather than leaving them untouched. This is a behavioral rule for file modifications, ensuring the codebase continuously improves.

You must delete the following three categories of remnants:
1. **Dead code:** Variables, imports, functions, or type declarations that are completely unreferenced anywhere in the file.
2. **Meaningless bindings:** Variables that receive a return value but are never read (e.g., `const _temp = sideEffect()`). These must be changed to pure calls without assignment (e.g., `sideEffect()`).
3. **Commented-out code:** Blocks of old code that have been commented out, or `// TODO` / `// FIXME` comments that are no longer relevant after your changes. Version control (git) is the correct place for history; commented-out code is noise.

This rule applies strictly to "remnants" and "dead code". It does NOT apply to:
- Incomplete placeholder implementations (e.g., an empty handler waiting to be wired up), which should be completed rather than deleted.
- Intermediate variables governed by Rule 4 (which must be pushed down into a `useDerivedValue` scope, not deleted).

### Rule 7 — Anti-over-encapsulation: Do not declare variables just to mechanically follow rules

This ruleset is not meant to be applied blindly. Every variable declaration must have a genuine reason to exist—such as being referenced in multiple places, being held by an effect/subscription, significantly improving semantics through naming, or containing actual control flow branches. Declaring variables merely to make the code "look neat" or to mechanically satisfy rules is an anti-pattern.

1. **Single-line forwarding callbacks:** Callbacks that simply forward arguments to another function must be inlined directly in the JSX prop. Do NOT wrap them in `usePersistFn` or assign them to a named variable. `usePersistFn` is reserved for callbacks held by effects/subscriptions, reused across multiple places, or containing multi-line logic that benefits from naming.
2. **`className` concatenation:** Expressions like `cn(...)` or `clsx(...)` must be inlined directly in the JSX `className` prop. Do NOT wrap them in `useDerivedValue`. The only exception is when the class name computation involves actual control flow branches (e.g., multiple `if/else` statements or early returns) that cannot be cleanly expressed in a single inline expression.
3. **Derived expressions:** Simple derived expressions (e.g., math operations, string concatenations, boolean checks) should be inlined in JSX whenever possible. `useDerivedValue` is reserved for derived values that require intermediate variables (to contain their scope), involve actual control flow, or are consumed in multiple places.

**Example:**

```tsx
// ❌ BAD: Over-encapsulation. Wrapping single-line callbacks and simple class names just to follow rules.
const handleChange = usePersistFn((event: ChangeEvent<HTMLInputElement>) => {
  onChange(normalizeAgentEmailInputValue(event.target.value))
})
const handleOpenDialog = usePersistFn(() => {
  openEditEmailNamespaceDialog()
})
const wrapperClassName = useDerivedValue(() => {
  return cn('flex h-[36px] w-full', hasError && 'ring-inset ring-[1px]')
})

return (
  <div className={wrapperClassName}>
    <input onChange={handleChange} />
    <button onClick={handleOpenDialog} />
  </div>
)

// ✅ GOOD: Inline simple expressions and forwarding callbacks.
// Note the recommended style: use block body `{ ... }` for inline callbacks, and pass function references directly when signatures match.
return (
  <div className={cn('flex h-[36px] w-full', hasError && 'ring-inset ring-[1px]')}>
    <input onChange={(event) => { onChange(normalizeAgentEmailInputValue(event.target.value)) }} />
    <button onClick={openEditEmailNamespaceDialog} />
  </div>
)
```

### Rule 8 — Check shared components before building new ones

Before writing any new UI element, you must first check the project's shared component directory (typically `components/`) to determine whether a suitable component already exists. Review the component's **Props interface** (TypeScript types) and any accompanying **documentation or README** to understand its supported variants, slots, and usage patterns. Only after confirming that no existing shared component satisfies the requirement should you proceed to build a new one from scratch.

This rule prevents duplicate implementations of common UI primitives (Button, Dialog, Input, Select, Toast, etc.) and ensures visual and behavioral consistency across the application.

**Workflow:**
1. Identify the UI element you need (e.g., a confirmation dialog, a primary button).
2. Search the `components/` directory for existing implementations.
3. If found: read its Props interface and documentation, then use it directly.
4. If not found: develop the component yourself.
