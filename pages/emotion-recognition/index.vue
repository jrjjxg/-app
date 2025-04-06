<template>
    <view class="emotion-recognition-container">
        <!-- 头部 -->
        <view class="header bg-gradient-to-r from-blue-500 to-indigo-600 px-4 pt-12 pb-6">
            <view class="flex items-center justify-between">
                <view>
                    <text class="text-xl font-bold text-white">情绪识别</text>
                    <text class="text-white/80 block mt-1">通过照片分析你的情绪状态</text>
                </view>
                <view class="px-3 py-1.5 bg-white/20 rounded-full" @tap="goBack">
                    <text class="text-white text-sm">返回</text>
                </view>
            </view>
        </view>

        <!-- 内容区域 -->
        <view class="content-container px-4 py-5">
            <!-- 上传区域 -->
            <view class="upload-section bg-white rounded-xl shadow-sm p-5 mb-6">
                <text class="text-gray-800 font-medium mb-3 block">上传照片</text>

                <view v-if="!imageUrl" class="upload-area" @tap="chooseImage">
                    <uni-icons type="camera" size="40" color="#9CA3AF"></uni-icons>
                    <text class="text-gray-500 mt-2">点击上传面部表情照片</text>
                    <text class="text-xs text-gray-400 mt-1">支持jpg、png、jpeg格式</text>
                </view>

                <view v-else class="preview-area">
                    <image :src="imageUrl" mode="aspectFit" class="preview-image"></image>
                    <view class="preview-actions">
                        <button class="action-btn secondary" @tap="chooseImage">重新选择</button>
                        <button class="action-btn primary" @tap="analyzeEmotion" :disabled="analyzing">
                            {{ analyzing ? '分析中...' : '分析情绪' }}
                        </button>
                    </view>
                </view>
            </view>

            <!-- 分析结果 -->
            <view v-if="result" class="result-section bg-white rounded-xl shadow-sm p-5">
                <text class="text-gray-800 font-medium mb-3 block">分析结果</text>

                <view class="result-card">
                    <view class="result-header">
                        <view class="emotion-badge" :class="getEmotionClass(result.predicted_class)">
                            <text class="emotion-text">{{ getEmotionLabel(result.predicted_class) }}</text>
                        </view>
                        <text class="probability">{{ (result.predicted_probability * 100).toFixed(2) }}% 可能性</text>
                    </view>

                    <view class="chart-container">
                        <view v-for="(prob, emotion) in result.all_probabilities" :key="emotion" class="emotion-bar">
                            <view class="emotion-label">{{ getEmotionLabel(emotion) }}</view>
                            <view class="progress-bar">
                                <view class="progress-fill"
                                    :style="{ width: `${prob * 100}%`, backgroundColor: getEmotionColor(emotion) }">
                                </view>
                            </view>
                            <view class="probability-value">{{ (prob * 100).toFixed(1) }}%</view>
                        </view>
                    </view>

                    <view class="result-actions mt-4">
                        <button class="action-btn secondary" @tap="saveResult">保存结果</button>
                        <button class="action-btn primary" @tap="shareResult">分享给AI助手</button>
                    </view>
                </view>
            </view>

            <!-- 提示信息 -->
            <view v-if="!result && !analyzing" class="tips-section mt-4">
                <text class="text-sm text-gray-500">提示：</text>
                <text class="text-sm text-gray-500 block">• 请确保照片中有清晰的面部表情</text>
                <text class="text-sm text-gray-500 block">• 光线充足的环境下拍摄效果更佳</text>
                <text class="text-sm text-gray-500 block">• 直面摄像头获得最准确的分析</text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            imageUrl: '',
            imageFile: null,
            analyzing: false,
            result: null,
            emotionLabels: {
                'angry': '愤怒',
                'disgust': '厌恶',
                'fear': '恐惧',
                'happy': '快乐',
                'sad': '悲伤',
                'surprise': '惊讶',
                'neutral': '平静'
            },
            emotionColors: {
                'angry': '#EF4444',
                'disgust': '#8B5CF6',
                'fear': '#EC4899',
                'happy': '#10B981',
                'sad': '#6B7280',
                'surprise': '#F59E0B',
                'neutral': '#3B82F6'
            }
        };
    },

    methods: {
        goBack() {
            uni.navigateBack();
        },

        chooseImage() {
            uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['camera', 'album'],
                success: (res) => {
                    this.imageUrl = res.tempFilePaths[0];
                    this.imageFile = res.tempFiles[0];
                    // 重置结果
                    this.result = null;
                }
            });
        },

        analyzeEmotion() {
            if (!this.imageUrl) {
                uni.showToast({
                    title: '请先上传照片',
                    icon: 'none'
                });
                return;
            }

            this.analyzing = true;

            // 创建FormData
            const formData = new FormData();
            formData.append('file', this.imageFile);

            // 获取API URL
            let apiUrl = 'http://localhost:5000/api/predict';

            // 发起请求
            uni.uploadFile({
                url: apiUrl,
                filePath: this.imageUrl,
                name: 'file',
                success: (uploadRes) => {
                    try {
                        // 解析响应
                        const data = JSON.parse(uploadRes.data);
                        this.result = data;

                        // 记录情绪识别到历史
                        this.saveToHistory();
                    } catch (error) {
                        console.error('解析响应失败', error);
                        uni.showToast({
                            title: '解析结果失败',
                            icon: 'none'
                        });
                    }
                },
                fail: (error) => {
                    console.error('请求失败', error);
                    uni.showToast({
                        title: '分析失败，请重试',
                        icon: 'none'
                    });
                },
                complete: () => {
                    this.analyzing = false;
                }
            });
        },

        getEmotionLabel(emotion) {
            return this.emotionLabels[emotion] || emotion;
        },

        getEmotionColor(emotion) {
            return this.emotionColors[emotion] || '#6B7280';
        },

        getEmotionClass(emotion) {
            const classMap = {
                'angry': 'bg-red-500',
                'disgust': 'bg-purple-500',
                'fear': 'bg-pink-500',
                'happy': 'bg-green-500',
                'sad': 'bg-gray-500',
                'surprise': 'bg-amber-500',
                'neutral': 'bg-blue-500'
            };
            return classMap[emotion] || 'bg-gray-500';
        },

        saveToHistory() {
            // 这里可以添加保存到本地历史记录的逻辑
            // 例如使用uni.setStorageSync存储到本地
            try {
                let history = uni.getStorageSync('emotion_history') || [];
                history.unshift({
                    date: new Date().toISOString(),
                    emotion: this.result.predicted_class,
                    probability: this.result.predicted_probability,
                    imageBase64: this.result.image_base64
                });

                // 限制历史记录数量
                if (history.length > 20) {
                    history = history.slice(0, 20);
                }

                uni.setStorageSync('emotion_history', history);
            } catch (e) {
                console.error('保存历史记录失败', e);
            }
        },

        saveResult() {
            uni.showToast({
                title: '结果已保存',
                icon: 'success'
            });
        },

        shareResult() {
            // 跳转到聊天页面并带上分析结果
            uni.navigateTo({
                url: '/pages/ai-chat/index?shareContent=' + encodeURIComponent(JSON.stringify({
                    type: 'emotion_analysis',
                    data: {
                        emotion: this.result.predicted_class,
                        probability: this.result.predicted_probability
                    }
                }))
            });
        }
    }
}
</script>

