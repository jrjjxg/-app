<template>
    <view class="flex flex-col h-full bg-gradient-to-b from-rose-50 to-blue-50">
      <!-- 头部 -->
      <view class="bg-white/80 backdrop-blur-sm px-4 py-3 flex justify-between items-center">
        <text class="text-lg font-medium text-gray-700">心灵笔记</text>
        <view class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
          <uni-icons type="plusempty" size="20" color="#FFFFFF"></uni-icons>
        </view>
      </view>
      
      <!-- 内容区域 -->
      <scroll-view scroll-y class="flex-1 px-5 pt-4 pb-2">
        <!-- 日记列表 -->
        <view class="bg-white rounded-xl p-4 shadow-sm mb-3 transition-all duration-300 hover:shadow-md">
          <view class="flex justify-between mb-3">
            <text class="font-medium text-gray-800">内心的平静</text>
            <text class="text-xs text-gray-500">今天 10:05</text>
          </view>
          <text class="text-sm text-gray-600 mb-3 line-clamp-2">今天早上感觉很焦虑，工作压力有点大。午饭后做了10分钟的冥想，感觉好多了。希望能保持这种平静的状态...</text>
          <view class="flex space-x-2">
            <text class="px-2 py-1 bg-blue-50 text-blue-500 rounded-full text-xs">焦虑</text>
            <text class="px-2 py-1 bg-green-50 text-green-500 rounded-full text-xs">平静</text>
          </view>
        </view>
        
        <view class="bg-white rounded-xl p-4 shadow-sm mb-3 transition-all duration-300 hover:shadow-md">
          <view class="flex justify-between mb-3">
            <text class="font-medium text-gray-800">挑战与成长</text>
            <text class="text-xs text-gray-500">昨天 19:22</text>
          </view>
          <text class="text-sm text-gray-600 mb-3 line-clamp-2">今天项目会议很有压力，感觉自己没有足够准备。但团队成员给了很多支持，最终还是顺利完成了演示...</text>
          <view class="flex space-x-2">
            <text class="px-2 py-1 bg-rose-50 text-rose-500 rounded-full text-xs">压力</text>
            <text class="px-2 py-1 bg-amber-50 text-amber-500 rounded-full text-xs">挑战</text>
            <text class="px-2 py-1 bg-emerald-50 text-emerald-500 rounded-full text-xs">成就感</text>
          </view>
        </view>
        
        <!-- 更多日记条目... -->
      </scroll-view>
      
      <!-- 使用统一的底部导航栏 -->
    </view>
  </template>
  
  <script>
  export default {
    data() {
      return {
        // 数据...
      }
    },
    methods: {
      // 方法...
    }
  }
  </script>