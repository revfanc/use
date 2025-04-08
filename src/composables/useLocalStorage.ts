import { ref, watch } from 'vue'

export interface UseLocalStorageOptions<T> {
  key: string
  defaultValue: T
  serializer?: (value: T) => string
  deserializer?: (value: string) => T
}

export function useLocalStorage<T>(options: UseLocalStorageOptions<T>) {
  const {
    key,
    defaultValue,
    serializer = JSON.stringify,
    deserializer = JSON.parse
  } = options

  const storedValue = localStorage.getItem(key)
  const value = ref<T>(
    storedValue ? deserializer(storedValue) : defaultValue
  )

  watch(
    value,
    (newValue) => {
      localStorage.setItem(key, serializer(newValue))
    },
    { deep: true }
  )

  return value
} 