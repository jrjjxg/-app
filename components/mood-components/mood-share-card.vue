<template>
    <view class="mood-share-card">
        <!-- 卡片预览 -->
        <view id="shareCardContainer"
            class="mb-4 bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-xl border border-gray-200">
            <view v-if="loading" class="py-10 flex justify-center items-center">
                <text class="text-gray-500">生成中...</text>
            </view>
            <view v-else-if="!cardData" class="py-10 flex justify-center items-center">
                <text class="text-gray-500">暂无数据</text>
            </view>
            <view v-else class="relative">
                <!-- 卡片内容 -->
                <view class="flex justify-between items-center mb-4">
                    <text class="text-lg font-bold text-gray-800">情绪报告</text>
                    <text class="text-xs text-gray-500">{{ startDate }} 至 {{ endDate }}</text>
                </view>

                <!-- 情绪概览 -->
                <view class="flex justify-between items-center p-3 bg-white rounded-lg mb-4">
                    <view class="flex flex-col items-center">
                        <text class="text-xs text-gray-500 mb-1">记录次数</text>
                        <text class="text-xl font-bold text-blue-600">{{ cardData.totalRecords }}</text>
                    </view>

                    <view class="h-10 border-r border-gray-200"></view>

                    <view class="flex flex-col items-center">
                        <text class="text-xs text-gray-500 mb-1">主要情绪</text>
                        <text class="text-xl font-bold" :class="getEmotionColorClass(cardData.dominantEmotion)">
                            {{ cardData.dominantEmotion }}
                        </text>
                    </view>
                </view>

                <!-- 情绪分布 -->
                <view class="bg-white p-3 rounded-lg">
                    <text class="font-medium text-gray-800 mb-2 block">情绪分布</text>
                    <view v-for="(item, index) in cardData.emotionDistribution.slice(0, 3)" :key="index" class="mb-2">
                        <view class="flex justify-between items-center mb-1">
                            <view class="flex items-center">
                                <view class="w-4 h-4 rounded-full mr-2" :style="{ backgroundColor: item.color }"></view>
                                <text class="text-xs text-gray-700">{{ item.name }}</text>
                            </view>
                            <text class="text-xs text-gray-500">{{ item.percentage.toFixed(1) }}%</text>
                        </view>

                        <view class="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <view class="h-full rounded-full"
                                :style="{ width: `${item.percentage}%`, backgroundColor: item.color }"></view>
                        </view>
                    </view>
                </view>

                <!-- 水印 -->
                <view class="absolute bottom-2 right-2">
                    <text class="text-xs text-gray-400">心理顾问</text>
                </view>
            </view>
        </view>

        <!-- 分享按钮 -->
        <view class="flex space-x-3">
            <button class="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium" @tap="saveToAlbum"
                :disabled="loading || !cardData">
                保存到相册
            </button>
            <button class="flex-1 py-3 rounded-lg bg-blue-500 text-white font-medium" @tap="share"
                :disabled="loading || !cardData">
                分享
            </button>
        </view>

        <!-- 隐藏的Canvas用于生成分享图片 -->
        <canvas canvas-id="shareCanvas" style="width: 375px; height: 500px; position: fixed; left: -9999px;"></canvas>
    </view>
</template>

