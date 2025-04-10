import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, Component } from 'vue'
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

  // // 测试基本打开功能
  // it('should open dialog with basic options', async () => {
  //   const dialog = useDialog()
  //   const TestComponent: Component = {
  //     setup() {
  //       return () => h('div', { class: 'test-content' }, 'Test Content')
  //     }
  //   }

  //   const promise = dialog.open({
  //     render: TestComponent
  //   })

  //   await vi.runAllTimers()

  //   // 检查 DOM 中是否存在对话框
  //   expect(document.querySelector('.test-content')).toBeTruthy()
    
  //   // 关闭对话框
  //   dialog.close()
  //   await vi.runAllTimers()
    
  //   // 验证对话框已关闭
  //   expect(document.querySelector('.test-content')).toBeFalsy()
  // })

  // // 测试自定义位置
  // it('should support custom position', async () => {
  //   const dialog = useDialog()
  //   const TestComponent: Component = {
  //     setup() {
  //       return () => h('div', { class: 'test-content' }, 'Test Content')
  //     }
  //   }

  //   dialog.open({
  //     render: TestComponent,
  //     position: 'top'
  //   })

  //   await vi.runAllTimers()
    
  //   const dialogElement = document.querySelector('.dialog-wrapper')
  //   expect(dialogElement?.getAttribute('data-position')).toBe('top')
  // })

  // // 测试点击遮罩层关闭
  // it('should close on overlay click when enabled', async () => {
  //   const dialog = useDialog()
  //   const TestComponent: Component = {
  //     setup() {
  //       return () => h('div', { class: 'test-content' }, 'Test Content')
  //     }
  //   }

  //   dialog.open({
  //     render: TestComponent,
  //     closeOnClickOverlay: true
  //   })

  //   await vi.runAllTimers()

  //   // 模拟点击遮罩层
  //   const overlay = document.querySelector('.dialog-overlay')
  //   overlay?.dispatchEvent(new Event('click'))
    
  //   await vi.runAllTimers()
    
  //   expect(document.querySelector('.test-content')).toBeFalsy()
  // })

  // // 测试beforeClose钩子
  // it('should handle beforeClose hook', async () => {
  //   const dialog = useDialog()
  //   const beforeCloseMock = vi.fn((close, params) => {
  //     if (params.confirm) {
  //       close(params)
  //     }
  //   })

  //   const TestComponent = (props: UseDialogRenderProps) => {
  //     return h('button', {
  //       onClick: () => props.callback({ confirm: true })
  //     }, 'Confirm')
  //   }

  //   dialog.open({
  //     render: TestComponent,
  //     beforeClose: beforeCloseMock
  //   })

  //   await vi.runAllTimers()

  //   // 触发确认
  //   const button = document.querySelector('button')
  //   button?.click()
    
  //   await vi.runAllTimers()

  //   expect(beforeCloseMock).toHaveBeenCalled()
  // })

  // // 测试多个对话框的管理
  // it('should manage multiple dialogs correctly', async () => {
  //   const dialog = useDialog()
  //   const TestComponent: Component = {
  //     setup() {
  //       return () => h('div', { class: 'test-content' }, 'Test Content')
  //     }
  //   }

  //   // 打开多个对话框
  //   dialog.open({ render: TestComponent })
  //   dialog.open({ render: TestComponent })
    
  //   await vi.runAllTimers()

  //   const instances = dialog.getInstances()
  //   expect(instances.length).toBe(2)

  //   // 关闭最上层对话框
  //   dialog.close()
  //   await vi.runAllTimers()
  //   expect(dialog.getInstances().length).toBe(1)

  //   // 关闭所有对话框
  //   dialog.close(true)
  //   await vi.runAllTimers()
  //   expect(dialog.getInstances().length).toBe(0)
  // })

  // // 测试全局配置
  // it('should apply global options', async () => {
  //   const dialog = useDialog()
  //   const globalOptions: Partial<UseDialogOptions> = {
  //     position: 'bottom',
  //     zIndex: 1000
  //   }

  //   dialog.setOptions(globalOptions)

  //   const TestComponent: Component = {
  //     setup() {
  //       return () => h('div', { class: 'test-content' }, 'Test Content')
  //     }
  //   }

  //   dialog.open({ render: TestComponent })
  //   await vi.runAllTimers()

  //   const dialogElement = document.querySelector('.dialog-wrapper')
  //   expect(dialogElement?.getAttribute('data-position')).toBe('bottom')
  //   expect(dialogElement?.getAttribute('style')).toContain('z-index: 1000')
  // })

  // // 测试错误处理
  // it('should handle errors properly', async () => {
  //   const dialog = useDialog()

  //   // 测试无效的选项
  //   await expect(dialog.open({} as UseDialogOptions)).rejects.toThrow('The "render" property is required')

  //   // 测试无效的渲染函数
  //   await expect(dialog.open({ 
  //     render: 'not a function' as any 
  //   })).rejects.toThrow('The "render" property must be a function')
  // })
}) 