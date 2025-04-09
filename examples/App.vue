<template>
  <div class="container">
    <h1>Vue 3 Composables 示例</h1>

    <section class="demo-section">
      <h2>useDialog 示例</h2>
      <div class="storage-demo">
        <div class="buttons">
          <button @click="openDialog">显示弹窗</button>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>useCounter 示例</h2>
      <div class="counter-demo">
        <p>当前计数: {{ count }}</p>
        <div class="buttons">
          <button @click="inc">增加</button>
          <button @click="dec">减少</button>
          <button @click="reset">重置</button>
        </div>
        <p>是否达到最小值: {{ isMin }}</p>
        <p>是否达到最大值: {{ isMax }}</p>
      </div>
    </section>

    <section class="demo-section">
      <h2>useLocalStorage 示例</h2>
      <div class="storage-demo">
        <input v-model="localValue" placeholder="输入内容会自动保存" />
        <p>已保存的值: {{ localValue }}</p>
      </div>
    </section>

    <section class="demo-section">
      <h2>useDebounce 示例</h2>
      <div class="debounce-demo">
        <input v-model="searchQuery" placeholder="输入搜索内容" />
        <p>防抖后的值: {{ debouncedSearch }}</p>
      </div>
    </section>

    <section class="demo-section">
      <h2>useThrottle 示例</h2>
      <div class="throttle-demo">
        <p>滚动位置: {{ scrollPosition }}</p>
        <p>节流后的值: {{ throttledScroll }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue";
import { ref, onMounted, onUnmounted, h } from "vue";
import {
  // useDialog,
  useCounter,
  useLocalStorage,
  useDebounce,
  useThrottle,
} from "../src";
import { useDialog } from "../dist/vue3-composables.es";

// 弹窗示例
const dialog = useDialog();

dialog.interceptors.before.use((config) => {
  console.log("before interceptors :>> ", config);
  return config;
});

dialog.interceptors.after.use((config) => {
  console.log("after interceptors :>> ", config);
  return config;
});

function openDialog() {
  dialog
    .open({
      params: { name: "world" },
      // render: HelloWorld,
      render(h, props) {
        const { callback } = props
        return h("div", { style: { height: "200px", overflow: "auto" } }, [
          h(
            "div",
            {
              style: {
                padding: "20px",
                background: "#fff",
              },
            },
            [
              h("p", { style: { height: "500px" } }, "我是一个组件"),
              h("p", "name: {{ params.name }}"),
            ]
          ),
          h("button", { class: "btn", onClick: () => openDialog() }, "ok1"),
          h(
            "button",
            { class: "btn", onClick: () => callback({ action: "ok2" }) },
            "ok2"
          ),
        ]);
      },
    })
    .then((res) => {
      console.log("open res :>> ", res);
    });
}

// useCounter 示例
const { count, inc, dec, reset, isMin, isMax } = useCounter({
  initial: 0,
  min: 0,
  max: 10,
  step: 1,
});

// useLocalStorage 示例
const localValue = useLocalStorage({
  key: "demo-input",
  defaultValue: "",
});

// useDebounce 示例
const searchQuery = ref("");
const debouncedSearch = useDebounce(searchQuery, {
  delay: 500,
  immediate: false,
});

// useThrottle 示例
const scrollPosition = ref(0);
const throttledScroll = useThrottle(scrollPosition, {
  delay: 100,
  immediate: false,
});

// 监听滚动事件
const handleScroll = () => {
  scrollPosition.value = window.scrollY;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 40px;
}

h2 {
  color: #42b983;
  margin-bottom: 20px;
}

.counter-demo,
.storage-demo,
.debounce-demo,
.throttle-demo {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.buttons {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

button {
  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #3aa876;
}

input {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

p {
  margin: 10px 0;
  color: #666;
}
</style>
