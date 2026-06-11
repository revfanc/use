import type { CSSProperties, PropType } from 'vue'
import type {
  UseDialogBeforeClose,
  UseDialogCallback,
  UseDialogRenderFunction,
  UseDialogRenderProps,
  UseDialogRes,
} from '../types'
import { defineComponent, h, Transition, withDirectives } from 'vue'
import { scrollLocker } from '@/utils/scroll-locker'

export type DialogPosition = 'center' | 'top' | 'bottom' | 'left' | 'right'

export interface DialogProps {
  /** 是否显示 Dialog */
  show: boolean
  /** 渲染函数或组件 */
  render?: UseDialogRenderFunction | object | string
  /** Dialog 位置 */
  position?: DialogPosition
  /** 点击遮罩层是否关闭 */
  closeOnClickOverlay?: boolean
  /** 遮罩层样式 */
  overlayStyle?: CSSProperties
  /** Dialog 的 z-index */
  zIndex?: number
  /** 关闭前的回调 */
  beforeClose?: UseDialogBeforeClose
  /** Dialog 关闭时的回调 */
  callback?: UseDialogCallback
}

export default defineComponent({
  name: 'DialogComponent',
  inheritAttrs: false,
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    render: {
      type: [Function, Object, String] as PropType<UseDialogRenderFunction | object | string | undefined>,
    },
    position: {
      type: String as PropType<DialogPosition>,
      default: 'center',
    },
    closeOnClickOverlay: {
      type: Boolean,
      default: false,
    },
    overlayStyle: {
      type: Object as PropType<CSSProperties>,
    },
    zIndex: {
      type: Number,
      default: 999,
    },
    beforeClose: {
      type: Function as PropType<UseDialogBeforeClose | undefined>,
    },
    callback: {
      type: Function as PropType<UseDialogCallback | undefined>,
    },
  },
  emits: ['closed'],
  setup(props: DialogProps, context) {
    const { emit } = context

    const locker = {
      mounted: scrollLocker.lock,
      unmounted: scrollLocker.unlock,
    }

    const callback: UseDialogCallback = (res) => {
      const close = (r?: UseDialogRes) => {
        const response = r || res

        if (typeof props.callback === 'function') {
          props.callback(response)
        }
      }

      if (typeof props.beforeClose === 'function') {
        props.beforeClose(close, res)
        return
      }

      close()
    }

    const propsData: UseDialogRenderProps = {
      ...context,
      callback,
    }

    const renderContent = () => {
      if (!props.render) {
        throw new Error(
          'The "render" property is required and cannot be empty',
        )
      }

      if (typeof props.render === 'function') {
        return (props.render as UseDialogRenderFunction)(propsData)
      }

      return h(props.render as object | string, propsData)
    }

    return () => {
      return (
        <div class="revfanc-dialog-container" style={{ zIndex: props.zIndex }}>
          <Transition name="revfanc-fade" appear onAfterLeave={() => emit('closed')}>
            {() =>
              props.show
              && withDirectives(
                <div
                  class="revfanc-dialog-overlay"
                  style={{ zIndex: props.zIndex, ...props.overlayStyle }}
                  onClick={() =>
                    props.closeOnClickOverlay && callback({ action: 'overlay' } as UseDialogRes)}
                />,
                [[locker]],
              )}
          </Transition>
          <Transition name={`revfanc-${props.position}`} appear>
            {() =>
              props.show && (
                <div
                  class={[
                    'revfanc-dialog-content',
                    `revfanc-dialog-content--${props.position}`,
                  ]}
                  style={{ zIndex: Number(props.zIndex) + 1 }}
                >
                  {renderContent()}
                </div>
              )}
          </Transition>
        </div>
      )
    }
  },
})
