# 组合式API

`@revfanc/use` 提供了一系列功能强大且易用的组合式API，帮助您快速构建交互丰富的Vue应用。

## 可用的组合式API

### 界面交互

- [useDialog](./dialog.md) - 创建和管理对话框
<!-- - useToast - 显示轻量级通知提示
- useLoading - 管理加载状态
- useConfirm - 简化确认对话框流程

### 状态管理

- useState - 创建跨组件共享的响应式状态
- useStorage - 持久化状态到本地存储
- useContext - 提供依赖注入的上下文管理

### DOM相关

- useScroll - 滚动位置监听和控制
- useResize - 元素大小调整监听
- useIntersection - 元素可见性监测

### 工具函数

- useDebounce - 防抖函数
- useThrottle - 节流函数
- useCopy - 复制文本到剪贴板 -->

## 按需引入

所有组合式API都支持按需引入，减少不必要的代码体积：

```js
// 只引入需要的组合式API
import { useDialog, useToast } from '@revfanc/use';
```
