import type { Component } from 'vue'
import type {
  UseDialogOptions,
  UseDialogRenderProps,
  UseDialogRes,
} from '../useDialog/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import useDialog from '../useDialog'

describe('useDialog', () => {
  beforeEach(() => {
    // 重置计时器
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()

    const dialog = useDialog()

    // 清除拦截器
    dialog.interceptors.before.clear()
    dialog.interceptors.after.clear()

    // 关闭所有对话框
    dialog.close(true)
  })

  // 测试基本打开和全局关闭功能
  it('should open dialog and close globally', async () => {
    const dialog = useDialog()
    const TestComponent: Component = {
      setup() {
        return () => h('div', { class: 'test-content' }, 'Test Content')
      },
    }

    dialog.open({
      render: TestComponent,
    })

    // 等待 DOM 更新
    await nextTick()
    // 等待过渡动画完成
    vi.advanceTimersByTime(300)

    // 检查 DOM 中是否存在对话框
    expect(document.querySelector('.test-content')).toBeTruthy()

    // 关闭对话框
    dialog.close()

    // 等待 DOM 更新
    await nextTick()
    // 等待过渡动画完成
    vi.advanceTimersByTime(300)

    // 验证对话框已关闭
    expect(document.querySelector('.test-content')).toBeFalsy()
  })

  // 测试基本打开和组件内关闭功能
  it('should open dialog and close in component', async () => {
    const dialog = useDialog()
    const TestComponent: Component = {
      setup(_, { emit }) {
        return () =>
          h(
            'div',
            {
              class: 'test-content',
              style: 'width: 200px; height: 200px',
              onClick: () => emit('action', { confirm: true }),
            },
            'Test Content',
          )
      },
    }

    dialog.open({
      render(context: any) {
        return h(TestComponent, { onAction: context.callback })
      },
    })

    // 等待 DOM 更新
    await nextTick()
    // 等待过渡动画完成
    vi.advanceTimersByTime(300)

    // 检查 DOM 中是否存在对话框
    expect(document.querySelector('.test-content')).toBeTruthy()

    // 触发对话框关闭
    const testContent = document.querySelector('.test-content')
    testContent?.dispatchEvent(new Event('click'))

    // 等待 DOM 更新
    await nextTick()
    // 等待过渡动画完成
    vi.advanceTimersByTime(300)

    // 验证对话框已关闭
    expect(document.querySelector('.test-content')).toBeFalsy()
  })

  // 测试自定义位置 bottom
  it('should support custom position bottom', async () => {
    const dialog = useDialog()
    const TestComponent: Component = {
      setup() {
        return () =>
          h(
            'div',
            {
              class: 'test-content',
              style: 'width: 200px; height: 200px; display: flex',
            },
            'Test Content',
          )
      },
    }

    dialog.open({
      render: TestComponent,
      position: 'bottom',
    })

    await nextTick()
    vi.advanceTimersByTime(300)

    const content: HTMLElement | null = document.querySelector(
      '.revfanc-dialog-content--bottom',
    )

    expect(content).toBeTruthy()
  })

  // 测试点击遮罩层关闭
  it('should close on overlay click when enabled', async () => {
    const dialog = useDialog()
    const TestComponent: Component = {
      setup() {
        return () => h('div', { class: 'test-content' }, 'Test Content')
      },
    }

    dialog.open({
      render: TestComponent,
      closeOnClickOverlay: true,
    })

    await nextTick()
    vi.advanceTimersByTime(300)

    // 模拟点击遮罩层
    const overlay = document.querySelector('.revfanc-dialog-overlay')
    overlay?.dispatchEvent(new Event('click'))

    await nextTick()
    vi.advanceTimersByTime(300)

    expect(document.querySelector('.test-content')).toBeFalsy()
  })

  // 测试beforeClose钩子
  it('should handle beforeClose hook', async () => {
    const dialog = useDialog()
    const beforeCloseMock = vi.fn((close, params) => {
      if (params.action === 'confirm') {
        close(params)
      }
    })
    const resultMock = vi.fn()

    const TestComponent = (ctx: UseDialogRenderProps) => {
      return h('div', [
        h(
          'button',
          {
            class: 'btn1',
            onClick: () => ctx.callback({ action: 'confirm' }),
          },
          'Confirm',
        ),
        h(
          'button',
          {
            class: 'btn2',
            onClick: () => ctx.callback({ action: 'cancel' }),
          },
          'Cancel',
        ),
      ])
    }

    dialog
      .open({
        render: TestComponent,
        beforeClose: beforeCloseMock,
      })
      .then(resultMock)

    await nextTick()
    vi.advanceTimersByTime(300)

    expect(document.querySelector('.btn1')).toBeTruthy()

    // 取消按钮点击
    const btn2 = document.querySelector('.btn2')
    btn2?.dispatchEvent(new Event('click'))

    await nextTick()
    vi.advanceTimersByTime(300)

    expect(beforeCloseMock).toHaveBeenCalled()
    expect(resultMock).not.toHaveBeenCalled()
    expect(document.querySelector('.btn2')).toBeTruthy()

    // 确认按钮点击
    const btn1 = document.querySelector('.btn1')
    btn1?.dispatchEvent(new Event('click'))

    await nextTick()
    vi.advanceTimersByTime(300)

    expect(beforeCloseMock).toHaveBeenCalled()
    await nextTick()
    expect(resultMock).toHaveBeenCalled()
    expect(document.querySelector('.btn1')).toBeFalsy()
  })

  // 测试多个对话框的管理
  it('should manage multiple dialogs correctly', async () => {
    const dialog = useDialog()
    const TestComponent1: Component = {
      setup() {
        return () => h('div', { class: 'test-content-1' }, 'Dialog 1')
      },
    }
    const TestComponent2: Component = {
      setup() {
        return () => h('div', { class: 'test-content-2' }, 'Dialog 2')
      },
    }

    // 打开第一个对话框
    dialog.open({
      render: TestComponent1,
    })
    await nextTick()

    // 打开第二个对话框
    dialog.open({
      render: TestComponent2,
    })
    await nextTick()

    // 验证两个对话框都存在
    expect(document.querySelector('.test-content-1')).toBeTruthy()
    expect(document.querySelector('.test-content-2')).toBeTruthy()

    // 关闭第尔个对话框
    dialog.close()
    await nextTick()
    vi.advanceTimersByTime(300)

    // 验证第二个对话框已关闭，第一个仍然存在
    expect(document.querySelector('.test-content-1')).toBeTruthy()
    expect(document.querySelector('.test-content-2')).toBeFalsy()

    // 关闭第二个对话框
    dialog.close()
    await nextTick()
    vi.advanceTimersByTime(300)

    // 验证所有对话框都已关闭
    expect(document.querySelector('.test-content-1')).toBeFalsy()
    expect(document.querySelector('.test-content-2')).toBeFalsy()
  })

  // 测试全局配置
  it('should apply global options', async () => {
    const dialog = useDialog()
    const globalOptions: Partial<UseDialogOptions> = {
      position: 'bottom',
      zIndex: 1000,
      overlayStyle: {
        backgroundColor: 'red',
      },
    }

    dialog.setOptions(globalOptions)

    const TestComponent: Component = {
      setup() {
        return () => h('div', { class: 'test-content' }, 'Test Content')
      },
    }

    dialog.open({ render: TestComponent })
    await nextTick()
    vi.advanceTimersByTime(300)

    expect(
      document.querySelector('.revfanc-dialog-content--bottom'),
    ).toBeTruthy()
    expect(
      document.querySelector('.revfanc-dialog-container')?.getAttribute('style'),
    ).toContain('z-index: 1000')
    expect(
      document.querySelector('.revfanc-dialog-overlay')?.getAttribute('style'),
    ).toContain('background-color: red')
  })

  // 测试拦截器interceptors
  it('should apply interceptors', async () => {
    const dialog = useDialog()
    const TestComponent1: Component = {
      setup() {
        return () => h('div', { class: 'test-content1' }, 'Test Content1')
      },
    }

    const beforeMock = vi.fn((options: UseDialogOptions) => {
      return options
    })
    const afterMock = vi.fn((res: UseDialogRes) => {
      return res
    })

    dialog.interceptors.before.use(beforeMock)
    dialog.interceptors.after.use(afterMock)

    dialog.open({ render: TestComponent1 }).then(() => {
      expect(afterMock).toHaveBeenCalled()
    })
    await nextTick()
    vi.advanceTimersByTime(300)

    expect(beforeMock).toHaveBeenCalled()

    dialog.close()
  })

  // 测试 getInstances
  it('should get instances', async () => {
    const dialog = useDialog()
    const TestComponent: Component = {
      setup() {
        return () => h('div', { class: 'test-content' }, 'Test Content')
      },
    }

    dialog.open({ render: TestComponent })
    await nextTick()
    vi.advanceTimersByTime(300)

    expect(dialog.getInstances().length).toBe(1)

    dialog.open({ render: TestComponent })
    await nextTick()
    vi.advanceTimersByTime(300)

    expect(dialog.getInstances().length).toBe(2)
  })

  // 测试渲染实例和运行环境实例的上下文是否一致
  it('should render and run in the same context', async () => {
    const fnMock = vi.fn(() => {})

    const app = createApp({})

    app.config.globalProperties.$test = fnMock

    const dialog = useDialog()

    const TestComponent: Component = {
      setup() {
        return () => h('div', { class: 'test-content' }, 'Test Content')
      },
      mounted() {
        if (typeof this.$test === 'function')
          this.$test()
      },
    }

    dialog.open({ render: TestComponent }, app._context)
    await nextTick()
    vi.advanceTimersByTime(300)

    expect(fnMock).toHaveBeenCalled()
  })

  // 测试错误处理
  it('should handle errors properly', async () => {
    const dialog = useDialog()

    // 测试无效的选项
    await expect(dialog.open({} as UseDialogOptions)).rejects.toThrow(
      'The "render" property is required',
    )

    // 测试无效的渲染函数
    await expect(
      dialog.open({
        render: 'not a function' as any,
      }),
    ).rejects.toThrow('The "render" property must be a function')
  })
})
