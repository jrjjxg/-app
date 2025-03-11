<template>
    <view class="flex flex-col h-full bg-gray-50">
      <!-- 头部 -->
      <view class="bg-white px-4 pt-12 pb-4 shadow-sm">
        <view class="flex items-center mb-4">
          <navigator url="/pages/mood-tracker/index" open-type="navigateBack" hover-class="none">
            <view class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
              <text class="iconfont icon-arrow-left text-gray-600"></text>
            </view>
          </navigator>
          <text class="text-xl font-bold text-gray-800">记录情绪</text>
        </view>
        <text class="text-gray-500">{{ formatDate(new Date()) }}</text>
      </view>
      
      <!-- 内容区域 -->
      <scroll-view scroll-y class="flex-1 px-4 py-5">
        <!-- 主要问题 -->
        <view class="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 class="text-xl font-medium mb-4 text-center">今天感觉如何？</h2>
          
          <!-- 情绪选择 -->
          <emotion-picker v-model="selectedEmotion"></emotion-picker>
          
          <!-- 情绪强度 -->
          <intensity-slider v-model="intensity" :emotionType="selectedEmotion"></intensity-slider>
          
          <!-- 情绪记录 -->
          <view class="mb-6">
            <h2 class="text-lg font-medium mb-4">想多说几句吗？</h2>
            
            <view class="mb-4">
              <textarea 
                class="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="发生了什么让你感到这种情绪？" 
                v-model="note"
                rows="3"
              ></textarea>
            </view>
          </view>
          
          <!-- 情绪标签 -->
          <view class="mb-6">
            <h2 class="text-lg font-medium mb-4">你为什么有这种感受？</h2>
            
            <view class="flex flex-wrap gap-2 mb-4">
              <view 
                v-for="(tag, index) in commonTags" 
                :key="index"
                class="px-4 py-2 rounded-full cursor-pointer"
                :class="tags.includes(tag) ? 
                  'bg-blue-500 text-white' : 
                  'bg-blue-100 text-blue-800 hover:bg-blue-200'"
                @click="toggleTag(tag)"
              >{{ tag }}</view>
              
              <view class="px-4 py-2 bg-gray-100 text-gray-800 rounded-full cursor-pointer hover:bg-gray-200" @click="showCustomTagInput = true" v-if="!showCustomTagInput">
                <text class="iconfont icon-plus mr-1"></text>自定义
              </view>
            </view>
            
            <view v-if="showCustomTagInput" class="flex mb-4">
              <input 
                class="flex-1 p-2 border border-gray-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="添加自定义标签"
                v-model="customTag"
              />
              <button 
                class="px-4 py-2 bg-blue-500 text-white rounded-r-xl"
                @click="addCustomTag"
              >添加</button>
            </view>
          </view>
        </view>
      </scroll-view>
      
      <!-- 提交按钮 -->
      <view class="p-4 bg-white border-t border-gray-200">
        <button 
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition duration-300"
          :disabled="!isFormValid || submitting"
          :class="{'opacity-50': !isFormValid || submitting}"
          @click="submitMoodRecord"
        >
          {{ submitting ? '提交中...' : '记录我的心情' }}
        </button>
      </view>
    </view>
  </template>
  
  <script>
  import EmotionPicker from '@/components/mood-components/emotion-picker.vue';
  import IntensitySlider from '@/components/mood-components/intensity-slider.vue';
  import { createMoodRecord } from '@/api/mood.js';
  
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
    methods: {
      formatDate(date) {
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
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
            
            // 延迟后返回上一页
            setTimeout(() => {
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