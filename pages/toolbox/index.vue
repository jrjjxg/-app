<template>
  <view class="flex flex-col h-full bg-gray-50">
    <!-- 顶部区域 -->
    <view class="px-5 pt-12 pb-5 bg-gradient-to-r from-indigo-500 to-purple-600">
      <view class="mb-3">
        <text class="text-xl font-medium text-white">心灵工具箱</text>
        <text class="text-sm text-white/80 mt-1 block">探索完整的心理健康工具集</text>
      </view>
    </view>

    <!-- 内容区域 - 使用滚动视图确保内容可滚动 -->
    <scroll-view scroll-y class="flex-1 px-4 pb-20">
      <!-- 情绪管理系统 -->
      <view class="mt-5 mb-5">
        <view class="flex items-center mb-3">
          <view class="w-1.5 h-6 bg-pink-500 rounded-full mr-2"></view>
          <text class="text-base font-medium text-gray-800">情绪管理系统</text>
        </view>

        <view class="grid grid-cols-2 gap-3">
          <!-- 情绪记录 -->
          <view @tap="navigateTo('/pages/mood-tracker/index')"
            class="bg-white rounded-xl p-3 flex flex-col items-center shadow-sm border border-gray-100 active:bg-gray-50">
            <view class="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center mb-2">
              <uni-icons type="heart" size="24" color="#EC4899"></uni-icons>
            </view>
            <text class="text-sm text-gray-800 font-medium">情绪花园</text>
            <text class="text-xs text-gray-500 mt-1">追踪情绪变化</text>
          </view>

          <!-- 情绪识别 -->
          <view @tap="navigateTo('/pages/emotion-recognition/index')"
            class="bg-white rounded-xl p-3 flex flex-col items-center shadow-sm border border-gray-100 active:bg-gray-50">
            <view class="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <uni-icons type="camera" size="24" color="#8B5CF6"></uni-icons>
            </view>
            <text class="text-sm text-gray-800 font-medium">情绪识别</text>
            <text class="text-xs text-gray-500 mt-1">面部情绪分析</text>
          </view>
        </view>
      </view>

      <!-- 日记与反思 -->
      <view class="mb-5">
        <view class="flex items-center mb-3">
          <view class="w-1.5 h-6 bg-blue-500 rounded-full mr-2"></view>
          <text class="text-base font-medium text-gray-800">日记与反思</text>
        </view>

        <view class="grid grid-cols-2 gap-3">
          <!-- 心灵日记 -->
          <view @tap="navigateTo('/pages/journal/list')"
            class="bg-white rounded-xl p-3 flex flex-col items-center shadow-sm border border-gray-100 active:bg-gray-50">
            <view class="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <uni-icons type="compose" size="24" color="#3B82F6"></uni-icons>
            </view>
            <text class="text-sm text-gray-800 font-medium">心灵日记</text>
            <text class="text-xs text-gray-500 mt-1">记录情绪与思考</text>
          </view>

          <!-- 关键词分析 -->
          <view @tap="navigateTo('/pages/journal/keywords')"
            class="bg-white rounded-xl p-3 flex flex-col items-center shadow-sm border border-gray-100 active:bg-gray-50">
            <view class="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
              <uni-icons type="sort" size="24" color="#6366F1"></uni-icons>
            </view>
            <text class="text-sm text-gray-800 font-medium">关键词云</text>
            <text class="text-xs text-gray-500 mt-1">洞察记录模式</text>
          </view>
        </view>
      </view>

      <!-- 心理分析工具 -->
      <view class="mb-5">
        <view class="flex items-center mb-3">
          <view class="w-1.5 h-6 bg-amber-500 rounded-full mr-2"></view>
          <text class="text-base font-medium text-gray-800">心理分析工具</text>
        </view>

        <view class="grid grid-cols-2 gap-3">
          <!-- 心理测评 -->
          <view @tap="navigateTo('/pages/psychological-test/index')"
            class="bg-white rounded-xl p-3 flex flex-col items-center shadow-sm border border-gray-100 active:bg-gray-50">
            <view class="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-2">
              <uni-icons type="checkbox" size="24" color="#D97706"></uni-icons>
            </view>
            <text class="text-sm text-gray-800 font-medium">心理测评</text>
            <text class="text-xs text-gray-500 mt-1">专业量表评估</text>
          </view>

          <!-- 分析报告 -->
          <view @tap="navigateTo('/pages/reports/index')"
            class="bg-white rounded-xl p-3 flex flex-col items-center shadow-sm border border-gray-100 active:bg-gray-50">
            <view class="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-2">
              <uni-icons type="paperplane" size="24" color="#F59E0B"></uni-icons>
            </view>
            <text class="text-sm text-gray-800 font-medium">分析报告</text>
            <text class="text-xs text-gray-500 mt-1">全面健康洞察</text>
          </view>
        </view>
      </view>

      <!-- 情绪支持工具 -->
      <view class="mb-5">
        <view class="flex items-center mb-3">
          <view class="w-1.5 h-6 bg-green-500 rounded-full mr-2"></view>
          <text class="text-base font-medium text-gray-800">情绪支持工具</text>
        </view>

        <!-- 情绪支持卡片 -->
        <view class="bg-white rounded-xl shadow-sm border border-gray-100 mb-3 overflow-hidden">
          <view @tap="navigateTo('/pages/chatbot/index')" class="flex items-center p-4 active:bg-gray-50">
            <view class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <uni-icons type="chat" size="24" color="#3B82F6"></uni-icons>
            </view>
            <view class="flex-1">
              <text class="text-gray-800 font-medium">AI助手</text>
              <text class="text-xs text-gray-500 mt-0.5 block">智能情感交流支持</text>
            </view>
            <uni-icons type="right" size="16" color="#D1D5DB"></uni-icons>
          </view>

          <view class="border-t border-gray-100"></view>

          <view @tap="navigateTo('/pages/community/index')" class="flex items-center p-4 active:bg-gray-50">
            <view class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-3">
              <uni-icons type="staff" size="24" color="#8B5CF6"></uni-icons>
            </view>
            <view class="flex-1">
              <text class="text-gray-800 font-medium">社区圈子</text>
              <text class="text-xs text-gray-500 mt-0.5 block">志同道合的支持交流</text>
            </view>
            <uni-icons type="right" size="16" color="#D1D5DB"></uni-icons>
          </view>

          <view class="border-t border-gray-100"></view>

          <view @tap="navigateTo('/pages/driftbottle/index')" class="flex items-center p-4 active:bg-gray-50">
            <view class="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mr-3">
              <uni-icons type="paperplane" size="24" color="#06B6D4"></uni-icons>
            </view>
            <view class="flex-1">
              <text class="text-gray-800 font-medium">漂流瓶</text>
              <text class="text-xs text-gray-500 mt-0.5 block">匿名分享与倾诉</text>
            </view>
            <uni-icons type="right" size="16" color="#D1D5DB"></uni-icons>
          </view>
        </view>
      </view>

      <!-- 情绪调节练习 -->
      <view class="mb-5">
        <view class="flex items-center mb-3">
          <view class="w-1.5 h-6 bg-indigo-500 rounded-full mr-2"></view>
          <text class="text-base font-medium text-gray-800">情绪调节练习</text>
        </view>

        <view class="grid grid-cols-2 gap-3">
          <!-- 冥想放松 -->
          <view @tap="navigateTo('/pages/meditation/index')"
            class="bg-white rounded-xl p-3 flex flex-col items-center shadow-sm border border-gray-100 active:bg-gray-50">
            <view class="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
              <uni-icons type="sound" size="24" color="#6366F1"></uni-icons>
            </view>
            <text class="text-sm text-gray-800 font-medium">冥想放松</text>
            <text class="text-xs text-gray-500 mt-1">引导式冥想练习</text>
          </view>

          <!-- 深呼吸训练 -->
          <view @tap="navigateTo('/pages/breathing/index')"
            class="bg-white rounded-xl p-3 flex flex-col items-center shadow-sm border border-gray-100 active:bg-gray-50">
            <view class="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mb-2">
              <uni-icons type="refresh" size="24" color="#14B8A6"></uni-icons>
            </view>
            <text class="text-sm text-gray-800 font-medium">深呼吸训练</text>
            <text class="text-xs text-gray-500 mt-1">舒缓压力与焦虑</text>
          </view>
        </view>
      </view>

      <!-- 健康管理 -->
      <view class="mb-5">
        <view class="flex items-center mb-3">
          <view class="w-1.5 h-6 bg-rose-500 rounded-full mr-2"></view>
          <text class="text-base font-medium text-gray-800">健康管理</text>
        </view>

        <view class="grid grid-cols-2 gap-3">
          <!-- 心理健康状态 -->
          <view @tap="navigateTo('/pages/mental-status/dashboard')"
            class="bg-white rounded-xl p-3 flex flex-col items-center shadow-sm border border-gray-100 active:bg-gray-50">
            <view class="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mb-2">
              <uni-icons type="heart-filled" size="24" color="#F43F5E"></uni-icons>
            </view>
            <text class="text-sm text-gray-800 font-medium">健康状态</text>
            <text class="text-xs text-gray-500 mt-1">健康监测与预警</text>
          </view>

          <!-- 睡眠管理 -->
          <view @tap="navigateTo('/pages/sleep/index')"
            class="bg-white rounded-xl p-3 flex flex-col items-center shadow-sm border border-gray-100 active:bg-gray-50">
            <view class="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <uni-icons type="moon" size="24" color="#3B82F6"></uni-icons>
            </view>
            <text class="text-sm text-gray-800 font-medium">睡眠管理</text>
            <text class="text-xs text-gray-500 mt-1">改善睡眠质量</text>
          </view>
        </view>
      </view>

      <!-- 底部空间，确保最后一项可以完全滚动到视图内 -->
      <view class="h-10"></view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 无需太多状态数据，主要是导航功能
    }
  },
  methods: {
    navigateTo(url) {
      // 添加轻微振动反馈
      uni.vibrateShort({
        success: function () { }
      });

      // 导航到对应页面
      uni.navigateTo({
        url: url,
        fail: (error) => {
          console.error('导航失败:', error);
          uni.showToast({
            title: '该功能即将上线',
            icon: 'none'
          });
        }
      });
    }
  }
}
</script>

<style>
.active\:bg-gray-50:active {
  background-color: #F9FAFB;
}

/* 优化滚动性能 */
scroll-view {
  -webkit-overflow-scrolling: touch;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000;
  will-change: transform;
}
</style>