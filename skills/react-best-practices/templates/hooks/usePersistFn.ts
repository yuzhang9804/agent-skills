import { useRef } from 'react'

type noop = (...args: any[]) => any

/**
 * usePersistFn 用于替代 useCallback。
 *
 * 设计目标：
 * 1. 返回的函数引用永远稳定（跨 render 不变）
 * 2. 函数体内访问的 state / props 永远是最新值
 *
 * 适用场景：
 * - 传给 memo 化子组件的事件回调
 * - 放进 useEffect / 订阅 / 事件监听 的回调
 * - 任何需要"引用稳定 + 闭包永远最新"的业务函数
 *
 * 与 useCallback 的区别：
 * - useCallback 的引用稳定性依赖 deps 数组，deps 一变就重建，心智负担大
 * - usePersistFn 引用永不变，且不需要写 deps，业务无需关心
 */
export function usePersistFn<T extends noop>(fn: T) {
  const fnRef = useRef<T>(fn)
  fnRef.current = fn

  const persistFn = useRef<T>()
  if (!persistFn.current) {
    persistFn.current = function (this: unknown, ...args) {
      return fnRef.current!.apply(this, args)
    } as T
  }

  return persistFn.current!
}
