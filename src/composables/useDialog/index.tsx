import type { AppContext } from 'vue'
import type {
  DialogWrapperInstance,
  UseDialogCallback,
  UseDialogOptions,
  UseDialogRes,
} from './types'
import type Interceptors from '@/utils/interceptors'
import { getCurrentInstance } from 'vue'
import InterceptorsClass from '@/utils/interceptors'
import { mountComponent, usePopupState } from '@/utils/mount-component'
import RootComponent from './components/Dialog'

import './style.css'

const INIT_OPTIONS: UseDialogOptions = {
  render: undefined,
  position: 'center',
  closeOnClickOverlay: false,
  overlayStyle: undefined,
  zIndex: 999,
  beforeClose: undefined,
}

let queue: DialogWrapperInstance[] = []

let currentOptions: UseDialogOptions = Object.assign({}, INIT_OPTIONS)

const interceptors: Interceptors<UseDialogOptions> = new InterceptorsClass<UseDialogOptions>()

function createInstance<T = any>(
  options: UseDialogOptions<T> & { resolve: (value: UseDialogRes<T>) => void, appContext?: AppContext },
): DialogWrapperInstance<T> {
  const { resolve, appContext, render: optionsRender, ...rest } = options

  if (currentOptions.zIndex !== undefined) {
    currentOptions.zIndex += 5
  }

  const { instance, unmount } = mountComponent(
    {
      setup() {
        const { state, toggle } = usePopupState()

        Object.assign(state, rest)

        const onClosed = () => {
          queue = queue.filter(item => item !== instance)
          unmount()
        }

        const callback: UseDialogCallback<T> = (res) => {
          toggle(false)

          resolve({
            ...res,
            __options__: rest,
          } as UseDialogRes<T>)
        }

        const render = () => {
          const attrs: Record<string, unknown> = {
            render: optionsRender,
            callback,
            onClosed,
          }
          return <RootComponent {...state} {...attrs} />
        };

        // rewrite render function
        (getCurrentInstance() as any).render = render

        return {
          callback,
        }
      },
    },
    appContext,
  )

  queue.push(instance as DialogWrapperInstance<T>)

  return instance as DialogWrapperInstance<T>
}

function useDialog() {
  const appContext = getCurrentInstance()?.appContext

  /**
   * 打开 Dialog（带泛型类型支持）
   * @template T - 回调返回的数据类型
   * @param opts - Dialog 配置选项
   * @param appCtx - 自定义的 App 上下文
   * @returns Promise<UseDialogRes<T>> - Dialog 关闭时返回的结果
   *
   * @example
   * // 不指定类型（向后兼容，结果类型为 any）
   * const res = await dialog.open({ render: MyComponent })
   *
   * @example
   * // 指定明确的返回类型
   * interface Result { confirmed: boolean; data: string }
   * const res = await dialog.open<Result>({ render: MyComponent })
   * // res.confirmed 有类型提示
   */
  const open = <T = any>(
    opts: UseDialogOptions<T>,
    appCtx?: AppContext,
  ): Promise<UseDialogRes<T>> => {
    // 使用 any 来绕过拦截器的类型约束，因为我们返回的是对话框结果而不是选项
    return ((interceptors.execute as any)((options: any) => {
      return new Promise<UseDialogRes<T>>((resolve, reject) => {
        try {
          if (!options || typeof options !== 'object') {
            throw new TypeError('Options must be an object')
          }

          if (!options.render) {
            throw new TypeError('The "render" property is required in options')
          }

          if (
            typeof options.render !== 'function'
            && typeof options.render !== 'object'
          ) {
            throw new TypeError(
              'The "render" property must be a function or a VNode or a component',
            )
          }

          createInstance<T>({
            ...currentOptions,
            ...options,
            appContext: appCtx || appContext,
            resolve,
          })
        }
        catch (error) {
          reject(error)
        }
      })
    }, opts))
  }

  const close = (all?: boolean) => {
    if (!queue.length) {
      return
    }
    if (all) {
      queue.forEach(item => item.callback({ action: 'manual' } as any))
    }
    else {
      queue[queue.length - 1].callback({ action: 'manual' } as any)
    }
  }

  const getInstances = () => {
    return queue
  }

  const setOptions = (options: Partial<UseDialogOptions>): void => {
    currentOptions = Object.assign({}, currentOptions, options)
  }

  return {
    open,
    close,
    interceptors,
    getInstances,
    setOptions,
  }
}

export default useDialog
