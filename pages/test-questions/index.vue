<!-- pages/test-questions/index.vue -->
<template>
  <view class="flex flex-col h-full bg-gray-50">
    <!-- 头部 -->
    <view class="bg-white px-4 pt-12 pb-4 shadow-sm">
      <view class="flex items-center mb-2">
        <navigator :url="`/pages/test-detail/index?id=${testId}`" open-type="navigateBack" hover-class="none">
          <view class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
            <text class="iconfont icon-arrow-left text-gray-600"></text>
          </view>
        </navigator>
        <text class="text-lg font-bold text-gray-800">{{ test.title || '加载中...' }}</text>
      </view>

      <!-- 进度条和视图切换 -->
      <view class="flex items-center justify-between mb-2">
        <view class="flex-1 mr-4">
          <progress-bar :current="currentQuestionIndex + 1" :total="totalQuestions"></progress-bar>
        </view>
        
        <!-- 视图切换按钮 -->
        <view class="flex bg-gray-100 rounded-full p-1">
          <view 
            class="px-3 py-1 text-sm rounded-full transition-all duration-200 flex items-center"
            :class="viewMode === 'single' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600'"
            @click="viewMode = 'single'"
          >
            <text class="iconfont icon-list mr-1 text-xs"></text>
            单题
          </view>
          <view 
            class="px-3 py-1 text-sm rounded-full transition-all duration-200 flex items-center"
            :class="viewMode === 'all' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600'"
            @click="viewMode = 'all'"
          >
            <text class="iconfont icon-grid mr-1 text-xs"></text>
            全部
          </view>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="flex-1 flex items-center justify-center">
      <text class="text-gray-600">加载中...</text>
    </view>

    <!-- 单题模式 -->
    <view v-else-if="viewMode === 'single'" class="flex-1 px-4 py-6">
      <!-- 问题卡片 - 添加过渡效果 -->
      <view class="question-container" :class="{ 'question-exit': isTransitioning, 'question-enter': !isTransitioning }">
        <view class="bg-white rounded-xl p-5 shadow-sm mb-6 transform translate-z-0" :key="'q-'+currentQuestionIndex">
          <view class="question-number mb-2 text-blue-500 font-medium">
            问题 {{ currentQuestionIndex + 1 }}/{{ totalQuestions }}
          </view>
          <text class="text-lg font-medium text-gray-800 mb-2 block">{{ currentQuestion.question }}</text>
          <text v-if="currentQuestion.description" class="text-sm text-gray-500 mb-4 block">{{ currentQuestion.description }}</text>
        </view>

        <!-- 选项 -->
        <view class="space-y-3 transform translate-z-0">
          <view v-for="(option, index) in currentQuestion.options" :key="index" 
            class="bg-white rounded-xl p-4 shadow-sm transition-all duration-200 option-item"
            :class="{ 
              'border-2 border-blue-500 bg-blue-50': selectedOption === index
            }" 
            @click="selectOption(index)"
          >
            <view class="flex items-center">
              <view class="w-6 h-6 rounded-full mr-3 flex items-center justify-center"
                :class="selectedOption === index ? 'bg-blue-500' : 'border border-gray-300'">
                <text v-if="selectedOption === index" class="iconfont icon-check text-white text-xs"></text>
              </view>
              <text class="text-gray-800">{{ option }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 全部题目模式 -->
    <view v-else class="flex-1 px-4 py-6 transform translate-z-0" style="overflow-y: auto; -webkit-overflow-scrolling: touch;">
      <view v-for="(question, qIndex) in test.questions" :key="qIndex" 
        class="bg-white rounded-xl p-5 shadow-sm mb-6 transition-all duration-300"
        :class="{
          'border-l-4 border-blue-500': currentQuestionIndex === qIndex,
          'scale-in': isScrolling && currentQuestionIndex === qIndex
        }"
      >
        <view class="flex items-center mb-2">
          <view class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mr-2 flex-shrink-0">
            <text class="text-white text-xs font-medium">{{ qIndex + 1 }}</text>
          </view>
          <text class="text-lg font-medium text-gray-800">{{ question.question }}</text>
        </view>
        
        <text v-if="question.description" class="text-sm text-gray-500 mb-4 ml-8 block">{{ question.description }}</text>
        
        <!-- 选项 -->
        <view class="space-y-3 ml-8">
          <view v-for="(option, oIndex) in question.options" :key="oIndex" 
            class="border rounded-lg p-3 transition-all duration-300"
            :class="{
              'border-blue-500 bg-blue-50': answers[qIndex] === oIndex,
              'hover:border-blue-300': answers[qIndex] !== oIndex
            }"
            @click="selectOptionInAllMode(qIndex, oIndex)"
          >
            <view class="flex items-center">
              <view class="w-5 h-5 rounded-full mr-3 flex items-center justify-center"
                :class="answers[qIndex] === oIndex ? 'bg-blue-500' : 'border border-gray-300'">
                <text v-if="answers[qIndex] === oIndex" class="iconfont icon-check text-white text-xs"></text>
              </view>
              <text class="text-gray-800">{{ option }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 提交按钮 -->
      <view class="sticky bottom-4 flex justify-center pb-4">
        <button 
          class="px-8 py-3 rounded-full bg-blue-600 text-white font-medium shadow-md transform hover:scale-105 transition-transform" 
          :class="{ 'opacity-50': !allQuestionsAnswered }" 
          :disabled="!allQuestionsAnswered"
          @click="completeTest"
        >
          完成测试
        </button>
      </view>
    </view>

    <!-- 底部按钮 - 仅单题模式显示 -->
    <view v-if="viewMode === 'single'" class="p-4 bg-white border-t border-gray-200">
      <view class="flex justify-between">
        <button class="px-6 py-3 rounded-full border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          :disabled="currentQuestionIndex === 0" 
          :class="{ 'opacity-50': currentQuestionIndex === 0 }"
          @click="prevQuestion">
          上一题
        </button>

        <button class="px-6 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors transform hover:scale-105" 
          :disabled="selectedOption === null"
          :class="{ 'opacity-50': selectedOption === null }" 
          @click="nextQuestion">
          {{ isLastQuestion ? '完成测试' : '下一题' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import ProgressBar from '@/components/progress-bar.vue'
import { request } from '@/api/request.js'

export default {
  components: {
    ProgressBar
  },
  data() {
    return {
      testId: '',
      test: {},
      loading: true,
      currentQuestionIndex: 0,
      selectedOption: null,
      answers: [],
      totalQuestions: 0,
      viewMode: 'single', // 'single' 或 'all'
      autoNext: true, // 是否自动进入下一题
      isTransitioning: false, // 问题切换过渡状态
      transitionDelay: 100, // 过渡延迟时间(毫秒)
      isScrolling: false, // 滚动状态
      lastScrollTime: 0, // 最后滚动时间
      scrollThrottleTime: 100 // 滚动节流时间
    }
  },
  computed: {
    currentQuestion() {
      return this.test.questions?.[this.currentQuestionIndex] || {}
    },
    isLastQuestion() {
      return this.currentQuestionIndex === this.totalQuestions - 1
    },
    allQuestionsAnswered() {
      // 检查是否所有题目都已回答
      return this.answers.every(answer => answer !== null && answer !== undefined)
    }
  },
  onLoad(options) {
    this.testId = options.id
    this.loadTestData()
  },
  // 添加页面滚动事件监听
  onPageScroll(e) {
    const now = Date.now()
    if (now - this.lastScrollTime > this.scrollThrottleTime) {
      this.isScrolling = true
      this.lastScrollTime = now
      
      // 重置滚动状态的计时器
      clearTimeout(this.scrollTimer)
      this.scrollTimer = setTimeout(() => {
        this.isScrolling = false
      }, 200)
    }
  },
  methods: {
    async loadTestData() {
      try {
        uni.showLoading({ title: '加载中...' })
        const response = await request({
          url: `/api/tests/${this.testId}/questions`,
          method: 'GET'
        })

        if (response.code === 200) {
          // 获取测试标题
          const testResponse = await request({
            url: `/api/tests/${this.testId}`,
            method: 'GET'
          })

          if (testResponse.code === 200) {
            this.test = {
              title: testResponse.data.name,
              questions: response.data.map(q => ({
                question: q.question || q.content || '',
                description: q.description || '',
                options: (q.options || []).map(opt => {
                  return typeof opt === 'string' ? opt : (opt.content || '')
                })
              }))
            }
            
            this.totalQuestions = this.test.questions.length
            this.answers = new Array(this.totalQuestions).fill(null)
            
            // 预加载所有问题以提高性能
            this.preloadQuestionData()
          } else {
            throw new Error(testResponse.message || '获取测试信息失败')
          }
        } else {
          throw new Error(response.message || '获取测试题目失败')
        }
      } catch (error) {
        console.error('加载测试题目失败:', error)
        uni.showToast({
          title: '加载测试题目失败，请重试',
          icon: 'none'
        })
        // 返回上一页
        uni.navigateBack()
      } finally {
        uni.hideLoading()
        this.loading = false
      }
    },
    
    // 预加载问题数据
    preloadQuestionData() {
      // 确保所有题目的内容被解析为最终形式，减少后续渲染时的计算
      this.test.questions.forEach(question => {
        // 强制解析问题文本，触发计算
        const title = question.question.toString()
        const options = question.options.map(opt => opt.toString())
      })
    },

    // 单题模式下选择选项，添加过渡效果
    selectOption(index) {
      // 检查是否已经选择了该选项，避免重复触发
      if (this.selectedOption === index) return
      
      this.selectedOption = index
      this.answers[this.currentQuestionIndex] = index
      
      // 振动反馈（如果设备支持）
      if (uni.vibrateShort) {
        uni.vibrateShort({ type: 'light' })
      }
      
      // 选择后自动前进到下一题（如果不是最后一题且启用自动前进）
      if (this.autoNext && !this.isLastQuestion) {
        setTimeout(() => {
          this.nextQuestion()
        }, 500) // 延长延迟，让用户能够清晰感知到选择
      }
    },

    // 全部题目模式下选择选项
    selectOptionInAllMode(questionIndex, optionIndex) {
      // 设置选择动画效果
      const previousAnswer = this.answers[questionIndex]
      
      this.answers[questionIndex] = optionIndex
      
      // 更新当前问题索引（用于高亮显示）
      this.currentQuestionIndex = questionIndex
      
      // 振动反馈
      if (uni.vibrateShort) {
        uni.vibrateShort({ type: 'light' })
      }
      
      // 找到下一个未回答的问题
      if (this.autoNext) {
        let nextUnansweredIndex = -1
        for (let i = questionIndex + 1; i < this.totalQuestions; i++) {
          if (this.answers[i] === null) {
            nextUnansweredIndex = i
            break
          }
        }
        
        // 如果找到了未回答的问题，滚动到该问题
        if (nextUnansweredIndex !== -1) {
          setTimeout(() => {
            const selector = `.question-item-${nextUnansweredIndex}`
            const query = uni.createSelectorQuery()
            
            query.select(selector).boundingClientRect(data => {
              if (data) {
                uni.pageScrollTo({
                  scrollTop: data.top,
                  duration: 300
                })
              }
            }).exec()
          }, 300)
        }
      }
    },

    prevQuestion() {
      if (this.currentQuestionIndex > 0 && !this.isTransitioning) {
        // 设置过渡状态
        this.startTransition()
        
        setTimeout(() => {
          this.currentQuestionIndex--
          this.selectedOption = this.answers[this.currentQuestionIndex]
          
          // 结束过渡状态
          setTimeout(() => {
            this.endTransition()
          }, 50)
        }, this.transitionDelay / 2)
      }
    },

    nextQuestion() {
      if (this.selectedOption === null || this.isTransitioning) return

      if (this.isLastQuestion) {
        this.completeTest()
      } else {
        // 设置过渡状态
        this.startTransition()
        
        setTimeout(() => {
          this.currentQuestionIndex++
          this.selectedOption = this.answers[this.currentQuestionIndex]
          
          // 结束过渡状态
          setTimeout(() => {
            this.endTransition()
          }, 50)
        }, this.transitionDelay / 2)
      }
    },
    
    // 开始过渡动画
    startTransition() {
      this.isTransitioning = true
    },
    
    // 结束过渡动画
    endTransition() {
      this.isTransitioning = false
    },

    async completeTest() {
      // 检查是否所有题目都已回答
      if (!this.allQuestionsAnswered) {
        uni.showToast({
          title: '请回答所有问题',
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({ title: '计算结果中...' })

        // 准备答案数据，将索引转为键值对格式
        const answersMap = {}
        this.answers.forEach((answer, index) => {
          answersMap[`q${index + 1}`] = answer.toString()
        })

        // 从缓存获取用户ID，如果没有则使用默认值
        const userId = uni.getStorageSync('userId') || 'test_user_001'

        const response = await request({
          url: `/api/tests/${this.testId}/submit`,
          method: 'POST',
          header: {
            'userId': userId  // 添加userId头信息
          },
          data: answersMap  // 提交转换后的答案
        })

        if (response.code === 200) {
          // 跳转到结果页面
          uni.redirectTo({
            url: `/pages/test-result/index?testId=${this.testId}&resultId=${response.data.id}`
          })
        } else {
          throw new Error(response.message || '提交答案失败')
        }
      } catch (error) {
        console.error('提交测试答案失败:', error)
        uni.showToast({
          title: '提交答案失败，请重试',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style>
/* 添加必要的样式 */
page {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* 启用硬件加速 */
.transform {
  will-change: transform;
}

.translate-z-0 {
  transform: translateZ(0);
}

/* 系统级滚动优化 */
::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
}

/* 问题切换动画 */
.question-container {
  transition: all 0.3s ease;
}

.question-exit {
  opacity: 0;
  transform: translateX(-5px);
}

.question-enter {
  opacity: 1;
  transform: translateX(0);
}

/* 选项圆圈颜色变化动画 - 移除缩放 */
.bg-blue-500 {
  transition: background-color 0.2s ease;
}

/* 全部模式中的效果 - 更柔和 */
.scale-in {
  transition: all 0.3s ease;
}

/* 题目编号样式 */
.question-number {
  font-size: 14px;
  opacity: 0.8;
}
</style>