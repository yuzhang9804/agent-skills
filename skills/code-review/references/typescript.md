# TypeScript Review Checklist

## Type Safety

- `any` type usage (should use `unknown` or proper types)
- Type assertions (`as`) bypassing type checks
- Non-null assertions (`!`) hiding potential null errors
- Missing return type annotations on public APIs
- `@ts-ignore` or `@ts-expect-error` without justification

## Type Design

- Overly broad types (`string` when union of literals is better)
- Missing discriminated unions for state machines
- Optional properties when `| undefined` is more explicit
- Inconsistent null vs undefined usage
- Missing readonly for immutable data

## Generics

- Generic type parameters unused or too broad
- Missing generic constraints
- Hardcoded types where generics would improve reusability

## Common Pitfalls

- Type narrowing not working due to reassignment
- Object spread losing type narrowing
- Enum vs const enum vs union type misuse
- Missing `satisfies` for type checking object literals
- Structural typing surprises (excess property checks)
