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

      <!-- 语音情绪分析 -->
      <view class="flex items-center justify-center my-4">
        <button class="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-600 rounded-xl"
          @click="showVoiceRecorder">
          <uni-icons type="mic" size="16" color="#2563EB" class="mr-2"></uni-icons>
          <text>通过语音分析情绪</text>
        </button>
      </view>

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
    
    <!-- 语音录制弹窗 -->
    <uni-popup ref="voicePopup" type="center">
      <view class="bg-white rounded-xl w-90vw max-w-lg p-4">
        <view class="flex justify-between items-center mb-4">
          <text class="text-lg font-medium">语音情绪分析</text>
          <uni-icons type="closeempty" size="20" @click="closeVoiceRecorder"></uni-icons>
        </view>
        <voice-recorder 
          :moodId="moodId" 
          @recording-result="handleVoiceResult"
        ></voice-recorder>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import EmotionPicker from '@/components/mood-components/emotion-picker.vue';
import IntensitySlider from '@/components/mood-components/intensity-slider.vue';
import VoiceRecorder from '@/components/voice/voice-recorder.vue';
import { createMoodRecord } from '@/api/mood.js';
import { formatDateToChinese } from '@/utils/dateUtils.js';

// 非响应式数据，不需要在视图中使用
let submitTimer = null;

export default {
  components: {
    EmotionPicker,
    IntensitySlider,
    VoiceRecorder
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
      submitting: false,
      moodId: ''
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
  onLoad(option) {
    if (option.id) {
      this.moodId = option.id;
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

    // 显示语音录制弹窗
    showVoiceRecorder() {
      // 检查浏览器是否支持录音功能
      // #ifdef H5
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        uni.showToast({
          title: '您的浏览器不支持录音功能',
          icon: 'none'
        });
        return;
      }
      // #endif
      
      // 请求录音权限
      // #ifdef H5
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          this.$refs.voicePopup.open();
        })
        .catch(err => {
          console.error('获取麦克风权限失败', err);
          uni.showToast({
            title: '未获得录音权限',
            icon: 'none'
          });
        });
      // #endif
      
      // #ifndef H5
      uni.authorize({
        scope: 'scope.record',
        success: () => {
          this.$refs.voicePopup.open();
        },
        fail: () => {
          uni.showToast({
            title: '未获得录音权限',
            icon: 'none'
          });
        }
      });
      // #endif
    },
    
    // 关闭语音录制弹窗
    closeVoiceRecorder() {
      this.$refs.voicePopup.close();
    },
    
    // 处理语音分析结果
    handleVoiceResult(result) {
      if (result && result.dominantEmotion) {
        // 根据分析结果设置情绪类型
        this.selectedEmotion = this.mapDominantEmotionToUI(result.dominantEmotion);
        
        // 如果有转写文本，则设置为备注
        if (result.transcription) {
          this.note = result.transcription;
        }
        
        // 关闭弹窗
        this.closeVoiceRecorder();
      }
    },
    
    // 将API返回的情绪映射到UI可用的情绪类型
    mapDominantEmotionToUI(dominantEmotion) {
      // 根据你的实际情况映射情绪类型
      const emotionMap = {
        'HAPPY': 'happy',
        'SAD': 'sad',
        'ANGRY': 'angry',
        'FEAR': 'fear',
        'SURPRISE': 'surprise',
        'NEUTRAL': 'neutral'
        // 根据需要添加更多映射
      };
      
      return emotionMap[dominantEmotion] || 'neutral';
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