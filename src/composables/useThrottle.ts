import { ref, watch } from 'vue'

export interface UseThrottleOptions {
  delay?: number
  immediate?: boolean
}

export function useThrottle<T>(value: T, options: UseThrottleOptions = {}) {
  const {
    delay = 1000,
    immediate = false
  } = options

  const throttledValue = ref<T>(value)
  let lastExecuted = 0

  watch(
    value,
    (newValue) => {
      const now = Date.now()
      
      if (immediate) {
        throttledValue.value = newValue
      } else if (now - lastExecuted >= delay) {
        throttledValue.value = newValue
        lastExecuted = now
      }
    }
  )

  return throttledValue
} 