<!-- pages/index/index.vue -->
<template>
    <view class="flex flex-col h-full bg-gray-50">
      <!-- 状态栏 -->
      <view class="bg-white px-4 py-2 flex justify-between items-center">
        <text class="text-sm font-medium">10:30</text>
        <view class="flex space-x-2">
          <text class="iconfont icon-signal"></text>
          <text class="iconfont icon-wifi"></text>
          <text class="iconfont icon-battery-three-quarters"></text>
        </view>
      </view>
      
      <!-- 内容区域 -->
      <scroll-view scroll-y class="flex-1 px-4 py-3">
        <!-- 头部搜索 -->
        <view class="flex items-center mb-5">
          <text class="text-xl font-bold text-gray-800 flex-1">心理工具箱</text>
          <view class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <text class="iconfont icon-search text-gray-500"></text>
          </view>
        </view>
        
        <!-- 分类标签 -->
        <category-tabs :categories="categories" :active="activeCategory" @change="changeCategory"></category-tabs>
        
        <!-- 推荐内容 -->
        <view class="mt-5">
          <view class="flex justify-between items-center mb-3">
            <text class="font-bold text-gray-800">为你推荐</text>
            <text class="text-sm text-blue-600">查看全部</text>
          </view>
          
          <!-- 推荐卡片 -->
          <view class="bg-white rounded-2xl overflow-hidden shadow mb-5">
            <view class="h-32 bg-gradient-to-r from-purple-500 to-indigo-500 relative">
              <view class="absolute bottom-4 left-4 text-white">
                <view class="bg-white/20 px-2 py-1 rounded-full text-xs inline-flex items-center mb-2">
                  <text class="iconfont icon-star mr-1"></text>
                  <text>最适合你</text>
                </view>
                <view class="text-lg font-bold mb-1">深度放松冥想</view>
                <view class="text-xs">10分钟 · 缓解焦虑</view>
              </view>
              <view class="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <text class="iconfont icon-play text-indigo-600"></text>
              </view>
            </view>
            <view class="p-4">
              <text class="text-sm text-gray-600 mb-3">根据你最近的睡眠问题和工作压力，我们特别推荐这个放松练习，帮助你缓解身心紧张</text>
              <view class="flex text-xs text-gray-500">
                <view class="flex items-center mr-4">
                  <text class="iconfont icon-headphones mr-1"></text>
                  <text>引导音频</text>
                </view>
                <view class="flex items-center">
                  <text class="iconfont icon-user-friends mr-1"></text>
                  <text>12,458人使用</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 心理测试区域 -->
          <view class="mt-6">
            <view class="flex justify-between items-center mb-3">
              <text class="font-bold text-gray-800">心理健康评估</text>
              <navigator url="/pages/psychological-test/index" class="text-sm text-blue-600">更多</navigator>
            </view>
            
            <view class="bg-white rounded-2xl overflow-hidden shadow mb-5">
              <view class="p-4 border-b border-gray-100">
                <text class="font-bold text-gray-800 mb-1 block">专业量表帮助你了解自己的心理状态</text>
                <text class="text-sm text-gray-600">科学评估，深入了解自我</text>
              </view>
              
              <navigator url="/pages/psychological-test/index" hover-class="none">
                <view class="p-4 flex items-center justify-between hover:bg-gray-50">
                  <view class="flex items-center">
                    <view class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <text class="iconfont icon-clipboard-check text-blue-600"></text>
                    </view>
                    <view>
                      <text class="font-medium text-gray-800">焦虑自评量表 (SAS)</text>
                      <text class="text-xs text-gray-500 block">评估焦虑程度的专业量表</text>
                    </view>
                  </view>
                  <text class="text-blue-600">5分钟</text>
                </view>
              </navigator>
              
              <navigator url="/pages/psychological-test/index" hover-class="none">
                <view class="p-4 flex items-center justify-between hover:bg-gray-50">
                  <view class="flex items-center">
                    <view class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <text class="iconfont icon-brain text-purple-600"></text>
                    </view>
                    <view>
                      <text class="font-medium text-gray-800">人格特质测评</text>
                      <text class="text-xs text-gray-500 block">了解你的性格特点</text>
                    </view>
                  </view>
                  <text class="text-blue-600">10分钟</text>
                </view>
              </navigator>
              
              <view class="p-4 bg-blue-50">
                <view class="flex items-center mb-2">
                  <text class="iconfont icon-check-circle text-green-500 mr-2"></text>
                  <text class="font-medium">最近完成的评估</text>
                </view>
                <view class="flex justify-between items-center">
                  <view>
                    <text class="text-gray-800">焦点自评量表</text>
                    <text class="text-xs text-gray-500 block">完成于 3天前</text>
                  </view>
                  <text class="text-blue-600 text-sm">查看</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 情绪调节工具 -->
          <view class="mt-6">
            <view class="flex justify-between items-center mb-3">
              <text class="font-bold text-gray-800">情绪调节工具</text>
              <text class="text-sm text-blue-600">更多</text>
            </view>
            
            <scroll-view scroll-x class="whitespace-nowrap -mx-4 px-4">
              <view class="inline-block w-36 mr-3 bg-white rounded-xl overflow-hidden shadow">
                <view class="h-24 bg-gradient-to-r from-teal-400 to-teal-500 flex items-center justify-center">
                  <text class="iconfont icon-wind text-white text-3xl"></text>
                </view>
                <view class="p-3">
                  <text class="font-medium text-gray-800 block">呼吸练习</text>
                  <text class="text-xs text-gray-500">5分钟 · 简单</text>
                </view>
              </view>
              
              <view class="inline-block w-36 mr-3 bg-white rounded-xl overflow-hidden shadow">
                <view class="h-24 bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center">
                  <text class="iconfont icon-brain text-white text-3xl"></text>
                </view>
                <view class="p-3">
                  <text class="font-medium text-gray-800 block">认知重塑</text>
                  <text class="text-xs text-gray-500">8分钟 · 中等</text>
                </view>
              </view>
              
              <view class="inline-block w-36 mr-3 bg-white rounded-xl overflow-hidden shadow">
                <view class="h-24 bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center">
                  <text class="iconfont icon-moon text-white text-3xl"></text>
                </view>
                <view class="p-3">
                  <text class="font-medium text-gray-800 block">睡前放松</text>
                  <text class="text-xs text-gray-500">15分钟 · 深度</text>
                </view>
              </view>
            </scroll-view>
          </view>
          
          <!-- 情绪日记 -->
          <view class="mt-6 mb-20">
            <view class="flex justify-between items-center mb-3">
              <text class="font-bold text-gray-800">情绪日记</text>
              <text class="text-sm text-blue-600">写新日记</text>
            </view>
            
            <view class="bg-white rounded-xl p-4 shadow mb-3">
              <view class="flex justify-between mb-2">
                <text class="font-medium text-gray-800">今天的感受</text>
                <text class="text-xs text-gray-500">今天 10:05</text>
              </view>
              <text class="text-sm text-gray-600 mb-3">今天早上感觉很焦虑，工作压力有点大。午饭后做了10分钟的冥想，感觉好多了。希望能保持这种平静的状态...</text>
              <view class="flex space-x-2">
                <text class="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">焦虑</text>
                <text class="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">平静</text>
              </view>
            </view>
            
            <view class="bg-white rounded-xl p-4 shadow">
              <view class="flex justify-between mb-2">
                <text class="font-medium text-gray-800">工作中的挑战</text>
                <text class="text-xs text-gray-500">昨天 19:22</text>
              </view>
              <text class="text-sm text-gray-600 mb-3">今天项目会议很有压力，感觉自己没有足够准备。但团队成员给了很多支持，最终还是顺利完成了演示...</text>
              <view class="flex space-x-2">
                <text class="px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs">压力</text>
                <text class="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs">挑战</text>
                <text class="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">成就感</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      
      <!-- 底部导航 -->
      <view class="flex justify-around items-center py-3 bg-white border-t border-gray-200">
        <view class="flex flex-col items-center text-gray-500">
          <text class="iconfont icon-home text-xl mb-1"></text>
          <text class="text-xs">首页</text>
        </view>
        <view class="flex flex-col items-center text-gray-500">
          <text class="iconfont icon-comment text-xl mb-1"></text>
          <text class="text-xs">对话</text>
        </view>
        <view class="flex flex-col items-center text-gray-500">
          <text class="iconfont icon-chart-line text-xl mb-1"></text>
          <text class="text-xs">分析</text>
        </view>
        <view class="flex flex-col items-center text-blue-600">
          <text class="iconfont icon-toolbox text-xl mb-1"></text>
          <text class="text-xs">工具</text>
        </view>
      </view>
    </view>
  </template>
  
  <script>
  import CategoryTabs from '@/components/category-tabs.vue'
  
  export default {
    components: {
      CategoryTabs
    },
    data() {
      return {
        categories: [
          { id: 'all', name: '所有' },
          { id: 'meditation', name: '冥想' },
          { id: 'relax', name: '放松' },
          { id: 'sleep', name: '睡眠' },
          { id: 'emotion', name: '情绪' },
          { id: 'cognitive', name: '认知练习' }
        ],
        activeCategory: 'all'
      }
    },
    methods: {
      changeCategory(category) {
        this.activeCategory = category
      }
    }
  }
  </script>
  
  <style>
  /* 引入字体图标 */
  @import 'https://at.alicdn.com/t/font_3159099_8l2qz5xbvyj.css';
  </style>