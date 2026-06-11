import type {
  Component,
  ComponentPublicInstance,
  CSSProperties,
  FunctionalComponent,
  VNode,
} from 'vue'

/**
 * Dialog 回调结果类型（泛型版本）
 * @template T - 回调返回的数据类型，默认为 any（向后兼容）
 */
export type UseDialogRes<T = any> = T & {
  action?: string
}

/**
 * Dialog 回调函数类型（泛型版本）
 * @template T - 回调返回的数据类型
 */
export interface UseDialogCallback<T = any> {
  (res: UseDialogRes<T>): void
}

/**
 * Dialog 渲染函数的 Props（泛型版本）
 * @template T - 回调数据类型
 */
export interface UseDialogRenderProps<T = any> {
  callback: UseDialogCallback<T>
  [key: string]: any
}

/**
 * Dialog 渲染函数类型（泛型版本）
 * @template T - 回调数据类型
 */
export interface UseDialogRenderFunction<T = any> {
  (props?: UseDialogRenderProps<T>): VNode
}

/**
 * Dialog 关闭前的回调类型（泛型版本）
 * @template T - 回调数据类型
 */
export interface UseDialogBeforeClose<T = any> {
  (close: UseDialogCallback<T>, params: UseDialogRes<T>): void
}

/**
 * Dialog 配置选项类型（泛型版本）
 * @template T - 回调数据类型
 */
export interface UseDialogOptions<T = any> {
  render: UseDialogRenderFunction<T> | FunctionalComponent | Component | undefined
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  zIndex?: number
  closeOnClickOverlay?: boolean
  overlayStyle?: CSSProperties
  beforeClose?: UseDialogBeforeClose<T>
  [key: string]: any
}

/**
 * Dialog 包装组件实例类型（泛型版本）
 * @template T - 回调数据类型
 */
export type DialogWrapperInstance<T = any> = ComponentPublicInstance<{
  callback: UseDialogCallback<T>
}>
