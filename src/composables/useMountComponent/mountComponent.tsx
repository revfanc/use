/**
 * 简易的组件挂载方法
 */
import type { AppContext, Component, Ref, VNode } from 'vue'
import {
  createVNode,
  defineComponent,
  getCurrentInstance,
  h,
  isVNode,
  ref,
  render,
  Transition,
} from 'vue'

const TRANSITION_DURATION = 300
const CSS_CLASS_PREFIX = 'revfanc-mount-component'

let stylesInjected = false

function injectTransitionStyles() {
  if (stylesInjected)
    return
  stylesInjected = true

  const style = document.createElement('style')
  style.textContent = `
    .${CSS_CLASS_PREFIX}-fade-enter-active,
    .${CSS_CLASS_PREFIX}-fade-leave-active,
    .${CSS_CLASS_PREFIX}-slide-up-enter-active,
    .${CSS_CLASS_PREFIX}-slide-up-leave-active,
    .${CSS_CLASS_PREFIX}-slide-down-enter-active,
    .${CSS_CLASS_PREFIX}-slide-down-leave-active,
    .${CSS_CLASS_PREFIX}-slide-left-enter-active,
    .${CSS_CLASS_PREFIX}-slide-left-leave-active,
    .${CSS_CLASS_PREFIX}-slide-right-enter-active,
    .${CSS_CLASS_PREFIX}-slide-right-leave-active {
      transition: all ${TRANSITION_DURATION}ms ease-in-out;
    }
    .${CSS_CLASS_PREFIX}-fade-enter-from,
    .${CSS_CLASS_PREFIX}-fade-leave-to {
      opacity: 0;
    }
    .${CSS_CLASS_PREFIX}-slide-up-enter-from,
    .${CSS_CLASS_PREFIX}-slide-up-leave-to {
      transform: translateY(100%);
      opacity: 0;
    }
    .${CSS_CLASS_PREFIX}-slide-down-enter-from,
    .${CSS_CLASS_PREFIX}-slide-down-leave-to {
      transform: translateY(-100%);
      opacity: 0;
    }
    .${CSS_CLASS_PREFIX}-slide-left-enter-from,
    .${CSS_CLASS_PREFIX}-slide-left-leave-to {
      transform: translateX(100%);
      opacity: 0;
    }
    .${CSS_CLASS_PREFIX}-slide-right-enter-from,
    .${CSS_CLASS_PREFIX}-slide-right-leave-to {
      transform: translateX(-100%);
      opacity: 0;
    }
  `
  document.head.appendChild(style)
}

type TransitionName = 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'

export type UnmountFn = () => void

export type RenderFn = (ctx: RenderCtx) => VNode

export interface RenderCtx {
  unmount: UnmountFn
  container: HTMLElement
  mountTarget: HTMLElement
  transition?: TransitionName
  isMounted: Ref<boolean>
}

export type RenderInput = RenderFn | VNode | Component

export interface MountOptions {
  render: RenderInput // 统一入口：函数/VNode/组件
  transition?: TransitionName
  appContext?: AppContext
  mountTo?: HTMLElement | string
}

interface CommonOptions {
  transition?: TransitionName
  appContext?: AppContext
  mountTo?: HTMLElement | string
}

/**
 * 挂载组件
 * @param options - 挂载选项
 * @param options.render - 统一渲染入口：支持 render(ctx)/VNode/Component
 * @param options.transition - 动画名称
 * @param options.appContext - 自定义app上下文
 * @param options.mountTo - 挂载目标，可以是DOM元素或CSS选择器字符串，默认为document.body
 * @returns - 卸载函数
 */
export function mountComponent(options: { render: RenderFn } & CommonOptions): UnmountFn
export function mountComponent(options: { render: VNode | Component } & CommonOptions): UnmountFn
export function mountComponent(options: MountOptions): UnmountFn {
  let isUnmounted = false

  const container = document.createElement('div')

  const mountTarget
    = typeof options.mountTo === 'string'
      ? (document.querySelector(options.mountTo) as HTMLElement) || document.body
      : options.mountTo || document.body

  mountTarget.appendChild(container)

  const show = ref(false)

  if (options.transition) {
    injectTransitionStyles()
  }

  const doUnmount = () => {
    if (isUnmounted)
      return
    isUnmounted = true
    show.value = false
    setTimeout(
      () => {
        render(null, container)
        if (container.parentNode) {
          container.parentNode.removeChild(container)
        }
      },
      options.transition ? TRANSITION_DURATION : 0,
    )
  }

  const WrapperComponent = defineComponent({
    setup() {
      const content = () => {
        if (!show.value)
          return null
        if (!options.render)
          return null

        let renderContent
        if (typeof options.render === 'function') {
          renderContent = (options.render as RenderFn)({
            unmount: doUnmount,
            container,
            mountTarget,
            transition: options.transition,
            isMounted: show,
          })
        }
        else if (isVNode(options.render)) {
          renderContent = options.render
        }
        else {
          renderContent = h(options.render as Component)
        }

        return renderContent
      }

      return () => (
        <Transition
          name={options.transition ? `${CSS_CLASS_PREFIX}-${options.transition}` : undefined}
          appear={!!options.transition}
        >
          {content()}
        </Transition>
      )
    },
  })

  const vnode = createVNode(WrapperComponent)

  const appContext = options.appContext || getCurrentInstance()?.appContext
  if (appContext) {
    vnode.appContext = appContext
  }

  render(vnode, container)

  requestAnimationFrame(() => {
    if (!isUnmounted) {
      show.value = true
    }
  })

  return doUnmount
}
