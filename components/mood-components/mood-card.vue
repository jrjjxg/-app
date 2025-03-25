<template>
  <view class="bg-white rounded-xl p-4 shadow mb-3">
    <view class="flex justify-between mb-2">
      <text class="font-medium text-gray-800">{{ mood.emotionType }}</text>
      <text class="text-xs text-gray-500">{{ formatDate(mood.createTime) }}</text>
    </view>

    <view class="flex items-center mb-3">
      <view class="w-8 h-8 rounded-full flex items-center justify-center mr-2" :class="getEmotionBgClass()">
        <text class="text-lg">{{ getEmotionEmoji() }}</text>
      </view>
      <view class="flex-1">
        <view class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <view class="h-full rounded-full" :class="getIntensityColorClass()"
            :style="{ width: `${(mood.intensity / 5) * 100}%` }"></view>
        </view>
      </view>
      <text class="ml-2 text-sm font-medium" :class="getIntensityTextClass()">{{ mood.intensity }}/5</text>
    </view>

    <text v-if="mood.note" class="text-sm text-gray-600 mb-3">{{ mood.note }}</text>

    <view v-if="mood.tags && mood.tags.length > 0" class="flex flex-wrap gap-2">
      <text v-for="(tag, index) in mood.tags" :key="index" class="px-2 py-1 rounded-full text-xs"
        :class="getTagClass(index)">{{ tag }}</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    mood: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '';

      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) {
        return `${diffMins}分钟前`;
      } else if (diffHours < 24) {
        return `${diffHours}小时前`;
      } else if (diffDays < 30) {
        return `${diffDays}天前`;
      } else {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
    },
    getEmotionEmoji() {
      const emojis = {
        '快乐/愉悦': '😊',
        '平静/满足': '😌',
        '焦虑/紧张': '😰',
        '悲伤/低落': '😢',
        '愤怒/烦躁': '😠',
        '疲惫/无力': '😴',
        '中性/平淡': '😐'
      };
      return emojis[this.mood.emotionType] || '😐';
    },
    getEmotionBgClass() {
      const classes = {
        '快乐/愉悦': 'bg-yellow-100',
        '平静/满足': 'bg-green-100',
        '焦虑/紧张': 'bg-purple-100',
        '悲伤/低落': 'bg-blue-100',
        '愤怒/烦躁': 'bg-red-100',
        '疲惫/无力': 'bg-gray-100',
        '中性/平淡': 'bg-gray-100'
      };
      return classes[this.mood.emotionType] || 'bg-gray-100';
    },
    getIntensityColorClass() {
      const classes = {
        '快乐/愉悦': 'bg-yellow-500',
        '平静/满足': 'bg-green-500',
        '焦虑/紧张': 'bg-purple-500',
        '悲伤/低落': 'bg-blue-500',
        '愤怒/烦躁': 'bg-red-500',
        '疲惫/无力': 'bg-gray-500',
        '中性/平淡': 'bg-gray-500'
      };
      return classes[this.mood.emotionType] || 'bg-blue-500';
    },
    getIntensityTextClass() {
      const classes = {
        '快乐/愉悦': 'text-yellow-600',
        '平静/满足': 'text-green-600',
        '焦虑/紧张': 'text-purple-600',
        '悲伤/低落': 'text-blue-600',
        '愤怒/烦躁': 'text-red-600',
        '疲惫/无力': 'text-gray-600',
        '中性/平淡': 'text-gray-600'
      };
      return classes[this.mood.emotionType] || 'text-blue-600';
    },
    getTagClass(index) {
      const classes = [
        'bg-blue-50 text-blue-600',
        'bg-green-50 text-green-600',
        'bg-yellow-50 text-yellow-600',
        'bg-red-50 text-red-600',
        'bg-purple-50 text-purple-600',
        'bg-indigo-50 text-indigo-600',
        'bg-pink-50 text-pink-600'
      ];
      return classes[index % classes.length];
    }
  }
}
</script>