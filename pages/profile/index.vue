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
        </view>

        <!-- 编辑资料按钮和通知徽章 -->
        <view class="ml-auto flex items-center">
          <notification-badge class="mr-2"></notification-badge>
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
      </view>


      <!-- 设置列表 -->
      <view class="bg-white rounded-xl shadow-sm mb-6">
        <view class="p-4 border-b border-gray-100">
          <text class="font-bold text-gray-800">设置</text>
        </view>

        <view class="p-4 flex items-center border-b border-gray-100" @tap="navigateToBackgroundSetting">
          <view class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
            <uni-icons type="image" size="18" color="#F59E0B"></uni-icons>
          </view>
          <text class="text-gray-800">更换背景图片</text>
          <uni-icons type="right" size="16" color="#9CA3AF" class="ml-auto"></uni-icons>
        </view>

        <view class="p-4 flex items-center border-b border-gray-100" @tap="navigateToEmergencyContacts">
          <view class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
            <uni-icons type="phone" size="18" color="#EF4444"></uni-icons>
          </view>
          <text class="text-gray-800">紧急联系人</text>
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
import NotificationBadge from '@/components/notification-badge/notification-badge.vue';
import { getUserInfo } from '@/api/user';
export default {
  components: {
    NotificationBadge
  },
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
        // 从服务器获取最新用户信息
        const res = await getUserInfo();

        // 检查返回数据格式并适当处理
        if (res.code === 200) {
          if (res.data) {
            this.userInfo = res.data;
            // 更新本地存储
            uni.setStorageSync('userInfo', JSON.stringify(res.data));
          } else {
            console.warn('用户信息数据为空');
          }
        } else {
          throw new Error(res.message || '获取用户信息失败');
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 显示错误提示但不影响页面正常加载
        uni.showToast({
          title: '获取用户信息失败，请稍后重试',
          icon: 'none'
        });
      }
    },

    navigateToEdit() {
      uni.navigateTo({
        url: '/pages/profile/edit'
      })
    },

    navigateToBackgroundSetting() {
      uni.navigateTo({
        url: '/pages/profile/background-setting'
      })
    },

    navigateToEmergencyContacts() {
      uni.navigateTo({
        url: '/pages/settings/emergency-contacts'
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