<script>
export default {
    name: 'MoodShareCard',
    props: {
        loading: {
            type: Boolean,
            default: false
        },
        cardData: {
            type: Object,
            default: null
        },
        startDate: {
            type: String,
            required: true
        },
        endDate: {
            type: String,
            required: true
        }
    },
    methods: {
        getEmotionColorClass(emotion) {
            const colorMap = {
                '快乐/愉悦': 'text-green-500',
                '平静/满足': 'text-blue-500',
                '焦虑/紧张': 'text-orange-500',
                '悲伤/低落': 'text-purple-500',
                '愤怒/烦躁': 'text-red-500',
                '疲惫/无力': 'text-purple-600',
                '中性/平淡': 'text-gray-500'
            };
            return colorMap[emotion] || 'text-gray-500';
        },

        saveToAlbum() {
            this.generateShareImage()
                .then(tempFilePath => {
                    uni.saveImageToPhotosAlbum({
                        filePath: tempFilePath,
                        success: () => {
                            uni.showToast({ title: '已保存到相册', icon: 'success' });
                        },
                        fail: () => {
                            uni.showToast({ title: '保存失败', icon: 'none' });
                        }
                    });
                })
                .catch(() => {
                    uni.showToast({ title: '生成图片失败', icon: 'none' });
                });
        },

        share() {
            this.generateShareImage()
                .then(tempFilePath => {
                    uni.shareAppMessage({
                        title: '我的情绪报告',
                        path: '/pages/mood-tracker/index',
                        imageUrl: tempFilePath,
                        success: () => {
                            uni.showToast({ title: '分享成功', icon: 'success' });
                        }
                    });
                })
                .catch(() => {
                    uni.showToast({ title: '分享失败', icon: 'none' });
                });
        },

        async generateShareImage() {
            return new Promise((resolve, reject) => {
                try {
                    const query = uni.createSelectorQuery().in(this);
                    query.select('#shareCardContainer').boundingClientRect(data => {
                        const ctx = uni.createCanvasContext('shareCanvas', this);

                        // 绘制背景
                        ctx.fillStyle = '#F0F4FF';
                        ctx.fillRect(0, 0, 375, 500);

                        // 绘制卡片内容
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(20, 20, 335, 460);

                        // 绘制标题
                        ctx.fillStyle = '#1F2937';
                        ctx.font = 'bold 20px sans-serif';
                        ctx.fillText('情绪报告', 40, 60);

                        // 绘制日期
                        ctx.fillStyle = '#6B7280';
                        ctx.font = '12px sans-serif';
                        ctx.fillText(`${this.startDate} 至 ${this.endDate}`, 40, 80);

                        // 绘制数据
                        if (this.cardData) {
                            // 记录次数
                            ctx.fillStyle = '#1F2937';
                            ctx.font = '14px sans-serif';
                            ctx.fillText('记录次数:', 40, 120);
                            ctx.fillStyle = '#3B82F6';
                            ctx.font = 'bold 24px sans-serif';
                            ctx.fillText(this.cardData.totalRecords, 40, 150);

                            // 主要情绪
                            ctx.fillStyle = '#1F2937';
                            ctx.font = '14px sans-serif';
                            ctx.fillText('主要情绪:', 200, 120);
                            ctx.fillStyle = '#8B5CF6';
                            ctx.font = 'bold 24px sans-serif';
                            ctx.fillText(this.cardData.dominantEmotion, 200, 150);

                            // 情绪分布
                            ctx.fillStyle = '#1F2937';
                            ctx.font = '16px sans-serif';
                            ctx.fillText('情绪分布', 40, 200);

                            // 简化的情绪分布图
                            const distributions = this.cardData.emotionDistribution.slice(0, 3);
                            distributions.forEach((item, index) => {
                                const y = 230 + index * 50;

                                // 情绪名称
                                ctx.fillStyle = '#4B5563';
                                ctx.font = '14px sans-serif';
                                ctx.fillText(item.name, 40, y);

                                // 百分比
                                ctx.fillText(`${item.percentage.toFixed(1)}%`, 300, y);

                                // 进度条背景
                                ctx.fillStyle = '#E5E7EB';
                                ctx.fillRect(40, y + 10, 280, 10);

                                // 进度条
                                ctx.fillStyle = item.color;
                                ctx.fillRect(40, y + 10, 280 * (item.percentage / 100), 10);
                            });
                        }

                        // 水印
                        ctx.fillStyle = '#9CA3AF';
                        ctx.font = '12px sans-serif';
                        ctx.fillText('心理顾问小程序', 260, 460);

                        ctx.draw(true, () => {
                            setTimeout(() => {
                                uni.canvasToTempFilePath({
                                    canvasId: 'shareCanvas',
                                    success: res => resolve(res.tempFilePath),
                                    fail: err => reject(err)
                                }, this);
                            }, 300);
                        });
                    }).exec();
                } catch (error) {
                    reject(error);
                }
            });
        }
    }
}
</script>

<style>
#shareCardContainer {
    transition: all 0.3s ease;
}
</style>