<template>
  <view class="intensity-slider">
    <!-- 强度可视化 -->
    <view class="relative mb-6">
      <view class="h-3 bg-gray-200 rounded-full overflow-hidden">
        <view class="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r" 
              :class="getIntensityGradient()"
              :style="{ width: `${(intensity / 5) * 100}%` }">
        </view>
      </view>
    </view>
    
    <!-- 强度选择按钮 -->
    <view class="flex justify-between mb-2">
      <view v-for="i in 5" :key="i" 
            @click="setIntensity(i)"
            class="intensity-point flex flex-col items-center transition-all duration-300"
            :class="{'selected': intensity >= i}">
        <view class="w-10 h-10 rounded-full flex items-center justify-center mb-1" 
              :class="intensity >= i ? getIntensityButtonClass(i) : 'bg-gray-100'">
          <text :class="intensity >= i ? 'text-white font-medium' : 'text-gray-500'">{{ i }}</text>
        </view>
      </view>
    </view>
    
    <!-- 强度标签 -->
    <view class="flex justify-between px-2">
      <text class="text-xs text-gray-500">轻微</text>
      <text class="text-xs text-gray-500">适中</text>
      <text class="text-xs text-gray-500">强烈</text>
    </view>
    
    <!-- 情绪描述 -->
    <view class="mt-6 p-4 bg-gray-50 rounded-xl">
      <text class="text-sm text-gray-700">{{ getIntensityDescription() }}</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 3
    },
    emotionType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      intensity: this.value
    }
  },
  watch: {
    value(newVal) {
      this.intensity = newVal;
    }
  },
  methods: {
    setIntensity(value) {
      this.intensity = value;
      this.$emit('input', value);
      
      // 添加触觉反馈
      uni.vibrateShort();
    },
    getIntensityGradient() {
      const gradients = {
        '快乐/愉悦': 'from-yellow-300 to-yellow-500',
        '平静/满足': 'from-green-300 to-green-500',
        '焦虑/紧张': 'from-purple-300 to-purple-500',
        '悲伤/低落': 'from-blue-300 to-blue-500',
        '愤怒/烦躁': 'from-red-300 to-red-500',
        '疲惫/无力': 'from-gray-300 to-gray-500',
        '中性/平淡': 'from-gray-300 to-gray-400'
      };
      return gradients[this.emotionType] || 'from-purple-300 to-purple-500';
    },
    getIntensityButtonClass(level) {
      const baseColors = {
        '快乐/愉悦': 'bg-yellow',
        '平静/满足': 'bg-green',
        '焦虑/紧张': 'bg-purple',
        '悲伤/低落': 'bg-blue',
        '愤怒/烦躁': 'bg-red',
        '疲惫/无力': 'bg-gray',
        '中性/平淡': 'bg-gray'
      };
      
      const baseColor = baseColors[this.emotionType] || 'bg-purple';
      // 强度等级对应的颜色深度
      const intensity = 400 + (level - 1) * 50;
      
      return `${baseColor}-${intensity}`;
    },
    getIntensityDescription() {
      // 根据情绪类型和强度返回描述文本
      const descriptions = {
        '快乐/愉悦': [
          '略微感到开心，有一点点愉悦感',
          '感到愉快，心情不错',
          '明显感到快乐，心情很好',
          '非常开心，充满活力',
          '极度喜悦，欣喜若狂'
        ],
        '平静/满足': [
          '略微感到平静，稍有安宁感',
          '感到平和，比较放松',
          '明显感到满足，内心平静',
          '非常平静，深感满足',
          '极度平和，完全沉浸在宁静中'
        ],
        '焦虑/紧张': [
          '略微感到不安，有一点担忧',
          '感到紧张，有些焦虑',
          '明显感到焦虑，思绪不宁',
          '非常焦虑，感到很大压力',
          '极度焦虑，几乎无法控制'
        ],
        '悲伤/低落': [
          '略微感到低落，有点失落',
          '感到悲伤，情绪有些低沉',
          '明显感到难过，心情很低落',
          '非常悲伤，感到很痛苦',
          '极度悲痛，几乎无法承受'
        ],
        '愤怒/烦躁': [
          '略微感到烦躁，有点不耐烦',
          '感到恼火，情绪有些激动',
          '明显感到愤怒，相当生气',
          '非常愤怒，怒火中烧',
          '极度暴怒，几乎失去控制'
        ],
        '疲惫/无力': [
          '略微感到疲惫，有点累',
          '感到疲乏，精力不足',
          '明显感到疲惫，很想休息',
          '非常疲惫，几乎耗尽精力',
          '极度疲惫，完全筋疲力尽'
        ],
        '中性/平淡': [
          '情绪非常平淡，几乎没有波动',
          '情绪比较中性，没有明显感受',
          '情绪处于中间状态，既不积极也不消极',
          '情绪较为平静，但有一定的存在感',
          '情绪明显存在，但很难定义为积极或消极'
        ]
      };
      
      const emotionDescriptions = descriptions[this.emotionType] || descriptions['中性/平淡'];
      return emotionDescriptions[this.intensity - 1] || '请选择情绪强度';
    }
  }
}
</script>

<style scoped>
.intensity-point {
  cursor: pointer;
}

.intensity-point.selected {
  transform: scale(1.1);
}

.intensity-point:active {
  transform: scale(0.95);
}

/* 情绪颜色系统 */
.bg-yellow-400 { background-color: #facc15; }
.bg-yellow-450 { background-color: #eab308; }
.bg-yellow-500 { background-color: #f59e0b; }
.bg-yellow-550 { background-color: #d97706; }
.bg-yellow-600 { background-color: #b45309; }

.bg-green-400 { background-color: #34d399; }
.bg-green-450 { background-color: #10b981; }
.bg-green-500 { background-color: #059669; }
.bg-green-550 { background-color: #047857; }
.bg-green-600 { background-color: #065f46; }

.bg-purple-400 { background-color: #a78bfa; }
.bg-purple-450 { background-color: #8b5cf6; }
.bg-purple-500 { background-color: #7c3aed; }
.bg-purple-550 { background-color: #6d28d9; }
.bg-purple-600 { background-color: #5b21b6; }

.bg-blue-400 { background-color: #60a5fa; }
.bg-blue-450 { background-color: #3b82f6; }
.bg-blue-500 { background-color: #2563eb; }
.bg-blue-550 { background-color: #1d4ed8; }
.bg-blue-600 { background-color: #1e40af; }

.bg-red-400 { background-color: #f87171; }
.bg-red-450 { background-color: #ef4444; }
.bg-red-500 { background-color: #dc2626; }
.bg-red-550 { background-color: #b91c1c; }
.bg-red-600 { background-color: #991b1b; }

.bg-gray-400 { background-color: #9ca3af; }
.bg-gray-450 { background-color: #6b7280; }
.bg-gray-500 { background-color: #4b5563; }
.bg-gray-550 { background-color: #374151; }
.bg-gray-600 { background-color: #1f2937; }
</style>