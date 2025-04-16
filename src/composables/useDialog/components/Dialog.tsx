import { defineComponent, Transition, withDirectives, h } from "vue";
import { scrollLocker } from "@/utils/scroll-locker";
import {
  UseDialogRes,
  UseDialogCallback,
  UseDialogRenderProps,
} from "../types";

export default defineComponent({
  name: "DialogComponent",
  inheritAttrs: false,
  props: {
    show: Boolean,
    render: [Function, Object, String],
    position: String,
    closeOnClickOverlay: Boolean,
    overlayStyle: Object,
    zIndex: Number,
    beforeClose: Function,
    callback: Function,
  },
  emits: ["closed"],
  setup(props, context) {
    const { emit } = context;

    const locker = {
      mounted: scrollLocker.lock,
      unmounted: scrollLocker.unlock,
    };

    const callback: UseDialogCallback = (res) => {
      const close = (r?: UseDialogRes) => {
        const response = r ? r : res;

        if (typeof props.callback === "function") {
          props.callback(response);
        }
      };

      if (typeof props.beforeClose === "function") {
        props.beforeClose(close, res);
        return;
      }

      close();
    };

    const propsData: UseDialogRenderProps = {
      ...context,
      callback,
    };

    const renderContent = () => {
      if (!props.render) {
        throw new Error(
          'The "render" property is required and cannot be empty'
        );
      }

      if (typeof props.render === "function") {
        return props.render(propsData);
      }

      return h(props.render, propsData);
    };

    return () => {
      return (
        <div class="revfanc-dialog-container" style={{ zIndex: props.zIndex }}>
          <Transition name="fade" appear onAfterLeave={() => emit("closed")}>
            {() =>
              props.show &&
              withDirectives(
                <div
                  class="revfanc-dialog-overlay"
                  style={{ zIndex: props.zIndex, ...props.overlayStyle }}
                  onClick={() =>
                    props.closeOnClickOverlay && callback({ action: "overlay" })
                  }
                />,
                [[locker]]
              )
            }
          </Transition>
          <Transition name={props.position} appear>
            {() =>
              props.show && (
                <div
                  class={[
                    "revfanc-dialog-content",
                    `revfanc-dialog-content--${props.position}`,
                  ]}
                  style={{ zIndex: Number(props.zIndex) + 1 }}
                >
                  {renderContent()}
                </div>
              )
            }
          </Transition>
        </div>
      );
    };
  },
});
