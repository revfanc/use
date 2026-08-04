import { createVNode, render } from "vue";
import type { AppContext, Component, ComponentPublicInstance } from "vue";

export function mountComponent(
  RootComponent: Component,
  appContext?: AppContext
) {
  const container = document.createElement("div");
  const vnode = createVNode(RootComponent);

  if (appContext) vnode.appContext = appContext;
  document.body.appendChild(container);

  try {
    render(vnode, container);
  } catch (error) {
    render(null, container);
    container.remove();
    throw error;
  }

  return {
    instance: vnode.component?.proxy as ComponentPublicInstance,
    unmount() {
      render(null, container);
      container.remove();
    },
  };
}
