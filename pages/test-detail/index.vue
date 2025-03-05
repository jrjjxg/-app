<!-- pages/test-detail/index.vue -->
<template>
    <view class="flex flex-col h-full bg-gray-50">
      <!-- 头部 -->
      <view class="bg-white px-4 pt-12 pb-4 shadow-sm">
        <view class="flex items-center mb-4">
          <navigator url="/pages/psychological-test/index" open-type="navigateBack" hover-class="none">
            <view class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
              <text class="iconfont icon-arrow-left text-gray-600"></text>
            </view>
          </navigator>
          <text class="text-xl font-bold text-gray-800">{{ test.title || '加载中...' }}</text>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view v-if="loading" class="flex-1 flex items-center justify-center">
        <text class="text-gray-600">加载中...</text>
      </view>

      <!-- 内容区域 -->
      <scroll-view v-else scroll-y class="flex-1 px-4 py-5">
        <!-- 测试信息 -->
        <view class="bg-white rounded-xl overflow-hidden shadow mb-5">
          <view class="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
            <view class="absolute inset-0 flex items-center justify-center">
              <text class="iconfont" :class="test.icon" style="font-size: 80rpx; color: white;"></text>
            </view>
            <view class="absolute bottom-4 left-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <view class="flex justify-between items-center">
                <text class="text-white font-bold">{{ test.title }}</text>
                <text class="text-white/80 text-sm">{{ test.time }}分钟</text>
              </view>
            </view>
          </view>
          
          <view class="p-4">
            <view class="flex space-x-2 mb-3">
              <text class="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">{{ test.category === 'emotion' ? '情绪评估' : test.category === 'personality' ? '人格测试' : '常用测试' }}</text>
              <text class="px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">{{ test.questionCount }}个问题</text>
              <text class="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">{{ test.completedCount }}人已完成</text>
            </view>
            
            <text class="text-gray-800 mb-4 block">{{ test.description }}</text>
            
            <view class="bg-gray-50 p-3 rounded-lg mb-4">
              <text class="font-medium text-gray-800 mb-2 block">适用人群：</text>
              <text class="text-sm text-gray-600">{{ test.suitableFor }}</text>
            </view>
            
            <view class="bg-gray-50 p-3 rounded-lg">
              <text class="font-medium text-gray-800 mb-2 block">测试说明：</text>
              <text class="text-sm text-gray-600">{{ test.instructions }}</text>
            </view>
          </view>
        </view>
        
        <!-- 科普信息 -->
        <view class="bg-white rounded-xl p-4 shadow mb-5">
          <text class="font-bold text-gray-800 mb-3 block">关于{{ test.title }}</text>
          <text class="text-sm text-gray-600 mb-3">{{ test.about }}</text>
          
          <view v-if="test.history" class="mb-3">
            <text class="font-medium text-gray-800 mb-1 block">历史背景</text>
            <text class="text-sm text-gray-600">{{ test.history }}</text>
          </view>
          
          <view v-if="test.validity" class="mb-3">
            <text class="font-medium text-gray-800 mb-1 block">科学依据</text>
            <text class="text-sm text-gray-600">{{ test.validity }}</text>
          </view>
          
          <view v-if="test.interpretation">
            <text class="font-medium text-gray-800 mb-1 block">结果解读</text>
            <text class="text-sm text-gray-600">{{ test.interpretation }}</text>
          </view>
        </view>
        
        <!-- 开始测试按钮 -->
        <view class="px-4 py-5">
          <button 
            class="w-full bg-blue-600 text-white py-4 rounded-full font-bold shadow-lg shadow-blue-600/30"
            @click="startTest"
            :disabled="loading"
          >
            开始测试
          </button>
        </view>
      </scroll-view>
    </view>
  </template>
  
  <script>
  import { request } from '@/api/request.js'
  
  export default {
    data() {
      return {
        testId: '',
        test: {},
        loading: true
      }
    },
    onLoad(options) {
      this.testId = options.id
      this.loadTestData()
    },
    methods: {
      async loadTestData() {
        try {
          uni.showLoading({ title: '加载中...' })
          const response = await request({
            url: `/api/tests/${this.testId}`,
            method: 'GET'
          })
          this.test = response.data
        } catch (error) {
          console.error('加载测试详情失败:', error)
          uni.showToast({
            title: '加载测试详情失败，请重试',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
          this.loading = false
        }
      },

      startTest() {
        if (this.loading) return
        
        uni.navigateTo({
          url: `/pages/test-questions/index?id=${this.testId}`
        })
      }
    }
  }
  </script>