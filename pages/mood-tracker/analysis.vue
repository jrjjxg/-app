<template>
  <view class="flex flex-col h-full bg-gray-50">
    <!-- 头部 -->
    <view class="bg-white px-4 pt-12 pb-4 shadow-sm">
      <view class="flex items-center mb-4">
        <navigator url="/pages/mood-tracker/index" open-type="navigateBack" hover-class="none">
          <view class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
            <text class="iconfont icon-arrow-left text-gray-600"></text>
          </view>
        </navigator>
        <text class="text-xl font-bold text-gray-800">情绪分析</text>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view scroll-y class="flex-1 px-4 py-5">
      <!-- 日期筛选 -->
      <view class="bg-white rounded-xl p-4 shadow-sm mb-6">
        <view class="flex items-center justify-between mb-3">
          <text class="font-medium text-gray-800">时间范围</text>
          <picker 
            mode="selector" 
            :range="dateRanges" 
            :value="dateRangeIndex"
            @change="onDateRangeChange"
          >
            <view class="flex items-center">
              <text class="text-blue-600">{{ dateRanges[dateRangeIndex] }}</text>
              <text class="iconfont icon-chevron-down text-blue-600 ml-1"></text>
            </view>
          </picker>
        </view>
        
        <view v-if="dateRangeIndex === 4" class="flex items-center justify-between">
          <picker 
            mode="date" 
            :value="customStartDate"
            @change="onStartDateChange"
          >
            <view class="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-600">
              {{ customStartDate }}
            </view>
          </picker>
          <text class="text-gray-400">至</text>
          <picker 
            mode="date" 
            :value="customEndDate"
            @change="onEndDateChange"
          >
            <view class="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-600">
              {{ customEndDate }}
            </view>
          </picker>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view v-if="loading" class="flex justify-center py-10">
        <text class="text-gray-500">加载中...</text>
      </view>
      
      <view v-else-if="!hasData" class="bg-white rounded-xl p-6 shadow-sm flex justify-center">
        <text class="text-gray-500">暂无情绪数据</text>
      </view>
      
      <view v-else>
        <!-- 情绪概览 -->
        <view class="bg-white rounded-xl p-5 shadow-sm mb-6">
          <text class="font-bold text-gray-800 mb-4 block">情绪概览</text>
          
          <view class="flex justify-between items-center mb-6">
            <view class="flex flex-col items-center">
              <text class="text-sm text-gray-500 mb-1">记录次数</text>
              <text class="text-2xl font-bold text-blue-600">{{ totalRecords }}</text>
            </view>
            
            <view class="h-10 border-r border-gray-200"></view>
            
            <view class="flex flex-col items-center">
              <text class="text-sm text-gray-500 mb-1">平均强度</text>
              <text class="text-2xl font-bold text-purple-600">{{ averageIntensity.toFixed(1) }}</text>
            </view>
            
            <view class="h-10 border-r border-gray-200"></view>
            
            <view class="flex flex-col items-center">
              <text class="text-sm text-gray-500 mb-1">主要情绪</text>
              <text class="text-2xl font-bold" :class="getDominantEmotionColor()">{{ dominantEmotion }}</text>
            </view>
          </view>
          
          <!-- 情绪分布 -->
          <view class="mb-4">
            <text class="font-medium text-gray-800 mb-2 block">情绪分布</text>
            
            <view v-for="(count, emotion) in emotionStats" :key="emotion" class="mb-2">
              <view class="flex justify-between items-center mb-1">
                <view class="flex items-center">
                  <text class="w-6 h-6 rounded-full flex items-center justify-center mr-2" :class="getEmotionBgClass(emotion)">
                    {{ getEmotionEmoji(emotion) }}
                  </text>
                  <text class="text-sm text-gray-700">{{ emotion }}</text>
                </view>
                <text class="text-sm text-gray-500">{{ count }}次</text>
              </view>
              
              <view class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <view 
                  class="h-full rounded-full"
                  :class="getEmotionBarClass(emotion)"
                  :style="{ width: `${(count / totalRecords) * 100}%` }"
                ></view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 情绪标签分析 -->
        <view class="bg-white rounded-xl p-5 shadow-sm mb-6">
          <text class="font-bold text-gray-800 mb-4 block">常见情绪标签</text>
          
          <view v-if="Object.keys(tagStats).length === 0" class="flex justify-center py-4">
            <text class="text-gray-500">暂无标签数据</text>
          </view>
          
          <view v-else class="flex flex-wrap gap-2">
            <view 
              v-for="(count, tag) in tagStats" 
              :key="tag"
              class="px-3 py-1 rounded-full text-sm"
              :class="getTagClass(tag, count)"
            >
              {{ tag }} ({{ count }})
            </view>
          </view>
        </view>
        
        <!-- 情绪趋势 -->
        <view class="bg-white rounded-xl p-5 shadow-sm mb-6">
          <text class="font-bold text-gray-800 mb-4 block">情绪趋势</text>
          
          <view class="flex justify-center py-6">
            <text class="text-gray-500">图表功能开发中...</text>
          </view>
        </view>
        
        <!-- 情绪洞察 -->
        <view class="bg-white rounded-xl p-5 shadow-sm mb-6">
          <text class="font-bold text-gray-800 mb-4 block">情绪洞察</text>
          
          <view class="bg-blue-50 p-4 rounded-lg">
            <view class="flex items-start">
              <text class="iconfont icon-lightbulb text-blue-500 mr-3 text-lg"></text>
              <view>
                <text class="font-medium text-blue-700 block mb-1">情绪分析</text>
                <text class="text-blue-600 text-sm">{{ getEmotionInsight() }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getMoodAnalytics } from '@/api/mood';

