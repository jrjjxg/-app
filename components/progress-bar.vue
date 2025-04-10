<template>
    <view class="mt-2">
      <view class="flex justify-between text-xs text-gray-500 mb-1">
        <text>问题 {{ current }}/{{ total }}</text>
        <text>{{ Math.round((current / total) * 100) }}%</text>
      </view>
      <view class="h-2 bg-gray-200 rounded-full overflow-hidden">
        <view 
          class="h-full bg-blue-600 rounded-full"
          :style="{ width: `${(current / total) * 100}%` }"
        ></view>
      </view>
    </view>
  </template>
  
  <script>
  export default {
    props: {
      current: {
        type: Number,
        required: true
      },
      total: {
        type: Number,
        required: true
      }
    }
  }
  </script>