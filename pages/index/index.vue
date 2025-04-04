<template>
  <view class="flex flex-col h-full bg-gray-50">
    <!-- 固定在顶部的背景图 -->
    <view class="fixed top-0 left-0 right-0 z-0 h-[45vh]">
      <image src="/static/images/calm-bg.jpg" mode="aspectFill" class="w-full h-full" />
      <view class="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-blue-900/30"></view>

      <!-- 头部问候语 -->
      <view class="absolute bottom-8 left-6 right-6">
        <text class="text-white text-2xl font-light block">{{ greetingMessage }}，</text>
        <text class="text-white text-2xl font-light block">{{ userInfo.nickname || '朋友' }}</text>
      </view>
    </view>

    <!-- 内容区域 - 使用页面级滚动，不使用scroll-view -->
    <view
      class="mt-[calc(45vh-24px)] flex-1 relative z-10 bg-gradient-to-b from-blue-100 to-blue-50 rounded-t-3xl pt-8 pb-[50px]">
      <view class="px-6">
        <!-- 今日情绪状态 -->
        <view v-if="loadedSections.mood" class="mb-6">
          <view class="flex justify-between items-center mb-3">
            <text class="font-bold text-gray-800">今日情绪</text>
            <text class="text-sm text-gray-500">{{ formatDate(new Date()) }}</text>
          </view>

          <view v-if="todayMood" class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <view class="flex items-center">
              <view class="w-12 h-12 rounded-full flex items-center justify-center mr-3"
                :class="getEmotionBgClass(todayMood.type)">
                <text class="text-2xl">😌</text>
              </view>
              <view class="flex-1">
                <text class="font-medium text-gray-800">{{ todayMood.type }}</text>
                <view class="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                  <view class="h-full bg-green-500 rounded-full w-[70%]"></view>
                </view>
              </view>
              <navigator url="/pages/mood-tracker/index" class="ml-2 py-1.5 px-3 bg-purple-100 rounded-full">
                <text class="text-xs text-purple-600 font-medium">记录</text>
              </navigator>
            </view>
          </view>
        </view>

        <!-- 快捷功能 -->
        <view v-if="loadedSections.shortcuts" class="grid grid-cols-2 gap-4 mb-6">
          <!-- 情绪花园 -->
          <navigator url="/pages/mood-tracker/index"
            class="p-[1px] rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
            <view class="bg-white h-full rounded-[11px] p-4 flex flex-col items-center justify-center">
              <view class="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                <uni-icons type="heart" size="24" color="#EC4899"></uni-icons>
              </view>
              <text class="font-medium text-gray-800 text-center">情绪花园</text>
              <text class="text-xs text-gray-500 text-center">追踪情绪变化</text>
            </view>
          </navigator>

          <!-- 心灵笔记 -->
          <navigator url="/pages/mood-journal/index"
            class="p-[1px] rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
            <view class="bg-white h-full rounded-[11px] p-4 flex flex-col items-center justify-center">
              <view class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <uni-icons type="edit" size="24" color="#8B5CF6"></uni-icons>
              </view>
              <text class="font-medium text-gray-800 text-center">心灵笔记</text>
              <text class="text-xs text-gray-500 text-center">记录今日感受</text>
            </view>
          </navigator>
        </view>

        <!-- 今日推荐 -->
        <view v-if="loadedSections.recommendations" class="mb-6">
          <view class="flex justify-between items-center mb-3">
            <text class="font-bold text-gray-800">今日推荐</text>
            <text class="text-sm text-purple-600">更多</text>
          </view>

          <!-- 推荐卡片 -->
          <view class="bg-white rounded-xl overflow-hidden shadow-md mb-4 transform-gpu">
            <view class="h-32 relative bg-gradient-to-r from-indigo-500 to-purple-500 rounded-br-3xl">
              <view class="absolute bottom-3 left-4 text-white">
                <text class="text-lg font-bold">心灵深呼吸</text>
                <text class="text-xs">10分钟 · 舒缓焦虑</text>
              </view>
              <view
                class="absolute bottom-3 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                <uni-icons type="play-right" size="20" color="#6366F1"></uni-icons>
              </view>
            </view>
            <view class="p-4">
              <text class="text-sm text-gray-600">让紧张的思绪安静下来，找回内心的平静</text>
            </view>
          </view>

          <!-- 第二个推荐卡片 -->
          <view class="bg-white rounded-xl overflow-hidden shadow-md transform-gpu">
            <view class="h-32 relative bg-gradient-to-r from-amber-500 to-orange-500 rounded-br-3xl">
              <view class="absolute bottom-3 left-4 text-white">
                <text class="text-lg font-bold">积极思维训练</text>
                <text class="text-xs">8分钟 · 改变思维模式</text>
              </view>
              <view
                class="absolute -bottom-6 right-6 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
                <view
                  class="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                  <uni-icons type="play-right" size="24" color="#FFFFFF"></uni-icons>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 最近活动 -->
        <view v-if="loadedSections.activities" class="mb-6">
          <view class="flex justify-between items-center mb-3">
            <text class="font-bold text-gray-800">最近活动</text>
            <text class="text-sm text-purple-600">全部</text>
          </view>

          <view class="bg-white rounded-xl p-4 shadow-md relative overflow-hidden transform-gpu">
            <view class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-blue-500"></view>

            <view class="flex items-center pl-2 pb-3 mb-3 border-b border-gray-100">
              <view class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <uni-icons type="checkmarkempty" size="20" color="#10B981"></uni-icons>
              </view>
              <view class="flex-1">
                <text class="font-medium text-gray-800">情绪自我评估</text>
                <text class="text-xs text-gray-500 block">3天前完成</text>
              </view>
              <text class="text-sm text-purple-600">查看</text>
            </view>

            <view class="flex items-center pl-2">
              <view class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <uni-icons type="heart" size="20" color="#3B82F6"></uni-icons>
              </view>
              <view class="flex-1">
                <text class="font-medium text-gray-800">记录了情绪</text>
                <text class="text-xs text-gray-500 block">今天 09:30</text>
              </view>
              <text class="text-sm text-purple-600">查看</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import CategoryTabs from '@/components/category-tabs.vue'

