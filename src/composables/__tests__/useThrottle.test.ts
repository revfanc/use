import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useThrottle } from '../useThrottle'
import { ref, nextTick } from 'vue'

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // 设置初始时间戳
    vi.setSystemTime(new Date('2024-01-01'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // 测试基本节流功能
  it('should throttle value changes', async () => {
    const sourceValue = ref('initial')
    const throttledValue = useThrottle(sourceValue, { delay: 100 })

    // 初始值应该相同
    expect(throttledValue.value).toBe('initial')

    // 第一次更新
    sourceValue.value = 'changed'
    await nextTick()
    await vi.advanceTimersByTimeAsync(50)
    expect(throttledValue.value).toBe('initial') // 50ms内不应该更新

    // 等待到达节流时间
    await vi.advanceTimersByTimeAsync(50)
    expect(throttledValue.value).toBe('changed') // 现在应该更新了
  })

  // 测试连续更新
  it('should handle multiple updates correctly', async () => {
    const sourceValue = ref('initial')
    const throttledValue = useThrottle(sourceValue, { delay: 100 })

    // 第一次更新
    sourceValue.value = 'change1'
    await nextTick()
    await vi.advanceTimersByTimeAsync(50)
    
    // 第二次更新（在节流时间内）
    sourceValue.value = 'change2'
    await nextTick()
    await vi.advanceTimersByTimeAsync(50) // 总共过了 100ms
    
    // 只应该执行第一次更新
    expect(throttledValue.value).toBe('change1')
    
    // 再等一个完整的节流周期
    await vi.advanceTimersByTimeAsync(100)
    expect(throttledValue.value).toBe('change2')
  })

  // 测试immediate选项
  it('should update immediately when immediate is true', async () => {
    const sourceValue = ref('initial')
    const throttledValue = useThrottle(sourceValue, { 
      delay: 100, 
      immediate: true 
    })

    sourceValue.value = 'changed'
    await nextTick()
    expect(throttledValue.value).toBe('changed') // 应该立即更新

    // 即使是immediate模式，后续更新仍然要遵循节流规则
    sourceValue.value = 'changed again'
    await nextTick()
    expect(throttledValue.value).toBe('changed') // 不应该立即更新第二次

    await vi.advanceTimersByTimeAsync(100)
    expect(throttledValue.value).toBe('changed again') // 现在应该更新了
  })

  // 测试默认值
  it('should use default options', async () => {
    const sourceValue = ref('initial')
    const throttledValue = useThrottle(sourceValue)

    sourceValue.value = 'changed'
    await nextTick()
    await vi.advanceTimersByTimeAsync(500)
    expect(throttledValue.value).toBe('initial') // 500ms内不应该更新

    await vi.advanceTimersByTimeAsync(500) // 总共 1000ms（默认延迟）
    expect(throttledValue.value).toBe('changed')
  })

  // 测试在节流期间的多次更新
  it('should only use latest value in throttle period', async () => {
    const sourceValue = ref('initial')
    const throttledValue = useThrottle(sourceValue, { delay: 100 })

    sourceValue.value = 'change1'
    await nextTick()
    await vi.advanceTimersByTimeAsync(50)

    sourceValue.value = 'change2'
    await nextTick()
    await vi.advanceTimersByTimeAsync(25)

    sourceValue.value = 'change3'
    await nextTick()
    await vi.advanceTimersByTimeAsync(25) // 总共 100ms

    expect(throttledValue.value).toBe('change1')

    // 下一个节流周期
    await vi.advanceTimersByTimeAsync(100)
    expect(throttledValue.value).toBe('change3')
  })

  // 测试不同类型的值
  it('should work with different value types', async () => {
    const numberValue = ref(0)
    const throttledNumber = useThrottle(numberValue, { delay: 100 })

    const objectValue = ref({ count: 0 })
    const throttledObject = useThrottle(objectValue, { delay: 100 })

    numberValue.value = 42
    objectValue.value = { count: 42 }
    await nextTick()

    expect(throttledNumber.value).toBe(0)
    expect(throttledObject.value).toEqual({ count: 0 })

    await vi.advanceTimersByTimeAsync(100)

    expect(throttledNumber.value).toBe(42)
    expect(throttledObject.value).toEqual({ count: 42 })
  })
}) 