# useMountComponent

`useMountComponent` 是一个用于在任意位置**挂载临时组件/内容**的组合式 API，适合用来实现全局提示、全屏遮罩、浮层等“脱离当前组件树”的 UI。

内部基于 `mountComponent`，自动注入当前应用的 `appContext`，并统一管理卸载。

## 基本用法

```vue
<script setup lang="ts">
import { useMountComponent } from '@revfanc/use'

const { mount } = useMountComponent()

function showOverlay() {
  const unmount = mount({
    render({ container, unmount }) {
      return (
        <div
          style="position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center;"
          onClick={() => unmount()}
        >
          <div style="padding: 16px; background: #fff; border-radius: 8px;">
            点击任意位置关闭
          </div>
        </div>
      )
    },
  })

  // 也可以在外部保留 unmount 引用
  // setTimeout(() => unmount(), 2000)
}
</script>

<template>
  <button @click="showOverlay">显示浮层</button>
</template>
```

## API

### `const { mount, mountPromisify, unmountAll } = useMountComponent()`

创建一个挂载控制器。

内部会通过 `getCurrentInstance().appContext` 获取当前组件的应用上下文，并在挂载时传给 `mountComponent`，保证全局配置、插件等上下文一致。

---

### `mount(options)`

立即挂载一次内容，返回一个卸载函数。

```ts
const unmount = mount({
  render: MyComponent,         // 组件 / VNode / 渲染函数
  transition: 'fade',          // 可选：过渡动画
  mountTo: '#app-overlay',     // 可选：挂载目标（默认 document.body）
})
```

#### `options` 参数

`mount` 的参数类型为 `MountOptions`：

| 参数名      | 类型                                             | 默认值          | 说明 |
| ----------- | ------------------------------------------------ | --------------- | ---- |
| `render`    | `RenderFn | VNode | Component`                 | 必填            | 渲染内容入口，支持渲染函数 / VNode / 组件 |
| `transition`| `'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'` | `undefined` | 过渡动画名称，会自动注入对应的 CSS |
| `mountTo`   | `HTMLElement | string`                          | `document.body` | 挂载目标 DOM 或选择器 |
| `appContext`| `AppContext`                                    | 当前实例上下文  | 一般无需手动传入 |

当 `render` 为函数时，其签名为：

```ts
type RenderFn = (ctx: RenderCtx) => VNode

interface RenderCtx {
  unmount: () => void
  container: HTMLElement       // 内部创建的容器
  mountTarget: HTMLElement     // 实际挂载到的目标
  transition?: TransitionName
  isMounted: Ref<boolean>      // 过渡过程中是否已显示
}
```

---

### `mountPromisify(options)`

在 `mount` 的基础上增加 **Promise 化的关闭结果**，常用于需要“等用户操作完再拿结果”的场景（类似对话框）。

```ts
const { mountPromisify } = useMountComponent()

async function openConfirm() {
  const result = await mountPromisify<{ confirmed: boolean }>({
    render({ unmount, container, mountTarget }) {
      return (
        <div class="my-confirm">
          <button onClick={() => unmount({ confirmed: true })}>确认</button>
          <button onClick={() => unmount({ confirmed: false })}>取消</button>
        </div>
      )
    },
  })

  if (result.confirmed) {
    // 用户点击了确认
  }
}
```

`mountPromisify` 的参数与 `mount` 基本一致，不同点是：

- `render` 的签名为：

  ```ts
  type RenderInputPromisifyFn<T> = (
    ctx: RenderCtx & { unmount: (arg?: T) => void }
  ) => VNode
  ```

- 你在渲染函数中调用的 `unmount(result)` 会：
  - 先 `resolve(result)`，把结果传给 `mountPromisify` 返回的 Promise
  - 再调用内部真正的 `ctx.unmount()` 完成卸载

---

### `unmountAll()`

卸载当前通过 `useMountComponent` 挂载的所有内容。

```ts
const { mount, unmountAll } = useMountComponent()

function openMulti() {
  mount({ render: CompA })
  mount({ render: CompB })
}

// 一次性关闭所有
unmountAll()
```

实现上，`useMountComponent` 内部维护了一个 `unmountList: UnmountFn[]`：

- 每次 `mount` / `mountPromisify` 都会把对应的 `unmount` 注册进去
- 使用 `addUnmount` 保证不会重复存同一个 `unmount`（引用相同则只保留一次）
- `unmountAll` 会依次调用列表里的所有 `unmount`，并在结束后清空列表

---

## 使用建议

- **配合全局样式/组件库**：因为自动注入了当前应用的 `appContext`，你在挂载的组件里可以正常使用全局注册组件、`app.config.globalProperties` 等。
- **适合做基础能力封装**：`useDialog` 就是基于类似能力封装出来的，你也可以用 `useMountComponent` 快速实现自己的 Toast、Loading、全局 Sheet 等。
- **注意内存清理**：如果你在挂载内容里自己保存了额外的引用（如全局数组），记得在 `unmount` 时一并清理，避免泄漏。
