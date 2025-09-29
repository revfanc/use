import type {
  Component,
  ComponentPublicInstance,
  CSSProperties,
  FunctionalComponent,
  VNode,
} from 'vue'

export interface UseDialogCallback {
  (res: UseDialogRes): void
}

export interface UseDialogRenderProps {
  callback: UseDialogCallback
  [key: string]: any
}

export interface UseDialogRenderFunction {
  (props?: UseDialogRenderProps): VNode
}

export interface UseDialogOptions {
  render: UseDialogRenderFunction | FunctionalComponent | Component | undefined
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  zIndex?: number
  closeOnClickOverlay?: boolean
  overlayStyle?: CSSProperties
  beforeClose?: UseDialogBeforeClose
  [key: string]: any
}

export interface UseDialogRes {
  [key: string]: any
};

export interface UseDialogBeforeClose {
  (close: UseDialogCallback, params: UseDialogRes): void
}

export type DialogWrapperInstance = ComponentPublicInstance<{
  callback: UseDialogCallback
}>
