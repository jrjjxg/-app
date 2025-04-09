<template>
  <view class="bg-white rounded-lg shadow-sm p-4" @click="$emit('click')">
    <view class="flex items-center">
      <view class="w-12 h-12 rounded-lg flex items-center justify-center mr-4 overflow-hidden"
        :style="{ backgroundColor: getIconBgColor(test.category) }">
        <image v-if="test.imageUrl" :src="test.imageUrl" mode="aspectFill" class="w-full h-full"></image>
        <text v-else class="iconfont text-2xl" :class="test.icon || 'icon-test'"
          :style="{ color: getIconColor(test.category) }">🌈</text>
      </view>
      <view class="flex-1">
        <text class="font-medium text-base text-gray-800">{{ test.name }}</text>
        <text class="text-xs text-gray-500 mt-1 block">{{ test.description || '评估抑郁状态严重程度的常用量表' }}</text>
        <view class="flex items-center mt-2">
          <view class="flex items-center">
            <text class="iconfont icon-time text-gray-400 mr-1"></text>
            <text class="text-xs text-gray-400">{{ test.timeMinutes || 5 }}分钟</text>
          </view>
          <text class="mx-2 text-gray-300">|</text>
          <view class="flex items-center">
            <text class="text-xs text-gray-400">{{ test.questionCount || 20 }}题</text>
          </view>
        </view>
      </view>
      <view class="ml-2">
        <view class="bg-blue-500 text-white px-4 py-2 rounded-full text-sm" @click.stop="onStartTest">开始</view>
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
        'common': '#F9A825'       // 黄色
      };
      return colors[category] || '#4F46E5';
    },
    getIconBgColor(category) {
      const colors = {
        'personality': '#EEF2FF', // 浅蓝色背景
        'emotion': '#FCE7F3',     // 浅粉色背景
        'common': '#FBE9CE'       // 浅黄色背景
      };
      return colors[category] || '#EEF2FF';
    },
    onStartTest(e) {
      e.preventDefault();
      this.$emit('start', this.test);
    }
  }
}
</script>
