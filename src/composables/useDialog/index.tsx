import { h, getCurrentInstance } from "vue";
import { mountComponent, usePopupState } from "../../utils/mount-component";
import Interceptors from "../../utils/interceptors";
import RootComponent from "./components/Dialog";
import "./style.css";

import {
  DialogWrapperInstance,
  UseDialogOpenOptions,
  UseDialogOpenRes,
} from "./types";

const INIT_OPTIONS: UseDialogOpenOptions = {
  render: null,
  position: "center",
  closeOnClickOverlay: false,
  overlayStyle: null,
  zIndex: 9999,
  beforeClose: null,
};

let queue: any[] = [];

let currentOptions: UseDialogOpenOptions = Object.assign({}, INIT_OPTIONS);

const interceptors = new Interceptors();

function createInstance(options: UseDialogOpenOptions & { resolve: any }) {
  const { resolve, render: optionsRender, ...rest } = options;

  if (currentOptions.zIndex !== undefined) {
    currentOptions.zIndex += 10;
  }

  const { instance, unmount } = mountComponent({
    setup() {
      const { state, toggle } = usePopupState();

      Object.assign(state, rest);

      const onClosed = () => {
        queue = queue.filter((item) => item !== instance);
        unmount();
      };

      const onAction = (res: UseDialogOpenRes) => {
        toggle(false);

        if (currentOptions.zIndex !== undefined) {
          currentOptions.zIndex -= 10;
        }

        resolve({
          ...res,
          options: rest,
        });
      };

      const render = () => {
        const attrs: Record<string, unknown> = {
          render: optionsRender,
          onClosed,
          onAction,
        };
        return <RootComponent {...state} {...attrs} />;
      };

      // rewrite render function
      (getCurrentInstance() as any).render = render;

      return {
        onAction,
      };
    },
  });

  queue.push(instance);

  return instance as DialogWrapperInstance;
}

function useDialog() {
  const open = (options: UseDialogOpenOptions): Promise<UseDialogOpenRes> => {
    return interceptors.execute((options) => {
      return new Promise((resolve, reject) => {
        try {
          if (!options || typeof options !== "object") {
            throw new TypeError("Options must be an object");
          }

          if (!options.render) {
            throw new TypeError('The "render" property is required in options');
          }

          createInstance({
            ...currentOptions,
            ...options,
            resolve,
          });
        } catch (error) {
          reject(error);
        }
      });
    }, options);
  };

  const close = (all?: boolean) => {
    if (!queue.length) {
      return;
    }
    if (all) {
      queue.forEach((item) => item.onAction({ action: "close" }));
    } else {
      queue[queue.length - 1].onAction({ action: "close" });
    }
  };

  const getInstances = () => {
    return queue;
  };

  const setOptions = (options: Partial<UseDialogOpenOptions>): void => {
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
