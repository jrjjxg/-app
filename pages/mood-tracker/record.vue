<template>
  <view :class="['flex flex-col h-full bg-gray-50 transition-colors duration-300', emotionThemeClass]">
    <!-- 顶部导航栏 -->
    <view class="nav-fixed px-4 pt-12 pb-4 shadow-sm transform-gpu z-50 transition-colors duration-300"
      :class="emotionThemeNavClass">
      <view class="flex items-center mb-2">
        <navigator url="/pages/mood-tracker/index" open-type="navigateBack" hover-class="none">
          <view class="w-10 h-10 rounded-full bg-opacity-20 flex items-center justify-center mr-3"
            :class="selectedEmotion ? `bg-${getEmotionColor()}-100` : 'bg-gray-100'">
            <uni-icons type="left" size="20" :color="selectedEmotion ? getEmotionColor() : '#6B7280'"></uni-icons>
          </view>
        </navigator>
        <text class="text-xl font-bold"
          :class="selectedEmotion ? `text-${getEmotionColor(true)}` : 'text-gray-800'">记录情绪</text>
      </view>
      <text class="text-gray-500">{{ formatDateToChinese(new Date()) }}</text>
    </view>

    <!-- 内容区域（滚动视图） -->
    <scroll-view scroll-y class="flex-1 content-area" show-scrollbar="false">
      <view class="px-4 py-5 relative z-10">


        <!-- 第一步：情绪选择 (当currentStep === 1) -->
        <view v-if="currentStep === 1" class="mb-6">
          <!-- 情绪选择区 -->
          <text class="text-xl font-medium mb-6 block text-center"
            :class="selectedEmotion ? `text-${getEmotionColor(true)}` : 'text-gray-800'">
            现在的感受是什么？
          </text>

          <!-- 情绪选择器 -->
          <view class="emotion-grid mb-8">
            <view v-for="emotion in emotionTypes" :key="emotion.type" class="emotion-item transition-all duration-300"
              :class="{ 'emotion-selected': selectedEmotion === emotion.type }" @click="selectEmotion(emotion.type)">
              <view class="emotion-circle" :style="{ backgroundColor: emotion.lightColor }">
                <text class="emotion-emoji">{{ emotion.emoji }}</text>
              </view>
              <text class="emotion-label mt-2"
                :class="selectedEmotion === emotion.type ? `text-${getEmotionColorByType(emotion.type, true)}` : 'text-gray-600'">
                {{ emotion.label }}
              </text>
            </view>
          </view>

          <!-- 情绪强度滑动条 -->
          <view class="bg-white rounded-xl p-4 shadow-sm mb-8" v-if="selectedEmotion">
            <view class="flex justify-between items-center mb-2">
              <text class="font-medium text-gray-700">感受强度</text>
              <view class="flex items-center">
                <text class="text-lg font-semibold" :style="{ color: getIntensityColor() }">{{ intensity }}</text>
                <text class="text-gray-500 ml-1">/10</text>
              </view>
            </view>

            <slider :value="intensity" min="1" max="10" :activeColor="getIntensityColor()" backgroundColor="#E5E7EB"
              block-size="28" @change="onIntensityChange" show-value />

            <view class="flex justify-between mt-1 text-xs text-gray-500">
              <text>轻微</text>
              <text>中等</text>
              <text>强烈</text>
            </view>

            <!-- 强度反馈区 -->
            <view class="flex items-center justify-center mt-4 p-2 rounded-lg"
              :style="{ backgroundColor: `${getIntensityColor()}15` }">
              <text class="text-2xl mr-2">{{ getIntensityEmoji() }}</text>
              <text :style="{ color: getIntensityColor() }">{{ getIntensityFeedback() }}</text>
            </view>
          </view>

          <!-- 下一步按钮 -->
          <button class="w-full py-3 px-6 rounded-xl shadow-sm text-white font-medium transition-all duration-300 mb-6"
            :style="{ backgroundColor: selectedEmotion ? getEmotionColor() : '#CBD5E1' }" :disabled="!selectedEmotion"
            :class="{ 'opacity-70': !selectedEmotion }" @click="currentStep = 2">
            下一步
          </button>
        </view>

        <!-- 第二步：标签和描述 (当currentStep === 2) -->
        <view v-if="currentStep === 2">
          <!-- 步骤指示器优化为点状标记 -->
          <view class="flex justify-center mb-6">
            <view class="mx-2 w-2 h-2 rounded-full bg-gray-300"></view>
            <view class="mx-2 w-2 h-2 rounded-full" :style="{ backgroundColor: getEmotionColor() }"></view>
          </view>

          <!-- 情绪概览 - 简化设计 -->
          <view class="bg-white rounded-xl p-4 shadow-sm mb-6">
            <view class="flex items-center mb-3">
              <text class="text-2xl mr-3">{{ getEmotionEmoji() }}</text>
              <text class="font-medium text-lg">{{ getEmotionLabel() }}</text>
              <view class="flex-1"></view>
              <view class="px-3 py-1 rounded-full text-white text-sm" :style="{ backgroundColor: getIntensityColor() }">
                <text>{{ intensity }}/10</text>
              </view>
            </view>

            <!-- 强度条视觉优化 -->
            <view class="h-1.5 rounded-full overflow-hidden bg-gray-100">
              <view class="h-full rounded-full"
                :style="{ width: `${intensity * 10}%`, backgroundColor: getIntensityColor() }"></view>
            </view>
            <text class="text-xs text-gray-500 mt-1 block text-right">{{ getIntensityFeedback() }}</text>
          </view>

          <!-- 标签选择区 - 标签类别改为分段控制器样式 -->
          <view class="mb-6">
            <text class="font-medium text-gray-700 mb-3 block">这种感受与什么有关？</text>

            <!-- 标签类别选择 - 分段控制器样式 -->
            <view class="flex bg-gray-100 p-1 rounded-xl mb-4">
              <view v-for="category in tagCategories" :key="category.id"
                class="flex-1 py-2 text-center text-sm rounded-lg transition-colors" :class="selectedCategory === category.id ?
                  'bg-white shadow-sm font-medium' :
                  'text-gray-600'" :style="selectedCategory === category.id ? { color: getEmotionColor() } : {}"
                @click="selectedCategory = category.id">
                {{ category.name }}
              </view>
            </view>

            <!-- 标签网格布局优化 -->
            <view class="grid-tags mb-4">
              <view v-for="tag in filteredTags" :key="tag.id" class="tag-item transition-all duration-200" :class="tags.includes(tag.name) ?
                `tag-active bg-${getEmotionClass()}-500 text-white` :
                `tag-inactive border border-gray-200 bg-white text-gray-700`" @click="toggleTag(tag.name)">
                {{ tag.name }}
              </view>

              <!-- 自定义标签按钮集成到网格中 -->
              <view v-if="!showCustomTagInput"
                class="tag-item border border-dashed border-gray-300 bg-gray-50 text-gray-600 flex items-center justify-center"
                @click="showCustomTagInput = true">
                <uni-icons type="plus" size="14" color="#4B5563" class="mr-1"></uni-icons>
                <text>添加标签</text>
              </view>
            </view>

            <!-- 自定义标签输入 -->
            <view v-if="showCustomTagInput" class="flex mb-4">
              <input class="flex-1 p-2 border border-gray-200 rounded-l-xl focus:outline-none" placeholder="添加标签"
                v-model="customTag" />
              <button class="px-4 py-2 rounded-r-xl text-white" :style="{ backgroundColor: getEmotionColor() }"
                @click="addCustomTag">添加</button>
            </view>
          </view>

          <!-- 描述文字 -->
          <view class="mb-8">
            <view class="flex justify-between items-center mb-2">
              <text class="font-medium text-gray-700">记录详情</text>
              <button class="flex items-center text-xs px-3 py-1 rounded-full bg-gray-100" @click="showVoiceRecorder">
                <uni-icons type="mic" size="14" :color="getEmotionColor()" class="mr-1"></uni-icons>
                <text :style="{ color: getEmotionColor() }">语音输入</text>
              </button>
            </view>

            <textarea class="w-full p-3 border rounded-xl focus:outline-none transition-colors bg-white" :class="selectedEmotion ?
              `border-${getEmotionColor()}-200 focus:ring-2 focus:ring-${getEmotionColor()}-200` :
              'border-gray-200 focus:ring-2 focus:ring-blue-200'" placeholder="发生了什么让你有这种感受？" v-model="note"
              rows="3"></textarea>
          </view>

          <!-- 操作按钮 - 底部固定 -->
          <view class="flex space-x-3">
            <button class="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium" @click="currentStep = 1">
              上一步
            </button>
            <button class="flex-1 py-3 rounded-xl shadow-sm text-white font-medium"
              :style="{ backgroundColor: getEmotionColor() }" :disabled="submitting"
              :class="{ 'opacity-70': submitting }" @click="submitMoodRecord">
              {{ submitting ? '记录中...' : '保存' }}
            </button>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 语音录制弹窗 -->
    <uni-popup ref="voicePopup" type="center">
      <view class="bg-white rounded-xl w-90vw max-w-lg p-4">
        <view class="flex justify-between items-center mb-4">
          <text class="text-lg font-medium">语音情绪分析</text>
          <uni-icons type="closeempty" size="20" @click="closeVoiceRecorder"></uni-icons>
        </view>
        <voice-recorder :moodId="moodId" @recording-result="handleVoiceResult"></voice-recorder>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import EmotionPicker from '@/components/mood-components/emotion-picker.vue';
