import { defineComponent, getCurrentInstance, h, ref } from "vue";
import type { AppContext } from "vue";
import { mountComponent } from "@/utils/mount-component";
import Interceptors from "@/utils/interceptors";
import RootComponent from "./components/Dialog";
import "./style.css";

import type {
  DialogResolvedResult,
  DialogWrapperInstance,
  UseDialogCallback,
  UseDialogController,
  UseDialogOpenOptions,
  UseDialogOptions,
  UseDialogRes,
} from "./types";

const INITIAL_OPTIONS: UseDialogOptions = {
  render: undefined,
  position: "center",
  closeOnClickOverlay: false,
  overlayStyle: undefined,
  zIndex: 999,
  beforeClose: undefined,
  trapFocus: true,
  restoreFocus: true,
  initialFocus: undefined,
};

interface DialogStore {
  queue: InternalDialogWrapperInstance[];
  options: UseDialogOptions;
  interceptors: Interceptors<UseDialogOptions, UseDialogRes>;
}

function createDialogStore(
  options: Partial<UseDialogOptions> = {}
): DialogStore {
  return {
    queue: [],
    options: { ...INITIAL_OPTIONS, ...options },
    interceptors: new Interceptors<UseDialogOptions, UseDialogRes>(),
  };
}

// useDialog() keeps using this store to preserve the public 1.x global behavior.
const globalStore = createDialogStore();

interface InternalDialogOptions extends UseDialogOptions {
  resolve: (result: DialogResolvedResult) => void;
  reject: (reason?: unknown) => void;
  appContext?: AppContext;
}

interface InternalDialogWrapperInstance extends DialogWrapperInstance {
  disableFocusRestore(): void;
}

type DialogNoInfer<T> = [T][T extends any ? 0 : never];

function createInstance(
  store: DialogStore,
  options: InternalDialogOptions
): InternalDialogWrapperInstance {
  const {
    resolve,
    reject,
    appContext,
    render: content,
    ...dialogOptions
  } = options;

  // Keep the established z-index behavior for backwards compatibility.
  if (store.options.zIndex !== undefined) store.options.zIndex += 5;

  const mountedDialog: {
    instance?: InternalDialogWrapperInstance;
    unmount?: () => void;
  } = {};

  const Wrapper = defineComponent({
    name: "DialogWrapper",
    setup() {
      const show = ref(true);
      const restoreFocusEnabled = ref(dialogOptions.restoreFocus);

      const onClosed = () => {
        store.queue = store.queue.filter(
          (item) => item !== mountedDialog.instance
        );
        mountedDialog.unmount?.();
      };

      const callback: UseDialogCallback = (result) => {
        show.value = false;
        resolve({
          ...result,
          __options__: dialogOptions,
        });
      };

      const onBeforeCloseError = (error: unknown) => {
        show.value = false;
        reject(error);
      };

      const disableFocusRestore = () => {
        restoreFocusEnabled.value = false;
      };

      return {
        show,
        restoreFocusEnabled,
        callback,
        disableFocusRestore,
        onBeforeCloseError,
        onClosed,
      };
    },
    render() {
      return h(RootComponent, {
        ...dialogOptions,
        show: this.show,
        render: content,
        callback: this.callback,
        beforeCloseError: this.onBeforeCloseError,
        restoreFocus: this.restoreFocusEnabled,
        onClosed: this.onClosed,
      });
    },
  });

  const mounted = mountComponent(Wrapper, appContext);
  mountedDialog.instance = mounted.instance as InternalDialogWrapperInstance;
  mountedDialog.unmount = mounted.unmount;
  store.queue.push(mountedDialog.instance);

  return mountedDialog.instance;
}

function createDialogController<
  TDefaultResult extends UseDialogRes = UseDialogRes,
  TDefaultAttrs extends Record<string, any> = Record<string, any>,
>(
  store: DialogStore,
  defaultAppContext?: AppContext
): UseDialogController<TDefaultResult, TDefaultAttrs> {

  const open = (<
    TResult extends UseDialogRes = TDefaultResult,
    TAttrs extends Record<string, any> = TDefaultAttrs,
    TOptions extends UseDialogOpenOptions<TResult, TAttrs> = UseDialogOpenOptions<
      TResult,
      TAttrs
    >,
  >(
    options: TOptions,
    appContext?: AppContext
  ): Promise<DialogResolvedResult<TResult, TOptions>> => {
    return store.interceptors.execute(
      (interceptedOptions) =>
        new Promise<DialogResolvedResult>((resolve, reject) => {
          try {
            if (!interceptedOptions || typeof interceptedOptions !== "object") {
              throw new TypeError("Options must be an object");
            }

            if (!interceptedOptions.render) {
              throw new TypeError('The "render" property is required in options');
            }

            if (
              typeof interceptedOptions.render !== "function" &&
              typeof interceptedOptions.render !== "object"
            ) {
              throw new TypeError(
                'The "render" property must be a function or a VNode or a component'
              );
            }

            createInstance(store, {
              ...store.options,
              ...interceptedOptions,
              appContext: appContext || defaultAppContext,
              resolve,
              reject,
            });
          } catch (error) {
            reject(error);
          }
        }),
      options as unknown as UseDialogOptions
    ) as unknown as Promise<DialogResolvedResult<TResult, TOptions>>;
  }) as UseDialogController<TDefaultResult, TDefaultAttrs>["open"];

  const close = (all?: boolean): void => {
    if (!store.queue.length) return;

    if (all) {
      const instances = [...store.queue];
      // Vue flushes watchers in component creation order, regardless of the
      // callback order. Only the oldest dialog should perform the final focus
      // restoration when the whole stack closes.
      instances.slice(1).forEach((item) => item.disableFocusRestore());
      instances.reverse().forEach((item) =>
        item.callback({ action: "manual" })
      );
      return;
    }

    store.queue[store.queue.length - 1].callback({ action: "manual" });
  };

  const getInstances = (): DialogWrapperInstance[] => store.queue;

  const setOptions: UseDialogController<
    TDefaultResult,
    TDefaultAttrs
  >["setOptions"] = (options) => {
    store.options = { ...store.options, ...options } as UseDialogOptions;
  };

  return {
    open,
    close,
    interceptors: store.interceptors as unknown as UseDialogController<
      TDefaultResult,
      TDefaultAttrs
    >["interceptors"],
    getInstances,
    setOptions,
  };
}

function useDialog<
  TDefaultResult extends UseDialogRes = UseDialogRes,
  TDefaultAttrs extends Record<string, any> = Record<string, any>,
>(): UseDialogController<TDefaultResult, TDefaultAttrs> {
  return createDialogController<TDefaultResult, TDefaultAttrs>(
    globalStore,
    getCurrentInstance()?.appContext
  );
}

export function createDialog<
  TDefaultResult extends UseDialogRes = UseDialogRes,
  TDefaultAttrs extends Record<string, any> = Record<string, any>,
>(
  options: Partial<
    UseDialogOpenOptions<
      DialogNoInfer<TDefaultResult>,
      DialogNoInfer<TDefaultAttrs>
    >
  > = {},
  appContext?: AppContext
): UseDialogController<TDefaultResult, TDefaultAttrs> {
  return createDialogController<TDefaultResult, TDefaultAttrs>(
    createDialogStore(options as Partial<UseDialogOptions>),
    appContext || getCurrentInstance()?.appContext
  );
}

export default useDialog;
