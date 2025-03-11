<!-- mood-stepper.vue -->
<template>
    <view class="mood-stepper">
      <!-- 步骤指示器 -->
      <view class="steps-indicator flex justify-between mb-6">
        <view v-for="(step, index) in steps" :key="index" 
              class="step-dot flex flex-col items-center">
          <view class="w-8 h-8 rounded-full flex items-center justify-center mb-1"
                :class="currentStep >= index ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'">
            {{ index + 1 }}
          </view>
          <text class="text-xs" :class="currentStep >= index ? 'text-primary' : 'text-gray-500'">
            {{ step.label }}
          </text>
        </view>
        <view class="steps-line absolute h-1 bg-gray-200 top-4 left-0 right-0 -z-10"></view>
        <view class="steps-line-active absolute h-1 bg-primary top-4 left-0 -z-10"
              :style="{ width: `${(currentStep / (steps.length - 1)) * 100}%` }"></view>
      </view>
      
      <!-- 步骤内容 -->
      <view class="step-content">
        <!-- 步骤1: 情绪选择 -->
        <view v-if="currentStep === 0" class="step-emotion animate-fade-in">
          <text class="text-xl font-medium mb-6 block text-center">今天感觉如何？</text>
          <emotion-picker v-model="selectedEmotion" @update:modelValue="onEmotionSelected" />
        </view>
        
        <!-- 步骤2: 强度选择 -->
        <view v-if="currentStep === 1" class="step-intensity animate-fade-in">
          <text class="text-xl font-medium mb-6 block text-center">这种感受有多强烈？</text>
          <intensity-slider :value="intensity" :emotionType="selectedEmotion" @input="onIntensitySelected" />
        </view>
        
        <!-- 步骤3: 原因记录 -->
        <view v-if="currentStep === 2" class="step-reason animate-fade-in">
          <text class="text-xl font-medium mb-6 block text-center">发生了什么让你有这种感受？</text>
          
          <!-- 文本输入区域 -->
          <view class="relative mb-6">
            <textarea
              class="w-full p-4 border border-gray-200 rounded-xl h-32 text-sm"
              placeholder="描述一下你的感受..."
              v-model="note"
            ></textarea>
            
            <!-- 语音输入按钮 -->
            <view 
              class="absolute right-3 bottom-3 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm"
              @touchstart="startVoiceInput"
              @touchend="stopVoiceInput">
              <uni-icons type="mic" size="20" color="#FFFFFF"></uni-icons>
            </view>
            
            <!-- 录音指示器 -->
            <view v-if="isRecording" class="recording-indicator absolute left-0 right-0 bottom-14 flex justify-center">
              <view class="px-3 py-1 bg-black/70 text-white text-xs rounded-full flex items-center">
                <view class="recording-dot mr-1"></view>
                <text>正在录音...</text>
              </view>
            </view>
          </view>
          
          <!-- 标签选择 -->
          <view class="mb-6">
            <text class="text-base font-medium mb-3 block">选择相关标签（可选）</text>
            <view class="flex flex-wrap gap-2">
              <view v-for="(tag, index) in commonTags" :key="index"
                    @click="toggleTag(tag)"
                    class="px-3 py-2 rounded-full text-sm cursor-pointer"
                    :class="selectedTags.includes(tag) ? getTagActiveClass(index) : 'bg-gray-100 text-gray-600'">
                {{ tag }}
              </view>
            </view>
          </view>
        </view>
        
        <!-- 步骤4: 完成确认 -->
        <view v-if="currentStep === 3" class="step-complete animate-fade-in flex flex-col items-center">
          <view class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <uni-icons type="checkmarkempty" size="40" color="#10B981"></uni-icons>
          </view>
          <text class="text-xl font-medium mb-2 text-center">感谢记录你的心情</text>
          <text class="text-gray-500 text-center mb-6">了解自己的情绪是心理健康的第一步</text>
          
          <!-- 情绪摘要卡片 -->
          <view class="w-full bg-white rounded-xl p-4 shadow-sm mb-6">
            <view class="flex items-center mb-3">
              <view class="w-12 h-12 rounded-full flex items-center justify-center mr-3" 
                    :class="getEmotionBgClass(selectedEmotion)">
                <text class="text-2xl">{{ getEmotionEmoji(selectedEmotion) }}</text>
              </view>
              <view>
                <text class="font-medium text-gray-800">{{ selectedEmotion }}</text>
                <view class="flex items-center">
                  <view class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                    <view class="h-full rounded-full" 
                          :class="getIntensityColorClass(selectedEmotion)"
                          :style="{ width: `${(intensity / 5) * 100}%` }"></view>
                  </view>
                  <text class="text-xs text-gray-500">强度 {{ intensity }}/5</text>
                </view>
              </view>
            </view>
            
            <text v-if="note" class="text-sm text-gray-600 mb-3">{{ note }}</text>
            
            <view v-if="selectedTags.length > 0" class="flex flex-wrap gap-2">
              <text v-for="(tag, index) in selectedTags" :key="index"
                    class="px-2 py-1 rounded-full text-xs"
                    :class="getTagClass(index)">
                {{ tag }}
              </text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 导航按钮 -->
      <view class="flex justify-between mt-6">
        <button v-if="currentStep > 0" 
                class="px-6 py-3 rounded-full bg-gray-100 text-gray-700"
                @click="prevStep">
          上一步
        </button>
        <view v-else class="w-24"></view>
        
        <button v-if="currentStep < 3" 
                class="px-6 py-3 rounded-full bg-primary text-white"
                :disabled="!canProceed"
                :class="{'opacity-50': !canProceed}"
                @click="nextStep">
          {{ currentStep === 2 ? '完成' : '下一步' }}
        </button>
        <button v-else
                class="px-6 py-3 rounded-full bg-primary text-white"
                @click="saveMood">
          保存记录
        </button>
      </view>
      
      <!-- 跳过选项 -->
      <view v-if="currentStep === 2" class="mt-4 text-center">
        <text class="text-gray-500 text-sm" @click="skipReason">跳过，直接完成</text>
      </view>
    </view>
  </template>
  
  <script>
  import EmotionPicker from './emotion-picker.vue';
  import IntensitySlider from './intensity-slider.vue';
  
  export default {
    components: {
      EmotionPicker,
      IntensitySlider
    },
    data() {
      return {
        steps: [
          { label: '情绪' },
          { label: '强度' },
          { label: '原因' },
          { label: '完成' }
        ],
        currentStep: 0,
        selectedEmotion: null,
        intensity: 3,
        note: '',
        selectedTags: [],
        commonTags: ['工作', '学习', '人际关系', '健康', '休息', '天气', '个人成就'],
        isRecording: false,
        recorderManager: null
      }
    },
    computed: {
      canProceed() {
        if (this.currentStep === 0) return !!this.selectedEmotion;
        if (this.currentStep === 1) return true; // 强度有默认值
        if (this.currentStep === 2) return true; // 原因可以跳过
        return true;
      }
    },
    mounted() {
      // 初始化录音管理器
      this.recorderManager = uni.getRecorderManager();
      
      // 监听录音结束事件
      this.recorderManager.onStop((res) => {
        this.isRecording = false;
        this.recognizeSpeech(res.tempFilePath);
      });
    },
    methods: {
      // 步骤控制
      nextStep() {
        if (this.currentStep < this.steps.length - 1 && this.canProceed) {
          this.currentStep++;
          // 添加触觉反馈
          uni.vibrateShort();
        }
      },
      prevStep() {
        if (this.currentStep > 0) {
          this.currentStep--;
          // 添加触觉反馈
          uni.vibrateShort();
        }
      },
      skipReason() {
        this.currentStep = 3;
      },
      
      // 事件处理
      onEmotionSelected(emotion) {
        this.selectedEmotion = emotion;
        // 自动进入下一步
        setTimeout(() => {
          if (this.selectedEmotion) this.nextStep();
        }, 300);
      },
      onIntensitySelected(value) {
        this.intensity = value;
      },
      toggleTag(tag) {
        if (this.selectedTags.includes(tag)) {
          this.selectedTags = this.selectedTags.filter(t => t !== tag);
        } else {
          this.selectedTags.push(tag);
        }
      },
      
      // 语音输入
      startVoiceInput() {
        this.isRecording = true;
        
        // 添加触觉反馈
        uni.vibrateShort();
        
        // 开始录音
        this.recorderManager.start({
          duration: 60000,
          sampleRate: 16000,
          numberOfChannels: 1,
          encodeBitRate: 48000,
          format: 'mp3'
        });
      },
      stopVoiceInput() {
        if (this.isRecording) {
          this.recorderManager.stop();
          // 添加触觉反馈
          uni.vibrateShort();
        }
      },
      recognizeSpeech(filePath) {
        uni.showLoading({ title: '识别中...' });
        
        // 调用语音识别API
        // 这里使用uni.uploadFile上传录音文件到服务器进行识别
        uni.uploadFile({
          url: 'https://your-api-url/speech-to-text',
          filePath: filePath,
          name: 'audio',
          success: (res) => {
            try {
              const data = JSON.parse(res.data);
              if (data.success) {
                // 将识别结果添加到输入框
                this.note += data.text;
              } else {
                uni.showToast({
                  title: '识别失败',
                  icon: 'none'
                });
              }
            } catch (e) {
              uni.showToast({
                title: '识别结果解析失败',
                icon: 'none'
              });
            }
          },
          fail: () => {
            uni.showToast({
              title: '识别服务异常',
              icon: 'none'
            });
          },
          complete: () => {
            uni.hideLoading();
          }
        });
      },
      
      // 保存情绪记录
      saveMood() {
        const moodData = {
          emotionType: this.selectedEmotion,
          intensity: this.intensity,
          note: this.note,
          tags: this.selectedTags,
          createTime: new Date().toISOString()
        };
        
        // 触发保存事件
        this.$emit('save', moodData);
        
        // 添加触觉反馈
        uni.vibrateShort();
        
        // 显示成功提示
        uni.showToast({
          title: '记录已保存',
          icon: 'success'
        });
        
        // 返回上一页
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      },
      
      // 样式辅助方法
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
      getEmotionEmoji(type) {
        const emojis = {
          '快乐/愉悦': '😊',
          '平静/满足': '😌',
          '焦虑/紧张': '😰',
          '悲伤/低落': '😢',
          '愤怒/烦躁': '😠',
          '疲惫/无力': '😩',
          '中性/平淡': '😐'
        };
        return emojis[type] || '😐';
      },
      getIntensityColorClass(type) {
        const classes = {
          '快乐/愉悦': 'bg-yellow-500',
          '平静/满足': 'bg-green-500',
          '焦虑/紧张': 'bg-purple-500',
          '悲伤/低落': 'bg-blue-500',
          '愤怒/烦躁': 'bg-red-500',
          '疲惫/无力': 'bg-gray-500',
          '中性/平淡': 'bg-gray-500'
        };
        return classes[type] || 'bg-blue-500';
      },
      getTagActiveClass(index) {
        const classes = [
          'bg-blue-100 text-blue-600',
          'bg-green-100 text-green-600',
          'bg-yellow-100 text-yellow-600',
          'bg-red-100 text-red-600',
          'bg-purple-100 text-purple-600',
          'bg-indigo-100 text-indigo-600',
          'bg-pink-100 text-pink-600'
        ];
        return classes[index % classes.length];
      },
      getTagClass(index) {
        const classes = [
          'bg-blue-50 text-blue-600',
          'bg-green-50 text-green-600',
          'bg-yellow-50 text-yellow-600',
          'bg-red-50 text-red-600',
          'bg-purple-50 text-purple-600',
          'bg-indigo-50 text-indigo-600',
          'bg-pink-50 text-pink-600'
        ];
        return classes[index % classes.length];
      }
    }
  }
  </script>
  
  <style>
  .mood-stepper {
    position: relative;
  }
  
  .steps-indicator {
    position: relative;
    z-index: 1;
  }
  
  .steps-line, .steps-line-active {
    z-index: 0;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .recording-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #f43f5e;
    animation: pulse 1s infinite ease-in-out;
  }
  
  @keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.2); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  .bg-primary {
    background-color: #8B5CF6;
  }
  
  .text-primary {
    color: #8B5CF6;
  }
  </style>