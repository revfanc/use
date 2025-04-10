import { ref, watch, onUnmounted } from 'vue'

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
  let timeoutId: NodeJS.Timeout | null = null
  let latestValue = value

  // Function to update the throttled value
  const updateValue = () => {
    throttledValue.value = latestValue
    lastExecuted = Date.now()
    timeoutId = null
  }

  watch(
    () => value,
    (newValue) => {
      latestValue = newValue
      const now = Date.now()
      const timeSinceLastExecution = now - lastExecuted

      if (timeoutId) {
        // Already scheduled, just update latest value
        return
      }

      if (immediate && lastExecuted === 0) {
        // First execution with immediate flag
        updateValue()
        return
      }

      if (timeSinceLastExecution >= delay) {
        // Enough time has passed, update immediately
        updateValue()
      } else {
        // Schedule update for remaining time
        timeoutId = setTimeout(() => {
          updateValue()
        }, delay - timeSinceLastExecution)
      }
    },
    { immediate: true }
  )

  // Cleanup on component unmount
  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  })

  return throttledValue
}
