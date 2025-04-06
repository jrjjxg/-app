<template>
  <view class="flex flex-col h-full bg-gray-50">
    <!-- 使用uni-app的原生导航栏 -->
    <view class="nav-fixed bg-white px-4 pt-12 pb-4 shadow-sm transform-gpu">
      <view class="flex items-center mb-4">
        <navigator url="/pages/mood-tracker/index" open-type="navigateBack" hover-class="none">
          <view class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
            <uni-icons type="left" size="20" color="#6B7280"></uni-icons>
          </view>
        </navigator>
        <text class="text-xl font-bold text-gray-800">记录情绪</text>
      </view>
      <text class="text-gray-500">{{ formatDateToChinese(new Date()) }}</text>
    </view>

    <!-- 内容区域 - 添加顶部内边距，为固定头部留出空间 -->
    <view class="flex-1 px-4 py-5 content-area">
      <!-- 主要问题 -->
      <text class="text-xl font-medium mb-4 block text-center">今天感觉如何？</text>

      <!-- 情绪选择 -->
      <emotion-picker v-model="selectedEmotion"></emotion-picker>

      <!-- 情绪强度 -->
      <intensity-slider v-model="intensity" :emotionType="selectedEmotion"></intensity-slider>

      <!-- 情绪记录 - 减少嵌套层级 -->
      <text class="text-lg font-medium mb-4 block">想多说几句吗？</text>
      <textarea
        class="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        placeholder="发生了什么让你感到这种情绪？" v-model="note" rows="3"></textarea>

      <!-- 情绪标签 - 减少嵌套层级 -->
      <text class="text-lg font-medium mb-4 block">你为什么有这种感受？</text>

      <view class="grid-tags mb-4">
        <view v-for="(tag, index) in commonTags" :key="index" class="tag-item"
          :class="tags.includes(tag) ? 'tag-active' : 'tag-inactive'" @click="toggleTag(tag)">{{ tag }}</view>

        <view v-if="!showCustomTagInput" class="tag-item tag-custom flex items-center justify-center"
          @click="showCustomTagInput = true">
          <uni-icons type="plus" size="14" color="#4B5563" class="mr-1"></uni-icons>
          <text>自定义</text>
        </view>
      </view>

      <view v-if="showCustomTagInput" class="flex mb-4">
        <input class="flex-1 p-2 border border-gray-200 rounded-l-xl focus:outline-none" placeholder="添加自定义标签"
          v-model="customTag" />
        <button class="px-4 py-2 bg-blue-500 text-white rounded-r-xl" @click="addCustomTag">添加</button>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="p-4 bg-white border-t border-gray-200 transform-gpu">
      <button class="w-full bg-blue-500 text-white font-medium py-3 px-6 rounded-xl shadow-sm"
        :disabled="!isFormValid || submitting" :class="{ 'opacity-50': !isFormValid || submitting }"
        @click="submitMoodRecord">
        {{ submitting ? '提交中...' : '记录我的心情' }}
      </button>
    </view>
  </view>
</template>

<script>
import EmotionPicker from '@/components/mood-components/emotion-picker.vue';
import IntensitySlider from '@/components/mood-components/intensity-slider.vue';
import { createMoodRecord } from '@/api/mood.js';
import { formatDateToChinese } from '@/utils/dateUtils.js';

// 非响应式数据，不需要在视图中使用
let submitTimer = null;

export default {
  components: {
    EmotionPicker,
    IntensitySlider
  },
  data() {
    return {
      selectedEmotion: null,
      intensity: 3,
      note: '',
      tags: [],
      commonTags: ['工作/学习', '人际关系', '健康状况', '休息质量', '天气变化', '个人成就'],
      customTag: '',
      showCustomTagInput: false,
      submitting: false
    }
  },
  computed: {
    isFormValid() {
      return this.selectedEmotion !== null;
    }
  },
  // 组件销毁时清理定时器
  beforeDestroy() {
    if (submitTimer) {
      clearTimeout(submitTimer);
      submitTimer = null;
    }
  },
  methods: {
    formatDateToChinese,

    toggleTag(tag) {
      if (this.tags.includes(tag)) {
        this.tags = this.tags.filter(t => t !== tag);
      } else {
        this.tags.push(tag);
      }
    },

    addCustomTag() {
      if (this.customTag.trim()) {
        this.tags.push(this.customTag.trim());
        this.commonTags.push(this.customTag.trim());
        this.customTag = '';
        this.showCustomTagInput = false;
      }
    },

    async submitMoodRecord() {
      if (!this.isFormValid) return;

      this.submitting = true;

      try {
        const moodData = {
          emotionType: this.selectedEmotion,
          intensity: this.intensity,
          note: this.note,
          tags: this.tags
        };

        const result = await createMoodRecord(moodData);

        if (result.code === 200) {
          uni.showToast({
            title: '记录成功',
            icon: 'success'
          });

          // 使用变量存储定时器，便于清理
          submitTimer = setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          throw new Error(result.message || '提交失败');
        }
      } catch (error) {
        uni.showToast({
          title: error.message || '提交失败，请重试',
          icon: 'none'
        });
      } finally {
        this.submitting = false;
      }
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

/* 固定导航栏样式 */
.nav-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

/* 内容区域样式 */
.content-area {
  margin-top: 112px;
  /* 根据导航栏高度调整 */
  padding-bottom: 80px;
  /* 为底部按钮留出空间 */
}

/* 使用grid布局代替flex布局，减少动态计算 */
.grid-tags {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

/* 标签样式 - 使用固定宽度避免动态计算 */
.tag-item {
  padding: 8px 0;
  text-align: center;
  border-radius: 9999px;
  font-size: 14px;
}

/* 激活状态标签 */
.tag-active {
  background-color: #3b82f6;
  color: white;
}

/* 非激活状态标签 */
.tag-inactive {
  background-color: #e0f2fe;
  color: #1e40af;
}

/* 自定义标签按钮 */
.tag-custom {
  background-color: #f3f4f6;
  color: #4b5563;
}

/* 兼容不同平台 */
/* #ifdef APP-PLUS */
.nav-fixed {
  padding-top: var(--status-bar-height);
}

/* #endif */
</style>