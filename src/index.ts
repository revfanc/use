// 导出所有组合式函数
export { default as useDialog } from './composables/useDialog'
export type { DialogPosition, DialogProps } from './composables/useDialog/components/Dialog'

// Dialog 类型定义
export type {
  DialogWrapperInstance,
  UseDialogBeforeClose,
  UseDialogCallback,
  UseDialogOptions,
  UseDialogRenderFunction,
  UseDialogRenderProps,
  UseDialogRes,
} from './composables/useDialog/types'
export { useMountComponent } from './composables/useMountComponent'

export type {
  RenderInputPromisifyFn,
  UnmountPromisifyFn,
} from './composables/useMountComponent'
// useMountComponent 类型定义
export type {
  MountOptions,
  RenderCtx,
  RenderFn,
  RenderInput,
  UnmountFn,
} from './composables/useMountComponent/mountComponent'

// 工具类型
export type { default as Interceptors } from './utils/interceptors'
