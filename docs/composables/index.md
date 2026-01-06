# 组合式API

`@revfanc/use` 提供了一系列功能强大且易用的组合式API，帮助您快速构建交互丰富的Vue应用。

## 可用的组合式API

### 界面交互

- [useDialog](./dialog.md) - 创建和管理对话框
- [useMountComponent](./mount-component.md) - 在任意位置挂载临时组件/内容

## 按需引入

所有组合式API都支持按需引入，减少不必要的代码体积：

```js
// 只引入需要的组合式API
import { useDialog, useToast } from '@revfanc/use';
```