export default {
  data() {
    return {
      loading: true,
      hasData: false,
      dateRanges: ['最近7天', '最近30天', '最近90天', '本月', '自定义'],
      dateRangeIndex: 0,
      customStartDate: this.formatDateForPicker(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
      customEndDate: this.formatDateForPicker(new Date()),
      averageIntensity: 0,
      emotionStats: {},
      tagStats: {}
    }
  },
  computed: {
    totalRecords() {
      return Object.values(this.emotionStats).reduce((sum, count) => sum + count, 0);
    },
    dominantEmotion() {
      if (Object.keys(this.emotionStats).length === 0) return '无';
      
      let maxCount = 0;
      let dominant = '';
      
      for (const [emotion, count] of Object.entries(this.emotionStats)) {
        if (count > maxCount) {
          maxCount = count;
          dominant = emotion;
        }
      }
      
      return dominant;
    }
  },
  onLoad() {
    this.loadAnalyticsData();
  },
  methods: {
    async loadAnalyticsData() {
      try {
        this.loading = true;
        
        let startDate, endDate;
        
        const today = new Date();
        
        switch (this.dateRangeIndex) {
          case 0: // 最近7天
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            endDate = today;
            break;
          case 1: // 最近30天
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 30);
            endDate = today;
            break;
          case 2: // 最近90天
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 90);
            endDate = today;
            break;
          case 3: // 本月
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = today;
            break;
          case 4: // 自定义
            startDate = new Date(this.customStartDate);
            endDate = new Date(this.customEndDate);
            break;
        }
        
        const response = await getMoodAnalytics(
          this.formatDateForApi(startDate),
          this.formatDateForApi(endDate)
        );
        
        if (response.code === 200) {
          const { averageIntensity, emotionStats } = response.data;
          
          this.averageIntensity = averageIntensity || 0;
          this.emotionStats = emotionStats || {};
          
          // 模拟标签统计数据（实际应从后端获取）
          this.tagStats = {
            '工作/学习': 12,
            '人际关系': 8,
            '健康状况': 5,
            '休息质量': 7,
            '天气变化': 3,
            '个人成就': 4
          };
          
          this.hasData = Object.keys(this.emotionStats).length > 0;
        } else {
          throw new Error(response.message || '获取数据失败');
        }
      } catch (error) {
        console.error('加载情绪分析数据失败:', error);
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    onDateRangeChange(e) {
      this.dateRangeIndex = e.detail.value;
      this.loadAnalyticsData();
    },
    onStartDateChange(e) {
      this.customStartDate = e.detail.value;
      if (this.dateRangeIndex === 4) {
        this.loadAnalyticsData();
      }
    },
    onEndDateChange(e) {
      this.customEndDate = e.detail.value;
      if (this.dateRangeIndex === 4) {
        this.loadAnalyticsData();
      }
    },
    getEmotionEmoji(type) {
      const emojis = {
        '快乐/愉悦': '😊',
        '平静/满足': '😌',
        '焦虑/紧张': '😰',
        '悲伤/低落': '😢',
        '愤怒/烦躁': '😠',
        '疲惫/无力': '😴',
        '中性/平淡': '😐'
      };
      return emojis[type] || '😐';
    },
    getEmotionBgClass(type) {
      const classes = {
        '快乐/愉悦': 'bg-yellow-100',
        '平静/满足': 'bg-green-100',
        '焦虑/紧张': 'bg-purple-100',
        '悲伤/低落': 'bg-blue-100',
        '愤怒/烦躁': 'bg-red-100',
        '疲惫/无力': 'bg-gray-100',
        '中性/平淡': 'bg-gray-100'
      };
      return classes[type] || 'bg-gray-100';
    },
    getEmotionBarClass(type) {
      const classes = {
        '快乐/愉悦': 'bg-yellow-500',
        '平静/满足': 'bg-green-500',
        '焦虑/紧张': 'bg-purple-500',
        '悲伤/低落': 'bg-blue-500',
        '愤怒/烦躁': 'bg-red-500',
        '疲惫/无力': 'bg-gray-500',
        '中性/平淡': 'bg-gray-500'
      };
      return classes[type] || 'bg-blue-500';
    },
    getDominantEmotionColor() {
      const classes = {
        '快乐/愉悦': 'text-yellow-600',
        '平静/满足': 'text-green-600',
        '焦虑/紧张': 'text-purple-600',
        '悲伤/低落': 'text-blue-600',
        '愤怒/烦躁': 'text-red-600',
        '疲惫/无力': 'text-gray-600',
        '中性/平淡': 'text-gray-600'
      };
      return classes[this.dominantEmotion] || 'text-gray-600';
    },
    getTagClass(tag, count) {
      const maxCount = Math.max(...Object.values(this.tagStats));
      const intensity = Math.ceil((count / maxCount) * 3); // 1-3 intensity levels
      
      // 根据标签内容选择颜色
      let colorClass;
      if (tag.includes('工作') || tag.includes('学习')) {
        colorClass = ['bg-blue-100 text-blue-700', 'bg-blue-200 text-blue-700', 'bg-blue-300 text-blue-800'][intensity - 1];
      } else if (tag.includes('人际') || tag.includes('关系')) {
        colorClass = ['bg-purple-100 text-purple-700', 'bg-purple-200 text-purple-700', 'bg-purple-300 text-purple-800'][intensity - 1];
      } else if (tag.includes('健康')) {
        colorClass = ['bg-green-100 text-green-700', 'bg-green-200 text-green-700', 'bg-green-300 text-green-800'][intensity - 1];
      } else if (tag.includes('休息') || tag.includes('睡眠')) {
        colorClass = ['bg-indigo-100 text-indigo-700', 'bg-indigo-200 text-indigo-700', 'bg-indigo-300 text-indigo-800'][intensity - 1];
      } else if (tag.includes('天气')) {
        colorClass = ['bg-yellow-100 text-yellow-700', 'bg-yellow-200 text-yellow-700', 'bg-yellow-300 text-yellow-800'][intensity - 1];
      } else if (tag.includes('成就')) {
        colorClass = ['bg-orange-100 text-orange-700', 'bg-orange-200 text-orange-700', 'bg-orange-300 text-orange-800'][intensity - 1];
      } else {
        colorClass = ['bg-gray-100 text-gray-700', 'bg-gray-200 text-gray-700', 'bg-gray-300 text-gray-800'][intensity - 1];
      }
      
      return colorClass;
    },
    getEmotionInsight() {
      if (!this.hasData) return '暂无足够数据生成洞察';
      
      const insights = [
        `在过去的时间里，你的主要情绪是"${this.dominantEmotion}"，平均情绪强度为${this.averageIntensity.toFixed(1)}。`,
        '情绪记录有助于提高自我觉察，继续保持记录习惯。',
        '尝试关注情绪背后的触发因素，这有助于更好地理解自己。'
      ];
      
      // 根据主要情绪添加特定建议
      if (this.dominantEmotion === '快乐/愉悦') {
        insights.push('你的积极情绪占比较高，这对心理健康非常有益。');
      } else if (this.dominantEmotion === '焦虑/紧张') {
        insights.push('尝试每天进行5-10分钟的深呼吸或冥想练习，有助于缓解焦虑。');
      } else if (this.dominantEmotion === '悲伤/低落') {
        insights.push('适当的社交活动和户外运动可能有助于改善情绪状态。');
      } else if (this.dominantEmotion === '愤怒/烦躁') {
        insights.push('当感到愤怒时，尝试暂时离开引发情绪的环境，给自己冷静的空间。');
      }
      
      return insights.join(' ');
    },
    formatDateForPicker(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    formatDateForApi(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
  }
}
</script>