<!-- pages/psychological-test/index.vue -->
<template>
  <view class="flex flex-col h-full bg-white">
    <!-- 头部搜索区域 -->
    <view class="px-4 pt-12 pb-3">
      <view class="flex items-center bg-gray-100 rounded-full px-4 py-2">
        <uni-icons type="search" size="18" color="#666666"></uni-icons>
        <input class="flex-1 ml-2 text-sm" placeholder="搜搜你想做的测评" v-model="searchKeyword" @confirm="handleSearch" />
      </view>
    </view>

    <!-- 分类导航 -->
    <scroll-view scroll-x class="whitespace-nowrap px-2 mb-3 scroll-optimize" show-scrollbar="false">
      <view class="inline-block px-4 py-2" @click="switchTab('all')">
        <text :class="activeTab === 'all' ? 'text-indigo-600 font-medium' : 'text-gray-500'">全部</text>
        <view v-if="activeTab === 'all'" class="h-0.5 bg-indigo-600 mt-1 rounded-full"></view>
      </view>
      <view class="inline-block px-4 py-2" @click="switchTab('hot')">
        <text :class="activeTab === 'hot' ? 'text-indigo-600 font-medium' : 'text-gray-500'">最热</text>
        <view v-if="activeTab === 'hot'" class="h-0.5 bg-indigo-600 mt-1 rounded-full"></view>
      </view>
      <view class="inline-block px-4 py-2" @click="switchTab('new')">
        <text :class="activeTab === 'new' ? 'text-indigo-600 font-medium' : 'text-gray-500'">最新</text>
        <view v-if="activeTab === 'new'" class="h-0.5 bg-indigo-600 mt-1 rounded-full"></view>
      </view>
    </scroll-view>

    <!-- 在测试列表上方添加筛选提示 -->
    <view v-if="activeTab !== 'all'" class="mx-3 my-2 p-2 bg-blue-50 rounded-lg">
      <text v-if="activeTab === 'hot'" class="text-xs text-blue-600">
        <uni-icons type="fire" size="14" color="#2563EB"></uni-icons> 显示最热门的10个测评,大家都在测哦
      </text>
      <text v-else-if="activeTab === 'new'" class="text-xs text-blue-600">
        <uni-icons type="calendar" size="14" color="#2563EB"></uni-icons> 显示最近一周上线的测评，快来看看吧👀
      </text>
    </view>

    <!-- 左侧分类菜单 -->
    <view class="flex flex-1 overflow-hidden">
      <scroll-view scroll-y class="w-20 bg-gray-50 border-r border-gray-100 scroll-optimize">
        <view v-for="category in allCategories" :key="category.code" class="py-3 px-2 text-center"
          :class="selectedCategory === category.code ? 'bg-white' : ''" @click="switchCategory(category.code)">
          <text :style="selectedCategory === category.code ? { color: category.color } : { color: '#6B7280' }"
            :class="selectedCategory === category.code ? 'font-medium' : ''">{{ category.name }}</text>
        </view>
      </scroll-view>

      <!-- 右侧内容区域 -->
      <scroll-view scroll-y class="flex-1 pb-20 scroll-optimize" v-if="loading">
        <view class="flex items-center justify-center py-10">
          <text class="text-gray-600">加载中...</text>
        </view>
      </scroll-view>

      <scroll-view scroll-y class="flex-1 pb-20 scroll-optimize" v-else @scrolltolower="loadMoreTests"
        :lower-threshold="300">
        <!-- 测试列表 -->
        <view class="px-3 py-2">
          <!-- 测试列表 -->
          <template v-for="(test, index) in displayedTests" :key="index">
            <view class="test-card mb-4 bg-white rounded-xl shadow-md overflow-hidden" @click="goToTestDetail(test)">
              <view class="p-4">
                <!-- 上部分：图片和名称 -->
                <view class="flex mb-2">
                  <view class="w-16 h-16 rounded-lg overflow-hidden shadow-sm mr-3">
                    <image v-if="test.imageUrl" :src="test.imageUrl" mode="aspectFill" class="w-full h-full" lazy-load>
                    </image>
                    <view v-else class="w-full h-16 flex items-center justify-center"
                      :style="{ backgroundColor: getCategoryColor(test.category) }">
                      <uni-icons type="person" size="28" color="#ffffff"></uni-icons>
                    </view>
                  </view>

                  <view class="flex-1">
                    <text class="text-base font-semibold text-gray-800 block mb-1">{{ test.name }}</text>
                    <view class="flex items-center">
                      <view class="px-2 py-0.5 rounded-full" :style="{
                        backgroundColor: `${getCategoryColor(test.category)}20`,
                        color: getCategoryColor(test.category),
                        borderColor: getCategoryColor(test.category)
                      }">
                        <text class="text-xs">{{ getCategoryLabel(test.category) }}</text>
                      </view>
                      <view class="flex items-center ml-2">
                        <text class="text-xs text-gray-500 ml-1">{{ formatTestCount(test.testCount) }}人测过</text>
                      </view>
                    </view>
                  </view>
                </view>

                <!-- 下部分：描述和统计 -->
                <view>
                  <text class="text-sm text-gray-600 block line-clamp-2 mb-2">{{ test.description }}</text>
                  <view class="flex items-center justify-between">
                    <view class="flex items-center">
                      <view class="flex items-center ml-3">
                        <uni-icons type="time" size="12" color="#6B7280"></uni-icons>
                        <text class="text-xs text-gray-500 ml-1">{{ test.timeMinutes || 10 }}分钟</text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </template>

          <!-- 加载更多指示器 -->
          <view v-if="isLoadingMore" class="py-4 flex justify-center">
            <text class="text-gray-500">加载更多...</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import TestCard from '@/components/test-card.vue'
