import type { AppContext, Component } from 'vue'
import { createApp, getCurrentInstance, reactive } from 'vue'

export function useExpose<T = Record<string, any>>(apis: T) {
  const instance = getCurrentInstance()
  if (instance) {
    Object.assign(instance.proxy as object, apis)
  }
}

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

export function mountComponent(
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

  return {
    instance: app.mount(root),
    unmount() {
      app.unmount()

      document.body.removeChild(root)
    },
  }
}
