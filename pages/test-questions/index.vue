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
        
        <!-- 进度条 -->
        <progress-bar :current="currentQuestionIndex + 1" :total="totalQuestions"></progress-bar>
      </view>
      
      <!-- 加载状态 -->
      <view v-if="loading" class="flex-1 flex items-center justify-center">
        <text class="text-gray-600">加载中...</text>
      </view>
      
      <!-- 问题区域 -->
      <view v-else class="flex-1 px-4 py-6">
        <view class="bg-white rounded-xl p-5 shadow-sm mb-6">
          <text class="text-lg font-medium text-gray-800 mb-2 block">{{ currentQuestion.question }}</text>
          <text v-if="currentQuestion.description" class="text-sm text-gray-500 mb-4 block">{{ currentQuestion.description }}</text>
        </view>
        
        <!-- 选项 -->
        <view class="space-y-3">
          <view 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            class="bg-white rounded-xl p-4 shadow-sm"
            :class="{'border-2 border-blue-500 bg-blue-50': selectedOption === index}"
            @click="selectOption(index)"
          >
            <view class="flex items-center">
              <view 
                class="w-6 h-6 rounded-full mr-3 flex items-center justify-center"
                :class="selectedOption === index ? 'bg-blue-500' : 'border border-gray-300'"
              >
                <text v-if="selectedOption === index" class="iconfont icon-check text-white text-xs"></text>
              </view>
              <text class="text-gray-800">{{ option }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 底部按钮 -->
      <view class="p-4 bg-white border-t border-gray-200">
        <view class="flex justify-between">
          <button 
            class="px-6 py-3 rounded-full border border-gray-300 text-gray-600 font-medium"
            :disabled="currentQuestionIndex === 0"
            :class="{'opacity-50': currentQuestionIndex === 0}"
            @click="prevQuestion"
          >
            上一题
          </button>
          
          <button 
            class="px-6 py-3 rounded-full bg-blue-600 text-white font-medium"
            :disabled="selectedOption === null"
            :class="{'opacity-50': selectedOption === null}"
            @click="nextQuestion"
          >
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
        totalQuestions: 0
      }
    },
    computed: {
      currentQuestion() {
        return this.test.questions?.[this.currentQuestionIndex] || {}
      },
      isLastQuestion() {
        return this.currentQuestionIndex === this.totalQuestions - 1
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
                  question: q.question,
                  description: q.description,
                  options: q.options.map(opt => opt.content)
                }))
              }
              this.totalQuestions = this.test.questions.length
              this.answers = new Array(this.totalQuestions).fill(null)
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

      selectOption(index) {
        this.selectedOption = index
        this.answers[this.currentQuestionIndex] = index
      },

      prevQuestion() {
        if (this.currentQuestionIndex > 0) {
          this.currentQuestionIndex--
          this.selectedOption = this.answers[this.currentQuestionIndex]
        }
      },

      nextQuestion() {
        if (this.selectedOption === null) return
        
        if (this.isLastQuestion) {
          this.completeTest()
        } else {
          this.currentQuestionIndex++
          this.selectedOption = this.answers[this.currentQuestionIndex]
        }
      },

      async completeTest() {
        try {
          uni.showLoading({ title: '计算结果中...' })
          
          // 准备答案数据，将索引转为键值对格式
          const answersMap = {}
          this.answers.forEach((answer, index) => {
            answersMap[`q${index+1}`] = answer.toString()
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
            //debug：将 completeTest 方法中跳转到结果页面的 URL 参数 response.data.resultId 改为 response.data.id，解决页面不显示
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