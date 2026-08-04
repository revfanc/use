import {
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  Transition,
  watch,
  withDirectives,
} from "vue";
import type { Component, CSSProperties, PropType } from "vue";
import { scrollLocker } from "@/utils/scroll-locker";
import type {
  UseDialogBeforeClose,
  UseDialogCallback,
  UseDialogClose,
  DialogInitialFocus,
  UseDialogRenderFunction,
  UseDialogRenderProps,
} from "../types";

export default defineComponent({
  name: "DialogComponent",
  inheritAttrs: false,
  props: {
    show: Boolean,
    render: [Function, Object] as PropType<
      UseDialogRenderFunction | Component
    >,
    position: String,
    closeOnClickOverlay: Boolean,
    overlayStyle: Object as PropType<CSSProperties>,
    zIndex: Number,
    beforeClose: Function as PropType<UseDialogBeforeClose>,
    callback: Function as PropType<UseDialogCallback>,
    trapFocus: Boolean,
    restoreFocus: Boolean,
    initialFocus: [String, Object, Function] as PropType<DialogInitialFocus>,
    ariaLabel: String,
    ariaLabelledby: String,
    ariaDescribedby: String,
  },
  emits: ["closed"],
  setup(props, context) {
    const contentRef = ref<HTMLElement>();
    const previouslyFocused =
      typeof document === "undefined"
        ? null
        : (document.activeElement as HTMLElement | null);
    let focusRestored = false;

    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    const getFocusableElements = (): HTMLElement[] => {
      if (!contentRef.value) return [];

      return Array.from(
        contentRef.value.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => {
        const style = window.getComputedStyle(element);
        return (
          !element.hidden &&
          element.getAttribute("aria-hidden") !== "true" &&
          style.display !== "none" &&
          style.visibility !== "hidden"
        );
      });
    };

    const resolveInitialFocus = (): HTMLElement | null => {
      const { initialFocus } = props;

      if (typeof initialFocus === "function") return initialFocus();
      if (typeof initialFocus === "string") {
        try {
          return contentRef.value?.querySelector<HTMLElement>(initialFocus) || null;
        } catch {
          return null;
        }
      }
      if (initialFocus instanceof HTMLElement) return initialFocus;

      return (
        contentRef.value?.querySelector<HTMLElement>("[autofocus]") ||
        getFocusableElements()[0] ||
        contentRef.value ||
        null
      );
    };

    const focusDialog = async () => {
      if (!props.trapFocus) return;
      await nextTick();
      resolveInitialFocus()?.focus();
    };

    const restoreFocus = () => {
      if (
        focusRestored ||
        !props.trapFocus ||
        !props.restoreFocus ||
        !previouslyFocused?.isConnected
      ) {
        return;
      }

      focusRestored = true;
      previouslyFocused.focus();
    };

    const onKeydown = (event: KeyboardEvent) => {
      if (!props.trapFocus || event.key !== "Tab" || !contentRef.value) return;

      const focusable = getFocusableElements();
      if (!focusable.length) {
        event.preventDefault();
        contentRef.value.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === first || !contentRef.value.contains(activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === last || !contentRef.value.contains(activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    onMounted(() => void focusDialog());
    watch(
      () => props.show,
      (show) => {
        if (show) void focusDialog();
        else restoreFocus();
      }
    );
    onBeforeUnmount(restoreFocus);

    const locker = {
      mounted: scrollLocker.lock,
      unmounted: scrollLocker.unlock,
    };

    const callback: UseDialogCallback = (result) => {
      const close: UseDialogClose = (replacement) => {
        props.callback?.(replacement || result);
      };

      if (props.beforeClose) {
        void props.beforeClose(close, result);
        return;
      }

      close(result);
    };

    const renderContent = () => {
      if (!props.render) {
        throw new Error('The "render" property is required and cannot be empty');
      }

      const renderProps: UseDialogRenderProps = {
        ...context,
        callback,
      };

      if (typeof props.render === "function") {
        return (props.render as UseDialogRenderFunction)(renderProps);
      }

      return h(props.render, renderProps);
    };

    return () => (
      <div class="revfanc-dialog-container" style={{ zIndex: props.zIndex }}>
        <Transition
          name="revfanc-fade"
          appear
          onAfterLeave={() => context.emit("closed")}
        >
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
        <Transition name={`revfanc-${props.position}`} appear>
          {() =>
            props.show && (
              <div
                ref={contentRef}
                class={[
                  "revfanc-dialog-content",
                  `revfanc-dialog-content--${props.position}`,
                ]}
                style={{ zIndex: Number(props.zIndex) + 1 }}
                role="dialog"
                aria-modal="true"
                aria-label={props.ariaLabel}
                aria-labelledby={props.ariaLabelledby}
                aria-describedby={props.ariaDescribedby}
                tabindex={-1}
                onKeydown={onKeydown}
              >
                {renderContent()}
              </div>
            )
          }
        </Transition>
      </div>
    );
  },
});
