# Vue 3 Composables

一个实用的 Vue 3 组合式 API 工具库。

## 详细文档

https://revfanc.github.io/use/

## 安装

```bash
npm install @revfanc/use
# 或
yarn add @revfanc/use
```

## 使用

### useDialog

一个对话框包装组合式函数，方便专注于对话框内容开发。

```typescript
import { useDialog } from '@revfanc/use'

const dialog = useDialog()

dialog.open({
  render(context) {
    return (
      <div>我是弹窗内容</div>
    )
  }
})
```

### TypeScript

可以为控制器声明对话框结果和自定义 attrs 类型；不传泛型时仍保持原有的宽松类型。

```typescript
import { h } from "vue"

type DialogResult =
  | { action: "confirm"; userId: number }
  | { action: "cancel" }

interface DialogAttrs {
  params: { name: string }
}

const dialog = useDialog<DialogResult, DialogAttrs>()

const result = await dialog.open({
  params: { name: "world" },
  render(context) {
    const name = context.attrs.params.name
    return h("button", {
      onClick: () => context.callback({ action: "confirm", userId: 1 }),
    }, name)
  },
})

if (result.action === "confirm") {
  console.log(result.userId)
}
```

默认的 `useDialog()` 延续 1.x 的全局共享行为。需要相互隔离的配置、实例队列和拦截器时，可以使用：

```typescript
import { createDialog } from "@revfanc/use"

const dialog = createDialog({
  position: "bottom",
  trapFocus: true,
})
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 运行测试
npm run test
```

## 许可证

MIT