export default {
  components: {
    CategoryTabs
  },
  data() {
    return {
      todayMood: {
        type: '平静/满足',
        level: 70
      },
      // 简化分类，减少选择负担
      categories: [
        { id: 'all', name: '所有' },
        { id: 'recommend', name: '推荐' },
        { id: 'meditation', name: '冥想' },
        { id: 'sleep', name: '睡眠' },
        { id: 'emotion', name: '情绪' }
      ],
      activeCategory: 'all',
      // 动态问候语
      greetingMessages: {
        morning: '早安',
        afternoon: '午好',
        evening: '晚上好'
      },
      loadedSections: {
        header: true,
        mood: false,
        shortcuts: false,
        recommendations: false,
        activities: false
      },
      userInfo: {
        nickname: ''
      }
    }
  },
  computed: {
    greetingMessage() {
      const hour = new Date().getHours();
      if (hour < 12) return this.greetingMessages.morning;
      if (hour < 18) return this.greetingMessages.afternoon;
      return this.greetingMessages.evening;
    }
  },
  methods: {
    changeCategory: function (category) {
      if (this.activeCategory === category) return;
      this.activeCategory = category;

      // 使用节流函数包装振动反馈
      this.throttleVibrate();
    },
    throttleVibrate: function () {
      if (this.vibrateTimer) return;
      this.vibrateTimer = setTimeout(() => {
        uni.vibrateShort();
        this.vibrateTimer = null;
      }, 300);
    },
    formatDate(date) {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
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
    loadMoodSection() {
      // 模拟异步加载
      setTimeout(() => {
        this.loadedSections.mood = true;
      }, 50);
    }
  },
  onLoad() {
    // 优先加载关键内容
    this.loadMoodSection();

    // 模拟获取用户信息
    setTimeout(() => {
      this.userInfo.nickname = '朋友';
    }, 100);

    // 延迟加载次要内容
    setTimeout(() => {
      this.loadedSections.shortcuts = true;
    }, 100);

    setTimeout(() => {
      this.loadedSections.recommendations = true;
    }, 200);

    setTimeout(() => {
      this.loadedSections.activities = true;
    }, 300);
  }
}
</script>

<style>
/* 添加硬件加速相关样式 */
.transform-gpu {
  transform: translateZ(0);
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
</style>