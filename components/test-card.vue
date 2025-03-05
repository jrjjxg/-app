<template>
  <view class="bg-white rounded-xl p-4 shadow hover:shadow-md transition-shadow" @click="$emit('click')">
    <view class="flex items-center">
      <view class="w-12 h-12 rounded-full flex items-center justify-center mr-4" :class="bgColorClass">
        <text class="iconfont" :class="test.icon" :style="{ color: iconColor }"></text>
      </view>
      
      <view class="flex-1">
        <text class="font-medium text-gray-800 mb-1 block">{{ test.title }}</text>
        <text class="text-xs text-gray-500">{{ test.shortDescription || test.description.substring(0, 30) + '...' }}</text>
      </view>
      
      <view class="ml-3 flex flex-col items-end">
        <text class="text-blue-600 mb-1">{{ test.time }}分钟</text>
        <text class="text-xs text-gray-500">{{ test.questions.length }}个问题</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    test: {
      type: Object,
      required: true
    }
  },
  computed: {
    bgColorClass() {
      const categories = {
        'common': 'bg-blue-100',
        'emotion': 'bg-purple-100',
        'personality': 'bg-yellow-100'
      }
      return categories[this.test.category] || 'bg-gray-100'
    },
    iconColor() {
      const colors = {
        'common': '#3b82f6',
        'emotion': '#8b5cf6',
        'personality': '#f59e0b'
      }
      return colors[this.test.category] || '#6b7280'
    }
  }
}
</script>
