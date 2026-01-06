import type { VNode } from 'vue'
import type { MountOptions, RenderCtx, UnmountFn } from './mountComponent'
import { getCurrentInstance } from 'vue'
import { mountComponent } from './mountComponent'

export type UnmountPromisifyFn<T> = (arg?: T) => void
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

export function useMountComponent() {
  const appContext = getCurrentInstance()!.appContext

  function mount(param: MountOptions): UnmountFn {
    const unmount = mountComponent(Object.assign({ appContext }, param) as MountOptions)
    addUnmount(unmount)
    return unmount
  }

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
