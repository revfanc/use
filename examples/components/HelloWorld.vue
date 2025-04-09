<template>
  <div style="background-color: #fff; padding: 20px">
    <p>我是一个组件</p>
    <p>name: {{ params?.name }}</p>
    <button @click="callback({ action1: 'ok', data: 'hello' })">
      ok
    </button>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  params: Object,
  callback: {
    type: Function,
    required: true,
  },
})
</script>
