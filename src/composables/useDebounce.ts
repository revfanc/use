import { ref, watch } from 'vue'

export interface UseDebounceOptions {
  delay?: number
  immediate?: boolean
}

export function useDebounce<T>(value: T, options: UseDebounceOptions = {}) {
  const {
    delay = 1000,
    immediate = false
  } = options

  const debouncedValue = ref<T>(value)

  let timer: NodeJS.Timeout | null = null

  watch(
    value,
    (newValue) => {
      if (timer) clearTimeout(timer)
      
      if (immediate) {
        debouncedValue.value = newValue
      } else {
        timer = setTimeout(() => {
          debouncedValue.value = newValue
        }, delay)
      }
    }
  )

  return debouncedValue
} 