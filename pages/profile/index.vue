<template>
  <view class="flex flex-col h-full bg-gray-50">
    <!-- 头部 - 用户信息 -->
    <view class="bg-gradient-to-r from-purple-500 to-pink-500 px-4 pt-12 pb-6">
      <view class="flex items-center">
        <view class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mr-4">
          <uni-icons type="person-filled" size="32" color="#FFFFFF"></uni-icons>
        </view>
        <view>
          <text class="text-xl font-bold text-white">用户昵称</text>
          <text class="text-white/80 text-sm">心灵花园会员</text>
        </view>
        <view class="ml-auto">
          <view class="px-3 py-1 bg-white/20 rounded-full">
            <text class="text-white text-sm">编辑资料</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view scroll-y class="flex-1 px-4 py-5 pb-20">
      <!-- 数据概览 -->
      <view class="bg-white rounded-xl p-5 shadow-sm mb-6">
        <view class="flex justify-between items-center mb-4">
          <text class="font-bold text-gray-800">我的数据</text>
          <text class="text-sm text-purple-500">查看详情</text>
        </view>
        
        <view class="grid grid-cols-3 gap-2">
          <view class="flex flex-col items-center">
            <text class="text-2xl font-bold text-purple-600">28</text>
            <text class="text-xs text-gray-500">情绪记录</text>
          </view>
          
          <view class="flex flex-col items-center">
            <text class="text-2xl font-bold text-blue-600">5</text>
            <text class="text-xs text-gray-500">完成测评</text>
          </view>
          
          <view class="flex flex-col items-center">
            <text class="text-2xl font-bold text-green-600">12</text>
            <text class="text-xs text-gray-500">冥想次数</text>
          </view>
        </view>
      </view>
      
      <!-- 我的成长 -->
      <view class="bg-white rounded-xl p-5 shadow-sm mb-6">
        <view class="flex justify-between items-center mb-4">
          <text class="font-bold text-gray-800">我的成长</text>
        </view>
        
        <view class="flex items-center justify-between mb-3">
          <view class="flex items-center">
            <view class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
              <uni-icons type="star" size="20" color="#8B5CF6"></uni-icons>
            </view>
            <view>
              <text class="font-medium text-gray-800">连续打卡</text>
              <text class="text-xs text-gray-500 block">已坚持5天</text>
            </view>
          </view>
          <view class="px-3 py-1 bg-purple-100 rounded-full">
            <text class="text-xs text-purple-600">继续加油</text>
          </view>
        </view>
        
        <view class="flex items-center justify-between">
          <view class="flex items-center">
            <view class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <uni-icons type="medal" size="20" color="#3B82F6"></uni-icons>
            </view>
            <view>
              <text class="font-medium text-gray-800">成长徽章</text>
              <text class="text-xs text-gray-500 block">已获得3个徽章</text>
            </view>
          </view>
          <view class="px-3 py-1 bg-blue-100 rounded-full">
            <text class="text-xs text-blue-600">查看</text>
          </view>
        </view>
      </view>
      
      <!-- 设置列表 -->
      <view class="bg-white rounded-xl shadow-sm mb-6">
        <view class="p-4 border-b border-gray-100">
          <text class="font-bold text-gray-800">设置</text>
        </view>
        
        <view class="p-4 flex items-center border-b border-gray-100">
          <view class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
            <uni-icons type="bell" size="18" color="#8B5CF6"></uni-icons>
          </view>
          <text class="text-gray-800">提醒设置</text>
          <uni-icons type="right" size="16" color="#9CA3AF" class="ml-auto"></uni-icons>
        </view>
        
        <view class="p-4 flex items-center border-b border-gray-100">
          <view class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <uni-icons type="eye" size="18" color="#3B82F6"></uni-icons>
          </view>
          <text class="text-gray-800">隐私设置</text>
          <uni-icons type="right" size="16" color="#9CA3AF" class="ml-auto"></uni-icons>
        </view>
        
        <view class="p-4 flex items-center border-b border-gray-100">
          <view class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
            <uni-icons type="help" size="18" color="#10B981"></uni-icons>
          </view>
          <text class="text-gray-800">帮助中心</text>
          <uni-icons type="right" size="16" color="#9CA3AF" class="ml-auto"></uni-icons>
        </view>
        
        <view class="p-4 flex items-center">
          <view class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
            <uni-icons type="gear" size="18" color="#6B7280"></uni-icons>
          </view>
          <text class="text-gray-800">通用设置</text>
          <uni-icons type="right" size="16" color="#9CA3AF" class="ml-auto"></uni-icons>
        </view>
      </view>
      
      <!-- 关于我们 -->
      <view class="bg-white rounded-xl p-4 shadow-sm mb-6 flex items-center">
        <view class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
          <uni-icons type="info" size="18" color="#6366F1"></uni-icons>
        </view>
        <text class="text-gray-800">关于我们</text>
        <uni-icons type="right" size="16" color="#9CA3AF" class="ml-auto"></uni-icons>
      </view>
      
      <!-- 退出登录 -->
      <view class="bg-white rounded-xl p-4 shadow-sm mb-6 flex items-center justify-center">
        <text class="text-red-500">退出登录</text>
      </view>
    </scroll-view>
    
    <!-- 底部导航栏 -->
    <view class="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-2">
      <navigator url="/pages/index/index" class="flex flex-col items-center">
        <uni-icons type="home" size="24" color="#9CA3AF"></uni-icons>
        <text class="text-xs mt-1 text-gray-500">首页</text>
      </navigator>
      
      <navigator url="/pages/toolbox/index" class="flex flex-col items-center">
        <uni-icons type="grid" size="24" color="#9CA3AF"></uni-icons>
        <text class="text-xs mt-1 text-gray-500">工具箱</text>
      </navigator>
      
      <navigator url="/pages/psychological-test/index" class="flex flex-col items-center">
        <uni-icons type="checkbox" size="24" color="#9CA3AF"></uni-icons>
        <text class="text-xs mt-1 text-gray-500">测评</text>
      </navigator>
      
      <view class="flex flex-col items-center">
        <uni-icons type="person-filled" size="24" color="#8B5CF6"></uni-icons>
        <text class="text-xs mt-1 text-purple-600 font-medium">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      
    }
  },
  methods: {
    
  }
}
</script>

<style>
</style> 