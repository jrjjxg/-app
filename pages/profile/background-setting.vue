<template>
    <view class="flex flex-col h-full bg-gray-50">
        <!-- 头部 -->
        <view class="bg-white px-4 py-3 flex items-center shadow-sm">
            <view @tap="goBack" class="w-8 h-8 flex items-center justify-center">
                <uni-icons type="back" size="20" color="#374151"></uni-icons>
            </view>
            <text class="text-lg font-medium text-center flex-1">背景图片设置</text>
            <view class="w-8"></view>
        </view>

        <!-- 内容区域 -->
        <scroll-view scroll-y class="flex-1 px-4 py-5">
            <!-- 当前背景预览 -->
            <view class="bg-white rounded-xl p-5 shadow-sm mb-6">
                <text class="font-bold text-gray-800 mb-3 block">当前背景</text>
                <view class="h-40 rounded-lg overflow-hidden relative">
                    <image :src="currentBackground || '/static/images/calm-bg.jpg'" mode="aspectFill"
                        class="w-full h-full"></image>
                    <view class="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-blue-900/30"></view>
                </view>
            </view>

            <!-- 选择预设背景 -->
            <view class="bg-white rounded-xl p-5 shadow-sm mb-6">
                <text class="font-bold text-gray-800 mb-3 block">预设背景</text>
                <view class="grid grid-cols-2 gap-3">
                    <view v-for="(bg, index) in presetBackgrounds" :key="index"
                        class="h-24 rounded-lg overflow-hidden relative" @tap="selectPresetBackground(bg.src)">
                        <image :src="bg.src" mode="aspectFill" class="w-full h-full"></image>
                        <view class="absolute inset-0 bg-black/20 flex items-center justify-center"
                            v-if="currentBackground === bg.src">
                            <view class="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                                <uni-icons type="checkmarkempty" size="20" color="#10B981"></uni-icons>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 上传自定义背景 -->
            <view class="bg-white rounded-xl p-5 shadow-sm mb-6">
                <text class="font-bold text-gray-800 mb-3 block">上传自定义背景</text>
                <view class="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
                    @tap="chooseImage">
                    <view class="flex flex-col items-center">
                        <uni-icons type="upload" size="28" color="#6B7280"></uni-icons>
                        <text class="text-gray-500 mt-2">点击上传图片</text>
                    </view>
                </view>
            </view>

            <!-- 保存按钮 -->
            <view class="px-4 mb-8">
                <view
                    class="bg-gradient-to-r from-purple-500 to-pink-500 py-3 rounded-full flex items-center justify-center"
                    @tap="saveBackground">
                    <text class="text-white font-medium">保存设置</text>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            currentBackground: '',
            presetBackgrounds: [
                { name: '平静海洋', src: '/static/images/calm-bg.jpg' },
                { name: '紫色星空', src: '/static/images/purple-stars.jpg' },
                { name: '山间日出', src: '/static/images/mountain-sunrise.jpg' },
                { name: '绿色森林', src: '/static/images/green-forest.jpg' }
            ],
            customBackground: ''
        }
    },

    onLoad() {
        // 获取当前背景图片
        try {
            const savedBackground = uni.getStorageSync('userBackgroundImage');
            if (savedBackground) {
                this.currentBackground = savedBackground;
            } else {
                this.currentBackground = '/static/images/calm-bg.jpg'; // 默认背景
            }
        } catch (e) {
            console.error('获取背景图片设置失败', e);
        }
    },

    methods: {
        goBack() {
            uni.navigateBack();
        },

        selectPresetBackground(src) {
            this.currentBackground = src;
            this.customBackground = ''; // 清除自定义背景
        },

        chooseImage() {
            uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
                success: (res) => {
                    const tempFilePath = res.tempFilePaths[0];

                    // 立即复制到应用内部存储，避免临时文件问题
                    this.copyImageToAppStorage(tempFilePath);
                },
                fail: (err) => {
                    console.error('选择图片失败', err);
                    uni.showToast({
                        title: '选择图片失败',
                        icon: 'none'
                    });
                }
            });
        },

        copyImageToAppStorage(tempFilePath) {
            // 显示加载状态
            uni.showLoading({
                title: '处理图片中...'
            });

            // 在某些平台上，我们可能需要先将图片保存到应用文件系统
            try {
                // 尝试直接显示临时图片
                this.customBackground = tempFilePath;
                this.currentBackground = tempFilePath;
                uni.hideLoading();
            } catch (e) {
                console.error('处理图片失败', e);
                uni.hideLoading();
                uni.showToast({
                    title: '处理图片失败',
                    icon: 'none'
                });
            }
        },

        saveBackground() {
            try {
                // 如果是临时文件路径，需要将图片保存到永久存储位置
                if (this.customBackground && (this.customBackground.startsWith('http://tmp') ||
                    this.customBackground.startsWith('wxfile://') ||
                    this.customBackground.startsWith('file://'))) {

                    // 先检查文件是否存在
                    uni.getFileInfo({
                        filePath: this.customBackground,
                        success: (fileInfo) => {
                            console.log('文件存在，准备保存', fileInfo);

                            // 保存图片到本地永久存储
                            uni.saveFile({
                                tempFilePath: this.customBackground,
                                success: (res) => {
                                    // 更新为永久路径
                                    const savedFilePath = res.savedFilePath;
                                    this.currentBackground = savedFilePath;

                                    // 保存永久路径到本地存储
                                    uni.setStorageSync('userBackgroundImage', savedFilePath);

                                    uni.showToast({
                                        title: '背景设置已保存',
                                        icon: 'success'
                                    });

                                    setTimeout(() => {
                                        uni.navigateBack();
                                    }, 1500);
                                },
                                fail: (err) => {
                                    console.error('保存图片失败', err);
                                    // 如果保存失败，使用默认或预设背景
                                    this.handleSaveFileFail();
                                }
                            });
                        },
                        fail: (err) => {
                            console.error('临时文件不存在', err);
                            // 如果临时文件不存在，使用默认或预设背景
                            this.handleSaveFileFail();
                        }
                    });
                } else {
                    // 如果是预设背景或已经是永久路径，直接保存路径
                    uni.setStorageSync('userBackgroundImage', this.currentBackground);

                    uni.showToast({
                        title: '背景设置已保存',
                        icon: 'success'
                    });

                    setTimeout(() => {
                        uni.navigateBack();
                    }, 1500);
                }
            } catch (e) {
                console.error('保存背景设置失败', e);
                this.handleSaveFileFail();
            }
        },

        // 处理保存文件失败的情况
        handleSaveFileFail() {
            // 使用一个预设背景作为回退选项
            const defaultBg = '/static/images/calm-bg.jpg';
            this.currentBackground = defaultBg;
            uni.setStorageSync('userBackgroundImage', defaultBg);

            uni.showToast({
                title: '使用默认背景',
                icon: 'none'
            });

            setTimeout(() => {
                uni.navigateBack();
            }, 1500);
        }
    }
}
</script>

<style></style>