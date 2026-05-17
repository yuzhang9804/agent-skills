/**
 * useDerivedValue 用于替代裸的派生计算和大多数 useMemo。
 *
 * 设计目标：
 * 1. 用 hook 形式表达"派生值"语义（自文档化）
 * 2. 把派生过程中的中间变量天然封进 fn 作用域，
 *    避免污染组件主作用域（呼应"组件主作用域不允许中间变量"规则）
 * 3. 不引入 useMemo 的依赖数组心智负担
 *
 * 实现说明：
 * - 实现就是直接调用 fn()，不做任何 memo 化
 * - 大多数业务派生计算都不昂贵，无需 memo
 *
 * 何时仍然使用 useMemo（而非 useDerivedValue）：
 * - 计算开销确实大（profiler 验证过的热点）
 * - 派生值需要引用稳定，供下游 deps / memo 子组件依赖
 *
 * @example
 * // 不推荐：中间变量污染组件主作用域
 * const total = items.reduce((s, x) => s + x.price, 0)
 * const formatted = `合计：¥${total.toFixed(2)}`
 *
 * // 推荐：用 useDerivedValue 收敛中间变量
 * const formatted = useDerivedValue(() => {
 *   const total = items.reduce((s, x) => s + x.price, 0)
 *   return `合计：¥${total.toFixed(2)}`
 * })
 */
export function useDerivedValue<T>(fn: () => T): T {
  return fn()
}
