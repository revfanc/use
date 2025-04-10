// 导出所有组合式函数
export * from './composables/useDebounce'
export * from './composables/useThrottle'
export { default as useDialog } from './composables/useDialog'

// 类型定义
export type { UseDebounceOptions } from './composables/useDebounce'
export type { UseThrottleOptions } from './composables/useThrottle'
export type { UseDialogOptions, UseDialogRes } from './composables/useDialog/types'
