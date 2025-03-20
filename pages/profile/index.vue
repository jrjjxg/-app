<template>
  <view class="flex flex-col h-full bg-gray-50">
    <!-- 头部 - 用户信息 -->
    <view class="bg-gradient-to-r from-purple-500 to-pink-500 px-4 pt-12 pb-6">
      <view class="flex items-center">
        <!-- 头像区域 -->
        <view class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mr-4" v-if="!userInfo.avatar">
          <uni-icons type="person-filled" size="32" color="#FFFFFF"></uni-icons>
        </view>
        <image v-else :src="userInfo.avatar" class="w-16 h-16 rounded-full mr-4" mode="aspectFill"></image>

        <!-- 用户信息 -->
        <view>
          <text class="text-xl font-bold text-white">{{ userInfo.nickname || '未设置昵称' }}</text>
          <text class="text-white/80 text-sm">心灵花园会员</text>
        </view>

        <!-- 编辑资料按钮 -->
        <view class="ml-auto">
          <view class="px-3 py-1 bg-white/20 rounded-full" @tap="navigateToEdit">
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
      <view class="bg-white rounded-xl p-4 shadow-sm mb-6 flex items-center justify-center" @tap="handleLogout">
        <text class="text-red-500">退出登录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        nickname: '',
        avatar: '',
        gender: 0,
        birthDate: '',
        phone: ''
      }
    }
  },

  onShow() {
    // 每次页面显示时重新获取用户信息，确保数据是最新的
    this.getUserInfo()
  },

  methods: {
    async getUserInfo() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo) {
          this.userInfo = JSON.parse(userInfo)
        }
        // 无论是否有本地缓存，都从服务器获取最新数据
        const res = await this.$api.user.getUserInfo()
        if (res.code === 200) {
          this.userInfo = res.data
          // 更新本地存储
          uni.setStorageSync('userInfo', JSON.stringify(res.data))
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        uni.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
      }
    },

    navigateToEdit() {
      uni.navigateTo({
        url: '/pages/profile/edit'
      })
    },

    // 处理退出登录
    handleLogout() {
      // 显示确认对话框
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除token
            uni.removeStorageSync('token');

            // 清除其他可能的用户数据
            uni.removeStorageSync('userInfo');

            // 显示提示
            uni.showToast({
              title: '已退出登录',
              icon: 'success',
              duration: 1500
            });

            // 延迟跳转到登录页面
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/auth/login'
              });
            }, 1500);
          }
        }
      });
    }
  }
}
</script>

<style></style>