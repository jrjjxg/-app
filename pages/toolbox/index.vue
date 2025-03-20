<template>
  <view class="flex flex-col h-full bg-gray-50">
    <!-- 头部 -->
    <view class="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 pt-12 pb-6">
      <view class="flex items-center mb-4">
        <text class="text-xl font-bold text-white">工具箱</text>
      </view>
      <text class="text-white/80">探索各种心理健康工具</text>
    </view>

    <!-- 内容区域 -->
    <scroll-view scroll-y class="flex-1 px-4 py-5 pb-20">
      <!-- 搜索框 -->
      <view class="bg-white rounded-full flex items-center px-4 py-2 mb-6 shadow-sm">
        <uni-icons type="search" size="18" color="#9CA3AF"></uni-icons>
        <input type="text" placeholder="搜索工具..." class="flex-1 ml-2 text-sm" />
      </view>

      <!-- 最近使用 -->
      <view class="mb-6">
        <view class="flex justify-between items-center mb-3">
          <text class="font-bold text-gray-800">最近使用</text>
        </view>

        <scroll-view scroll-x class="whitespace-nowrap -mx-4 px-4" show-scrollbar="false">
          <!-- 深呼吸 -->
          <view class="inline-block w-28 mr-3 bg-white rounded-xl overflow-hidden shadow-sm">
            <view class="h-20 bg-gradient-to-r from-teal-400 to-emerald-400 flex items-center justify-center">
              <uni-icons type="refresh" size="28" color="#FFFFFF"></uni-icons>
            </view>
            <view class="p-2">
              <text class="font-medium text-gray-800 block text-center">深呼吸</text>
              <text class="text-xs text-gray-500 text-center block">5分钟</text>
            </view>
          </view>

          <!-- 冥想 -->
          <view class="inline-block w-28 mr-3 bg-white rounded-xl overflow-hidden shadow-sm">
            <view class="h-20 bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center">
              <uni-icons type="staff" size="28" color="#FFFFFF"></uni-icons>
            </view>
            <view class="p-2">
              <text class="font-medium text-gray-800 block text-center">冥想</text>
              <text class="text-xs text-gray-500 text-center block">10分钟</text>
            </view>
          </view>

          <!-- 情绪日记 -->
          <view class="inline-block w-28 mr-3 bg-white rounded-xl overflow-hidden shadow-sm">
            <view class="h-20 bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
              <uni-icons type="compose" size="28" color="#FFFFFF"></uni-icons>
            </view>
            <view class="p-2">
              <text class="font-medium text-gray-800 block text-center">情绪日记</text>
              <text class="text-xs text-gray-500 text-center block">记录</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 冥想与正念 -->
      <view class="mb-6">
        <view class="flex justify-between items-center mb-3">
          <text class="font-bold text-gray-800">冥想与正念</text>
          <text class="text-sm text-purple-500">全部</text>
        </view>

        <view class="grid grid-cols-2 gap-4">
          <!-- 引导冥想 -->
          <view class="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center">
            <view class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
              <uni-icons type="headphones" size="24" color="#6366F1"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">引导冥想</text>
            <text class="text-xs text-gray-500 text-center">10分钟</text>
          </view>

          <!-- 深呼吸练习 -->
          <view class="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center">
            <view class="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-2">
              <uni-icons type="refresh" size="24" color="#14B8A6"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">深呼吸练习</text>
            <text class="text-xs text-gray-500 text-center">5分钟</text>
          </view>

          <!-- 专注力训练 -->
          <view class="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center">
            <view class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
              <uni-icons type="eye" size="24" color="#F59E0B"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">专注力训练</text>
            <text class="text-xs text-gray-500 text-center">8分钟</text>
          </view>

          <!-- 身体扫描 -->
          <view class="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center">
            <view class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <uni-icons type="scan" size="24" color="#3B82F6"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">身体扫描</text>
            <text class="text-xs text-gray-500 text-center">12分钟</text>
          </view>
        </view>
      </view>

      <!-- 情绪调节 -->
      <view class="mb-6">
        <view class="flex justify-between items-center mb-3">
          <text class="font-bold text-gray-800">情绪调节</text>
          <text class="text-sm text-purple-500">全部</text>
        </view>

        <view class="grid grid-cols-2 gap-4">
          <!-- 情绪识别 -->
          <view class="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center">
            <view class="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-2">
              <uni-icons type="heart" size="24" color="#EC4899"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">情绪识别</text>
            <text class="text-xs text-gray-500 text-center">练习</text>
          </view>

          <!-- 思维重塑 -->
          <view class="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center">
            <view class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-2">
              <uni-icons type="brain" size="24" color="#F97316"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">思维重塑</text>
            <text class="text-xs text-gray-500 text-center">8分钟</text>
          </view>

          <!-- 压力管理 -->
          <view class="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center">
            <view class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <uni-icons type="gear" size="24" color="#10B981"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">压力管理</text>
            <text class="text-xs text-gray-500 text-center">技巧</text>
          </view>

          <!-- 情绪日记 -->
          <view class="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center">
            <view class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <uni-icons type="compose" size="24" color="#8B5CF6"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">情绪日记</text>
            <text class="text-xs text-gray-500 text-center">记录</text>
          </view>
        </view>
      </view>

      <!-- 睡眠改善 -->
      <view class="mb-6">
        <view class="flex justify-between items-center mb-3">
          <text class="font-bold text-gray-800">睡眠改善</text>
          <text class="text-sm text-purple-500">全部</text>
        </view>

        <view class="grid grid-cols-2 gap-4">
          <!-- 夜间安眠 -->
          <view class="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center">
            <view class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
              <uni-icons type="moon" size="24" color="#6366F1"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">夜间安眠</text>
            <text class="text-xs text-gray-500 text-center">15分钟</text>
          </view>

          <!-- 睡前放松 -->
          <view class="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center">
            <view class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <uni-icons type="wind-power" size="24" color="#3B82F6"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">睡前放松</text>
            <text class="text-xs text-gray-500 text-center">10分钟</text>
          </view>
        </view>
      </view>
    </scroll-view>
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

<style></style>