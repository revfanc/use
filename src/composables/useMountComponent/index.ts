import type { VNode } from 'vue'
import type { MountOptions, RenderCtx, UnmountFn } from './mountComponent'
import { getCurrentInstance } from 'vue'
import { mountComponent } from './mountComponent'

/**
 * 卸载函数类型（Promise 版本）
 * @template T - 返回的数据类型
 */
export type UnmountPromisifyFn<T> = (arg?: T) => void

/**
 * Promise 化的渲染函数类型
 * @template T - 返回的数据类型
 */
export type RenderInputPromisifyFn<T> = (
  ctx: RenderCtx & { unmount: UnmountPromisifyFn<T> }
) => VNode

const unmountList: Array<UnmountFn> = []

function addUnmount(unmount: UnmountFn) {
  const index = unmountList.findIndex(item => item === unmount)
  if (index === -1) {
    unmountList.push(unmount)
  }
}

/**
 * 挂载组件的 Composable
 * @returns 返回 mount、mountPromisify 和 unmountAll 方法
 */
export function useMountComponent() {
  const appContext = getCurrentInstance()!.appContext

  /**
   * 挂载组件
   * @param param - 挂载选项
   * @returns 卸载函数
   */
  function mount(param: MountOptions): UnmountFn {
    const unmount = mountComponent(Object.assign({ appContext }, param) as MountOptions)
    addUnmount(unmount)
    return unmount
  }

  /**
   * Promise 化的组件挂载
   * @template T - 返回的数据类型
   * @param param - 挂载选项（render 为 Promise 化的渲染函数）
   * @returns Promise<T> - 返回组件卸载时的数据
   */
  function mountPromisify<T>(
    param: Omit<MountOptions, 'render'> & { render: RenderInputPromisifyFn<T> },
  ): Promise<T> {
    return new Promise<T>((resolve) => {
      mountComponent({
        appContext,
        ...(param as Omit<MountOptions, 'render'>),
        render: (ctx: RenderCtx) => {
          const unmount = (arg?: T) => {
            resolve(arg as T)
            ctx.unmount()
          }
          addUnmount(unmount)
          return (param.render as RenderInputPromisifyFn<T>)({
            ...(ctx as RenderCtx),
            unmount,
          })
        },
      } as MountOptions)
    })
  }

  /**
   * 卸载所有已挂载的组件
   */
  function unmountAll() {
    unmountList.forEach((unmount) => {
      unmount()
    })
    unmountList.splice(0, unmountList.length)
  }

  return {
    mount,
    mountPromisify,
    unmountAll,
  }
}
