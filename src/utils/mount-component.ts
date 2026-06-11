import type { AppContext, Component } from 'vue'
import { createApp, getCurrentInstance, reactive } from 'vue'

/**
 * 向组件实例暴露公共 API
 * @template T - 暴露的 API 类型
 * @param apis - 要暴露的 API 对象
 */
export function useExpose<T = Record<string, any>>(apis: T) {
  const instance = getCurrentInstance()
  if (instance) {
    Object.assign(instance.proxy as object, apis)
  }
}

/**
 * Popup 状态管理
 * @returns 返回状态对象和控制方法
 */
export function usePopupState() {
  const state = reactive<{
    show: boolean
    [key: string]: any
  }>({
    show: true,
  })

  const toggle = (show: boolean) => {
    state.show = show
  }

  const open = () => toggle(true)

  const close = () => toggle(false)

  useExpose({ open, close, toggle })

  return {
    state,
    open,
    close,
    toggle,
  }
}

/**
 * 挂载 Vue 组件到 DOM
 * @template T - 组件返回的实例类型
 * @param RootComponent - 要挂载的组件
 * @param appContext - Vue App 上下文
 * @returns 返回组件实例和卸载函数
 */
export function mountComponent<T = any>(
  RootComponent: Component,
  appContext?: AppContext,
) {
  const app = createApp(RootComponent)

  // Get the current instance's app context
  if (appContext) {
    // Copy the app context from current instance to the new app
    Object.assign(app._context, appContext)
  }

  const root = document.createElement('div')
  document.body.appendChild(root)

  const instance = app.mount(root) as T

  return {
    instance,
    unmount() {
      app.unmount()
      document.body.removeChild(root)
    },
  }
}
