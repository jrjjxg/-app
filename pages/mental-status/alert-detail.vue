<template>
    <view class="alert-detail-container">
        <template v-if="loading">
            <view class="loading-container">
                <uni-load-more status="loading"></uni-load-more>
            </view>
        </template>

        <template v-else-if="!alertData">
            <view class="error-container">
                <uni-icons type="info" size="40" color="#9ca3af"></uni-icons>
                <text class="error-text">未找到预警记录</text>
                <button class="back-btn" @click="goBack">返回</button>
            </view>
        </template>

        <template v-else>
            <view class="alert-header" :class="'level-' + alertData.riskLevel">
                <view class="risk-level">
                    <text class="level-text">{{ getRiskLevelText(alertData.riskLevel) }}</text>
                    <text class="source-text">来源: {{ getSourceText(alertData.dataSourceType) }}</text>
                </view>
                <view class="alert-time">{{ formatTime(alertData.createTime) }}</view>
            </view>

            <view class="alert-content">
                <view class="content-section">
                    <view class="section-title">预警内容</view>
                    <view class="section-body">{{ alertData.content }}</view>
                </view>

                <view class="content-section">
                    <view class="section-title">建议措施</view>
                    <view class="section-body">{{ alertData.suggestion }}</view>
                </view>

                <view class="content-section">
                    <view class="section-title">处理状态</view>
                    <view class="status-tag" :class="'status-' + alertData.status">
                        {{ getStatusText(alertData.status) }}
                    </view>
                </view>
            </view>

            <view class="action-area">
                <button class="action-btn primary" v-if="alertData.status === 0 || alertData.status === 1"
                    @click="handleAlert(2)">
                    采取干预措施
                </button>

                <button class="action-btn secondary"
                    v-if="alertData.status === 0 || alertData.status === 1 || alertData.status === 2"
                    @click="handleAlert(3)">
                    标记为已解决
                </button>

                <button class="action-btn outline" @click="goBack">返回</button>
            </view>

            <!-- 资源推荐卡片 -->
            <view class="resources-card">
                <view class="card-title">推荐资源</view>

                <view v-for="(resource, index) in recommendedResources" :key="index" class="resource-item"
                    @click="openResource(resource)">
                    <view class="resource-icon" :style="{ backgroundColor: resource.color }">
                        <uni-icons :type="resource.icon" size="24" color="#ffffff"></uni-icons>
                    </view>
                    <view class="resource-info">
                        <view class="resource-name">{{ resource.name }}</view>
                        <view class="resource-desc">{{ resource.description }}</view>
                    </view>
                    <uni-icons type="right" size="16" color="#d1d5db"></uni-icons>
                </view>
            </view>
        </template>
    </view>
</template>

