import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { h, Component, nextTick } from 'vue'
import useDialog from '../useDialog'
import { UseDialogOptions, UseDialogRenderProps } from '../useDialog/types'

describe('useDialog', () => {
  beforeEach(() => {
    // 清理 DOM
    document.body.innerHTML = ''
    // 重置计时器
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // 测试基本打开和关闭功能
  it('should open dialog with basic options', async () => {
    const dialog = useDialog()
    const TestComponent: Component = {
      setup() {
        return () => h('div', { class: 'test-content' }, 'Test Content')
      }
    }

    dialog.open({
      render: TestComponent
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

  // 测试自定义位置
  it('should support custom position', async () => {
    const dialog = useDialog()
    const TestComponent: Component = {
      setup() {
        return () => h('div', { class: 'test-content' }, 'Test Content')
      }
    }

    dialog.open({
      render: TestComponent,
      position: 'top'
    })

    await nextTick()
    vi.advanceTimersByTime(300)

    expect(document.querySelector('.revfanc-dialog-content--top')).toBeTruthy()
  })

  // 测试点击遮罩层关闭
  it('should close on overlay click when enabled', async () => {
    const dialog = useDialog()
    const TestComponent: Component = {
      setup() {
        return () => h('div', { class: 'test-content' }, 'Test Content')
      }
    }

    dialog.open({
      render: TestComponent,
      closeOnClickOverlay: true
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
      if (params.confirm) {
        close(params)
      }
    })

    const TestComponent = (ctx: UseDialogRenderProps) => {
      return h('button', {
        onClick: () => ctx.callback({ confirm: true })
      }, 'Confirm')
    }

    dialog.open({
      render: TestComponent,
      beforeClose: beforeCloseMock
    })

    await nextTick()
    vi.advanceTimersByTime(300)

    expect(document.querySelector('button')).toBeTruthy()

    // 触发确认
    const button = document.querySelector('button')
    button?.click()

    await nextTick()
    vi.advanceTimersByTime(300)

    expect(beforeCloseMock).toHaveBeenCalled()
  })

  // 测试多个对话框的管理
  it('should manage multiple dialogs correctly', async () => {
    const dialog = useDialog()
    const TestComponent1: Component = {
      setup() {
        return () => h('div', { class: 'test-content-1' }, 'Dialog 1')
      }
    }
    const TestComponent2: Component = {
      setup() {
        return () => h('div', { class: 'test-content-2' }, 'Dialog 2')
      }
    }

    // 打开第一个对话框
    dialog.open({
      render: TestComponent1
    })
    await nextTick()

    // 打开第二个对话框
    dialog.open({
      render: TestComponent2
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
        backgroundColor: 'red'
      }
    }

    dialog.setOptions(globalOptions)

    const TestComponent: Component = {
      setup() {
        return () => h('div', { class: 'test-content' }, 'Test Content')
      }
    }

    dialog.open({ render: TestComponent })
    await nextTick()
    vi.advanceTimersByTime(300)

    expect(document.querySelector('.revfanc-dialog-content--bottom')).toBeTruthy()
    expect(document.querySelector('.revfanc-dialog-container')?.getAttribute('style')).toContain('z-index: 1000')
    expect(document.querySelector('.revfanc-dialog-overlay')?.getAttribute('style')).toContain('background-color: red')
  })

  // 测试错误处理
  it('should handle errors properly', async () => {
    const dialog = useDialog()

    // 测试无效的选项
    await expect(dialog.open({} as UseDialogOptions)).rejects.toThrow('The "render" property is required')

    // 测试无效的渲染函数
    await expect(dialog.open({
      render: 'not a function' as any
    })).rejects.toThrow('The "render" property must be a function')
  })
})
