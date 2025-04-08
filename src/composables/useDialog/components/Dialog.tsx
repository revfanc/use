import { defineComponent, Transition, withDirectives, h } from "vue";
import { scrollLocker } from "@/utils/scroll-locker";
import { UseDialogOpenRes } from "../types";

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
  },
  emits: ["action", "closed"],
  setup(props, { emit, attrs }) {
    const locker = {
      mounted: scrollLocker.lock,
      unmounted: scrollLocker.unlock,
    };

    const onAction = (res: UseDialogOpenRes) => {
      const close = (r?: UseDialogOpenRes) => {
        const response = r ? r : res;
        emit("action", response);
      };

      if (typeof props.beforeClose === "function") {
        props.beforeClose(close, res);
        return;
      }

      close();
    };

    const renderContent = () => {
      if (!props.render) {
        throw new Error(
          'The "render" property is required and cannot be empty'
        );
      }

      if (typeof props.render === "function") {
        return props.render(h, { onAction });
      }

      return h(props.render, { ...attrs, onAction });
    };

    return () => {
      return (
        <div class="dialog-container" style={{ zIndex: props.zIndex }}>
          <Transition name="fade" appear onAfterLeave={() => emit("closed")}>
            {() =>
              props.show &&
              withDirectives(
                <div
                  class="dialog-overlay"
                  style={props.overlayStyle}
                  onClick={() =>
                    props.closeOnClickOverlay && onAction({ action: "close" })
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
                    "dialog-content",
                    `dialog-content--${props.position}`,
                  ]}
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
