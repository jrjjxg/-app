<template>
  <view class="grid grid-cols-3 gap-4">
    <view v-for="emotion in emotions" :key="emotion.type"
      class="emotion-item p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
      :class="{ 'selected': modelValue === emotion.type }" @click="selectEmotion(emotion.type)">
      <view class="emotion-icon mb-3 relative">
        <text class="text-3xl">{{ emotion.emoji }}</text>
        <view v-if="modelValue === emotion.type"
          class="check-mark absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
          <uni-icons type="checkmarkempty" size="12" color="#FFFFFF"></uni-icons>
        </view>
      </view>
      <text class="text-sm font-medium">{{ emotion.label }}</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      emotions: [
        { type: '快乐/愉悦', emoji: '😊', label: '快乐' },
        { type: '平静/满足', emoji: '😌', label: '平静' },
        { type: '焦虑/紧张', emoji: '😰', label: '焦虑' },
        { type: '悲伤/低落', emoji: '😢', label: '悲伤' },
        { type: '愤怒/烦躁', emoji: '😠', label: '愤怒' },
        { type: '疲惫/无力', emoji: '😩', label: '疲惫' },
        { type: '中性/平淡', emoji: '😐', label: '平淡' }
      ]
    }
  },
  methods: {
    selectEmotion(type) {
      this.$emit('update:modelValue', type);

      // 添加触觉反馈
      uni.vibrateShort();
    }
  }
}
</script>

<style scoped>
.emotion-item {
  background-color: #f8f9fa;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.emotion-item:active {
  transform: scale(0.95);
}

.emotion-item.selected {
  background-color: #ede9fe;
  border: 2px solid #8B5CF6;
  transform: scale(1.05);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.emotion-icon {
  transition: all 0.3s;
}

.emotion-item.selected .emotion-icon {
  transform: scale(1.1);
}

.check-mark {
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.bg-primary {
  background-color: #8B5CF6;
}
</style>