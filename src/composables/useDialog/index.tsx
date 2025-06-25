import { h, getCurrentInstance, AppContext } from "vue";
import { mountComponent, usePopupState } from "@/utils/mount-component";
import Interceptors from "@/utils/interceptors";
import RootComponent from "./components/Dialog";
import "./style.css";

import {
  DialogWrapperInstance,
  UseDialogCallback,
  UseDialogOptions,
  UseDialogRes,
} from "./types";

const INIT_OPTIONS: UseDialogOptions = {
  render: undefined,
  position: "center",
  closeOnClickOverlay: false,
  overlayStyle: undefined,
  zIndex: 999,
  beforeClose: undefined,
};

let queue: DialogWrapperInstance[] = [];

let currentOptions: UseDialogOptions = Object.assign({}, INIT_OPTIONS);

const interceptors = new Interceptors();

function createInstance(
  options: UseDialogOptions & { resolve: any; appContext?: AppContext }
): DialogWrapperInstance {
  const { resolve, appContext, render: optionsRender, ...rest } = options;

  if (currentOptions.zIndex !== undefined) {
    currentOptions.zIndex += 5;
  }

  const { instance, unmount } = mountComponent(
    {
      setup() {
        const { state, toggle } = usePopupState();

        Object.assign(state, rest);

        const onClosed = () => {
          queue = queue.filter((item) => item !== instance);
          unmount();
        };

        const callback: UseDialogCallback = (res) => {
          toggle(false);

          resolve({
            ...res,
            __options__: rest,
          });
        };

        const render = () => {
          const attrs: Record<string, unknown> = {
            render: optionsRender,
            callback,
            onClosed,
          };
          return <RootComponent {...state} {...attrs} />;
        };

        // rewrite render function
        (getCurrentInstance() as any).render = render;

        return {
          callback,
        };
      },
    },
    appContext
  );

  queue.push(instance as DialogWrapperInstance);

  return instance as DialogWrapperInstance;
}

function useDialog() {
  let appContext = getCurrentInstance()?.appContext;

  const open = (opts: UseDialogOptions, appCtx?: AppContext): Promise<UseDialogRes> => {
    return interceptors.execute((options) => {
      return new Promise((resolve, reject) => {
        try {
          if (!options || typeof options !== "object") {
            throw new TypeError("Options must be an object");
          }

          if (!options.render) {
            throw new TypeError('The "render" property is required in options');
          }

          if (
            typeof options.render !== "function" &&
            typeof options.render !== "object"
          ) {
            throw new TypeError(
              'The "render" property must be a function or a VNode or a component'
            );
          }

          createInstance({
            ...currentOptions,
            ...options,
            appContext: appCtx || appContext,
            resolve,
          });
        } catch (error) {
          reject(error);
        }
      });
    }, opts);
  };

  const close = (all?: boolean) => {
    if (!queue.length) {
      return;
    }
    if (all) {
      queue.forEach((item) => item.callback({ action: "manual" }));
    } else {
      queue[queue.length - 1].callback({ action: "manual" });
    }
  };

  const getInstances = () => {
    return queue;
  };

  const setOptions = (options: Partial<UseDialogOptions>): void => {
    currentOptions = Object.assign({}, currentOptions, options);
  };

  return {
    open,
    close,
    interceptors,
    getInstances,
    setOptions,
  };
}

export default useDialog;
