# Vue Review Checklist

## Reactivity

- Mutating reactive object properties directly without Vue's reactivity system
- Using `reactive()` for primitives (should use `ref()`)
- Destructuring reactive objects losing reactivity
- Missing `.value` when accessing ref in script
- Replacing entire reactive object instead of modifying properties

## Composition API

- `watch` without cleanup for async operations
- `watchEffect` with side effects that should use `watch`
- Computed properties with side effects
- Missing `onUnmounted` cleanup for subscriptions/timers

## Template

- `v-if` and `v-for` on same element (v-if has higher priority in Vue 3)
- Missing `key` in `v-for` loops
- Complex expressions in templates (should be computed)
- Event handlers with inline complex logic

## Performance

- Large reactive objects when only subset is needed
- Missing `shallowRef`/`shallowReactive` for large data
- Components not lazy loaded for routes
- `v-if` vs `v-show` misuse (frequent toggle vs rare toggle)

## Common Pitfalls

- Async component without error/loading handling
- Props mutation (should emit events instead)
- Missing prop validation or default values
- Teleport target not existing on mount