import VoiceRecorder from '@/components/voice/voice-recorder.vue';
import { createMoodRecord } from '@/api/mood.js';
import { formatDateToChinese } from '@/utils/dateUtils.js';

let submitTimer = null;

export default {
  components: {
    EmotionPicker,
    VoiceRecorder
  },
  data() {
    return {
      currentStep: 1,
      selectedEmotion: null,
      intensity: 5,
      note: '',
      tags: [],
      customTag: '',
      showCustomTagInput: false,
      submitting: false,
      moodId: '',
      selectedCategory: 'all',
      emotionTypes: [
        { type: '快乐/愉悦', label: '快乐', emoji: '😊', color: '#FFB800', lightColor: 'rgba(255, 184, 0, 0.2)' },
        { type: '平静/满足', label: '平静', emoji: '😌', color: '#4CAF50', lightColor: 'rgba(76, 175, 80, 0.2)' },
        { type: '焦虑/紧张', label: '焦虑', emoji: '😰', color: '#9C27B0', lightColor: 'rgba(156, 39, 176, 0.2)' },
        { type: '悲伤/低落', label: '悲伤', emoji: '😢', color: '#2196F3', lightColor: 'rgba(33, 150, 243, 0.2)' },
        { type: '愤怒/烦躁', label: '愤怒', emoji: '😠', color: '#F44336', lightColor: 'rgba(244, 67, 54, 0.2)' },
        { type: '疲惫/无力', label: '疲惫', emoji: '😩', color: '#757575', lightColor: 'rgba(117, 117, 117, 0.2)' },
        { type: '中性/平淡', label: '中性', emoji: '😐', color: '#607D8B', lightColor: 'rgba(96, 125, 139, 0.2)' }
      ],
      tagCategories: [
        { id: 'all', name: '全部' },
        { id: '生活', name: '生活' },
        { id: '工作', name: '工作' },
        { id: '健康', name: '健康' },
        { id: '社交', name: '社交' }
      ],
      allTags: [
        // 工作类标签
        { id: 1, name: '工作压力', category: '工作' },
        { id: 2, name: '工作成就', category: '工作' },
        { id: 3, name: '学习成长', category: '工作' },

        // 社交类标签
        { id: 4, name: '人际关系', category: '社交' },
        { id: 5, name: '家人互动', category: '社交' },
        { id: 6, name: '社交活动', category: '社交' },

        // 健康类标签
        { id: 7, name: '身体状况', category: '健康' },
        { id: 8, name: '睡眠质量', category: '健康' },
        { id: 9, name: '精神压力', category: '健康' },

        // 生活类标签
        { id: 10, name: '天气变化', category: '生活' },
        { id: 11, name: '财务状况', category: '生活' },
        { id: 12, name: '居住环境', category: '生活' }
      ]
    }
  },
  computed: {
    isFormValid() {
      return this.selectedEmotion !== null;
    },
    emotionThemeClass() {
      if (!this.selectedEmotion) return '';
      return `theme-${this.getEmotionClass()}`;
    },
    emotionThemeNavClass() {
      if (!this.selectedEmotion) return 'bg-white';
      const emotionClass = this.getEmotionClass();
      // 如果是中性情绪 (blueGray)，使用 bg-gray-100 以确保足够的背景不透明度
      if (emotionClass === 'blueGray') {
        return 'bg-gray-100';
      }
      // 其他情绪保持原来的 -50 浅色背景
      return `bg-${emotionClass}-50`;
    },
    filteredTags() {
      if (this.selectedCategory === 'all') {
        return this.allTags;
      }
      return this.allTags.filter(tag => tag.category === this.selectedCategory);
    }
  },
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

    selectEmotion(type) {
      this.selectedEmotion = type;
      // 触感反馈
      uni.vibrateShort({ type: 'medium' });
    },

    getEmotionClass() {
      const emotion = this.emotionTypes.find(e => e.type === this.selectedEmotion);
      if (!emotion) return 'blue';

      // 将色彩转为Tailwind类名
      const colorMap = {
        '#FFB800': 'yellow',
        '#4CAF50': 'green',
        '#9C27B0': 'purple',
        '#2196F3': 'blue',
        '#F44336': 'red',
        '#757575': 'gray',
        '#607D8B': 'blueGray'
      };

      return colorMap[emotion.color] || 'blue';
    },

    getEmotionColor(isDark = false) {
      const emotion = this.emotionTypes.find(e => e.type === this.selectedEmotion);
      if (!emotion) return isDark ? '#1D4ED8' : '#3B82F6'; // 默认蓝色
      return emotion.color;
    },

    getEmotionColorByType(type, isDark = false) {
      const emotion = this.emotionTypes.find(e => e.type === type);
      if (!emotion) return isDark ? 'blue-700' : 'blue-500';

      // 将色彩转为Tailwind类名
      const colorMap = {
        '#FFB800': isDark ? 'yellow-600' : 'yellow-400',
        '#4CAF50': isDark ? 'green-700' : 'green-500',
        '#9C27B0': isDark ? 'purple-700' : 'purple-500',
        '#2196F3': isDark ? 'blue-700' : 'blue-500',
        '#F44336': isDark ? 'red-700' : 'red-500',
        '#757575': isDark ? 'gray-700' : 'gray-500',
        '#607D8B': isDark ? 'blueGray-700' : 'blueGray-500'
      };

      return colorMap[emotion.color] || (isDark ? 'blue-700' : 'blue-500');
    },

    getIntensityColor() {
      if (!this.selectedEmotion) return '#3B82F6';

      const baseColor = this.getEmotionColor();

      // 根据强度调整饱和度和亮度
      if (this.intensity <= 3) {
        return this.adjustColorBrightness(baseColor, 40); // 淡化颜色
      } else if (this.intensity >= 8) {
        return this.adjustColorBrightness(baseColor, -20); // 加深颜色
      }

      return baseColor;
    },

    adjustColorBrightness(hex, percent) {
      // 简单的颜色亮度调整函数
      let r = parseInt(hex.substring(1, 3), 16);
      let g = parseInt(hex.substring(3, 5), 16);
      let b = parseInt(hex.substring(5, 7), 16);

      r = Math.min(255, Math.max(0, Math.round(r * (1 + percent / 100))));
      g = Math.min(255, Math.max(0, Math.round(g * (1 + percent / 100))));
      b = Math.min(255, Math.max(0, Math.round(b * (1 + percent / 100))));

      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    getIntensityEmoji() {
      if (this.intensity <= 3) return '🙂';
      if (this.intensity <= 7) return '😮';
      return '😲';
    },

    getIntensityFeedback() {
      if (this.intensity <= 3) return '轻微的感受';
      if (this.intensity <= 7) return '明显的感受';
      return '强烈的感受';
    },

    getEmotionPatternSrc() {
      const patterns = {
        '快乐/愉悦': '/static/patterns/happy-pattern.png',
        '平静/满足': '/static/patterns/calm-pattern.png',
        '焦虑/紧张': '/static/patterns/anxious-pattern.png',
        '悲伤/低落': '/static/patterns/sad-pattern.png',
        '愤怒/烦躁': '/static/patterns/angry-pattern.png',
        '疲惫/无力': '/static/patterns/tired-pattern.png',
        '中性/平淡': '/static/patterns/neutral-pattern.svg'
      };

      return patterns[this.selectedEmotion] || '/static/patterns/default-pattern.svg';
    },

    onIntensityChange(e) {
      this.intensity = e.detail.value;
      // 触感反馈
      uni.vibrateShort({ type: 'light' });
    },

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
        // 将新标签添加到全部标签列表
        this.allTags.push({
          id: this.allTags.length + 1,
          name: this.customTag.trim(),
          category: this.selectedCategory !== 'all' ? this.selectedCategory : '个人'
        });
        this.customTag = '';
        this.showCustomTagInput = false;
      }
    },

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

    closeVoiceRecorder() {
      this.$refs.voicePopup.close();
    },

    handleVoiceResult(result) {
      if (result && result.dominantEmotion) {
        // 根据分析结果设置情绪类型
        this.selectedEmotion = this.mapDominantEmotionToUI(result.dominantEmotion);

        // 根据分析结果调整强度
        if (result.intensity) {
          this.intensity = Math.min(10, Math.max(1, Math.round(result.intensity * 10)));
        }

        // 如果有转写文本，则设置为备注
        if (result.transcription) {
          this.note = result.transcription;
        }

        // 关闭弹窗
        this.closeVoiceRecorder();
      }
    },

    mapDominantEmotionToUI(dominantEmotion) {
      const emotionMap = {
        'HAPPY': '快乐/愉悦',
        'SAD': '悲伤/低落',
        'ANGRY': '愤怒/烦躁',
        'FEAR': '焦虑/紧张',
        'SURPRISE': '快乐/愉悦',
        'NEUTRAL': '中性/平淡',
        'TIRED': '疲惫/无力',
        'CALM': '平静/满足'
      };

      return emotionMap[dominantEmotion] || '中性/平淡';
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
    },

    // 获取当前选中情绪的emoji
    getEmotionEmoji() {
      const emotion = this.emotionTypes.find(e => e.type === this.selectedEmotion);
      return emotion ? emotion.emoji : '😐';
    },

    // 获取当前选中情绪的标签
    getEmotionLabel() {
      const emotion = this.emotionTypes.find(e => e.type === this.selectedEmotion);
      return emotion ? emotion.label : '未选择';
    }
  }
}
</script>

