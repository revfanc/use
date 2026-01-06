import type { AppContext } from 'vue'
import type { MountOptions, RenderCtx, UnmountFn } from '../useMountComponent/mountComponent'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as Vue from 'vue'
import { useMountComponent } from '../useMountComponent'
import * as MountModule from '../useMountComponent/mountComponent'

vi.mock('vue', async () => {
  const actual = await vi.importActual<typeof import('vue')>('vue')
  return {
    ...actual,
    getCurrentInstance: vi.fn(),
  }
})

describe('useMountComponent', () => {
  let appContext: AppContext

  beforeEach(() => {
    appContext = {} as AppContext

    const getCurrentInstanceMock = Vue.getCurrentInstance as any
    getCurrentInstanceMock.mockReturnValue({ appContext } as any)
  })

  afterEach(() => {
    const { unmountAll } = useMountComponent()
    unmountAll()
  })

  it('should mount component with appContext and register unmount function', () => {
    const mountComponentMock = vi
      .spyOn(MountModule, 'mountComponent')
      .mockImplementation((_options: MountOptions): UnmountFn => {
        return vi.fn()
      })

    const { mount, unmountAll } = useMountComponent()

    const unmount = mount({
      render: {} as any,
    } as MountOptions)

    expect(typeof unmount).toBe('function')
    expect(mountComponentMock).toHaveBeenCalledTimes(1)
    expect(mountComponentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        appContext,
        render: {} as any,
      }),
    )

    const unmountSpy = mountComponentMock.mock.results[0].value as unknown as () => void

    unmountAll()
    expect(unmountSpy).toHaveBeenCalledTimes(1)

    unmountAll()
    expect(unmountSpy).toHaveBeenCalledTimes(1)
  })

  it('should not register duplicate unmount functions', () => {
    const unmountSpy = vi.fn()

    vi.spyOn(MountModule, 'mountComponent').mockImplementation(
      (_options: MountOptions): UnmountFn => {
        return unmountSpy
      },
    )

    const { mount, unmountAll } = useMountComponent()

    mount({ render: {} as any } as MountOptions)
    mount({ render: {} as any } as MountOptions)

    unmountAll()
    expect(unmountSpy).toHaveBeenCalledTimes(1)

    unmountAll()
    expect(unmountSpy).toHaveBeenCalledTimes(1)
  })

  it('should resolve mountPromisify and call original ctx.unmount', async () => {
    let capturedRender: ((ctx: RenderCtx) => any) | null = null

    vi.spyOn(MountModule, 'mountComponent').mockImplementation(
      (options: MountOptions): UnmountFn => {
        capturedRender = options.render as (ctx: RenderCtx) => any
        return vi.fn()
      },
    )

    const { mountPromisify } = useMountComponent()

    const ctxUnmount = vi.fn()

    const promise = mountPromisify<{ success: boolean }>({
      render: vi.fn(({ unmount }) => {
        unmount({ success: true })
        return {} as any
      }),
    } as any)

    expect(capturedRender).toBeTruthy()

    capturedRender!({
      unmount: ctxUnmount,
      container: document.createElement('div'),
      mountTarget: document.body,
      isMounted: { value: true } as any,
    } as RenderCtx)

    const result = await promise
    expect(result).toEqual({ success: true })
    expect(ctxUnmount).toHaveBeenCalled()
  })
})
