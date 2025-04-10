import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useDebounce } from '../useDebounce'
import { ref, nextTick } from 'vue'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // 测试基本防抖功能
  it('should debounce value changes', async () => {
    const sourceValue = ref('initial')
    const debouncedValue = useDebounce(sourceValue, { delay: 100 })

    // 初始值应该相同
    expect(debouncedValue.value).toBe('initial')

    // 更新值
    sourceValue.value = 'changed'
    await nextTick()
    expect(debouncedValue.value).toBe('initial') // 应该还是初始值

    // 等待 50ms（小于延迟时间）
    await vi.advanceTimersByTimeAsync(50)
    expect(debouncedValue.value).toBe('initial') // 仍然是初始值

    // 等待剩余时间
    await vi.advanceTimersByTimeAsync(50)
    expect(debouncedValue.value).toBe('changed') // 现在应该更新了
  })

  // 测试连续更新
  it('should handle multiple updates correctly', async () => {
    const sourceValue = ref('initial')
    const debouncedValue = useDebounce(sourceValue, { delay: 100 })

    sourceValue.value = 'change1'
    await nextTick()
    await vi.advanceTimersByTimeAsync(50)
    
    sourceValue.value = 'change2'
    await nextTick()
    await vi.advanceTimersByTimeAsync(50)
    
    expect(debouncedValue.value).toBe('initial')
    
    await vi.advanceTimersByTimeAsync(50)
    expect(debouncedValue.value).toBe('change2')
  })

  // 测试immediate选项
  it('should update immediately when immediate is true', async () => {
    const sourceValue = ref('initial')
    const debouncedValue = useDebounce(sourceValue, { 
      delay: 100, 
      immediate: true 
    })

    sourceValue.value = 'changed'
    await nextTick()
    expect(debouncedValue.value).toBe('changed') // 应该立即更新

    sourceValue.value = 'changed again'
    await nextTick()
    expect(debouncedValue.value).toBe('changed again') // 应该再次立即更新
  })

  // 测试默认值
  it('should use default options', async () => {
    const sourceValue = ref('initial')
    const debouncedValue = useDebounce(sourceValue)

    sourceValue.value = 'changed'
    await nextTick()
    expect(debouncedValue.value).toBe('initial')

    await vi.advanceTimersByTimeAsync(500)
    expect(debouncedValue.value).toBe('initial')

    await vi.advanceTimersByTimeAsync(500)
    expect(debouncedValue.value).toBe('changed')
  })

  // 测试清理定时器
  it('should clear previous timer on rapid updates', async () => {
    const sourceValue = ref('initial')
    const debouncedValue = useDebounce(sourceValue, { delay: 100 })

    sourceValue.value = 'change1'
    await nextTick()
    await vi.advanceTimersByTimeAsync(50)

    sourceValue.value = 'change2'
    await nextTick()
    await vi.advanceTimersByTimeAsync(50)

    sourceValue.value = 'change3'
    await nextTick()
    await vi.advanceTimersByTimeAsync(50)

    expect(debouncedValue.value).toBe('initial')

    await vi.advanceTimersByTimeAsync(50)
    expect(debouncedValue.value).toBe('change3')
  })

  // 测试不同类型的值
  it('should work with different value types', async () => {
    const numberValue = ref(0)
    const debouncedNumber = useDebounce(numberValue, { delay: 100 })

    const objectValue = ref({ count: 0 })
    const debouncedObject = useDebounce(objectValue, { delay: 100 })

    numberValue.value = 42
    objectValue.value = { count: 42 }
    await nextTick()

    expect(debouncedNumber.value).toBe(0)
    expect(debouncedObject.value).toEqual({ count: 0 })

    await vi.advanceTimersByTimeAsync(100)

    expect(debouncedNumber.value).toBe(42)
    expect(debouncedObject.value).toEqual({ count: 42 })
  })
}) 