<!-- pages/test-result/index.vue -->
<template>
  <view class="flex flex-col h-full bg-gray-50">
    <!-- 头部 -->
    <view class="bg-indigo-600 px-4 pt-12 pb-6">
      <view class="flex items-center mb-4">
        <navigator url="/pages/psychological-test/index" open-type="navigateBack" hover-class="none">
          <view class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
            <text class="iconfont icon-arrow-left text-white"></text>
          </view>
        </navigator>
        <text class="text-xl font-bold text-white">测试结果</text>
      </view>
      <text class="text-white/80">{{ test.title }}</text>
    </view>

    <!-- 内容区域 -->
    <scroll-view scroll-y class="flex-1 px-4 py-5">
      <!-- 加载状态 -->
      <view v-if="loading" class="flex items-center justify-center py-10">
        <text class="text-gray-600">加载中...</text>
      </view>

      <view v-else>
        <!-- 结果概览 -->
        <view class="bg-white rounded-xl overflow-hidden shadow mb-5">
          <view class="p-5 border-b border-gray-100">
            <view class="flex justify-between items-center mb-3">
              <text class="font-bold text-gray-800">您的结果</text>
              <text class="text-sm text-gray-500">{{ formatDate(result.createTime) }}</text>
            </view>

            <view class="flex items-center justify-center py-5">
              <view class="w-32 h-32 rounded-full flex items-center justify-center" :class="resultBgClass">
                <view class="text-center">
                  <text class="text-3xl font-bold" :class="resultTextClass">{{ result.totalScore }}</text>
                  <text class="block text-sm mt-1" :class="resultTextClass">{{ result.resultLevel }}</text>
                </view>
              </view>
            </view>

            <view class="bg-gray-50 p-4 rounded-lg">
              <text class="text-gray-800">{{ result.resultDescription }}</text>
            </view>
          </view>
        </view>

        <!-- 专业解读 -->
        <view class="bg-white rounded-xl overflow-hidden shadow mb-5">
          <view class="p-5">
            <text class="font-bold text-gray-800 mb-3 block">专业解读</text>
            <text class="text-gray-600 mb-4 block">{{ result.interpretation }}</text>

            <view class="bg-blue-50 p-4 rounded-lg mb-4">
              <view class="flex items-start">
                <text class="iconfont icon-lightbulb text-blue-500 mr-3 text-lg"></text>
                <view>
                  <text class="font-medium text-blue-700 block mb-1">建议</text>
                  <text class="text-blue-600 text-sm">{{ result.suggestions }}</text>
                </view>
              </view>
            </view>

            <view v-if="showWarning" class="bg-red-50 p-4 rounded-lg">
              <view class="flex items-start">
                <text class="iconfont icon-warning text-red-500 mr-3 text-lg"></text>
                <view>
                  <text class="font-medium text-red-700 block mb-1">注意</text>
                  <text class="text-red-600 text-sm">{{ result.warning }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 按钮区域 -->
        <view class="flex space-x-3 mb-5">
          <button class="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium" @click="goBack">
            返回
          </button>
          <button class="flex-1 bg-white border border-indigo-600 text-indigo-600 py-3 rounded-lg font-medium"
            @click="retakeTest">
            重新测试
          </button>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { fetchTestResultDetail, fetchTestById } from '@/api/test'

export default {
  data() {
    return {
      testId: '',
      resultId: '',
      test: {},
      result: {},
      loading: true
    }
  },
  computed: {
    showWarning() {
      return this.result.warning && this.result.warning.length > 0
    },
    resultBgClass() {
      const levelMap = {
        '正常': 'bg-green-100',
        '低': 'bg-green-100',
        '轻度': 'bg-yellow-100',
        '中度': 'bg-orange-100',
        '重度': 'bg-red-100'
      }
      return levelMap[this.result.resultLevel] || 'bg-indigo-100'
    },
    resultTextClass() {
      const levelMap = {
        '正常': 'text-green-600',
        '低': 'text-green-600',
        '轻度': 'text-yellow-600',
        '中度': 'text-orange-600',
        '重度': 'text-red-600'
      }
      return levelMap[this.result.resultLevel] || 'text-indigo-600'
    }
  },
  onLoad(options) {
    this.testId = options.testId
    this.resultId = options.resultId
    this.loadTestResult()
  },
  methods: {
    async loadTestResult() {
      try {
        uni.showLoading({ title: '加载中...' })

        // 获取测试结果详情
        const resultResponse = await fetchTestResultDetail(this.resultId)
        this.result = resultResponse.data

        // 获取测试详情
        const testResponse = await fetchTestById(this.testId)
        this.test = testResponse.data

      } catch (error) {
        console.error('加载结果失败:', error)
        uni.showToast({
          title: '加载结果失败，请重试',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
        this.loading = false
      }
    },
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },
    goBack() {
      uni.navigateBack()
    },
    retakeTest() {
      uni.redirectTo({
        url: `/pages/test-questions/index?id=${this.testId}`
      })
    }
  }
}
</script>