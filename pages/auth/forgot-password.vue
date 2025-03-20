<template>
    <view class="flex flex-col h-full bg-gradient-to-b from-purple-50 to-indigo-50">
        <!-- 顶部 -->
        <view class="bg-white px-4 pt-12 pb-4 border-b border-gray-100">
            <view class="flex items-center">
                <view @click="goBack" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <uni-icons type="back" size="18" color="#6B7280"></uni-icons>
                </view>
                <text class="text-lg font-bold text-gray-800">找回密码</text>
            </view>
        </view>

        <!-- 内容区域 -->
        <view class="flex-1 px-8 py-10">
            <view v-if="step === 1">
                <text class="text-lg font-medium text-gray-800 mb-2">重置您的密码</text>
                <text class="text-sm text-gray-600 mb-8 block">请输入您注册时使用的邮箱，我们将向您发送重置密码的链接</text>

                <view class="mb-6">
                    <text class="block text-sm font-medium text-gray-700 mb-1">邮箱地址</text>
                    <input
                        class="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-purple-500 transition-colors duration-300"
                        type="text" v-model="email" placeholder="请输入您的邮箱" />
                </view>

                <button
                    class="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                    :class="{ 'opacity-70': isLoading }" @click="sendResetEmail" :disabled="isLoading">
                    <uni-icons v-if="isLoading" type="spinner-cycle" size="20" color="#FFFFFF"
                        class="animate-spin mr-2"></uni-icons>
                    <text>{{ isLoading ? '发送中...' : '发送重置链接' }}</text>
                </button>
            </view>

            <view v-else-if="step === 2" class="flex flex-col items-center">
                <view class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                    <uni-icons type="checkmarkempty" size="40" color="#10B981"></uni-icons>
                </view>

                <text class="text-lg font-medium text-gray-800 mb-2 text-center">邮件已发送</text>
                <text class="text-sm text-gray-600 mb-8 text-center">我们已向您的邮箱发送了重置密码的链接，请查收并按照提示操作</text>

                <view class="w-full">
                    <button
                        class="w-full py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium mb-4"
                        @click="step = 1">
                        重新发送
                    </button>

                    <button
                        class="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium shadow-md"
                        @click="goToLogin">
                        返回登录
                    </button>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { forgotPassword } from '@/api/auth';

export default {
    data() {
        return {
            step: 1,
            email: '',
            isLoading: false
        }
    },
    methods: {
        goBack() {
            uni.navigateBack();
        },

        goToLogin() {
            uni.navigateTo({
                url: '/pages/auth/login'
            });
        },

        async sendResetEmail() {
            // 邮箱格式验证
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.email)) {
                uni.showToast({
                    title: '请输入有效的邮箱地址',
                    icon: 'none'
                });
                return;
            }

            try {
                this.isLoading = true;

                // 调用忘记密码API
                await forgotPassword(this.email);

                // 进入第二步
                this.step = 2;
            } catch (error) {
                // 发送失败处理
                uni.showToast({
                    title: error.message || '发送失败，请稍后再试',
                    icon: 'none'
                });
            } finally {
                this.isLoading = false;
            }
        }
    }
}
</script>

<style>
.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>