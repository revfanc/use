# Vue 3 Composables

一个实用的 Vue 3 组合式 API 工具库。

## 安装

```bash
npm install use
# 或
yarn add use
```

## 使用

### useDialog

一个对话框包装组合式函数，方便专注于对话框内容开发。

```typescript
import { useDialog } from 'use'

const dialog = useDialog()

dialog.open({
  render(h, context) {
    return (
      <div>我是弹窗内容</div>
    )
  }
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
