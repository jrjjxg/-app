<template>
    <view class="profile-container">
        <!-- 顶部导航栏 -->
        <view class="header">
            <view class="back-icon" @click="goBack">
                <uni-icons type="back" size="20"></uni-icons>
            </view>
            <view class="title">编辑资料</view>
            <view class="save-button" @click="saveProfile">保存</view>
        </view>

        <!-- 编辑表单 -->
        <view class="edit-form">
            <!-- 头像上传 -->
            <view class="avatar-section">
                <view class="avatar-upload">
                    <image :src="userInfo.avatar || '/static/images/default-avatar.png'" @click="chooseAvatar"></image>
                    <text>点击更换头像</text>
                </view>
            </view>

            <!-- 昵称 -->
            <view class="form-item">
                <view class="form-label">昵称</view>
                <input type="text" v-model="userInfo.nickname" placeholder="请输入昵称" maxlength="20" class="form-input" />
            </view>

            <!-- 性别 -->
            <view class="form-item">
                <view class="form-label">性别</view>
                <view class="gender-options">
                    <view class="gender-option" :class="{ active: userInfo.gender === 1 }" @click="userInfo.gender = 1">
                        <uni-icons type="male" size="20" color="#007AFF"></uni-icons>
                        <text>男</text>
                    </view>
                    <view class="gender-option" :class="{ active: userInfo.gender === 2 }" @click="userInfo.gender = 2">
                        <uni-icons type="female" size="20" color="#FF6B6B"></uni-icons>
                        <text>女</text>
                    </view>
                    <view class="gender-option" :class="{ active: userInfo.gender === 0 }" @click="userInfo.gender = 0">
                        <uni-icons type="help" size="20" color="#999"></uni-icons>
                        <text>保密</text>
                    </view>
                </view>
            </view>

            <!-- 生日 -->
            <view class="form-item">
                <view class="form-label">生日</view>
                <picker mode="date" :value="userInfo.birthDate" @change="onBirthDateChange" class="form-picker">
                    <view class="picker-value">{{ userInfo.birthDate || '请选择生日' }}</view>
                </picker>
            </view>

            <!-- 个人简介 -->
            <view class="form-item">
                <view class="form-label">个人简介</view>
                <textarea v-model="userInfo.bio" placeholder="介绍一下自己吧" maxlength="200" class="form-textarea"></textarea>
                <view class="textarea-counter">{{ userInfo.bio ? userInfo.bio.length : 0 }}/200</view>
            </view>
        </view>
    </view>
</template>

<script>
import { getUserProfile, updateUserProfile } from '@/api/user';

