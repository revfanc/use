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
  </div>
</template>

<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue";
import { ref, onMounted, onUnmounted, h } from "vue";
import {
  useDialog,
} from "../src";

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
      // position: "bottom",
      render(props) {
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
