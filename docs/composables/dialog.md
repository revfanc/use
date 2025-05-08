# useDialog

提供创建和管理对话框的组合式API。

## 基本用法

```vue
<template>
  <button @click="openDialog">打开对话框</button>
</template>

<script setup>
import { useDialog } from "@revfanc/use";

const dialog = useDialog();

function openDialog() {
  dialog.open({
    render(context) {
      return (
        <div @click={() => context.callback({action: 'confirm'})}>
          点击关闭对话框
        </div>
      )
    }
  })
}
</script>
```

## API

### useDialog()

返回一个对话框控制器对象。

### dialog.open(options)

打开一个对话框。

#### 参数

| 名称 | 类型 | 描述 |
| ---- | ---- | ---- |
| options.render | Function | 渲染对话框内容的函数 |

#### 返回值

返回一个Promise，在对话框关闭时解析。
