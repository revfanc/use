import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export interface UseCounterOptions {
  initial?: number
  min?: number
  max?: number
  step?: number
}

export interface UseCounterReturn {
  count: Ref<number>
  inc: () => void
  dec: () => void
  set: (value: number) => void
  reset: () => void
  isMin: ComputedRef<boolean>
  isMax: ComputedRef<boolean>
}

export function useCounter(options: UseCounterOptions = {}): UseCounterReturn {
  const {
    initial = 0,
    min = -Infinity,
    max = Infinity,
    step = 1
  } = options

  const count = ref(initial)

  const inc = () => {
    count.value = Math.min(count.value + step, max)
  }

  const dec = () => {
    count.value = Math.max(count.value - step, min)
  }

  const set = (value: number) => {
    count.value = Math.min(Math.max(value, min), max)
  }

  const reset = () => {
    count.value = initial
  }

  const isMin = computed(() => count.value <= min)
  const isMax = computed(() => count.value >= max)

  return {
    count,
    inc,
    dec,
    set,
    reset,
    isMin,
    isMax
  }
}
