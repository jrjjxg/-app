<template>
  <view v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 半透明背景 -->
    <view class="absolute inset-0 bg-black/40" @click="closePopup"></view>
    
    <!-- 弹窗内容 -->
    <view class="relative w-4/5 max-w-sm bg-white rounded-xl shadow-xl overflow-hidden transform transition-all">
      <!-- 顶部图片区域 -->
      <view class="h-32 bg-gradient-to-r" :class="gradientClass">
        <view class="absolute top-3 right-3">
          <view class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center" @click="closePopup">
            <uni-icons type="close" size="16" color="#FFFFFF"></uni-icons>
          </view>
        </view>
        <view class="absolute bottom-3 left-4 text-white">
          <text class="text-lg font-bold">{{ title }}</text>
          <text class="text-xs block">{{ subtitle }}</text>
        </view>
      </view>
      
      <!-- 内容区域 -->
      <view class="p-4">
        <text class="text-sm text-gray-600 mb-4 block">{{ description }}</text>
        
        <!-- 推荐内容 -->
        <view class="mb-4">
          <view class="flex items-center mb-2">
            <view class="w-10 h-10 rounded-full flex items-center justify-center mr-3" :class="iconBgClass">
              <uni-icons :type="iconType" size="20" :color="iconColor"></uni-icons>
            </view>
            <view>
              <text class="font-medium text-gray-800">{{ recommendTitle }}</text>
              <text class="text-xs text-gray-500 block">{{ recommendSubtitle }}</text>
            </view>
          </view>
        </view>
        
        <!-- 按钮区域 -->
        <view class="flex justify-between">
          <view class="px-4 py-2 rounded-full bg-gray-100" @click="closePopup">
            <text class="text-sm text-gray-600">稍后再说</text>
          </view>
          <view class="px-4 py-2 rounded-full" :class="buttonClass" @click="goToRecommend">
            <text class="text-sm text-white">立即查看</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'emotion', // emotion, test, daily
      validator: (value) => ['emotion', 'test', 'daily'].includes(value)
    },
    emotionType: {
      type: String,
      default: '平静/满足'
    },
    testResult: {
      type: Object,
      default: () => ({})
    },
    recommendUrl: {
      type: String,
      default: ''
    }
  },
  computed: {
    // 根据类型和情绪/测试结果计算推荐内容
    title() {
      if (this.type === 'emotion') {
        const emotionTitles = {
          '快乐/愉悦': '保持好心情',
          '平静/满足': '享受平静时刻',
          '焦虑/紧张': '缓解焦虑',
          '悲伤/低落': '情绪调节',
          '愤怒/烦躁': '平复情绪',
          '疲惫/无力': '恢复活力',
          '中性/平淡': '提升心情'
        };
        return emotionTitles[this.emotionType] || '个性化推荐';
      } else if (this.type === 'test') {
        return '测评结果推荐';
      } else {
        return '今日推荐';
      }
    },
    subtitle() {
      if (this.type === 'emotion') {
        const emotionSubtitles = {
          '快乐/愉悦': '延续美好情绪',
          '平静/满足': '深度放松练习',
          '焦虑/紧张': '5分钟减压',
          '悲伤/低落': '温和疗愈',
          '愤怒/烦躁': '冷静思考',
          '疲惫/无力': '能量恢复',
          '中性/平淡': '情绪提升'
        };
        return emotionSubtitles[this.emotionType] || '为你定制';
      } else if (this.type === 'test') {
        return '基于你的测评结果';
      } else {
        return '每日精选';
      }
    },
    description() {
      if (this.type === 'emotion') {
        const emotionDescriptions = {
          '快乐/愉悦': '很高兴看到你今天心情不错！以下是我们为你推荐的内容，帮助你保持这种积极的状态。',
          '平静/满足': '平静是一种珍贵的状态，我们为你准备了一些内容，帮助你更好地享受这种平静。',
          '焦虑/紧张': '注意到你感到焦虑，这是很常见的情绪。以下是一些可能帮助你缓解焦虑的方法。',
          '悲伤/低落': '每个人都有情绪低落的时候，这些内容可能帮助你度过这段时期。',
          '愤怒/烦躁': '感到烦躁是正常的，这些工具可以帮助你平复情绪，找回平静。',
          '疲惫/无力': '休息和恢复同样重要，这些内容可以帮助你恢复活力。',
          '中性/平淡': '有时平淡也是一种状态，这些内容可能会为你的一天增添一些色彩。'
        };
        return emotionDescriptions[this.emotionType] || '根据你的情绪状态，我们为你推荐了以下内容。';
      } else if (this.type === 'test') {
        return '根据你的测评结果，我们为你精心挑选了一些可能对你有帮助的内容。';
      } else {
        return '每天一点小进步，积累成就大改变。今天为你推荐：';
      }
    },
    recommendTitle() {
      if (this.type === 'emotion') {
        const titles = {
          '快乐/愉悦': '正念冥想',
          '平静/满足': '深度放松',
          '焦虑/紧张': '深呼吸练习',
          '悲伤/低落': '情绪疗愈',
          '愤怒/烦躁': '思维重塑',
          '疲惫/无力': '能量恢复',
          '中性/平淡': '积极思维训练'
        };
        return titles[this.emotionType] || '个性化推荐';
      } else if (this.type === 'test') {
        return '专属练习';
      } else {
        return '每日冥想';
      }
    },
    recommendSubtitle() {
      if (this.type === 'emotion') {
        const subtitles = {
          '快乐/愉悦': '10分钟 · 享受当下',
          '平静/满足': '15分钟 · 深度放松',
          '焦虑/紧张': '5分钟 · 快速减压',
          '悲伤/低落': '10分钟 · 温和疗愈',
          '愤怒/烦躁': '8分钟 · 情绪调节',
          '疲惫/无力': '10分钟 · 恢复活力',
          '中性/平淡': '8分钟 · 提升心情'
        };
        return subtitles[this.emotionType] || '为你定制';
      } else if (this.type === 'test') {
        return '根据测评结果定制';
      } else {
        return '10分钟 · 提升专注力';
      }
    },
    gradientClass() {
      if (this.type === 'emotion') {
        const gradients = {
          '快乐/愉悦': 'from-yellow-400 to-orange-400',
          '平静/满足': 'from-green-400 to-teal-400',
          '焦虑/紧张': 'from-purple-400 to-indigo-400',
          '悲伤/低落': 'from-blue-400 to-indigo-400',
          '愤怒/烦躁': 'from-red-400 to-pink-400',
          '疲惫/无力': 'from-gray-400 to-slate-500',
          '中性/平淡': 'from-blue-400 to-purple-400'
        };
        return gradients[this.emotionType] || 'from-indigo-400 to-purple-400';
      } else if (this.type === 'test') {
        return 'from-blue-400 to-indigo-600';
      } else {
        return 'from-purple-400 to-pink-400';
      }
    },
    iconType() {
      if (this.type === 'emotion') {
        const icons = {
          '快乐/愉悦': 'star',
          '平静/满足': 'staff',
          '焦虑/紧张': 'refresh',
          '悲伤/低落': 'heart',
          '愤怒/烦躁': 'brain',
          '疲惫/无力': 'moon',
          '中性/平淡': 'sun'
        };
        return icons[this.emotionType] || 'star';
      } else if (this.type === 'test') {
        return 'checkbox';
      } else {
        return 'headphones';
      }
    },
    iconBgClass() {
      if (this.type === 'emotion') {
        const bgColors = {
          '快乐/愉悦': 'bg-yellow-100',
          '平静/满足': 'bg-green-100',
          '焦虑/紧张': 'bg-purple-100',
          '悲伤/低落': 'bg-blue-100',
          '愤怒/烦躁': 'bg-red-100',
          '疲惫/无力': 'bg-gray-100',
          '中性/平淡': 'bg-blue-100'
        };
        return bgColors[this.emotionType] || 'bg-indigo-100';
      } else if (this.type === 'test') {
        return 'bg-blue-100';
      } else {
        return 'bg-purple-100';
      }
    },
    iconColor() {
      if (this.type === 'emotion') {
        const colors = {
          '快乐/愉悦': '#F59E0B',
          '平静/满足': '#10B981',
          '焦虑/紧张': '#8B5CF6',
          '悲伤/低落': '#3B82F6',
          '愤怒/烦躁': '#EF4444',
          '疲惫/无力': '#6B7280',
          '中性/平淡': '#3B82F6'
        };
        return colors[this.emotionType] || '#6366F1';
      } else if (this.type === 'test') {
        return '#3B82F6';
      } else {
        return '#8B5CF6';
      }
    },
    buttonClass() {
      if (this.type === 'emotion') {
        const buttons = {
          '快乐/愉悦': 'bg-yellow-500',
          '平静/满足': 'bg-green-500',
          '焦虑/紧张': 'bg-purple-500',
          '悲伤/低落': 'bg-blue-500',
          '愤怒/烦躁': 'bg-red-500',
          '疲惫/无力': 'bg-gray-500',
          '中性/平淡': 'bg-blue-500'
        };
        return buttons[this.emotionType] || 'bg-indigo-500';
      } else if (this.type === 'test') {
        return 'bg-blue-500';
      } else {
        return 'bg-purple-500';
      }
    }
  },
  methods: {
    closePopup() {
      this.$emit('close');
    },
    goToRecommend() {
      if (this.recommendUrl) {
        uni.navigateTo({
          url: this.recommendUrl
        });
      }
      this.closePopup();
    }
  }
}
</script>

<style>
</style> 