<script>
import { getAlertDetail, handleAlert } from '@/api/alert';
import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default {
    data() {
        return {
            alertId: '',
            alertData: null,
            loading: true,
            recommendedResources: [
                {
                    name: '放松练习',
                    description: '减轻焦虑和压力的呼吸与冥想练习',
                    icon: 'hand-up',
                    color: '#10b981',
                    url: '/pages/resources/relaxation'
                },
                {
                    name: '心理热线',
                    description: '24小时专业心理咨询热线',
                    icon: 'phone-filled',
                    color: '#3b82f6',
                    url: '/pages/resources/helplines'
                },
                {
                    name: '情绪日记',
                    description: '记录并跟踪您的情绪变化',
                    icon: 'compose',
                    color: '#8b5cf6',
                    url: '/pages/mood/mood-record'
                }
            ]
        };
    },

    onLoad(options) {
        if (options.id) {
            this.alertId = options.id;
            this.fetchAlertDetail();
        } else {
            this.loading = false;
            uni.showToast({
                title: '预警ID无效',
                icon: 'none'
            });
        }
    },

    methods: {
        async fetchAlertDetail() {
            this.loading = true;
            try {
                const res = await getAlertDetail(this.alertId);
                if (res.code === 200 && res.data) {
                    this.alertData = res.data;
                } else {
                    uni.showToast({
                        title: '获取预警详情失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('获取预警详情失败', error);
                uni.showToast({
                    title: '获取预警详情失败',
                    icon: 'none'
                });
            } finally {
                this.loading = false;
            }
        },

        getRiskLevelText(level) {
            const levelMap = {
                1: '正常',
                2: '轻度风险',
                3: '中度风险',
                4: '严重风险',
                5: '紧急风险'
            };
            return levelMap[level] || '未知风险';
        },

        getSourceText(sourceType) {
            const sourceMap = {
                'TEST_RESULT': '心理测试',
                'MOOD_RECORD': '情绪记录',
                'JOURNAL': '日记内容',
                'USER_BEHAVIOR': '用户行为',
                'CUSTOM': '自定义数据源'
            };
            return sourceMap[sourceType] || '未知来源';
        },

        getStatusText(status) {
            const statusMap = {
                0: '未处理',
                1: '已通知',
                2: '已干预',
                3: '已解决'
            };
            return statusMap[status] || '未知状态';
        },

        formatTime(time) {
            if (!time) return '';
            try {
                const date = new Date(time);
                return formatDistance(date, new Date(), { addSuffix: true, locale: zhCN });
            } catch (e) {
                return time;
            }
        },

        goBack() {
            uni.navigateBack();
        },

        async handleAlert(status) {
            try {
                uni.showLoading({ title: '处理中...' });
                const res = await handleAlert(this.alertId, status);

                if (res.code === 200 && res.data) {
                    uni.showToast({
                        title: '处理成功',
                        icon: 'success'
                    });

                    // 更新本地数据
                    this.alertData.status = status;

                    // 如果标记为已解决，返回上一页
                    if (status === 3) {
                        setTimeout(() => {
                            uni.navigateBack();
                        }, 1500);
                    }
                } else {
                    uni.showToast({
                        title: '处理失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('处理预警失败', error);
                uni.showToast({
                    title: '处理失败',
                    icon: 'none'
                });
            } finally {
                uni.hideLoading();
            }
        },

        openResource(resource) {
            if (resource.url) {
                uni.navigateTo({
                    url: resource.url
                });
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.alert-detail-container {
    min-height: 100vh;
    background-color: #f9fafb;
    padding-bottom: 30px;
}

.loading-container,
.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 30px;
}

.error-text {
    margin: 16px 0;
    font-size: 16px;
    color: #6b7280;
}

.back-btn {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #5b21b6;
    color: white;
    border-radius: 8px;
}

.alert-header {
    padding: 20px;
    background-color: #3b82f6;
    color: white;
}

.level-2 {
    background-color: #f59e0b;
}

.level-3 {
    background-color: #f97316;
}

.level-4 {
    background-color: #ef4444;
}

.level-5 {
    background-color: #b91c1c;
}

.risk-level {
    margin-bottom: 8px;
}

.level-text {
    font-size: 20px;
    font-weight: 600;
}

.source-text {
    font-size: 14px;
    opacity: 0.8;
    margin-left: 10px;
}

.alert-time {
    font-size: 14px;
    opacity: 0.8;
}

.alert-content {
    background-color: white;
    border-radius: 12px;
    margin: 16px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.content-section {
    margin-bottom: 20px;
}

.content-section:last-child {
    margin-bottom: 0;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 8px;
}

.section-body {
    font-size: 15px;
    color: #4b5563;
    line-height: 1.6;
}

.status-tag {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 14px;
    color: white;
    background-color: #6b7280;
}

.status-0 {
    background-color: #6b7280;
}

.status-1 {
    background-color: #3b82f6;
}

.status-2 {
    background-color: #f59e0b;
}

.status-3 {
    background-color: #10b981;
}

.action-area {
    padding: 0 16px;
    margin-bottom: 16px;
}

.action-btn {
    height: 44px;
    border-radius: 8px;
    margin-bottom: 12px;
    font-size: 16px;
}

.action-btn.primary {
    background-color: #5b21b6;
    color: white;
}

.action-btn.secondary {
    background-color: #4b5563;
    color: white;
}

.action-btn.outline {
    background-color: white;
    color: #4b5563;
    border: 1px solid #d1d5db;
}

.resources-card {
    background-color: white;
    border-radius: 12px;
    margin: 16px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 12px;
}

.resource-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
}

.resource-item:last-child {
    border-bottom: none;
}

.resource-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 12px;
}

.resource-info {
    flex: 1;
}

.resource-name {
    font-size: 15px;
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 4px;
}

.resource-desc {
    font-size: 12px;
    color: #6b7280;
}
</style>