<style>
/* 主题颜色样式 - 加深颜色 */
.theme-yellow {
  background-color: rgba(255, 184, 0, 0.3);
}

.theme-green {
  background-color: rgba(76, 175, 80, 0.3);
}

.theme-blue {
  background-color: rgba(33, 150, 243, 0.3);
}

.theme-purple {
  background-color: rgba(156, 39, 176, 0.3);
}

.theme-red {
  background-color: rgba(244, 67, 54, 0.3);
}

.theme-gray {
  background-color: rgba(117, 117, 117, 0.3);
}

.theme-blueGray {
  background-color: rgba(96, 125, 139, 0.3);
}

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
  padding-bottom: 80px;
}

/* 情绪选择网格 */
.emotion-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.emotion-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border-radius: 12px;
  opacity: 0.8;
}

.emotion-selected {
  opacity: 1;
  transform: scale(1.05);
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.emotion-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emotion-emoji {
  font-size: 24px;
}

.emotion-label {
  font-size: 12px;
  margin-top: 6px;
}

/* 滑块滑动区域加大 */
.uni-slider {
  margin: 14px 0;
}

/* 标签类别滚动区 */
.tag-categories {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.tag-categories::-webkit-scrollbar {
  display: none;
}

/* 标签网格 */
.grid-tags {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.tag-item {
  padding: 10px 0;
  text-align: center;
  border-radius: 999px;
  font-size: 14px;
}

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