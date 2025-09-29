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
      <div>content</div>
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
