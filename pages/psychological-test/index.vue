<!-- pages/psychological-test/index.vue -->
<template>
  <view class="flex flex-col h-full bg-white">
    <!-- 头部搜索区域 -->
    <view class="px-4 pt-12 pb-3">
      <view class="flex items-center bg-gray-100 rounded-full px-4 py-2">
        <uni-icons type="search" size="18" color="#666666"></uni-icons>
        <input class="flex-1 ml-2 text-sm" placeholder="搜搜你想做的测评" />
        <navigator url="/pages/psychological-test/report" class="ml-3">
          <uni-icons type="bars" size="22" color="#333333"></uni-icons>
        </navigator>
      </view>
    </view>
    
    <!-- 分类导航 -->
    <scroll-view scroll-x class="whitespace-nowrap px-2 mb-3" show-scrollbar="false">
      <view class="inline-block px-4 py-2">
        <text class="text-indigo-600 font-medium">全部</text>
        <view class="h-0.5 bg-indigo-600 mt-1 rounded-full"></view>
      </view>
      <view class="inline-block px-4 py-2">
        <text class="text-gray-500">最热</text>
      </view>
      <view class="inline-block px-4 py-2">
        <text class="text-gray-500">最新</text>
      </view>
    </scroll-view>
    
    <!-- 左侧分类菜单 -->
    <view class="flex flex-1 overflow-hidden">
      <scroll-view scroll-y class="w-20 bg-gray-50 border-r border-gray-100">
        <view class="py-3 px-2 text-center bg-white">
          <text class="text-indigo-600 font-medium">人格</text>
        </view>
        <view class="py-3 px-2 text-center">
          <text class="text-gray-500">恋爱</text>
        </view>
        <view class="py-3 px-2 text-center">
          <text class="text-gray-500">自我</text>
        </view>
        <view class="py-3 px-2 text-center">
          <text class="text-gray-500">情绪</text>
        </view>
        <view class="py-3 px-2 text-center">
          <text class="text-gray-500">职业</text>
        </view>
        <view class="py-3 px-2 text-center">
          <text class="text-gray-500">趣味</text>
        </view>
      </scroll-view>
      
      <!-- 右侧内容区域 -->
      <scroll-view scroll-y class="flex-1 pb-20" v-if="loading">
        <view class="flex items-center justify-center py-10">
          <text class="text-gray-600">加载中...</text>
        </view>
      </scroll-view>
      
      <scroll-view scroll-y class="flex-1 pb-20" v-else>
        <!-- 测试列表 -->
        <view class="px-3 py-2">
          <!-- 人格测试 -->
          <view v-for="(test, index) in personalityTests" :key="index" 
                class="flex items-center py-4 border-b border-gray-100"
                @click="goToTestDetail(test)">
            <view class="w-16 h-16 rounded-lg bg-blue-50 flex items-center justify-center mr-3 overflow-hidden">
              <image v-if="test.imageUrl" :src="test.imageUrl" mode="aspectFill" class="w-full h-full"></image>
              <uni-icons v-else type="person" size="28" color="#4F46E5"></uni-icons>
            </view>
            <view class="flex-1">
              <text class="font-medium text-gray-800">{{ test.title }}</text>
              <text class="text-xs text-gray-500 mt-1 block">{{ test.description || '了解你的人格特质' }}</text>
              <view class="flex items-center mt-1">
                <text v-if="test.originalPrice" class="text-xs text-gray-400 line-through ml-1">¥{{ test.originalPrice }}</text>
                <text class="text-xs text-gray-400 ml-auto">{{ formatTestCount(test.testCount) }}人测过</text>
              </view>
            </view>
          </view>
          
          <!-- 情绪测试 -->
          <view v-if="emotionTests.length > 0" class="mt-4">
            <text class="font-medium text-gray-800 mb-2 block">情绪状态评估</text>
            <view v-for="(test, index) in emotionTests" :key="index" 
                  class="flex items-center py-4 border-b border-gray-100"
                  @click="goToTestDetail(test)">
              <view class="w-16 h-16 rounded-lg bg-pink-50 flex items-center justify-center mr-3 overflow-hidden">
                <image v-if="test.imageUrl" :src="test.imageUrl" mode="aspectFill" class="w-full h-full"></image>
                <uni-icons v-else type="heart" size="28" color="#EC4899"></uni-icons>
              </view>
              <view class="flex-1">
                <text class="font-medium text-gray-800">{{ test.title }}</text>
                <text class="text-xs text-gray-500 mt-1 block">{{ test.description || '评估你的情绪状态' }}</text>
                <view class="flex items-center mt-1">
                  <text v-if="test.originalPrice" class="text-xs text-gray-400 line-through ml-1">¥{{ test.originalPrice }}</text>
                  <text class="text-xs text-gray-400 ml-auto">{{ formatTestCount(test.testCount) }}人测过</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 常用测试 -->
          <view v-if="commonTests.length > 0" class="mt-4">
            <text class="font-medium text-gray-800 mb-2 block">常用心理测试</text>
            <view v-for="(test, index) in commonTests" :key="index" 
                  class="flex items-center py-4 border-b border-gray-100"
                  @click="goToTestDetail(test)">
              <view class="w-16 h-16 rounded-lg bg-green-50 flex items-center justify-center mr-3 overflow-hidden">
                <image v-if="test.imageUrl" :src="test.imageUrl" mode="aspectFill" class="w-full h-full"></image>
                <uni-icons v-else type="checkbox" size="28" color="#10B981"></uni-icons>
              </view>
              <view class="flex-1">
                <text class="font-medium text-gray-800">{{ test.title }}</text>
                <text class="text-xs text-gray-500 mt-1 block">{{ test.description || '常用心理测试工具' }}</text>
                <view class="flex items-center mt-1">
                  <text v-if="test.originalPrice" class="text-xs text-gray-400 line-through ml-1">¥{{ test.originalPrice }}</text>
                  <text class="text-xs text-gray-400 ml-auto">{{ formatTestCount(test.testCount) }}人测过</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 最近完成 -->
          <view v-if="recentTest" class="mt-6 mb-10">
            <text class="font-medium text-gray-800 mb-2 block">最近完成的评估</text>
            <view class="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <view class="flex items-center mb-3">
                <view class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <text class="iconfont icon-check-circle text-green-600"></text>
                </view>
                <view class="flex-1">
                  <text class="font-medium text-gray-800">{{ recentTest.title }}</text>
                  <text class="text-xs text-gray-500 block">完成于 {{ recentTest.completedTime }}</text>
                </view>
                <text class="text-indigo-600" @click="viewTestResult(recentTest)">查看</text>
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
    
  </view>
