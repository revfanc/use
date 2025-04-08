<template>
  <div style="background-color: #fff; padding: 20px">
    <p>我是一个组件</p>
    <p>name: {{ params.name }}</p>
    <button @click="$emit('action', { action: 'ok', data: 'hello' })">
      ok
    </button>
  </div>
</template>

<script lang="ts">
export default {
  name: "HelloWorld",
  emits: ["action"],
  props: ["params"],
};
</script>
