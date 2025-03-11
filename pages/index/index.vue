<template>
  <view class="flex flex-col h-full bg-gradient-to-b from-rose-50 to-blue-50">
    <!-- 状态栏 - 更柔和的设计 -->
    <view class="bg-white/80 backdrop-blur-sm px-4 py-3 flex justify-between items-center">
      <text class="text-sm font-medium text-gray-600">{{ greetingMessage }}</text>
      <view class="flex space-x-2">
        <uni-icons type="signal" size="18" color="#60A5FA"></uni-icons>
        <uni-icons type="wifi" size="18" color="#60A5FA"></uni-icons>
        <uni-icons type="battery" size="18" color="#60A5FA"></uni-icons>
      </view>
    </view>
    
    <!-- 内容区域 - 增加顶部边距，让内容呼吸 -->
    <scroll-view scroll-y class="flex-1 px-5 pt-4 pb-2">
      <!-- 头部搜索 - 更亲和的设计 -->
      <view class="flex items-center mb-6 animate-fade-in">
        <view>
          <text class="text-2xl font-bold text-gray-800 mb-1 block">心灵花园</text>
          <text class="text-sm text-gray-500">今天，与自己温柔相处</text>
        </view>
        <view class="ml-auto w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
          <uni-icons type="search" size="20" color="#9CA3AF"></uni-icons>
        </view>
      </view>
      
      <!-- 情绪状态卡片 - 全新设计 -->
      <navigator url="/pages/mood-tracker/index" 
                class="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 mb-6 animate-fade-in-delay-1">
        <view class="flex items-center">
          <uni-icons type="heart" size="24" color="#FFFFFF" class="icon-with-bg"></uni-icons>
          <view class="ml-3">
            <text class="text-lg font-medium text-gray-800">今日情绪</text>
            <text class="text-sm text-gray-500 block">记录此刻的心情...</text>
          </view>
          <view class="ml-auto flex items-center justify-center">
            <uni-icons type="right" size="16" color="#9CA3AF"></uni-icons>
          </view>
        </view>
        <view class="h-2 rounded-full bg-gray-100 overflow-hidden">
          <view class="h-full progress-bar-60 rounded-full"></view>
        </view>
      </navigator>
      
      <!-- 分类标签 - 圆角设计，更少的选项，突出重点 -->
      <view class="mb-6 animate-fade-in-delay-2">
        <scroll-view scroll-x class="whitespace-nowrap -mx-5 px-5" show-scrollbar="false">
          <view class="inline-flex space-x-2">
            <view v-for="(category, index) in categories" :key="index"
                 class="px-4 py-2 rounded-full cursor-pointer transition-all duration-300"
                 :class="activeCategory === category.id ? 
                         'bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-sm' : 
                         'bg-white text-gray-600 hover:bg-gray-50'"
                 @click="changeCategory(category.id)">
              <text>{{ category.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
      
      <!-- 推荐内容 - 温暖的色彩，更具吸引力的文案 -->
      <view class="mb-6 animate-fade-in-delay-3">
        <view class="flex justify-between items-center mb-4">
          <text class="font-bold text-gray-800">今日疗愈</text>
          <text class="text-sm text-purple-500">查看全部</text>
        </view>
        
        <!-- 推荐卡片 - 更柔和的渐变、现代卡片设计 -->
        <view class="bg-white rounded-2xl overflow-hidden shadow-sm mb-5 transition-all duration-300 hover:shadow-md">
          <view class="h-32 bg-gradient-to-r from-indigo-400 to-purple-400 relative">
            <view class="absolute bottom-4 left-4 text-white">
              <view class="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs inline-flex items-center mb-2">
                <uni-icons type="star" size="14" color="#FFFFFF" class="mr-1"></uni-icons>
                <text>专为你定制</text>
              </view>
              <view class="text-lg font-bold mb-1">心灵深呼吸</view>
              <view class="text-xs">10分钟 · 舒缓焦虑</view>
            </view>
            <view class="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center
                       transform transition-transform duration-300 hover:scale-110">
              <uni-icons type="play-right" size="20" color="#6366F1"></uni-icons>
            </view>
          </view>
          <view class="p-4">
            <text class="text-sm text-gray-600 mb-3">让紧张的思绪安静下来，给自己一刻宁静的时光，重新找回内心的平静</text>
            <view class="flex text-xs text-gray-500">
              <view class="flex items-center mr-4">
                <uni-icons type="headphones" size="14" color="#6B7280" class="mr-1"></uni-icons>
                <text>引导音频</text>
              </view>
              <view class="flex items-center">
                <uni-icons type="person" size="14" color="#6B7280" class="mr-1"></uni-icons>
                <text>12,458人正在疗愈</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 心理测试区域 - 更和谐的视觉设计 -->
      <view class="mt-6 mb-6 animate-fade-in-delay-4">
        <view class="flex justify-between items-center mb-3">
          <text class="font-bold text-gray-800">心理健康评估</text>
          <navigator url="/pages/psychological-test/index" class="text-sm text-purple-500">探索更多</navigator>
        </view>
        
        <view class="bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
          <view class="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <text class="font-bold text-gray-800 mb-1 block">探索内心世界</text>
            <text class="text-sm text-gray-600">科学测评，发现真实的自己</text>
          </view>
          
          <navigator url="/pages/psychological-test/index" hover-class="bg-gray-50">
            <view class="p-4 flex items-center justify-between border-b border-gray-50 transition-all duration-300">
              <view class="flex items-center">
                <view class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mr-3">
                  <uni-icons type="checkbox" size="20" color="#3B82F6"></uni-icons>
                </view>
                <view>
                  <text class="font-medium text-gray-800">焦虑自评</text>
                  <text class="text-xs text-gray-500 block">了解你的焦虑水平</text>
                </view>
              </view>
              <text class="text-purple-500 text-sm">5分钟</text>
            </view>
          </navigator>
          
          <navigator url="/pages/psychological-test/index" hover-class="bg-gray-50">
            <view class="p-4 flex items-center justify-between border-b border-gray-50 transition-all duration-300">
              <view class="flex items-center">
                <view class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mr-3">
                  <uni-icons type="info" size="20" color="#8B5CF6"></uni-icons>
                </view>
                <view>
                  <text class="font-medium text-gray-800">性格探索</text>
                  <text class="text-xs text-gray-500 block">发现你的性格优势</text>
                </view>
              </view>
              <text class="text-purple-500 text-sm">10分钟</text>
            </view>
          </navigator>
          
          <view class="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
            <view class="flex items-center mb-2">
              <uni-icons type="checkmarkempty" size="16" color="#10B981" class="mr-2"></uni-icons>
              <text class="font-medium text-gray-700">最近完成</text>
            </view>
            <view class="flex justify-between items-center">
              <view>
                <text class="text-gray-800">情绪自我评估</text>
                <text class="text-xs text-gray-500 block">3天前完成</text>
              </view>
              <text class="text-purple-500 text-sm">查看报告</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 情绪调节工具 - 更有吸引力的卡片设计 -->
      <view class="mt-6 animate-fade-in-delay-5">
        <view class="flex justify-between items-center mb-4">
          <text class="font-bold text-gray-800">疗愈工具箱</text>
          <text class="text-sm text-purple-500">全部工具</text>
        </view>
        
        <scroll-view 
          scroll-x 
          class="whitespace-nowrap -mx-5 px-5" 
          show-scrollbar="false"
          enhanced="true"
          :bounces="true"
        >
          <!-- 情绪追踪入口卡片 -->
          <navigator url="/pages/mood-tracker/index" 
                    class="inline-block w-36 mr-3 bg-white rounded-xl overflow-hidden shadow-sm 
                          transition-transform duration-300 hover:scale-105 hover:shadow-md">
            <view class="h-24 bg-gradient-to-r from-rose-400 to-pink-400 flex items-center justify-center">
              <uni-icons type="heart" size="32" color="#FFFFFF"></uni-icons>
            </view>
            <view class="p-3">
              <text class="font-medium text-gray-800 block">情绪花园</text>
              <text class="text-xs text-gray-500">记录心情变化</text>
            </view>
          </navigator>
          
          <view class="inline-block w-36 mr-3 bg-white rounded-xl overflow-hidden shadow-sm 
                        transition-transform duration-300 hover:scale-105 hover:shadow-md">
            <view class="h-24 bg-gradient-to-r from-teal-400 to-emerald-400 flex items-center justify-center">
              <uni-icons type="refresh" size="32" color="#FFFFFF"></uni-icons>
            </view>
            <view class="p-3">
              <text class="font-medium text-gray-800 block">深呼吸</text>
              <text class="text-xs text-gray-500">5分钟 · 平复情绪</text>
            </view>
          </view>
          
          <view class="inline-block w-36 mr-3 bg-white rounded-xl overflow-hidden shadow-sm 
                        transition-transform duration-300 hover:scale-105 hover:shadow-md">
            <view class="h-24 bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center">
              <uni-icons type="brain" size="32" color="#FFFFFF"></uni-icons>
            </view>
            <view class="p-3">
              <text class="font-medium text-gray-800 block">思维重塑</text>
              <text class="text-xs text-gray-500">8分钟 · 积极思考</text>
            </view>
          </view>
          
          <view class="inline-block w-36 mr-3 bg-white rounded-xl overflow-hidden shadow-sm 
                        transition-transform duration-300 hover:scale-105 hover:shadow-md">
            <view class="h-24 bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center">
              <uni-icons type="moon" size="32" color="#FFFFFF"></uni-icons>
            </view>
            <view class="p-3">
              <text class="font-medium text-gray-800 block">夜间安眠</text>
              <text class="text-xs text-gray-500">15分钟 · 深度放松</text>
            </view>
          </view>
          
          <!-- 提示滑动查看更多 -->
          <view class="inline-flex items-center justify-center h-24 px-4 text-gray-400 text-sm">
            <uni-icons type="right" size="16" color="#9CA3AF" class="mr-1"></uni-icons>
            <text>向右滑动查看更多</text>
          </view>
        </scroll-view>
      </view>
      
      <!-- 心灵笔记入口 - 简洁卡片设计 -->
      <navigator url="/pages/mood-journal/index" 
                class="mt-6 mb-6 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-delay-6">
        <view class="flex items-center">
          <view class="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-300 to-purple-300 flex items-center justify-center mr-3">
            <uni-icons type="edit" size="24" color="#FFFFFF"></uni-icons>
          </view>
          <view>
            <text class="text-lg font-medium text-gray-800">心灵笔记</text>
            <text class="text-sm text-gray-500 block">记录今日的心情感受...</text>
          </view>
          <view class="ml-auto flex items-center justify-center">
            <uni-icons type="right" size="16" color="#9CA3AF"></uni-icons>
          </view>
        </view>
      </navigator>
    </scroll-view>
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