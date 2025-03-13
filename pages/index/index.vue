<template>
  <view class="flex flex-col h-full bg-gradient-to-b from-rose-50 to-blue-50">
    <!-- 状态栏 -->
    <view class="bg-white/80 backdrop-blur-sm px-4 py-3 flex justify-between items-center">
      <text class="text-sm font-medium text-gray-600">{{ greetingMessage }}</text>
      <view class="flex space-x-2">
        <uni-icons type="signal" size="18" color="#60A5FA"></uni-icons>
        <uni-icons type="wifi" size="18" color="#60A5FA"></uni-icons>
        <uni-icons type="battery" size="18" color="#60A5FA"></uni-icons>
      </view>
    </view>
    
    <!-- 内容区域 - 更加简洁的布局 -->
    <scroll-view scroll-y class="flex-1 px-5 pt-4 pb-20">
      <!-- 头部标题 -->
      <view class="flex items-center mb-5 animate-fade-in">
        <view>
          <text class="text-2xl font-bold text-gray-800 mb-1 block">心灵花园</text>
          <text class="text-sm text-gray-500">今天，与自己温柔相处</text>
        </view>
        <view class="ml-auto w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
          <uni-icons type="search" size="20" color="#9CA3AF"></uni-icons>
        </view>
      </view>
      
      <!-- 今日情绪状态 -->
      <view class="mb-6 animate-fade-in-delay-1">
        <view class="bg-white rounded-xl p-5 shadow-sm">
          <view class="flex justify-between items-center mb-3">
            <text class="font-bold text-gray-800">今日情绪</text>
            <text class="text-sm text-gray-500">{{ formatDate(new Date()) }}</text>
          </view>
          
          <view v-if="todayMood" class="flex items-center">
            <view class="w-12 h-12 rounded-full flex items-center justify-center mr-3" :class="getEmotionBgClass('平静/满足')">
              <text class="text-2xl">😌</text>
            </view>
            <view class="flex-1">
              <text class="font-medium text-gray-800">平静/满足</text>
              <view class="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                <view class="h-full bg-green-500 rounded-full" style="width: 70%"></view>
              </view>
            </view>
            <navigator url="/pages/mood-tracker/index" class="ml-2">
              <view class="px-3 py-1.5 bg-purple-100 rounded-full">
                <text class="text-xs text-purple-600 font-medium">记录</text>
              </view>
            </navigator>
          </view>
          
          <view v-else class="flex items-center justify-between">
            <text class="text-gray-500">今天还没有记录情绪</text>
            <navigator url="/pages/mood-tracker/record" class="px-3 py-1.5 bg-purple-100 rounded-full">
              <text class="text-xs text-purple-600 font-medium">立即记录</text>
            </navigator>
          </view>
        </view>
      </view>
      
      <!-- 快捷功能 -->
      <view class="grid grid-cols-2 gap-4 mb-6 animate-fade-in-delay-2">
        <!-- 情绪花园 -->
        <navigator url="/pages/mood-tracker/index" 
                  class="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center justify-center">
          <view class="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-2">
            <uni-icons type="heart" size="24" color="#EC4899"></uni-icons>
          </view>
          <text class="font-medium text-gray-800 text-center">情绪花园</text>
          <text class="text-xs text-gray-500 text-center">追踪情绪变化</text>
        </navigator>
        
        <!-- 心灵笔记 -->
        <navigator url="/pages/mood-journal/index" 
                  class="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center justify-center">
          <view class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
            <uni-icons type="edit" size="24" color="#8B5CF6"></uni-icons>
          </view>
          <text class="font-medium text-gray-800 text-center">心灵笔记</text>
          <text class="text-xs text-gray-500 text-center">记录今日感受</text>
        </navigator>
      </view>
      
      <!-- 今日推荐 -->
      <view class="mb-6 animate-fade-in-delay-3">
        <view class="flex justify-between items-center mb-3">
          <text class="font-bold text-gray-800">今日推荐</text>
          <text class="text-sm text-purple-500">更多</text>
        </view>
        
        <!-- 推荐卡片 -->
        <view class="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
          <view class="h-32 bg-gradient-to-r from-indigo-400 to-purple-400 relative">
            <view class="absolute bottom-3 left-4 text-white">
              <view class="text-lg font-bold">心灵深呼吸</view>
              <view class="text-xs">10分钟 · 舒缓焦虑</view>
            </view>
            <view class="absolute bottom-3 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
              <uni-icons type="play-right" size="20" color="#6366F1"></uni-icons>
            </view>
          </view>
          <view class="p-3">
            <text class="text-sm text-gray-600">让紧张的思绪安静下来，找回内心的平静</text>
          </view>
        </view>
        
        <!-- 第二个推荐卡片 -->
        <view class="bg-white rounded-xl overflow-hidden shadow-sm">
          <view class="h-32 bg-gradient-to-r from-amber-400 to-orange-400 relative">
            <view class="absolute bottom-3 left-4 text-white">
              <view class="text-lg font-bold">积极思维训练</view>
              <view class="text-xs">8分钟 · 改变思维模式</view>
            </view>
            <view class="absolute bottom-3 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
              <uni-icons type="play-right" size="20" color="#F59E0B"></uni-icons>
            </view>
          </view>
          <view class="p-3">
            <text class="text-sm text-gray-600">学习识别消极思维，培养积极的思考方式</text>
          </view>
        </view>
      </view>
      
      <!-- 最近活动 -->
      <view class="mb-6 animate-fade-in-delay-4">
        <view class="flex justify-between items-center mb-3">
          <text class="font-bold text-gray-800">最近活动</text>
          <text class="text-sm text-purple-500">全部</text>
        </view>
        
        <view class="bg-white rounded-xl p-4 shadow-sm">
          <view class="flex items-center mb-3 pb-3 border-b border-gray-100">
            <view class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <uni-icons type="checkmarkempty" size="20" color="#10B981"></uni-icons>
            </view>
            <view class="flex-1">
              <text class="font-medium text-gray-800">情绪自我评估</text>
              <text class="text-xs text-gray-500 block">3天前完成</text>
            </view>
            <text class="text-sm text-purple-500">查看</text>
          </view>
          
          <view class="flex items-center">
            <view class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <uni-icons type="heart" size="20" color="#3B82F6"></uni-icons>
            </view>
            <view class="flex-1">
              <text class="font-medium text-gray-800">记录了情绪</text>
              <text class="text-xs text-gray-500 block">今天 09:30</text>
            </view>
            <text class="text-sm text-purple-500">查看</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部导航栏 -->
    <view class="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-2">
      <view class="flex flex-col items-center">
        <uni-icons type="home-filled" size="24" color="#8B5CF6"></uni-icons>
        <text class="text-xs mt-1 text-purple-600 font-medium">首页</text>
      </view>
      
      <navigator url="/pages/toolbox/index" class="flex flex-col items-center">
        <uni-icons type="grid" size="24" color="#9CA3AF"></uni-icons>
        <text class="text-xs mt-1 text-gray-500">工具箱</text>
      </navigator>
      
      <navigator url="/pages/psychological-test/index" class="flex flex-col items-center">
        <uni-icons type="checkbox" size="24" color="#9CA3AF"></uni-icons>
        <text class="text-xs mt-1 text-gray-500">测评</text>
      </navigator>
      
      <navigator url="/pages/profile/index" class="flex flex-col items-center">
        <uni-icons type="person" size="24" color="#9CA3AF"></uni-icons>
        <text class="text-xs mt-1 text-gray-500">我的</text>
      </navigator>
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
      showSecondaryContent: false,
      todayMood: { type: '平静/满足', intensity: 3.5 }, // 模拟数据
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
        morning: '早安，愿今天充满正能量',
        afternoon: '午好，休息一下，调整心情',
        evening: '晚上好，是时候放松一下了'
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
    changeCategory: function(category) {
      if (this.activeCategory === category) return;
      this.activeCategory = category;
      
      // 使用节流函数包装振动反馈
      this.throttleVibrate();
    },
    throttleVibrate: function() {
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
    }
  },
  onLoad() {
    // 延迟加载次要内容
    setTimeout(() => {
      this.showSecondaryContent = true;
    }, 300);
  }
}
</script>

<style>
/* 动画效果 */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.animate-fade-in-delay-1 {
  animation: fadeIn 0.5s ease-out 0.1s both;
}

.animate-fade-in-delay-2 {
  animation: fadeIn 0.5s ease-out 0.2s both;
}

.animate-fade-in-delay-3 {
  animation: fadeIn 0.5s ease-out 0.3s both;
}

.animate-fade-in-delay-4 {
  animation: fadeIn 0.5s ease-out 0.4s both;
}

.animate-fade-in-delay-5 {
  animation: fadeIn 0.5s ease-out 0.5s both;
}

.animate-fade-in-delay-6 {
  animation: fadeIn 0.5s ease-out 0.6s both;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;  /* 添加标准属性 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 添加样式 */
.icon-with-bg {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: #d8b4fe;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 添加静态样式类 */
.progress-bar-60 {
  width: 60%;
  background: linear-gradient(to right, #93c5fd, #c4b5fd);
}
</style>