export default {
    data() {
        return {
            userInfo: {
                id: '',
                nickname: '',
                avatar: '',
                gender: 0, // 0-保密，1-男，2-女
                birthDate: '',
                bio: ''
            },
            loading: false
        }
    },
    onLoad() {
        this.loadUserInfo();
    },
    methods: {
        // 返回上一页
        goBack() {
            uni.navigateBack();
        },

        // 加载用户信息
        async loadUserInfo() {
            try {
                this.loading = true;
                const userId = uni.getStorageSync('userId');

                const res = await getUserProfile(userId);

                if (res.code === 200) {
                    // 处理头像URL，检测并替换blob URL
                    if (res.data.avatar && res.data.avatar.startsWith('blob:')) {
                        console.warn('检测到blob URL头像，使用默认头像替代');
                        res.data.avatar = '/static/images/default-avatar.png';
                    }

                    this.userInfo = {
                        id: res.data.id,
                        nickname: res.data.nickname || '',
                        avatar: res.data.avatar || '/static/images/default-avatar.png',
                        gender: res.data.gender || 0,
                        birthDate: res.data.birthDate || '',
                        bio: res.data.bio || ''
                    };
                } else {
                    uni.showToast({
                        title: res.message || '获取用户信息失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('加载用户信息失败', error);
                uni.showToast({
                    title: '加载用户信息失败',
                    icon: 'none'
                });
            } finally {
                this.loading = false;
            }
        },

        // 选择头像
        chooseAvatar() {
            uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
                success: (res) => {
                    const tempFilePath = res.tempFilePaths[0];
                    this.uploadAvatar(tempFilePath);
                }
            });
        },

        // 上传头像到服务器
        async uploadAvatar(filePath) {
            uni.showLoading({ title: '上传中...' });

            try {
                const uploadResult = await new Promise((resolve, reject) => {
                    uni.uploadFile({
                        url: 'http://localhost:9000/api/upload/avatar',
                        filePath: filePath,
                        name: 'file',
                        success: (uploadRes) => {
                            const result = JSON.parse(uploadRes.data);
                            if (uploadRes.statusCode === 200 && result.code === 200) {
                                resolve(result.data);
                            } else {
                                reject(new Error(result.message || '上传失败'));
                            }
                        },
                        fail: (err) => {
                            reject(err);
                        }
                    });
                });

                // 更新头像URL
                this.userInfo.avatar = uploadResult;

                uni.showToast({
                    title: '上传成功',
                    icon: 'success'
                });
            } catch (error) {
                console.error('头像上传失败', error);
                uni.showToast({
                    title: '上传失败，请重试',
                    icon: 'none'
                });
            } finally {
                uni.hideLoading();
            }
        },

        // 生日选择器变化
        onBirthDateChange(e) {
            this.userInfo.birthDate = e.detail.value;
        },

        // 保存个人资料
        async saveProfile() {
            // 表单验证
            if (!this.userInfo.nickname) {
                uni.showToast({
                    title: '昵称不能为空',
                    icon: 'none'
                });
                return;
            }

            try {
                uni.showLoading({ title: '保存中...' });

                const res = await updateUserProfile(this.userInfo);

                if (res.code === 200) {
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
                console.error('保存个人资料失败', error);
                uni.showToast({
                    title: '保存失败，请重试',
                    icon: 'none'
                });
            } finally {
                uni.hideLoading();
            }
        },

        // 处理头像加载错误
        handleAvatarError() {
            console.error('头像加载失败:', this.userInfo.avatar);
            this.userInfo.avatar = '/static/images/default-avatar.png';
        }
    }
}
</script>

<style>
.profile-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f5f5;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
    background-color: #fff;
    border-bottom: 1px solid #eee;
}

.back-icon {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.title {
    font-size: 18px;
    font-weight: bold;
}

.save-button {
    font-size: 16px;
    color: #007AFF;
}

.edit-form {
    padding: 20px 15px;
    background-color: #fff;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;
}

.avatar-upload {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.avatar {
    width: 100px;
    height: 100px;
    border-radius: 50px;
    margin-bottom: 10px;
}

.change-avatar-text {
    font-size: 14px;
    color: #007AFF;
}

.form-item {
    margin-bottom: 20px;
}

.form-label {
    font-size: 16px;
    color: #333;
    margin-bottom: 10px;
}

.form-input {
    width: 100%;
    height: 45px;
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 0 15px;
    font-size: 16px;
    background-color: #f9f9f9;
}

.gender-options {
    display: flex;
    justify-content: space-between;
}

.gender-option {
    flex: 1;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #eee;
    border-radius: 5px;
    margin: 0 5px;
    background-color: #f9f9f9;
}

.gender-option:first-child {
    margin-left: 0;
}

.gender-option:last-child {
    margin-right: 0;
}

.gender-option.active {
    background-color: #e6f2ff;
    border-color: #007AFF;
}

.gender-option text {
    margin-left: 5px;
}

.form-picker {
    width: 100%;
    height: 45px;
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 0 15px;
    background-color: #f9f9f9;
    display: flex;
    align-items: center;
}

.picker-value {
    font-size: 16px;
    color: #333;
}

.form-textarea {
    width: 100%;
    height: 120px;
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 10px 15px;
    font-size: 16px;
    background-color: #f9f9f9;
}

.textarea-counter {
    text-align: right;
    font-size: 12px;
    color: #999;
    margin-top: 5px;
}
</style>
