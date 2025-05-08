# 快速开始

## 安装

```bash
npm install @revfanc/use
# 或
yarn add @revfanc/use
```

## 使用方法

直接从包中导入所需的组合式函数：

```js
import { useDialog } from "@revfanc/use";

const dialog = useDialog();
```

## 基础示例

```vue
<template>
  <button @click="showDialog">打开对话框</button>
</template>

<script setup>
import { useDialog } from "@revfanc/use";

const dialog = useDialog();

function showDialog() {
  dialog.open({
    render(context) {
      return (
        <div @click={() => context.callback({action: 'confirm'})}>
          对话框内容
        </div>
      )
    }
  })
}
</script>
```
