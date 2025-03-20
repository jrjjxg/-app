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
            class="relative mb-4 bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-102 active:scale-98"
            @click="goToTestDetail(test)">
            <!-- 卡片背景渐变 -->
            <view class="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white opacity-70"></view>

            <!-- 卡片内容 -->
            <view class="relative p-4">
              <!-- 上部分：图片和名称 -->
              <view class="flex mb-2">
                <view class="w-16 h-16 rounded-lg overflow-hidden shadow-sm mr-3">
                  <image v-if="test.imageUrl" :src="test.imageUrl" mode="aspectFill" class="w-full h-full"></image>
                  <view v-else
                    class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <uni-icons type="person" size="28" color="#ffffff"></uni-icons>
                  </view>
                </view>

                <view class="flex-1">
                  <text class="text-base font-semibold text-gray-800 block mb-1">{{ test.name }}</text>
                  <view class="flex items-center">
                    <view class="px-2 py-0.5 bg-indigo-100 rounded-full">
                      <text class="text-xs text-indigo-700">{{ test.category || '人格' }}</text>
                    </view>
                    <view class="flex items-center ml-2">
                      <uni-icons type="star-filled" size="12" color="#FBBF24"></uni-icons>
                      <text class="text-xs text-gray-500 ml-1">{{ (test.rating || 4.8).toFixed(1) }}</text>
                    </view>
                  </view>
                </view>
              </view>

              <!-- 下部分：描述和统计 -->
              <view>
                <text class="text-sm text-gray-600 block line-clamp-2 mb-2">{{ test.description || '了解你的人格特质，发现真实的自我'
                }}</text>

                <view class="flex items-center justify-between">
                  <view class="flex items-center">
                    <view class="flex items-center">
                      <uni-icons type="person-filled" size="12" color="#6B7280"></uni-icons>
                      <text class="text-xs text-gray-500 ml-1">{{ formatTestCount(test.testCount) }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 情绪测试 -->
          <view v-if="emotionTests.length > 0" class="mt-6">
            <view class="flex items-center mb-3">
              <view class="w-1 h-5 bg-pink-500 rounded-full mr-2"></view>
              <text class="text-lg font-semibold text-gray-800">情绪状态评估</text>
            </view>

            <view v-for="(test, index) in emotionTests" :key="index"
              class="relative mb-4 bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-102 active:scale-98"
              @click="goToTestDetail(test)">
              <!-- 卡片背景渐变 -->
              <view class="absolute inset-0 bg-gradient-to-br from-pink-50 to-white opacity-70"></view>

              <!-- 卡片内容 -->
              <view class="relative p-4">
                <!-- 上部分：图片和名称 -->
                <view class="flex mb-2">
                  <view class="w-16 h-16 rounded-lg overflow-hidden shadow-sm mr-3">
                    <image v-if="test.imageUrl" :src="test.imageUrl" mode="aspectFill" class="w-full h-full"></image>
                    <view v-else
                      class="w-full h-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                      <uni-icons type="heart" size="28" color="#ffffff"></uni-icons>
                    </view>
                  </view>

                  <view class="flex-1">
                    <text class="text-base font-semibold text-gray-800 block mb-1">{{ test.name }}</text>
                    <view class="flex items-center">
                      <view class="px-2 py-0.5 bg-pink-100 rounded-full">
                        <text class="text-xs text-pink-700">{{ test.category || '情绪' }}</text>
                      </view>
                      <view class="flex items-center ml-2">
                        <uni-icons type="star-filled" size="12" color="#FBBF24"></uni-icons>
                        <text class="text-xs text-gray-500 ml-1">{{ (test.rating || 4.7).toFixed(1) }}</text>
                      </view>
                    </view>
                  </view>
                </view>

                <!-- 下部分：描述和统计 -->
                <view>
                  <text class="text-sm text-gray-600 block line-clamp-2 mb-2">{{ test.description || '评估你的情绪状态，找到内心平衡'
                  }}</text>

                  <view class="flex items-center justify-between">
                    <view class="flex items-center">
                      <view class="flex items-center">
                        <uni-icons type="person-filled" size="12" color="#6B7280"></uni-icons>
                        <text class="text-xs text-gray-500 ml-1">{{ formatTestCount(test.testCount) }}</text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 常用测试 -->
          <view v-if="commonTests.length > 0" class="mt-6">
            <view class="flex items-center mb-3">
              <view class="w-1 h-5 bg-emerald-500 rounded-full mr-2"></view>
              <text class="text-lg font-semibold text-gray-800">常用心理测试</text>
            </view>

            <view v-for="(test, index) in commonTests" :key="index"
              class="relative mb-4 bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-102 active:scale-98"
              @click="goToTestDetail(test)">
              <!-- 卡片背景渐变 -->
              <view class="absolute inset-0 bg-gradient-to-br from-emerald-50 to-white opacity-70"></view>

              <!-- 卡片内容 -->
              <view class="relative p-4">
                <!-- 上部分：图片和名称 -->
                <view class="flex mb-2">
                  <view class="w-16 h-16 rounded-lg overflow-hidden shadow-sm mr-3">
                    <image v-if="test.imageUrl" :src="test.imageUrl" mode="aspectFill" class="w-full h-full"></image>
                    <view v-else
                      class="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <uni-icons type="checkbox" size="28" color="#ffffff"></uni-icons>
                    </view>
                  </view>

                  <view class="flex-1">
                    <text class="text-base font-semibold text-gray-800 block mb-1">{{ test.name }}</text>
                    <view class="flex items-center">
                      <view class="px-2 py-0.5 bg-emerald-100 rounded-full">
                        <text class="text-xs text-emerald-700">{{ test.category || '常用' }}</text>
                      </view>
                      <view class="flex items-center ml-2">
                        <uni-icons type="star-filled" size="12" color="#FBBF24"></uni-icons>
                        <text class="text-xs text-gray-500 ml-1">{{ (test.rating || 4.9).toFixed(1) }}</text>
                      </view>
                    </view>
                  </view>
                </view>

                <!-- 下部分：描述和统计 -->
                <view>
                  <text class="text-sm text-gray-600 block line-clamp-2 mb-2">{{ test.description || '专业心理测试工具，助你深入了解自我'
                  }}</text>

                  <view class="flex items-center justify-between">
                    <view class="flex items-center">
                      <view class="flex items-center">
                        <uni-icons type="person-filled" size="12" color="#6B7280"></uni-icons>
                        <text class="text-xs text-gray-500 ml-1">{{ formatTestCount(test.testCount) }}</text>
                      </view>
                      <view class="flex items-center ml-3">
                        <uni-icons type="time" size="12" color="#6B7280"></uni-icons>
                        <text class="text-xs text-gray-500 ml-1">{{ test.time_minutes || 10 }}分钟</text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 最近完成 -->
          <view v-if="recentTest" class="mt-8 mb-10">
            <view class="flex items-center mb-3">
              <view class="w-1 h-5 bg-amber-500 rounded-full mr-2"></view>
              <text class="text-lg font-semibold text-gray-800">最近完成的评估</text>
            </view>

            <view class="bg-white rounded-xl p-5 shadow-md border border-gray-100 relative overflow-hidden">
              <!-- 背景装饰 -->
              <view
                class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100 to-transparent rounded-bl-full opacity-70">
              </view>

              <view class="flex items-center mb-4 relative">
                <view
                  class="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mr-3 shadow-sm">
                  <uni-icons type="checkmarkempty" size="24" color="#ffffff"></uni-icons>
                </view>
                <view class="flex-1">
                  <text class="font-semibold text-gray-800 text-base">{{ recentTest.name }}</text>
                  <text class="text-xs text-gray-500 block">完成于 {{ recentTest.completedTime }}</text>
                </view>
                <view class="px-3 py-1.5 bg-indigo-600 rounded-full shadow-sm" @click.stop="viewTestResult(recentTest)">
                  <text class="text-white text-sm">查看报告</text>
                </view>
              </view>

              <view class="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl relative">
                <view class="absolute top-2 left-2 w-8 h-8 rounded-full bg-amber-100 opacity-50"></view>
                <view class="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-amber-100 opacity-30"></view>

                <text class="text-sm font-medium text-amber-800 mb-2 block">测试结果摘要：</text>
                <text class="text-sm text-gray-700 leading-relaxed relative">{{ recentTest.summary }}</text>

                <!-- 底部标签 -->
                <view class="flex flex-wrap mt-3 gap-2">
                  <view v-for="(tag, idx) in getResultTags(recentTest)" :key="idx"
                    class="px-2 py-0.5 bg-white bg-opacity-70 rounded-full border border-amber-200">
                    <text class="text-xs text-amber-700">{{ tag }}</text>
                  </view>
                </view>
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
    // }
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
    },

    getResultTags(test) {
      // 从测试结果中提取标签，如果没有则返回默认标签
      return test.tags || ['性格分析', '情绪稳定', '自我认知'];
    }
  }
}
</script>

<style></style>