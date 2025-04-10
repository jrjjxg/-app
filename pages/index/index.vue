<template>
  <view class="flex flex-col h-full bg-gray-50">
    <!-- 固定在顶部的背景图 -->
    <view class="fixed top-0 left-0 right-0 z-0 h-[30vh]">
      <image :src="backgroundImage" mode="aspectFill" class="w-full h-full" />
      <view class="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-indigo-900/40"></view>

      <!-- 头部问候语 -->
      <view class="absolute bottom-8 left-6 right-6">
        <text class="text-white text-2xl font-medium block">情绪健康中心</text>
        <text class="text-white text-lg font-light mt-1 block">{{ greetingMessage }}，{{ userInfo.nickname || '朋友'
          }}</text>
      </view>
    </view>

    <!-- 内容区域 - 使用页面级滚动 -->
    <scroll-view scroll-y
      class="mt-[calc(30vh-24px)] flex-1 relative z-10 bg-gradient-to-b from-blue-50 to-white rounded-t-3xl pt-4 pb-[100px]">
      <!-- 情绪记录区 -->
      <view class="px-5 py-4 mb-3">
        <view class="flex items-center justify-between mb-3">
          <view class="flex items-center">
            <view class="w-1.5 h-6 bg-indigo-500 rounded-full mr-2"></view>
            <text class="text-base font-medium text-gray-800">情绪记录</text>
          </view>
          <view class="bg-indigo-50 px-3 py-1 rounded-full">
            <text class="text-xs text-indigo-600">{{ formatDate(new Date()) }}</text>
          </view>
        </view>

        <!-- 今日情绪状态卡片 -->
        <view v-if="todayMood" class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <view class="flex items-center">
            <view class="w-12 h-12 rounded-full flex items-center justify-center mr-3"
              :class="getEmotionBgClass(todayMood.type)">
              <text class="text-2xl">{{ getEmotionIcon(todayMood.type) }}</text>
            </view>
            <view class="flex-1">
              <text class="font-medium text-gray-800">今日心情: {{ todayMood.type }}</text>
              <view class="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                <view class="h-full rounded-full"
                  :style="{ width: todayMood.level + '%', backgroundColor: getEmotionColor(todayMood.type) }"></view>
              </view>
            </view>
            <view @tap="navigateTo('/pages/mood-tracker/record')"
              class="ml-2 py-1.5 px-3 bg-indigo-100 rounded-full active:bg-indigo-200">
              <text class="text-xs text-indigo-600 font-medium">更新</text>
            </view>
          </view>
        </view>

        <!-- 情绪记录快捷方式 -->
        <view class="grid grid-cols-3 gap-3">
          <!-- 快速记录情绪 -->
          <view @tap="navigateTo('/pages/mood-tracker/record')"
            class="bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 h-24 active:bg-gray-50">
            <view class="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mb-2">
              <uni-icons type="heart" size="20" color="#EC4899"></uni-icons>
            </view>
            <text class="text-xs text-gray-800 text-center">快速记录</text>
          </view>

          <!-- 写日记 -->
          <view @tap="navigateTo('/pages/journal/edit')"
            class="bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 h-24 active:bg-gray-50">
            <view class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <uni-icons type="compose" size="20" color="#3B82F6"></uni-icons>
            </view>
            <text class="text-xs text-gray-800 text-center">写日记</text>
          </view>

          <!-- 情绪识别 -->
          <view @tap="navigateTo('/pages/emotion-recognition/index')"
            class="bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 h-24 active:bg-gray-50">
            <view class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <uni-icons type="camera" size="20" color="#8B5CF6"></uni-icons>
            </view>
            <text class="text-xs text-gray-800 text-center">情绪识别</text>
          </view>
        </view>
      </view>

      <!-- 情绪分析区 -->
      <view class="px-5 py-4 mb-3">
        <view class="flex items-center justify-between mb-3">
          <view class="flex items-center">
            <view class="w-1.5 h-6 bg-blue-500 rounded-full mr-2"></view>
            <text class="text-base font-medium text-gray-800">情绪分析</text>
          </view>
          <view @tap="navigateTo('/pages/reports/index')" class="flex items-center">
            <text class="text-xs text-blue-500">查看全部</text>
            <uni-icons type="right" size="12" color="#3B82F6"></uni-icons>
          </view>
        </view>

        <!-- 情绪趋势图 -->
        <view class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <view class="flex justify-between items-center mb-3">
            <text class="font-medium text-gray-700">近期情绪趋势</text>
            <text class="text-xs text-gray-500">最近7天</text>
          </view>
          <view class="h-32 w-full">
            <!-- 这里可以引入图表组件，如果有的话 -->
            <view v-if="!moodTrendData.length" class="h-full flex items-center justify-center">
              <text class="text-gray-400 text-xs">暂无数据，请先记录情绪</text>
            </view>
            <view v-else class="h-full flex items-end justify-between">
              <view v-for="(item, index) in moodTrendData" :key="index" class="flex flex-col items-center flex-1">
                <view class="w-6 bg-blue-400 rounded-t-md mb-1"
                  :style="{ height: (item.level / 100 * 80) + 'px', backgroundColor: getEmotionColor(item.type) }"></view>
                <text class="text-gray-400 text-[10px]">{{ item.day }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 关键词云小组件 -->
        <view @tap="navigateTo('/pages/journal/keywords')"
          class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <view class="flex justify-between items-center mb-3">
            <text class="font-medium text-gray-700">情绪关键词</text>
            <uni-icons type="right" size="14" color="#9CA3AF"></uni-icons>
          </view>
          <view class="flex flex-wrap">
            <view v-for="(tag, index) in keywordTags" :key="index" class="px-2 py-1 rounded-full m-1 text-xs"
              :style="{ backgroundColor: tag.bgColor, color: tag.color }">
              {{ tag.name }}
            </view>
          </view>
        </view>
      </view>

      <!-- 情绪支持区 -->
      <view class="px-5 py-4 mb-3">
        <view class="flex items-center justify-between mb-3">
          <view class="flex items-center">
            <view class="w-1.5 h-6 bg-green-500 rounded-full mr-2"></view>
            <text class="text-base font-medium text-gray-800">情绪支持</text>
          </view>
        </view>

        <!-- 推荐支持卡片 -->
        <view class="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
          <view class="h-20 w-full relative">
            <image src="/static/images/meditation-bg.jpg" mode="aspectFill" class="w-full h-full" />
            <view class="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-transparent"></view>
            <view class="absolute left-4 bottom-3">
              <text class="text-white font-medium">{{ supportRecommendation.title }}</text>
              <text class="text-white/80 text-xs block mt-1">{{ supportRecommendation.subtitle }}</text>
            </view>
            <view class="absolute right-4 bottom-3 bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full">
              <text class="text-white text-xs">{{ supportRecommendation.duration }}</text>
            </view>
          </view>
          <view class="p-3 flex justify-between items-center">
            <text class="text-xs text-gray-500">{{ supportRecommendation.description }}</text>
            <view @tap="navigateTo(supportRecommendation.url)"
              class="px-4 py-1.5 bg-green-100 rounded-full active:bg-green-200">
              <text class="text-xs text-green-600 font-medium">开始</text>
            </view>
          </view>
        </view>

        <!-- 支持工具卡片组 -->
        <view class="grid grid-cols-2 gap-3">
          <!-- AI聊天 -->
          <view @tap="navigateTo('/pages/chatbot/threads')"
            class="bg-white rounded-xl p-4 flex items-center shadow-sm border border-gray-100 active:bg-gray-50">
            <view class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <uni-icons type="chat" size="20" color="#3B82F6"></uni-icons>
            </view>
            <view>
              <text class="text-sm text-gray-800 font-medium">AI助手</text>
              <text class="text-xs text-gray-500 block">情感交流与支持</text>
            </view>
          </view>

          <!-- 社区 -->
          <view @tap="navigateTo('/pages/social-hub/index')"
            class="bg-white rounded-xl p-4 flex items-center shadow-sm border border-gray-100 active:bg-gray-50">
            <view class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
              <uni-icons type="staff" size="20" color="#8B5CF6"></uni-icons>
            </view>
            <view>
              <text class="text-sm text-gray-800 font-medium">情绪社交</text>
              <text class="text-xs text-gray-500 block">分享与匿名互动</text>
            </view>
          </view>

          <!-- 冥想 -->
          <view @tap="navigateTo('/pages/meditation/index')"
            class="bg-white rounded-xl p-4 flex items-center shadow-sm border border-gray-100 active:bg-gray-50">
            <view class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
              <uni-icons type="sound" size="20" color="#6366F1"></uni-icons>
            </view>
            <view>
              <text class="text-sm text-gray-800 font-medium">冥想放松</text>
              <text class="text-xs text-gray-500 block">平静心灵</text>
            </view>
          </view>

          <!-- 心理测试 -->
          <view @tap="navigateTo('/pages/psychological-test/index')"
            class="bg-white rounded-xl p-4 flex items-center shadow-sm border border-gray-100 active:bg-gray-50">
            <view class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
              <uni-icons type="checkbox" size="20" color="#D97706"></uni-icons>
            </view>
            <view>
              <text class="text-sm text-gray-800 font-medium">心理测评</text>
              <text class="text-xs text-gray-500 block">深入了解自己</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      todayMood: {
        type: '平静/满足',
        level: 70
      },
      // 动态问候语
      greetingMessages: {
        morning: '早安',
        afternoon: '午好',
        evening: '晚上好'
      },
      loadedSections: {
        header: true,
        mood: false,
        analysis: false,
        support: false
      },
      userInfo: {
        nickname: ''
      },
      backgroundImage: '/static/images/calm-bg.jpg',
      // 情绪趋势示例数据
      moodTrendData: [
        { day: '一', level: 65, type: '平静/满足' },
        { day: '二', level: 80, type: '快乐/愉悦' },
        { day: '三', level: 60, type: '平静/满足' },
        { day: '四', level: 45, type: '焦虑/紧张' },
        { day: '五', level: 30, type: '悲伤/低落' },
        { day: '六', level: 50, type: '中性/平淡' },
        { day: '日', level: 75, type: '快乐/愉悦' }
      ],
      // 关键词示例数据
      keywordTags: [
        { name: '工作', bgColor: '#EFF6FF', color: '#3B82F6' },
        { name: '放松', bgColor: '#F0FDF4', color: '#22C55E' },
        { name: '家人', bgColor: '#FEF2F2', color: '#EF4444' },
        { name: '朋友', bgColor: '#F3E8FF', color: '#A855F7' },
        { name: '压力', bgColor: '#FEF3C7', color: '#D97706' },
        { name: '期待', bgColor: '#ECFDF5', color: '#10B981' }
      ],
      // 推荐支持
      supportRecommendation: {
        title: '减压冥想',
        subtitle: '舒缓情绪的指导练习',
        description: '基于你近期的情绪状态，推荐这个冥想练习',
        duration: '10分钟',
        url: '/pages/meditation/detail?id=stress-relief'
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
    formatDate(date) {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
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
    getEmotionIcon(type) {
      const icons = {
        '快乐/愉悦': '😊',
        '平静/满足': '😌',
        '焦虑/紧张': '😰',
        '悲伤/低落': '😔',
        '愤怒/烦躁': '😠',
        '疲惫/无力': '😩',
        '中性/平淡': '😐'
      };
      return icons[type] || '😐';
    },
    getEmotionColor(type) {
      const colors = {
        '快乐/愉悦': '#F59E0B',
        '平静/满足': '#10B981',
        '焦虑/紧张': '#8B5CF6',
        '悲伤/低落': '#3B82F6',
        '愤怒/烦躁': '#EF4444',
        '疲惫/无力': '#6B7280',
        '中性/平淡': '#9CA3AF'
      };
      return colors[type] || '#9CA3AF';
    },
    navigateTo(url) {
      uni.navigateTo({ url });
    },
    loadMoodSection() {
      setTimeout(() => {
        this.loadedSections.mood = true;
      }, 50);
    },
    loadAnalysisSection() {
      setTimeout(() => {
        this.loadedSections.analysis = true;
      }, 100);
    },
    loadSupportSection() {
      setTimeout(() => {
        this.loadedSections.support = true;
      }, 150);
    }
  },
  onLoad() {
    // 获取用户自定义背景图片
    try {
      const savedBackground = uni.getStorageSync('userBackgroundImage');
      if (savedBackground) {
        this.backgroundImage = savedBackground;
      }
    } catch (e) {
      console.error('获取背景图片设置失败', e);
    }

    // 优先加载关键内容
    this.loadMoodSection();
    this.loadAnalysisSection();
    this.loadSupportSection();

    // 模拟获取用户信息
    setTimeout(() => {
      this.userInfo.nickname = '朋友';

      // 在真实环境中，这里应该从API获取数据
      // 获取今日情绪
      // 获取情绪趋势数据
      // 获取关键词数据
      // 基于情绪状态生成推荐
    }, 100);
  }
}
</script>

<style>
.active\:bg-gray-50:active {
  background-color: #F9FAFB;
}

.active\:bg-indigo-200:active {
  background-color: #C7D2FE;
}

.active\:bg-green-200:active {
  background-color: #A7F3D0;
}
</style>