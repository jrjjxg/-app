<!-- accessibility-settings.vue -->
<template>
    <view class="accessibility-settings p-4 bg-white rounded-xl shadow-sm">
      <view class="mb-4">
        <text class="text-lg font-medium mb-2 block">文字大小</text>
        <slider 
          :min="1" 
          :max="3" 
          :step="0.5"
          :value="fontSize" 
          @change="changeFontSize" 
        />
        <view class="flex justify-between mt-1">
          <text class="text-xs text-gray-500">小</text>
          <text class="text-xs text-gray-500">标准</text>
          <text class="text-xs text-gray-500">大</text>
        </view>
      </view>
      
      <view class="mb-4">
        <text class="text-lg font-medium mb-2 block">对比度</text>
        <slider 
          :min="1" 
          :max="3" 
          :step="0.5"
          :value="contrast" 
          @change="changeContrast" 
        />
        <view class="flex justify-between mt-1">
          <text class="text-xs text-gray-500">标准</text>
          <text class="text-xs text-gray-500">中等</text>
          <text class="text-xs text-gray-500">高</text>
        </view>
      </view>
      
      <view class="mb-4">
        <text class="text-lg font-medium mb-2 block">减少动画</text>
        <switch :checked="reduceMotion" @change="toggleReduceMotion" color="#8B5CF6" />
      </view>
      
      <button class="w-full bg-primary text-white py-3 rounded-full font-medium" @click="saveSettings">
        保存设置
      </button>
    </view>
  </template>
  
  <script>
  export default {
    data() {
      return {
        fontSize: 1.5, // 默认标准大小
        contrast: 1, // 默认标准对比度
        reduceMotion: false // 默认不减少动画
      }
    },
    created() {
      // 从本地存储加载设置
      const settings = uni.getStorageSync('accessibility_settings');
      if (settings) {
        try {
          const parsedSettings = JSON.parse(settings);
          this.fontSize = parsedSettings.fontSize || 1.5;
          this.contrast = parsedSettings.contrast || 1;
          this.reduceMotion = parsedSettings.reduceMotion || false;
          
          // 应用设置
          this.applySettings();
        } catch (e) {
          console.error('解析设置失败:', e);
        }
      }
    },
    methods: {
      changeFontSize(e) {
        this.fontSize = e.detail.value;
        this.applySettings();
      },
      changeContrast(e) {
        this.contrast = e.detail.value;
        this.applySettings();
      },
      toggleReduceMotion(e) {
        this.reduceMotion = e.detail.value;
        this.applySettings();
      },
      applySettings() {
        // 应用字体大小
        const fontSizeClass = `font-size-${this.fontSize.toString().replace('.', '-')}`;
        document.documentElement.className = document.documentElement.className
          .replace(/font-size-\d+-\d+/g, '')
          .concat(` ${fontSizeClass}`);
        
        // 应用对比度
        const contrastClass = `contrast-${this.contrast.toString().replace('.', '-')}`;
        document.documentElement.className = document.documentElement.className
          .replace(/contrast-\d+-\d+/g, '')
          .concat(` ${contrastClass}`);
        
        // 应用动画设置
        if (this.reduceMotion) {
          document.documentElement.classList.add('reduce-motion');
        } else {
          document.documentElement.classList.remove('reduce-motion');
        }
      },
      saveSettings() {
        // 保存到本地存储
        const settings = {
          fontSize: this.fontSize,
          contrast: this.contrast,
          reduceMotion: this.reduceMotion
        };
        
        uni.setStorageSync('accessibility_settings', JSON.stringify(settings));
        
        uni.showToast({
          title: '设置已保存',
          icon: 'success'
        });
      }
    }
  }
  </script>
  
  <style>
  /* 在App.vue中添加以下全局样式 */
  .font-size-1-0 {
    --text-base-size: 0.85;
  }
  .font-size-1-5 {
    --text-base-size: 1;
  }
  .font-size-2-0 {
    --text-base-size: 1.15;
  }
  .font-size-2-5 {
    --text-base-size: 1.3;
  }
  .font-size-3-0 {
    --text-base-size: 1.5;
  }
  
  .contrast-1-0 {
    --contrast-factor: 1;
  }
  .contrast-2-0 {
    --contrast-factor: 1.2;
  }
  .contrast-3-0 {
    --contrast-factor: 1.5;
  }
  
  .reduce-motion * {
    animation-duration: 0.001s !important;
    transition-duration: 0.001s !important;
  }
  
  /* 应用字体大小变量 */
  .text-xs {
    font-size: calc(0.75rem * var(--text-base-size, 1));
  }
  .text-sm {
    font-size: calc(0.875rem * var(--text-base-size, 1));
  }
  .text-base {
    font-size: calc(1rem * var(--text-base-size, 1));
  }
  .text-lg {
    font-size: calc(1.125rem * var(--text-base-size, 1));
  }
  .text-xl {
    font-size: calc(1.25rem * var(--text-base-size, 1));
  }
  .text-2xl {
    font-size: calc(1.5rem * var(--text-base-size, 1));
  }
  
  /* 应用对比度变量 */
  .contrast-1-0 .text-gray-500 {
    color: #6b7280;
  }
  .contrast-2-0 .text-gray-500 {
    color: #4b5563;
  }
  .contrast-3-0 .text-gray-500 {
    color: #374151;
  }
  
  .bg-primary {
    background-color: #8B5CF6;
  }
  </style>