import { fetchAllTests, getTestCompletionCounts, searchTests, getCategories } from '@/api/test.js'

export default {
  components: {
    TestCard
  },
  data() {
    return {
      allTests: [],
      allCategories: [],
      selectedCategory: 'all',
      activeTab: 'all',
      loading: true,
      searchKeyword: '',
      page: 1,
      pageSize: 10,
      hasMore: true,
      isLoadingMore: false,
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
    },
    // 根据选中的分类和标签筛选测试
    filteredTests() {
      if (this.activeTab !== 'all') {
        // 如果是最热或最新排序，使用searchTests接口获取的数据
        return this.allTests;
      } else if (this.selectedCategory === 'all') {
        // 显示所有测试
        return this.allTests;
      } else {
        // 按分类筛选
        return this.allTests.filter(test => test.category === this.selectedCategory);
      }
    },
    // 分页显示
    displayedTests() {
      return this.filteredTests.slice(0, this.page * this.pageSize);
    },
    displayedPersonalityTests() {
      return this.personalityTests.slice(0, this.page * this.pageSize)
    },
    displayedEmotionTests() {
      return this.emotionTests.slice(0, this.page * this.pageSize)
    },
    displayedCommonTests() {
      return this.commonTests.slice(0, this.page * this.pageSize)
    }
  },
  onLoad() {
    this.loadCategories();
    this.loadTests();
  },
  methods: {
    // 加载分类数据
    async loadCategories() {
      try {
        const response = await getCategories();
        if (response.code === 200) {
          this.allCategories = response.data;
          console.log('加载到的分类数据:', this.allCategories);

          // 如果没有选择分类，则设置默认选中第一个
          if (!this.selectedCategory && this.allCategories.length > 0) {
            this.selectedCategory = this.allCategories[0].code;
          }
        }
      } catch (error) {
        console.error('获取分类数据失败:', error);
      }
    },

    // 切换分类
    switchCategory(categoryCode) {
      this.selectedCategory = categoryCode;
      this.page = 1; // 重置分页
    },

    // 获取分类名称
    getCategoryLabel(categoryCode) {
      const category = this.allCategories.find(c => c.code === categoryCode);
      return category ? category.name : categoryCode;
    },

    // 获取分类颜色
    getCategoryColor(categoryCode) {
      const category = this.allCategories.find(c => c.code === categoryCode);
      if (category) {
        console.log(`找到分类 ${categoryCode} 的颜色: ${category.color}`);
        return category.color || '#6B7280';
      }
      console.log(`未找到分类 ${categoryCode}`);
      return '#6B7280'; // 默认颜色
    },

    async loadTests() {
      try {
        this.loading = true;

        // 如果选择了排序方式，则通过searchTests接口获取数据
        if (this.activeTab !== 'all') {
          const response = await searchTests('', this.activeTab);
          if (response.code === 200) {
            this.allTests = response.data;
          }
        } else {
          // 正常加载所有测试
          const response = await fetchAllTests();
          if (response.code === 200) {
            this.allTests = response.data;
          }
        }

        // 加载测试完成人数
        if (this.allTests && this.allTests.length > 0) {
          const testIds = this.allTests.map(test => test.id);
          if (testIds.length > 0) {
            const countsResponse = await getTestCompletionCounts(testIds);
            if (countsResponse.code === 200) {
              this.allTests = this.allTests.map(test => {
                return {
                  ...test,
                  testCount: countsResponse.data[test.id] || 0
                };
              });
            }
          }
        }
      } catch (error) {
        console.error('获取测试列表失败:', error);
        uni.showToast({
          title: '获取测试列表失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // 加载更多测试
    loadMoreTests() {
      if (this.isLoadingMore || !this.hasMore) return

      this.isLoadingMore = true

      // 模拟加载延迟
      setTimeout(() => {
        this.page++

        // 检查是否还有更多数据
        const totalItems = Math.max(
          this.personalityTests.length,
          this.emotionTests.length,
          this.commonTests.length
        )

        this.hasMore = this.page * this.pageSize < totalItems
        this.isLoadingMore = false
      }, 500)
    },

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
    },

    handleSearch() {
      if (!this.searchKeyword.trim()) return;

      // 跳转到搜索结果页面
      uni.navigateTo({
        url: `/pages/psychological-test/search-result?keyword=${encodeURIComponent(this.searchKeyword)}`
      });
    },

    switchTab(tab) {
      if (this.activeTab === tab) return;

      this.activeTab = tab;
      this.page = 1; // 重置分页

      // 重新加载数据
      this.loadTests();
    }
  },
  watch: {
    activeTab() {
      this.loadTests();
    }
  }
}
</script>

<style>
/* 优化滚动性能 */
.scroll-optimize {
  -webkit-overflow-scrolling: touch;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000;
  will-change: transform;
}

/* 优化卡片样式，移除动画效果 */
.test-card {
  position: relative;
  background-color: white;
}

/* 优化文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}

/* 减少重绘和重排 */
image {
  will-change: transform;
}

/* 优化滚动容器 */
scroll-view {
  -webkit-overflow-scrolling: touch;
}
</style>