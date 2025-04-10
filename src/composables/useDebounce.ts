import { ref, watch } from 'vue'
import type { Ref, ComputedRef } from 'vue'

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

  const update = (newValue: T) => {
    if (timer) {
      clearTimeout(timer)
    }

    if (immediate && !timer) {
      debouncedValue.value = newValue
    }

    timer = setTimeout(() => {
      if (!immediate) {
        debouncedValue.value = newValue
      }
      timer = null
    }, delay)
  }

  watch(
    () => value,
    (newValue) => {
      update(newValue)
    },
    { immediate: true }
  )

  return debouncedValue
}
