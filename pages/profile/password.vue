<template>
    <view class="min-h-screen bg-gray-50">
        <view class="p-4">
            <!-- 密码修改表单 -->
            <view class="bg-white rounded-xl p-6 mb-4">
                <view class="mb-6">
                    <text class="text-lg font-medium text-gray-800">修改密码</text>
                    <text class="text-sm text-gray-500 block mt-1">为了保障账户安全，请定期修改密码</text>
                </view>

                <!-- 当前密码 -->
                <view class="mb-4">
                    <text class="text-sm text-gray-600 mb-2 block">当前密码</text>
                    <view class="relative">
                        <input :type="showOldPassword ? 'text' : 'password'" v-model="passwordForm.oldPassword"
                            placeholder="请输入当前密码"
                            class="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800" />
                        <view class="absolute right-3 top-3" @tap="showOldPassword = !showOldPassword">
                            <uni-icons :type="showOldPassword ? 'eye-slash' : 'eye'" size="20"
                                color="#9CA3AF"></uni-icons>
                        </view>
                    </view>
                </view>

                <!-- 新密码 -->
                <view class="mb-4">
                    <text class="text-sm text-gray-600 mb-2 block">新密码</text>
                    <view class="relative">
                        <input :type="showNewPassword ? 'text' : 'password'" v-model="passwordForm.newPassword"
                            placeholder="请输入新密码"
                            class="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                            @input="checkPasswordStrength" />
                        <view class="absolute right-3 top-3" @tap="showNewPassword = !showNewPassword">
                            <uni-icons :type="showNewPassword ? 'eye-slash' : 'eye'" size="20"
                                color="#9CA3AF"></uni-icons>
                        </view>
                    </view>

                    <!-- 密码强度指示器 -->
                    <view class="mt-2" v-if="passwordForm.newPassword">
                        <view class="flex space-x-1">
                            <view class="h-1 flex-1 rounded"
                                :class="passwordStrength >= 1 ? 'bg-red-500' : 'bg-gray-200'"></view>
                            <view class="h-1 flex-1 rounded"
                                :class="passwordStrength >= 2 ? 'bg-yellow-500' : 'bg-gray-200'"></view>
                            <view class="h-1 flex-1 rounded"
                                :class="passwordStrength >= 3 ? 'bg-green-500' : 'bg-gray-200'"></view>
                        </view>
                        <text class="text-xs mt-1 block" :class="strengthColor">
                            {{ strengthText }}
                        </text>
                    </view>
                </view>

                <!-- 确认新密码 -->
                <view class="mb-4">
                    <text class="text-sm text-gray-600 mb-2 block">确认新密码</text>
                    <view class="relative">
                        <input :type="showConfirmPassword ? 'text' : 'password'" v-model="passwordForm.confirmPassword"
                            placeholder="请再次输入新密码"
                            class="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800" />
                        <view class="absolute right-3 top-3" @tap="showConfirmPassword = !showConfirmPassword">
                            <uni-icons :type="showConfirmPassword ? 'eye-slash' : 'eye'" size="20"
                                color="#9CA3AF"></uni-icons>
                        </view>
                    </view>
                    <text
                        v-if="passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword"
                        class="text-xs text-red-500 mt-1">
                        两次输入的密码不一致
                    </text>
                </view>

                <view class="mt-4">
                    <text class="text-xs text-gray-500">
                        * 密码要求：至少8位，包含大小写字母和数字
                    </text>
                </view>
            </view>

            <!-- 保存按钮 -->
            <view class="mt-4 px-4">
                <button class="w-full bg-primary text-white py-3 rounded-full" :disabled="!isFormValid"
                    :class="{ 'opacity-50': !isFormValid }" @tap="submitPasswordChange">
                    确认修改
                </button>
            </view>
        </view>
    </view>
</template>

<script>
import { updatePassword } from '@/api/user';

export default {
    data() {
        return {
            passwordForm: {
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
            showOldPassword: false,
            showNewPassword: false,
            showConfirmPassword: false,
            passwordStrength: 0,
            loading: false
        }
    },

    computed: {
        isFormValid() {
            return this.passwordForm.oldPassword
                && this.passwordForm.newPassword
                && this.passwordForm.confirmPassword
                && this.passwordForm.newPassword === this.passwordForm.confirmPassword
                && this.passwordStrength >= 2;
        },

        strengthText() {
            switch (this.passwordStrength) {
                case 0: return '过于简单';
                case 1: return '较弱';
                case 2: return '中等';
                case 3: return '强';
                default: return '';
            }
        },

        strengthColor() {
            switch (this.passwordStrength) {
                case 0: case 1: return 'text-red-500';
                case 2: return 'text-yellow-500';
                case 3: return 'text-green-500';
                default: return '';
            }
        }
    },

    methods: {
        checkPasswordStrength() {
            const password = this.passwordForm.newPassword;

            if (!password) {
                this.passwordStrength = 0;
                return;
            }

            let strength = 0;

            // 检查长度
            if (password.length >= 8) strength += 1;

            // 检查复杂性
            if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 1;
            if (/[0-9]/.test(password)) strength += 1;

            // 限制最高为3
            this.passwordStrength = Math.min(3, strength);
        },

        async submitPasswordChange() {
            if (!this.isFormValid || this.loading) return;

            this.loading = true;

            try {
                await updatePassword({
                    oldPassword: this.passwordForm.oldPassword,
                    newPassword: this.passwordForm.newPassword
                });

                uni.showToast({
                    title: '密码修改成功',
                    icon: 'success'
                });

                setTimeout(() => {
                    uni.navigateBack();
                }, 1500);
            } catch (error) {
                let message = '密码修改失败';

                if (error.response && error.response.data && error.response.data.message) {
                    message = error.response.data.message;
                }

                uni.showToast({
                    title: message,
                    icon: 'none'
                });
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>

<style>
.bg-primary {
    background-color: #6366f1;
}
</style>