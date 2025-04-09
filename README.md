# Vue 3 Composables

一个实用的 Vue 3 组合式 API 工具库。

## 安装

```bash
npm install use
# 或
yarn add use
```

## 使用

### useCounter

一个计数器组合式函数，支持增加、减少、设置值和重置。

```typescript
import { useCounter } from 'use'

const { count, inc, dec, set, reset, isMin, isMax } = useCounter({
  initial: 0,
  min: 0,
  max: 10,
  step: 1
})
```

### useLocalStorage

一个用于本地存储的组合式函数，支持自动序列化和反序列化。

```typescript
import { useLocalStorage } from 'use'

const value = useLocalStorage({
  key: 'my-key',
  defaultValue: { name: 'John' }
})
```

### useDebounce

一个防抖组合式函数，用于延迟更新值。

```typescript
import { useDebounce } from 'use'

const searchQuery = ref('')
const debouncedSearch = useDebounce(searchQuery, {
  delay: 300,
  immediate: false
})
```

### useThrottle

一个节流组合式函数，用于限制值的更新频率。

```typescript
import { useThrottle } from 'use'

const scrollPosition = ref(0)
const throttledScroll = useThrottle(scrollPosition, {
  delay: 100,
  immediate: false
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
