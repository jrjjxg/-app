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
        <!-- 结果概览 -->
        <view class="bg-white rounded-xl overflow-hidden shadow mb-5">
          <view class="p-5 border-b border-gray-100">
            <view class="flex justify-between items-center mb-3">
              <text class="font-bold text-gray-800">您的结果</text>
              <text class="text-sm text-gray-500">{{ formatDate(new Date()) }}</text>
            </view>
            
            <view class="flex items-center justify-center py-5">
              <view class="w-32 h-32 rounded-full flex items-center justify-center" :class="resultBgClass">
                <view class="text-center">
                  <text class="text-3xl font-bold" :class="resultTextClass">{{ result.score }}</text>
                  <text class="block text-sm mt-1" :class="resultTextClass">{{ result.level }}</text>
                </view>
              </view>
            </view>
            
            <view class="bg-gray-50 p-4 rounded-lg">
              <text class="text-gray-800">{{ result.description }}</text>
            </view>
          </view>
          
          <view class="p-5">
            <text class="font-bold text-gray-800 mb-3 block">专业解读</text>
<!-- pages/test-result/index.vue (续) -->
<text class="text-gray-600 mb-4 block">{{ getInterpretation() }}</text>
          
          <view class="bg-blue-50 p-4 rounded-lg mb-4">
            <view class="flex items-start">
              <text class="iconfont icon-lightbulb text-blue-500 mr-3 text-lg"></text>
              <view>
                <text class="font-medium text-blue-700 block mb-1">建议</text>
                <text class="text-blue-600 text-sm">{{ getSuggestion() }}</text>
              </view>
            </view>
          </view>
          
          <view v-if="showWarning" class="bg-red-50 p-4 rounded-lg">
            <view class="flex items-start">
              <text class="iconfont icon-warning text-red-500 mr-3 text-lg"></text>
              <view>
                <text class="font-medium text-red-700 block mb-1">注意</text>
                <text class="text-red-600 text-sm">您的得分表明您可能正在经历较为严重的心理困扰。建议您尽快咨询专业心理医生或心理咨询师获取帮助。</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 详细分析 -->
      <view class="bg-white rounded-xl overflow-hidden shadow mb-5">
        <view class="p-5">
          <text class="font-bold text-gray-800 mb-4 block">详细分析</text>
          
          <view v-if="test.id === 'sas' || test.id === 'sds' || test.id === 'phq9' || test.id === 'gad7'">
            <view class="mb-4">
              <text class="text-gray-700 mb-2 block">症状严重程度</text>
              <view class="h-3 bg-gray-200 rounded-full overflow-hidden">
                <view 
                  class="h-full rounded-full"
                  :class="severityBarClass"
                  :style="{ width: `${getSeverityPercentage()}%` }"
                ></view>
              </view>
              <view class="flex justify-between mt-1">
                <text class="text-xs text-gray-500">轻微</text>
                <text class="text-xs text-gray-500">中等</text>
                <text class="text-xs text-gray-500">严重</text>
              </view>
            </view>
            
            <view class="mb-4">
              <text class="text-gray-700 mb-2 block">主要表现</text>
              <view class="space-y-2">
                <view v-for="(symptom, index) in getMainSymptoms()" :key="index" class="flex items-center">
                  <view class="w-2 h-2 rounded-full bg-indigo-500 mr-2"></view>
                  <text class="text-gray-600">{{ symptom }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <view v-if="test.id === 'big5'">
            <view class="space-y-4">
              <view v-for="(trait, index) in getBig5Traits()" :key="index">
                <view class="flex justify-between mb-1">
                  <text class="text-gray-700">{{ trait.name }}</text>
                  <text class="text-gray-600">{{ trait.score }}%</text>
                </view>
                <view class="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <view 
                    class="h-full rounded-full"
                    :style="{ width: `${trait.score}%`, backgroundColor: trait.color }"
                  ></view>
                </view>
                <text class="text-sm text-gray-600 mt-1 block">{{ trait.description }}</text>
              </view>
            </view>
          </view>
          
          <view v-if="test.id === 'mbti'">
            <view class="bg-gray-50 p-4 rounded-lg mb-4">
              <text class="text-xl font-bold text-center block text-indigo-700 mb-2">{{ getMbtiType() }}</text>
              <text class="text-gray-600 text-center block">{{ getMbtiDescription() }}</text>
            </view>
            
            <view class="space-y-4 mt-4">
              <view v-for="(dimension, index) in getMbtiDimensions()" :key="index">
                <view class="flex justify-between mb-1">
                  <text class="text-gray-700">{{ dimension.left }}</text>
                  <text class="text-gray-700">{{ dimension.right }}</text>
                </view>
                <view class="h-3 bg-gray-200 rounded-full overflow-hidden relative">
                  <view class="absolute inset-0 flex items-center justify-center">
                    <view class="w-px h-full bg-gray-400"></view>
                  </view>
                  <view 
                    class="h-full bg-indigo-500 absolute"
                    :style="dimension.value < 50 ? 
                      { right: '50%', left: `${50 - dimension.value}%` } : 
                      { left: '50%', right: `${50 - (100 - dimension.value)}%` }"
                  ></view>
                </view>
                <view class="flex justify-between mt-1">
                  <text class="text-xs text-gray-500">{{ dimension.value }}%</text>
                  <text class="text-xs text-gray-500">{{ 100 - dimension.value }}%</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 行动建议 -->
      <view class="bg-white rounded-xl overflow-hidden shadow mb-5">
        <view class="p-5">
          <text class="font-bold text-gray-800 mb-4 block">行动建议</text>
          
          <view class="space-y-4">
            <view v-for="(action, index) in getActionSuggestions()" :key="index" class="flex">
              <view class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                <text class="iconfont" :class="action.icon" style="color: #6366f1"></text>
              </view>
              <view>
                <text class="font-medium text-gray-800 block mb-1">{{ action.title }}</text>
                <text class="text-gray-600 text-sm">{{ action.description }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 按钮区域 -->
      <view class="flex space-x-3 mb-5">
        <button class="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium">
          保存结果
        </button>
        <button class="flex-1 bg-white border border-indigo-600 text-indigo-600 py-3 rounded-lg font-medium">
          分享
        </button>
      </view>
      
      <!-- 相关测试推荐 -->
      <view class="mb-5">
        <text class="font-bold text-gray-800 mb-4 block">相关测试推荐</text>
        
        <view class="space-y-3">
          <view v-for="test in getRelatedTests()" :key="test.id" 
                class="bg-white rounded-lg p-4 flex items-center shadow-sm"
                @click="goToTest(test.id)">
            <view class="w-10 h-10 rounded-full flex items-center justify-center mr-3" :class="getCategoryBgClass(test.category)">
              <text class="iconfont" :class="test.icon" :style="{ color: getCategoryTextColor(test.category) }"></text>
            </view>
            <view class="flex-1">
              <text class="font-medium text-gray-800 block">{{ test.title }}</text>
              <text class="text-xs text-gray-500">{{ test.time }}分钟 · {{ test.completed }}人已完成</text>
            </view>
            <text class="iconfont icon-arrow-right text-gray-400"></text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getTestById, getAllTests } from '@/utils/test-data.js'

export default {
  data() {
    return {
      testId: '',
      test: {},
      result: {
        score: 0,
        level: '',
        description: ''
      }
    }
  },
  computed: {
    showWarning() {
      if (this.test.id === 'sas' || this.test.id === 'sds') {
        return this.result.score >= 60
      } else if (this.test.id === 'phq9') {
        return this.result.score >= 15
      } else if (this.test.id === 'gad7') {
        return this.result.score >= 15
      }
      return false
    },
    resultBgClass() {
      if (this.test.id === 'sas' || this.test.id === 'sds' || this.test.id === 'phq9' || this.test.id === 'gad7') {
        if (this.result.score < 50) return 'bg-green-100'
        if (this.result.score < 60) return 'bg-yellow-100'
        if (this.result.score < 70) return 'bg-orange-100'
        return 'bg-red-100'
      }
      return 'bg-indigo-100'
    },
    resultTextClass() {
      if (this.test.id === 'sas' || this.test.id === 'sds' || this.test.id === 'phq9' || this.test.id === 'gad7') {
        if (this.result.score < 50) return 'text-green-600'
        if (this.result.score < 60) return 'text-yellow-600'
        if (this.result.score < 70) return 'text-orange-600'
        return 'text-red-600'
      }
      return 'text-indigo-600'
    },
    severityBarClass() {
      if (this.result.score < 50) return 'bg-green-500'
      if (this.result.score < 60) return 'bg-yellow-500'
      if (this.result.score < 70) return 'bg-orange-500'
      return 'bg-red-500'
    }
  },
  onLoad(options) {
    this.testId = options.id
    this.test = getTestById(this.testId)
    
    // 解析结果数据
    if (options.result) {
      try {
        this.result = JSON.parse(options.result)
      } catch (e) {
        console.error('解析结果数据失败', e)
      }
    }
  },
  methods: {
    formatDate(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },
    getInterpretation() {
      if (this.test.id === 'sas') {
        return '焦虑自评量表(SAS)是评估焦虑症状严重程度的专业工具。标准分低于50分为正常范围；50-59分为轻度焦虑；60-69分为中度焦虑；70分以上为重度焦虑。'
      } else if (this.test.id === 'sds') {
        return '抑郁自评量表(SDS)是评估抑郁症状严重程度的专业工具。标准分低于50分为正常范围；50-59分为轻度抑郁；60-69分为中度抑郁；70分以上为重度抑郁。'
      } else if (this.test.id === 'phq9') {
        return '患者健康问卷(PHQ-9)是一种简短的抑郁症筛查工具。总分0-4为无抑郁症状；5-9为轻度抑郁；10-14为中度抑郁；15-19为中重度抑郁；20-27为重度抑郁。'
      }
      return this.test.interpretation || '感谢您完成测试，以上是您的测试结果。'
    },
    getSuggestion() {
      if (this.test.id === 'sas') {
        if (this.result.score < 50) {
          return '您的焦虑水平在正常范围内，建议保持健康的生活方式和积极的心态。'
        } else if (this.result.score < 60) {
          return '您有轻度焦虑症状，建议学习放松技巧，如深呼吸、冥想等，保持规律作息，适当运动。'
        } else if (this.result.score < 70) {
          return '您有中度焦虑症状，建议寻求专业心理咨询，学习认知行为疗法技巧，避免咖啡因等刺激物。'
        } else {
          return '您有重度焦虑症状，建议尽快咨询专业心理医生或精神科医生，可能需要药物治疗和心理治疗的综合干预。'
        }
      } else if (this.test.id === 'phq9') {
        if (this.result.score < 5) {
          return '您没有明显的抑郁症状，建议保持健康的生活方式和积极的心态。'
        } else if (this.result.score < 10) {
          return '您有轻度抑郁症状，建议增加社交活动，保持规律作息，适当运动，学习正念冥想等放松技巧。'
        } else if (this.result.score < 15) {
          return '您有中度抑郁症状，建议寻求专业心理咨询，学习认知行为疗法技巧，建立支持系统。'
        } else {
          return '您有中重度或重度抑郁症状，建议尽快咨询专业心理医生或精神科医生，可能需要药物治疗和心理治疗的综合干预。'
        }
      }
      return '建议您根据测试结果，关注自己的心理健康，必要时寻求专业帮助。'
    },
    getSeverityPercentage() {
      if (this.test.id === 'sas' || this.test.id === 'sds') {
        // 将50-80的分数映射到0-100%
        return Math.min(100, Math.max(0, (this.result.score - 50) * (100 / 30)))
      } else if (this.test.id === 'phq9') {
        // 将0-27的分数映射到0-100%
        return Math.min(100, Math.max(0, (this.result.score / 27) * 100))
      } else if (this.test.id === 'gad7') {
        // 将0-21的分数映射到0-100%
        return Math.min(100, Math.max(0, (this.result.score / 21) * 100))
      }
      return 50
    },
    getMainSymptoms() {
      if (this.test.id === 'sas') {
        return [
          '感到紧张和焦虑',
          '容易心烦意乱',
          '心跳加快',
          '难以放松',
          '睡眠问题'
        ]
      } else if (this.test.id === 'sds') {
        return [
          '情绪低落',
          '兴趣减退',
          '疲劳感',
          '睡眠问题',
          '食欲改变'
        ]
      } else if (this.test.id === 'phq9') {
        return [
          '情绪低落',
          '兴趣减退',
          '睡眠问题',
          '疲劳感',
          '注意力不集中'
        ]
      } else if (this.test.id === 'gad7') {
        return [
          '过度担忧',
          '难以放松',
          '坐立不安',
          '易怒',
          '害怕可能发生可怕的事情'
        ]
      }
      return []
    },
    getBig5Traits() {
      // 模拟大五人格测试结果
      return [
        {
          name: '开放性',
          score: 75,
          color: '#6366f1',
          description: '您对新经验持开放态度，富有想象力和创造力，喜欢探索新事物。'
        },
        {
          name: '尽责性',
          score: 65,
          color: '#8b5cf6',
          description: '您做事有计划和条理，能够坚持完成任务，但有时也会适当放松。'
        },
        {
          name: '外向性',
          score: 45,
          color: '#ec4899',
          description: '您在社交方面较为平衡，既能享受社交活动，也能独处。'
        },
        {
          name: '宜人性',
          score: 80,
          color: '#14b8a6',
          description: '您乐于助人，富有同情心，重视与他人的和谐关系。'
        },
        {
          name: '神经质',
          score: 30,
          color: '#f59e0b',
          description: '您情绪相对稳定，能够较好地应对压力和负面情绪。'
        }
      ]
    },
    getMbtiType() {
      return 'INFJ - 提倡者'
    },
    getMbtiDescription() {
      return 'INFJ型人格是16种人格类型中最稀少的类型，具有内向、直觉、情感和判断的特质。他们富有洞察力，理想主义，追求意义和真实性。'
    },
    getMbtiDimensions() {
      return [
        {
          left: '内向 (I)',
          right: '外向 (E)',
          value: 70 // 70% 内向，30% 外向
        },
        {
          left: '直觉 (N)',
          right: '感觉 (S)',
          value: 85 // 85% 直觉，15% 感觉
        },
        {
          left: '情感 (F)',
          right: '思考 (T)',
          value: 60 // 60% 情感，40% 思考
        },
        {
          left: '判断 (J)',
          right: '知觉 (P)',
          value: 65 // 65% 判断，35% 知觉
        }
      ]
    },
    getActionSuggestions() {
      if (this.test.id === 'sas' || this.test.id === 'gad7') {
        return [
          {
            icon: 'icon-breath',
            title: '练习深呼吸',
            description: '每天花5-10分钟进行深呼吸练习，可以有效缓解焦虑症状。吸气4秒，屏息2秒，呼气6秒。'
          },
          {
            icon: 'icon-running',
            title: '规律运动',
            description: '每周至少进行150分钟中等强度的有氧运动，如快走、游泳或骑自行车，有助于减轻焦虑。'
          },
          {
            icon: 'icon-moon',
            title: '改善睡眠',
            description: '保持规律的睡眠时间，睡前避免使用电子设备，创造安静、舒适的睡眠环境。'
          },
          {
            icon: 'icon-coffee',
            title: '减少刺激物',
            description: '减少或避免咖啡因、酒精和尼古丁等刺激物的摄入，这些物质可能加重焦虑症状。'
          }
        ]
      } else if (this.test.id === 'sds' || this.test.id === 'phq9') {
        return [
          {
            icon: 'icon-calendar',
            title: '建立日常结构',
            description: '制定并遵循日常计划，包括固定的起床和睡觉时间，有助于稳定情绪。'
          },
          {
            icon: 'icon-users',
            title: '增加社交互动',
            description: '与朋友和家人保持联系，参加社交活动，避免社交孤立。'
          },
          {
            icon: 'icon-target',
            title: '设定小目标',
            description: '设定可实现的小目标，完成后给予自己奖励，逐步建立成就感。'
          },
          {
            icon: 'icon-book',
            title: '学习认知技巧',
            description: '学习识别和挑战消极思维模式，培养更积极、平衡的思维方式。'
          }
        ]
      } else if (this.test.id === 'big5' || this.test.id === 'mbti') {
        return [
          {
            icon: 'icon-lightbulb',
            title: '发挥优势',
            description: '根据您的人格特点，找到适合您的工作和生活方式，发挥您的优势。'
          },
          {
            icon: 'icon-chart-line',
            title: '个人成长',
            description: '了解自己的人格特点后，有意识地发展不太突出的方面，使人格更加平衡。'
          },
          {
            icon: 'icon-users',
            title: '改善人际关系',
            description: '利用对自己和他人人格类型的了解，提高沟通效率，减少冲突。'
          },
          {
            icon: 'icon-compass',
            title: '职业规划',
            description: '根据您的人格特点，探索适合您的职业方向，找到能发挥您优势的工作。'
          }
        ]
      }
      return []
    },
    getRelatedTests() {
      const allTests = getAllTests()
      const relatedTests = []
      
      if (this.test.id === 'sas') {
        // 如果当前是焦虑测试，推荐抑郁和压力测试
        relatedTests.push(allTests.find(t => t.id === 'sds'))
        relatedTests.push(allTests.find(t => t.id === 'pss'))
        relatedTests.push(allTests.find(t => t.id === 'gad7'))
      } else if (this.test.id === 'sds') {
        // 如果当前是抑郁测试，推荐焦虑和人格测试
        relatedTests.push(allTests.find(t => t.id === 'sas'))
        relatedTests.push(allTests.find(t => t.id === 'phq9'))
        relatedTests.push(allTests.find(t => t.id === 'big5'))
      } else {
        // 默认推荐一些常用测试
        relatedTests.push(allTests.find(t => t.id === 'sas'))
        relatedTests.push(allTests.find(t => t.id === 'sds'))
        relatedTests.push(allTests.find(t => t.id === 'big5'))
      }
      
      return relatedTests.filter(Boolean).slice(0, 3)
    },
    getCategoryBgClass(category) {
      const categories = {
        'common': 'bg-blue-100',
        'emotion': 'bg-purple-100',
        'personality': 'bg-yellow-100'
      }
      return categories[category] || 'bg-gray-100'
    },
    getCategoryTextColor(category) {
      const colors = {
        'common': '#3b82f6',
        'emotion': '#8b5cf6',
        'personality': '#f59e0b'
      }
      return colors[category] || '#6b7280'
    },
    goToTest(id) {
      uni.navigateTo({
        url: `/pages/test-detail/index?id=${id}`
      })
    }
  }
}
</script>