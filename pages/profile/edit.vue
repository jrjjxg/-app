<template>
    <view class="bg-gray-50 min-h-screen">
        <!-- 顶部导航栏 -->
        <view class="bg-white p-4 flex items-center justify-between shadow-sm">
            <view class="flex items-center">
                <text class="iconfont icon-back text-gray-800" @click="goBack"></text>
                <text class="ml-2 text-lg font-medium">编辑资料</text>
            </view>
            <text class="text-primary font-medium" @click="saveProfile">保存</text>
        </view>

        <!-- 加载状态 -->
        <view v-if="loading" class="flex justify-center items-center p-10">
            <view class="spinner"></view>
        </view>

        <!-- 表单内容 -->
        <view v-else class="p-4">
            <!-- 头像 -->
            <view class="bg-white rounded-xl p-4 mb-4 flex items-center">
                <text class="text-gray-700 w-20">头像</text>
                <view class="flex-1 flex justify-end">
                    <view class="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100" @click="chooseAvatar">
                        <image v-if="userInfo.avatar" :src="userInfo.avatar" mode="aspectFill" class="w-full h-full">
                        </image>
                        <view v-else class="w-full h-full flex items-center justify-center bg-gray-200">
                            <text class="text-gray-400 text-2xl">头像</text>
                        </view>
                        <view class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 py-1 flex justify-center">
                            <text class="text-white text-xs">更换</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 昵称 -->
            <view class="bg-white rounded-xl p-4 mb-4">
                <view class="flex items-center">
                    <text class="text-gray-700 w-20">昵称</text>
                    <input class="flex-1 text-gray-800 text-right" v-model="userInfo.nickname" placeholder="请输入昵称"
                        maxlength="20" />
                </view>
            </view>

            <!-- 性别 -->
            <view class="bg-white rounded-xl p-4 mb-4">
                <view class="flex items-center justify-between">
                    <text class="text-gray-700">性别</text>
                    <picker :value="genderIndex" :range="genderOptions" @change="onGenderChange" class="text-right">
                        <text :class="userInfo.gender ? 'text-gray-800' : 'text-gray-400'">
                            {{ userInfo.gender ? genderOptions[genderIndex] : '请选择' }}
                        </text>
                    </picker>
                </view>
            </view>

            <!-- 生日 -->
            <view class="bg-white rounded-xl p-4 mb-4">
                <view class="flex items-center justify-between">
                    <text class="text-gray-700">生日</text>
                    <picker mode="date" :value="userInfo.birthday || '2000-01-01'" start="1900-01-01" :end="today"
                        @change="onBirthdayChange" class="text-right">
                        <text :class="userInfo.birthday ? 'text-gray-800' : 'text-gray-400'">
                            {{ userInfo.birthday || '请选择' }}
                        </text>
                    </picker>
                </view>
            </view>

            <!-- 个人简介 -->
            <view class="bg-white rounded-xl p-4 mb-4">
                <view class="mb-2">
                    <text class="text-gray-700">个人简介</text>
                </view>
                <textarea class="w-full p-3 bg-gray-50 rounded-lg text-gray-800 min-h-[100px]" v-model="userInfo.bio"
                    placeholder="介绍一下自己吧..." maxlength="200"></textarea>
                <view class="flex justify-end mt-1">
                    <text class="text-xs text-gray-500">{{ userInfo.bio ? userInfo.bio.length : 0 }}/200</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { getUserInfo, updateUserInfo, uploadAvatar } from '@/api/user';

export default {
    data() {
        return {
            loading: true,
            saving: false,
            userInfo: {
                nickname: '',
                avatar: '',
                gender: '',
                birthday: '',
                bio: ''
            },
            genderOptions: ['男', '女', '保密'],
            genderIndex: 0,
            today: new Date().toISOString().split('T')[0]
        };
    },
    onLoad() {
        this.fetchUserInfo();
    },
    methods: {
        async fetchUserInfo() {
            try {
                this.loading = true;
                const res = await getUserInfo();
                if (res.code === 0 || res.code === 200) {
                    this.userInfo = res.data;
                    // 设置性别选择器的索引
                    if (this.userInfo.gender) {
                        this.genderIndex = this.genderOptions.findIndex(g => g === this.userInfo.gender);
                        if (this.genderIndex === -1) this.genderIndex = 0;
                    }
                } else {
                    uni.showToast({
                        title: '获取用户信息失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('获取用户信息错误:', error);
                uni.showToast({
                    title: '获取用户信息失败，请稍后再试',
                    icon: 'none'
                });
            } finally {
                this.loading = false;
            }
        },
        chooseAvatar() {
            uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
                success: async (res) => {
                    try {
                        uni.showLoading({
                            title: '上传中...'
                        });

                        const uploadRes = await uploadAvatar(res.tempFilePaths[0]);
                        if (uploadRes.code === 0 || uploadRes.code === 200) {
                            this.userInfo.avatar = uploadRes.data.url;
                            uni.showToast({
                                title: '头像上传成功',
                                icon: 'success'
                            });
                        }
                    } catch (error) {
                        console.error('上传头像错误:', error);
                        uni.showToast({
                            title: '上传头像失败，请稍后再试',
                            icon: 'none'
                        });
                    } finally {
                        uni.hideLoading();
                    }
                }
            });
        },
        onGenderChange(e) {
            this.genderIndex = e.detail.value;
            this.userInfo.gender = this.genderOptions[this.genderIndex];
        },
        onBirthdayChange(e) {
            this.userInfo.birthday = e.detail.value;
        },
        goBack() {
            uni.navigateBack();
        },
        validateForm() {
            if (!this.userInfo.nickname || this.userInfo.nickname.trim() === '') {
                uni.showToast({
                    title: '请输入昵称',
                    icon: 'none'
                });
                return false;
            }
            return true;
        },
        async saveProfile() {
            if (this.saving) return;
            if (!this.validateForm()) return;

            try {
                this.saving = true;
                uni.showLoading({
                    title: '保存中...'
                });

                const res = await updateUserInfo(this.userInfo);
                if (res.code === 0 || res.code === 200) {
                    uni.showToast({
                        title: '保存成功',
                        icon: 'success'
                    });

                    // 延迟返回，让用户看到成功提示
                    setTimeout(() => {
                        uni.navigateBack();
                    }, 1500);
                } else {
                    uni.showToast({
                        title: res.message || '保存失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('保存资料错误:', error);
                uni.showToast({
                    title: '保存失败，请稍后再试',
                    icon: 'none'
                });
            } finally {
                this.saving = false;
                uni.hideLoading();
            }
        }
    }
};
</script>

<style>
.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(139, 92, 246, 0.2);
    border-radius: 50%;
    border-top-color: #8B5CF6;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.text-primary {
    color: #8B5CF6;
}
</style>