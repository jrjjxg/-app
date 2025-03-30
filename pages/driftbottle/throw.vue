<template>
    <view class="container">
        <!-- 顶部导航栏 -->
        <view class="header">
            <view class="back-btn" @click="goBack">
                <uni-icons type="back" size="20"></uni-icons>
            </view>
            <view class="title">写漂流瓶</view>
            <view class="throw-btn" :class="{ disabled: !canThrow }" @click="throwBottle">投掷</view>
        </view>

        <!-- 内容编辑区 -->
        <view class="content-area">
            <textarea class="content-input" v-model="content" placeholder="写下你想说的话，让它飘向远方..." :maxlength="1000"
                auto-height></textarea>

            <!-- 图片上传区 -->
            <view class="image-upload-area">
                <view v-for="(image, index) in images" :key="index" class="image-item">
                    <image :src="image" mode="aspectFill" class="preview-image" @click="previewImage(index)"></image>
                    <view class="delete-icon" @click.stop="deleteImage(index)">
                        <uni-icons type="close" size="20" color="#ffffff"></uni-icons>
                    </view>
                </view>

                <view v-if="images.length < 3" class="upload-btn" @click="chooseImage">
                    <uni-icons type="camera" size="24" color="#999999"></uni-icons>
                </view>
            </view>
        </view>

        <!-- 底部选项 -->
        <view class="bottom-options">
            <view class="option-item">
                <text>匿名发布</text>
                <switch :checked="isAnonymous" @change="toggleAnonymous" color="#007aff" />
            </view>

            <view class="tip-text">
                提示：漂流瓶内容将经过审核，请遵守社区规范
            </view>
        </view>
    </view>
</template>

<script>
import { throwBottle } from '@/api/driftbottle';

export default {
    data() {
        return {
            content: '',
            images: [],
            isAnonymous: false,
            isSubmitting: false
        };
    },
    computed: {
        canThrow() {
            return this.content.trim().length > 0 && !this.isSubmitting;
        }
    },
    methods: {
        goBack() {
            uni.navigateBack();
        },
        toggleAnonymous(e) {
            this.isAnonymous = e.detail.value;
        },
        chooseImage() {
            uni.chooseImage({
                count: 3 - this.images.length,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
                success: (res) => {
                    // 处理选择的图片
                    this.handleSelectedImages(res.tempFilePaths);
                }
            });
        },
        handleSelectedImages(tempFilePaths) {
            // 这里可以添加上传逻辑，或者先保存本地路径
            this.images = [...this.images, ...tempFilePaths];
        },
        deleteImage(index) {
            this.images.splice(index, 1);
        },
        previewImage(index) {
            uni.previewImage({
                urls: this.images,
                current: this.images[index]
            });
        },
        async throwBottle() {
            if (!this.canThrow) return;

            this.isSubmitting = true;
            try {
                // 先上传图片，获取URL
                const imageUrls = await this.uploadImages();

                // 创建漂流瓶数据
                const bottleData = {
                    content: this.content,
                    images: imageUrls,
                    isAnonymous: this.isAnonymous ? 1 : 0
                };

                // 提交数据
                const res = await throwBottle(bottleData);

                if (res.code === 200) {
                    uni.showToast({
                        title: '投掷成功，等待审核',
                        icon: 'success'
                    });

                    setTimeout(() => {
                        uni.navigateBack();
                    }, 1500);
                } else {
                    uni.showToast({
                        title: res.message || '投掷失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                uni.showToast({
                    title: '投掷失败，请重试',
                    icon: 'none'
                });
            } finally {
                this.isSubmitting = false;
            }
        },
        async uploadImages() {
            if (this.images.length === 0) return [];

            const promises = this.images.map(path => {
                return new Promise((resolve, reject) => {
                    uni.uploadFile({
                        url: 'http://localhost:9000/api/file/upload',
                        filePath: path,
                        name: 'file',
                        header: {
                            'Authorization': `Bearer ${uni.getStorageSync('token')}`
                        },
                        success: (res) => {
                            const data = JSON.parse(res.data);
                            if (data.code === 200) {
                                resolve(data.data);
                            } else {
                                reject(new Error(data.message || '上传失败'));
                            }
                        },
                        fail: (err) => {
                            reject(err);
                        }
                    });
                });
            });

            try {
                return await Promise.all(promises);
            } catch (error) {
                console.error('上传图片失败', error);
                uni.showToast({
                    title: '图片上传失败',
                    icon: 'none'
                });
                return [];
            }
        }
    }
};
</script>

<style>
.container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f8f8f8;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background-color: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.back-btn {
    padding: 5px;
}

.title {
    font-size: 18px;
    font-weight: bold;
}

.throw-btn {
    padding: 5px 12px;
    border-radius: 15px;
    background-color: #007aff;
    color: #ffffff;
    font-size: 14px;
}

.throw-btn.disabled {
    background-color: #cccccc;
}

.content-area {
    flex: 1;
    padding: 15px;
    background-color: #ffffff;
}

.content-input {
    width: 100%;
    min-height: 100px;
    padding: 10px;
    font-size: 16px;
    color: #333;
    line-height: 1.5;
}

.image-upload-area {
    display: flex;
    flex-wrap: wrap;
    margin-top: 15px;
}

.image-item {
    position: relative;
    width: 80px;
    height: 80px;
    margin-right: 10px;
    margin-bottom: 10px;
    border-radius: 8px;
    overflow: hidden;
}

.preview-image {
    width: 100%;
    height: 100%;
}

.delete-icon {
    position: absolute;
    top: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.5);
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.upload-btn {
    width: 80px;
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f0f0f0;
    border-radius: 8px;
    border: 1px dashed #cccccc;
}

.bottom-options {
    padding: 15px;
    background-color: #ffffff;
    margin-top: 10px;
}

.option-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
}

.tip-text {
    margin-top: 10px;
    font-size: 12px;
    color: #999999;
    text-align: center;
}
</style>