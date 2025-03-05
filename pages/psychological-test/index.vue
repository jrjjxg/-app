<!-- pages/psychological-test/index.vue -->
<template>
    <view class="flex flex-col h-full bg-gray-50">
      <!-- 头部 -->
      <view class="bg-indigo-600 px-4 pt-12 pb-4">
        <view class="flex items-center mb-4">
          <navigator url="/pages/index/index" open-type="navigateBack" hover-class="none">
            <view class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
              <text class="iconfont icon-arrow-left text-white"></text>
            </view>
          </navigator>
          <text class="text-xl font-bold text-white">心理健康评估</text>
        </view>
        <text class="text-white/80">专业量表帮助你了解自己的心理状态</text>
      </view>
      
      <!-- 内容区域 -->
      <scroll-view scroll-y class="flex-1 px-4 py-5">
        <!-- 加载状态 -->
        <view v-if="loading" class="flex items-center justify-center py-10">
          <text class="text-gray-600">加载中...</text>
        </view>

        <view v-else>
          <!-- 常用测试 -->
          <view class="mb-6">
            <text class="font-bold text-gray-800 mb-3 block">常用心理测试</text>
            
            <view class="space-y-3">
              <test-card 
                v-for="(test, index) in commonTests" 
                :key="index"
                :test="test"
                @click="goToTestDetail(test)"
              />
            </view>
          </view>
          
          <!-- 情绪评估 -->
          <view class="mb-6">
            <text class="font-bold text-gray-800 mb-3 block">情绪状态评估</text>
            
            <view class="space-y-3">
              <test-card 
                v-for="(test, index) in emotionTests" 
                :key="index"
                :test="test"
                @click="goToTestDetail(test)"
              />
            </view>
          </view>
          
          <!-- 人格测试 -->
          <view class="mb-6">
            <text class="font-bold text-gray-800 mb-3 block">人格与特质测试</text>
            
            <view class="space-y-3">
              <test-card 
                v-for="(test, index) in personalityTests" 
                :key="index"
                :test="test"
                @click="goToTestDetail(test)"
              />
            </view>
          </view>
          
          <!-- 最近完成 -->
          <view class="mb-10" v-if="recentTest">
            <text class="font-bold text-gray-800 mb-3 block">最近完成的评估</text>
            
            <view class="bg-white rounded-xl p-4 shadow">
              <view class="flex items-center mb-3">
                <view class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <text class="iconfont icon-check-circle text-green-600"></text>
                </view>
                <view class="flex-1">
                  <text class="font-medium text-gray-800">{{ recentTest.title }}</text>
                  <text class="text-xs text-gray-500 block">完成于 {{ recentTest.completedTime }}</text>
                </view>
                <text class="text-blue-600" @click="viewTestResult(recentTest)">查看</text>
              </view>
              
              <view class="bg-gray-50 p-3 rounded-lg">
                <text class="text-sm text-gray-600 mb-2 block">测试结果摘要：</text>
                <text class="text-sm text-gray-800">{{ recentTest.summary }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </template>
  
  <script>
  import TestCard from '@/components/test-card.vue'
  import { request } from '@/api/request.js'
  
  export default {
    components: {
      TestCard
    },
    data() {
      return {
        loading: true,
        allTests: [],
        recentTest: null
      }
    },
    computed: {
      commonTests() {
        return this.allTests.filter(test => test.category === 'common')
      },
      emotionTests() {
        return this.allTests.filter(test => test.category === 'emotion')
      },
      personalityTests() {
        return this.allTests.filter(test => test.category === 'personality')
      }
    },
    onLoad() {
      this.loadTests()
      // this.loadRecentTest()
    },
    methods: {
      async loadTests() {
        try {
          this.loading = true
          const response = await request({
            url: '/api/tests',
            method: 'GET'
          })
          this.allTests = response.data
        } catch (error) {
          console.error('获取测试列表失败:', error)
          uni.showToast({
            title: '获取测试列表失败',
            icon: 'none'
          })
        } finally {
          this.loading = false
        }
      },
      
      // async loadRecentTest() {
      //   try {
      //     const response = await request({
      //       url: '/api/tests/recent',
      //       method: 'GET'
      //     })
      //     this.recentTest = response.data
      //   } catch (error) {
      //     console.error('获取最近测试失败:', error)
      //   }
      // },

      goToTestDetail(test) {
        uni.navigateTo({
          url: `/pages/test-detail/index?id=${test.id}`
        })
      },

      viewTestResult(test) {
        uni.navigateTo({
          url: `/pages/test-result/index?id=${test.id}&resultId=${test.resultId}`
        })
      }
    }
  }
  </script>