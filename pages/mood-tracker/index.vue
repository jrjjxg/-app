<template>
  <view class="flex flex-col h-full bg-gray-50">
    <!-- 头部 -->
    <view class="bg-gradient-to-r from-pink-500 to-purple-600 px-4 pt-12 pb-6">
      <view class="flex items-center mb-4">
        <navigator open-type="navigateBack" delta="1" hover-class="none">
          <view class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
            <uni-icons type="left" size="20" color="#FFFFFF"></uni-icons>
          </view>
        </navigator>
        <text class="text-xl font-bold text-white">情绪追踪</text>
      </view>
      <text class="text-white/80">记录和了解你的情绪变化</text>
    </view>

    <!-- 内容区域 - 使用页面级滚动替代scroll-view -->
    <view class="flex-1 px-4 py-5">
      <!-- 今日情绪卡片 -->
      <view class="bg-white rounded-xl p-5 shadow-sm mb-6 transform-gpu">
        <view class="flex justify-between items-center mb-4">
          <text class="font-bold text-gray-800">今日情绪</text>
          <text class="text-sm text-gray-500">{{ formatDateToChinese(new Date()) }}</text>
        </view>

        <view v-if="todayMood" class="mb-3">
          <view class="flex items-center mb-2">
            <view class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              :class="getEmotionBgClass(todayMood.emotionType)">
              <text class="text-2xl">{{ getEmotionEmoji(todayMood.emotionType) }}</text>
            </view>
            <view>
              <text class="font-medium text-gray-800">{{ todayMood.emotionType }}</text>
              <view class="flex items-center">
                <view class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                  <view class="h-full rounded-full" :class="getIntensityColorClass(todayMood.emotionType)"
                    :style="{ width: `${(todayMood.intensity / 5) * 100}%` }"></view>
                </view>
                <text class="text-xs text-gray-500">强度 {{ todayMood.intensity }}/5</text>
              </view>
            </view>
          </view>

          <text v-if="todayMood.note" class="text-sm text-gray-600 mb-3">{{ todayMood.note }}</text>

          <view v-if="todayMood.tags && todayMood.tags.length > 0" class="flex flex-wrap gap-2">
            <text v-for="(tag, index) in todayMood.tags" :key="index" class="px-2 py-1 rounded-full text-xs"
              :class="getTagClass(index)">{{ tag }}</text>
          </view>
        </view>

        <view v-else class="flex flex-col items-center justify-center py-6">
          <text class="text-gray-500 mb-4">今天还没有记录情绪</text>
          <button
            class="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-6 rounded-full text-sm font-medium"
            @click="goToRecordMood">
            记录当前情绪
          </button>
        </view>
      </view>

      <!-- 功能区域 - 使用grid布局代替复杂的flex布局 -->
      <view class="grid grid-cols-2 gap-4 mb-6">
        <navigator url="/pages/mood-tracker/record"
          class="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center transform-gpu">
          <view class="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-2">
            <uni-icons type="compose" size="24" color="#EC4899"></uni-icons>
          </view>
          <text class="font-medium text-gray-800">记录情绪</text>
          <text class="text-xs text-gray-500">记录当前感受</text>
        </navigator>

        <navigator url="/pages/mood-tracker/history"
          class="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center transform-gpu">
          <view class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
            <uni-icons type="list" size="24" color="#A78BFA"></uni-icons>
          </view>
          <text class="font-medium text-gray-800">历史记录</text>
          <text class="text-xs text-gray-500">查看过去情绪</text>
        </navigator>

        <navigator url="/pages/mood-tracker/analysis"
          class="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center transform-gpu">
          <view class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <uni-icons type="pie-filled" size="24" color="#60A5FA"></uni-icons>
          </view>
          <text class="font-medium text-gray-800">情绪分析</text>
          <text class="text-xs text-gray-500">了解情绪趋势</text>
        </navigator>

        <view class="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center opacity-50 transform-gpu">
          <view class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
            <uni-icons type="flag" size="24" color="#34D399"></uni-icons>
          </view>
          <text class="font-medium text-gray-800">情绪花园</text>
          <text class="text-xs text-gray-500">即将推出</text>
        </view>
      </view>

      <!-- 最近情绪记录 -->
      <view class="mb-6">
        <view class="flex justify-between items-center mb-3">
          <text class="font-bold text-gray-800">最近情绪</text>
          <navigator url="/pages/mood-tracker/history" class="text-sm text-blue-600">查看全部</navigator>
        </view>

        <view v-if="loading" class="flex justify-center py-4">
          <text class="text-gray-500">加载中...</text>
        </view>

        <view v-else-if="recentMoods.length === 0"
          class="bg-white rounded-xl p-5 shadow-sm flex justify-center transform-gpu">
          <text class="text-gray-500">暂无情绪记录</text>
        </view>

        <view v-else>
          <!-- 直接使用基础组件替代自定义组件 -->
          <view v-for="(mood, index) in recentMoods" :key="index"
            class="bg-white rounded-xl p-4 shadow-sm mb-3 transform-gpu" @click="viewMoodDetail(mood.id)">
            <view class="flex items-center mb-2">
              <view class="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                :class="getEmotionBgClass(mood.emotionType)">
                <text class="text-xl">{{ getEmotionEmoji(mood.emotionType) }}</text>
              </view>
              <view class="flex-1">
                <text class="font-medium text-gray-800">{{ mood.emotionType }}</text>
                <view class="flex items-center">
                  <view class="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden mr-1.5">
                    <view class="h-full rounded-full" :class="getIntensityColorClass(mood.emotionType)"
                      :style="{ width: `${(mood.intensity / 5) * 100}%` }"></view>
                  </view>
                  <text class="text-xs text-gray-500">{{ mood.intensity }}/5</text>
                </view>
              </view>
              <text class="text-xs text-gray-500">{{ formatRelativeDate(mood.createTime) }}</text>
            </view>
            <text v-if="mood.note" class="text-sm text-gray-600 line-clamp-2">{{ mood.note }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="p-4 bg-white border-t border-gray-200 transform-gpu">
      <button
        class="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-full font-medium shadow-sm"
        @click="goToRecordMood">
        记录当前情绪
      </button>
    </view>
  </view>
</template>

<script>
import { getMoodHistory } from '@/api/mood';
import { formatDateToChinese, formatRelativeDate, isSameDay } from '@/utils/dateUtils';

export default {
  data() {
    return {
      loading: true,
      todayMood: null,
      recentMoods: []
    }
  },
  onLoad() {
    this.loadMoodData();
  },
  onShow() {
    // 每次页面显示时重新加载数据
    this.loadMoodData();
  },
  methods: {
    async loadMoodData() {
      try {
        this.loading = true;
        const response = await getMoodHistory(1, 5);

        if (response.code === 200 && response.data) {
          this.recentMoods = response.data.records || [];

          // 检查是否有今天的记录
          const today = new Date();
          this.todayMood = this.recentMoods.find(mood =>
            isSameDay(new Date(mood.createTime), today)
          );
        }
      } catch (error) {
        console.error('加载情绪数据失败:', error);
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    goToRecordMood() {
      uni.navigateTo({
        url: '/pages/mood-tracker/record'
      });
    },

    viewMoodDetail(id) {
      const mood = this.recentMoods.find(m => m.id === id);
      if (mood) {
        uni.showModal({
          title: mood.emotionType,
          content: mood.note || '无记录内容',
          showCancel: false
        });
      }
    },

    // 使用导入的日期工具函数
    formatDateToChinese,
    formatRelativeDate,

    getEmotionEmoji(type) {
      const emojis = {
        '快乐/愉悦': '😊',
        '平静/满足': '😌',
        '焦虑/紧张': '😰',
        '悲伤/低落': '😢',
        '愤怒/烦躁': '😠',
        '疲惫/无力': '😴',
        '中性/平淡': '😐'
      };
      return emojis[type] || '😐';
    },

    getEmotionBgClass(type) {
      const classes = {
        '快乐/愉悦': 'bg-yellow-100',
        '平静/满足': 'bg-green-100',
        '焦虑/紧张': 'bg-purple-100',
        '悲伤/低落': 'bg-blue-100',
        '愤怒/烦躁': 'bg-red-100',
        '疲惫/无力': 'bg-gray-100',
        '中性/平淡': 'bg-gray-100'
      };
      return classes[type] || 'bg-gray-100';
    },

    getIntensityColorClass(type) {
      const classes = {
        '快乐/愉悦': 'bg-yellow-500',
        '平静/满足': 'bg-green-500',
        '焦虑/紧张': 'bg-purple-500',
        '悲伤/低落': 'bg-blue-500',
        '愤怒/烦躁': 'bg-red-500',
        '疲惫/无力': 'bg-gray-500',
        '中性/平淡': 'bg-gray-500'
      };
      return classes[type] || 'bg-blue-500';
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

<style>
/* 性能优化相关样式 */
.transform-gpu {
  transform: translateZ(0);
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>