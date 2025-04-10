import { describe, it, expect } from 'vitest'
import { useCounter } from '../useCounter'

describe('useCounter', () => {
  // 测试默认值
  it('should initialize with default values', () => {
    const { count, isMin, isMax } = useCounter()
    expect(count.value).toBe(0)
    expect(isMin.value).toBe(false)
    expect(isMax.value).toBe(false)
  })

  // 测试自定义初始值
  it('should initialize with custom initial value', () => {
    const { count } = useCounter({ initial: 10 })
    expect(count.value).toBe(10)
  })

  // 测试递增功能
  it('should increment correctly', () => {
    const { count, inc } = useCounter({ initial: 0, step: 2 })
    inc()
    expect(count.value).toBe(2)
  })

  // 测试递减功能
  it('should decrement correctly', () => {
    const { count, dec } = useCounter({ initial: 5, step: 2 })
    dec()
    expect(count.value).toBe(3)
  })

  // 测试最大值限制
  it('should respect max value', () => {
    const { count, inc, isMax } = useCounter({ initial: 8, max: 10, step: 1 })
    inc() // 9
    expect(count.value).toBe(9)
    expect(isMax.value).toBe(false)
    inc() // 10
    expect(count.value).toBe(10)
    expect(isMax.value).toBe(true)
    inc() // should stay at 10
    expect(count.value).toBe(10)
  })

  // 测试最小值限制
  it('should respect min value', () => {
    const { count, dec, isMin } = useCounter({ initial: 2, min: 0, step: 1 })
    dec() // 1
    expect(count.value).toBe(1)
    expect(isMin.value).toBe(false)
    dec() // 0
    expect(count.value).toBe(0)
    expect(isMin.value).toBe(true)
    dec() // should stay at 0
    expect(count.value).toBe(0)
  })

  // 测试设置值功能
  it('should set value correctly within bounds', () => {
    const { count, set } = useCounter({ min: 0, max: 10 })
    set(5)
    expect(count.value).toBe(5)
    set(-1) // should be clamped to min
    expect(count.value).toBe(0)
    set(11) // should be clamped to max
    expect(count.value).toBe(10)
  })

  // 测试重置功能
  it('should reset to initial value', () => {
    const { count, inc, reset } = useCounter({ initial: 5 })
    inc()
    expect(count.value).toBe(6)
    reset()
    expect(count.value).toBe(5)
  })
}) 