<style>
.emotion-recognition-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #F3F4F6;
}

.content-container {
    flex: 1;
}

.upload-area {
    border: 2px dashed #D1D5DB;
    border-radius: 12px;
    padding: 32px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.preview-area {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.preview-image {
    width: 100%;
    height: 200px;
    border-radius: 8px;
    margin-bottom: 16px;
}

.preview-actions {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.action-btn {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
}

.primary {
    background-color: #3B82F6;
    color: white;
}

.secondary {
    background-color: #F3F4F6;
    color: #4B5563;
    border: 1px solid #D1D5DB;
}

.result-card {
    background-color: #F9FAFB;
    border-radius: 8px;
    padding: 16px;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.emotion-badge {
    padding: 4px 12px;
    border-radius: 16px;
    color: white;
    font-weight: 500;
}

.probability {
    font-size: 14px;
    color: #4B5563;
}

.chart-container {
    margin-bottom: 16px;
}

.emotion-bar {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.emotion-label {
    width: 40px;
    font-size: 12px;
    color: #4B5563;
}

.progress-bar {
    flex: 1;
    height: 8px;
    background-color: #E5E7EB;
    border-radius: 4px;
    margin: 0 8px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 4px;
}

.probability-value {
    width: 40px;
    font-size: 12px;
    color: #4B5563;
    text-align: right;
}

.result-actions {
    display: flex;
    justify-content: space-between;
}
</style>