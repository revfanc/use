## useDialog

### 基本示例

```vue
<template>
  <div>
    <button @click="showBasicDialog">显示基础对话框</button>
  </div>
</template>

<script setup>
import { useDialog } from "@revfanc/use";

const dialog = useDialog();

function showBasicDialog() {
  return dialog.open({
    render(context) {
      return (
        <div @click="() => context.callback({action: 'confirm'})">
          content
        </div>
      )
    }
  })
}
</script>
```
