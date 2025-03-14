<template>
  <view class="bg-white rounded-lg shadow-sm p-4" @click="$emit('click')">
    <view class="flex items-center">
      <view class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-3 overflow-hidden">
        <image v-if="test.imageUrl" :src="test.imageUrl" mode="aspectFill" class="w-full h-full rounded-full"></image>
        <text v-else class="iconfont" :class="test.icon || 'icon-test'"
          :style="{ color: getIconColor(test.category) }"></text>
      </view>
      <view class="flex-1">
        <text class="font-medium text-gray-800">{{ test.name }}</text>
        <text class="text-xs text-gray-500 mt-1 block">{{ test.description }}</text>
        <view class="flex items-center mt-2">
          <view class="flex items-center">
            <text class="iconfont icon-time text-gray-400 mr-1"></text>
            <text class="text-xs text-gray-400">{{ test.timeMinutes || 10 }}分钟</text>
          </view>
          <view class="flex items-center ml-3">
            <text class="iconfont icon-user text-gray-400 mr-1"></text>
            <text class="text-xs text-gray-400">{{ formatTestCount(test.testCount) }}人测过</text>
          </view>
        </view>
      </view>
      <text class="iconfont icon-right text-gray-300"></text>
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
  methods: {
    formatTestCount(count) {
      if (!count) return '0';
      if (count < 1000) return count.toString();
      if (count < 10000) return (count / 1000).toFixed(1) + 'k';
      return (count / 10000).toFixed(1) + '万';
    },
    getIconColor(category) {
      const colors = {
        'personality': '#4F46E5', // 蓝色
        'emotion': '#EC4899',     // 粉色
        'common': '#10B981'       // 绿色
      };
      return colors[category] || '#4F46E5';
    }
  }
}
</script>