</template>

<script>
import TestCard from '@/components/test-card.vue'
import { fetchAllTests, getTestCompletionCounts } from '@/api/test.js'

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
        const response = await fetchAllTests()
        this.allTests = response.data
        
        // 确保有测试数据
        if (this.allTests && this.allTests.length > 0) {
          const testIds = this.allTests.map(test => test.id)
          console.log('测试ID列表:', testIds) // 添加日志检查ID列表
          
          // 确保testIds不为空
          if (testIds.length > 0) {
            const countsResponse = await getTestCompletionCounts(testIds)
            console.log('测试人数响应:', countsResponse) // 添加日志检查响应
            
            if (countsResponse.code === 200) {
              this.allTests = this.allTests.map(test => {
                return {
                  ...test,
                  testCount: countsResponse.data[test.id] || 0
                }
              })
            }
          }
        }
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
    },
    
    formatTestCount(count) {
      if (!count) return '0';
      if (count < 1000) return count.toString();
      if (count < 10000) return (count / 1000).toFixed(1) + 'k';
      return (count / 10000).toFixed(1) + '万';
    },
    
    getIconForTest(test) {
      // 根据测试类型返回不同的图标
      const iconMap = {
        'anxiety': 'info',
        'depression': 'heart',
        'pressure': 'staff',
        'happiness': 'medal'
      }
      return iconMap[test.type] || 'checkbox'
    }
  }
}
</script>

<style>
</style>

  