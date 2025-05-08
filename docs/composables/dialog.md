# useDialog

`useDialog` 是一个用于创建和管理对话框的组合式API，提供了灵活的配置选项和完善的类型支持。

## 基本用法

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
        <div 
          style="padding: 20px; background: white; border-radius: 8px;"
          onClick={() => context.callback({ action: 'confirm' })}
        >
          点击关闭对话框
        </div>
      )
    }
  })
}
</script>
```

## 完整API

### useDialog()

创建一个对话框控制器实例。

```js
const dialog = useDialog();
```

### dialog.open(options)

打开一个对话框，返回一个Promise，在对话框关闭时解析。

```js
dialog.open({
  render: MyComponent,
  position: 'center',
  closeOnClickOverlay: true
}).then(result => {
  console.log('对话框关闭，返回结果:', result);
});
```

#### options 参数

| 参数名 | 类型 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- |
| render | Function/Component | - | 必填，渲染对话框内容的函数或组件 |
| position | 'center' \| 'top' \| 'bottom' \| 'left' \| 'right' | 'center' | 对话框显示位置 |
| zIndex | number | 999 | 对话框的z-index值 |
| closeOnClickOverlay | boolean | false | 是否在点击遮罩层时关闭对话框 |
| overlayStyle | CSSProperties | - | 自定义遮罩层样式 |
| beforeClose | Function | - | 关闭前的拦截函数 |

### dialog.close(all?)

关闭对话框。如果参数`all`为true，则关闭所有对话框，否则只关闭最近打开的对话框。

```js
// 关闭最近打开的对话框
dialog.close();

// 关闭所有对话框
dialog.close(true);
```

### dialog.setOptions(options)

设置全局默认选项。

```js
dialog.setOptions({
  closeOnClickOverlay: true,
  position: 'bottom'
});
```

### dialog.interceptors

提供对话框的拦截器。

```js
// 添加打开前拦截器
dialog.interceptors.before.use((options) => {
  console.log('对话框打开前:', options);
  return options;
});

// 添加关闭后拦截器
dialog.interceptors.after.use((result) => {
  console.log('对话框关闭后:', result);
  return result;
});
```

## 高级用法

### 自定义关闭逻辑

你可以使用`beforeClose`钩子来控制对话框的关闭逻辑：

```js
dialog.open({
  render: MyComponent,
  beforeClose: (close, params) => {
    if (params.action === 'confirm') {
      // 执行一些操作后关闭
      setTimeout(() => {
        close(params);
      }, 1000);
    } else {
      // 直接关闭
      close(params);
    }
  }
});
```

### 组件内部关闭

在自定义组件中使用`context.callback`关闭对话框：

```vue
<script setup>
// MyDialogComponent.vue
defineProps({
  callback: Function
});

function handleConfirm() {
  callback({ action: 'confirm', data: { /* 自定义数据 */ } });
}

function handleCancel() {
  callback({ action: 'cancel' });
}
</script>

<template>
  <div class="dialog-content">
    <h2>自定义对话框</h2>
    <div class="dialog-buttons">
      <button @click="handleConfirm">确认</button>
      <button @click="handleCancel">取消</button>
    </div>
  </div>
</template>
```

然后使用：

```js
import MyDialogComponent from './MyDialogComponent.vue';

dialog.open({
  render(context) {
    return <MyDialogComponent callback={context.callback} />;
  }
}).then(result => {
  if (result.action === 'confirm') {
    // 处理确认操作
    console.log('确认并返回数据:', result.data);
  } else {
    // 处理取消操作
    console.log('取消操作');
  }
});
```
