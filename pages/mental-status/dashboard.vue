<template>
    <view class="dashboard-container">
        <!-- 顶部状态栏 -->
        <view class="status-bar" :class="statusClass">
            <view class="status-info">
                <view class="status-title">当前心理状态</view>
                <view class="status-value">{{ statusText }}</view>
            </view>
            <view class="status-action" v-if="latestAlert && latestAlert.riskLevel > 2">
                <button class="action-btn" @click="showHelpResources">寻求帮助</button>
            </view>
        </view>

        <!-- 健康指数卡片 -->
        <view class="card health-index-card">
            <view class="card-header">
                <text class="card-title">心理健康指数</text>
                <text class="update-time">{{ lastUpdateText }}</text>
            </view>

            <view class="health-chart">
                <view class="chart-container">
                    <!-- 使用自定义组件或图表库 -->
                    <view class="circle-progress">
                        <view class="health-score">{{ healthIndex }}</view>
                    </view>
                </view>

                <view class="health-dimensions">
                    <view v-for="(dimension, index) in dimensions" :key="index" class="dimension-item">
                        <view class="dimension-label">{{ dimension.name }}</view>
                        <view class="dimension-bar-container">
                            <view class="dimension-bar"
                                :style="{ width: `${dimension.score}%`, backgroundColor: dimension.color }"></view>
                        </view>
                        <view class="dimension-value">{{ dimension.score }}</view>
                    </view>
                </view>
            </view>

            <view class="assess-action" @click="runRiskAssessment">
                <uni-icons type="refresh" size="14" color="#6b7280"></uni-icons>
                <text class="assess-text">重新评估</text>
            </view>
        </view>

        <!-- 最近预警卡片 -->
        <view class="card alerts-card" v-if="recentAlerts.length > 0">
            <view class="card-header">
                <text class="card-title">最近预警</text>
                <text class="view-more" @click="navigateToAlertHistory">查看更多</text>
            </view>

            <view v-for="(alert, index) in recentAlerts.slice(0, 3)" :key="alert.id" class="alert-item"
                :class="{ 'border-bottom': index < Math.min(recentAlerts.length, 3) - 1 }">
                <view class="alert-icon" :class="'level-' + alert.riskLevel">
                    <uni-icons :type="getAlertIcon(alert.riskLevel)" size="20" color="#ffffff"></uni-icons>
                </view>
                <view class="alert-content">
                    <view class="alert-title">{{ getRiskLevelText(alert.riskLevel) }}</view>
                    <view class="alert-desc">{{ alert.content }}</view>
                    <view class="alert-time">{{ formatTime(alert.createTime) }}</view>
                </view>
            </view>
        </view>

        <!-- 资源推荐卡片 -->
        <view class="card resources-card">
            <view class="card-header">
                <text class="card-title">推荐资源</text>
            </view>

            <view class="resources-list">
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
        </view>

        <!-- 心理支持入口 -->
        <view class="support-actions">
            <view class="support-btn" @click="navigateToConsultation">
                <uni-icons type="chat" size="24" color="#4f46e5"></uni-icons>
                <text>寻求咨询</text>
            </view>
            <view class="support-btn" @click="navigateToTests">
                <uni-icons type="checkbox" size="24" color="#4f46e5"></uni-icons>
                <text>心理测评</text>
            </view>
        </view>
    </view>
</template>

<script>
import { triggerRiskAssessment, getAlertRecords } from '@/api/alert.js';

export default {
    data() {
        return {
            // 健康指数与维度
            healthIndex: 85,
            dimensions: [
                { name: '情绪稳定', score: 75, color: '#4f46e5' },
                { name: '压力控制', score: 82, color: '#8b5cf6' },
                { name: '社交能力', score: 90, color: '#a855f7' },
                { name: '睡眠质量', score: 68, color: '#ec4899' }
            ],
            lastUpdateTime: new Date(),

            // 预警记录
            recentAlerts: [],
            latestAlert: null,

            // 推荐资源
            recommendedResources: [
                {
                    id: 'resource1',
                    name: '冥想放松练习',
                    description: '缓解压力的音频引导',
                    icon: 'sound',
                    color: '#8b5cf6',
                    type: 'media',
                    link: '/pages/media/detail?id=123'
                },
                {
                    id: 'resource2',
                    name: '如何应对焦虑',
                    description: '专业心理医生的建议',
                    icon: 'info',
                    color: '#ec4899',
                    type: 'article',
                    link: '/pages/articles/detail?id=456'
                },
                {
                    id: 'resource3',
                    name: '寻找心理咨询师',
                    description: '附近专业人士',
                    icon: 'contact',
                    color: '#10b981',
                    type: 'consultation',
                    link: '/pages/consultation/search'
                }
            ]
        };
    },

    computed: {
        // 状态文本和样式
        statusText() {
            if (!this.latestAlert) return '状态良好';

            const level = this.latestAlert.riskLevel;
            if (level >= 5) return '需要立即关注';
            if (level >= 4) return '需要密切关注';
            if (level >= 3) return '需要适度关注';
            if (level >= 2) return '需要轻微关注';
            return '状态良好';
        },

        statusClass() {
            if (!this.latestAlert) return 'status-normal';

            const level = this.latestAlert.riskLevel;
            if (level >= 5) return 'status-critical';
            if (level >= 4) return 'status-severe';
            if (level >= 3) return 'status-moderate';
            if (level >= 2) return 'status-mild';
            return 'status-normal';
        },

        // 上次更新时间文本
        lastUpdateText() {
            const now = new Date();
            const diff = Math.floor((now - this.lastUpdateTime) / (1000 * 60));

            if (diff < 60) {
                return `${diff}分钟前更新`;
            } else if (diff < 24 * 60) {
                return `${Math.floor(diff / 60)}小时前更新`;
            } else {
                return `${Math.floor(diff / (24 * 60))}天前更新`;
            }
        }
    },

    onLoad() {
        this.loadData();
    },

    methods: {
        // 加载数据
        async loadData() {
            try {
                // 获取预警记录
                const alertRes = await getAlertRecords(1, 10);
                if (alertRes.code === 200 && alertRes.data && alertRes.data.records) {
                    this.recentAlerts = alertRes.data.records;

                    // 获取最新的预警记录
                    if (this.recentAlerts.length > 0) {
                        this.latestAlert = this.recentAlerts[0];
                        this.lastUpdateTime = new Date(this.latestAlert.createTime);

                        // 根据风险级别更新健康指数
                        this.updateHealthIndex(this.latestAlert.riskLevel);
                    }
                }
            } catch (error) {
                console.error('加载数据失败：', error);
                uni.showToast({
                    title: '加载数据失败',
                    icon: 'none'
                });
            }
        },

        // 根据风险级别更新健康指数
        updateHealthIndex(riskLevel) {
            // 风险级别与健康指数的映射关系
            const indexMapping = {
                1: 95,
                2: 85,
                3: 70,
                4: 55,
                5: 30
            };

            this.healthIndex = indexMapping[riskLevel] || 85;

            // 同时更新维度分数
            // 这里只是简单示例，实际可能需要从后端获取详细维度数据
            const baseDimension = this.healthIndex * 0.01;
            this.dimensions = [
                { name: '情绪稳定', score: Math.round(baseDimension * 85 + Math.random() * 10), color: '#4f46e5' },
                { name: '压力控制', score: Math.round(baseDimension * 92 + Math.random() * 10), color: '#8b5cf6' },
                { name: '社交能力', score: Math.round(baseDimension * 100 + Math.random() * 10), color: '#a855f7' },
                { name: '睡眠质量', score: Math.round(baseDimension * 78 + Math.random() * 10), color: '#ec4899' }
            ];
        },

        // 触发风险评估
        async runRiskAssessment() {
            uni.showLoading({
                title: '评估中...'
            });

            try {
                const res = await triggerRiskAssessment();
                uni.hideLoading();

                if (res.code === 200) {
                    if (res.data.status === 'no_risk') {
                        uni.showToast({
                            title: '评估完成，未发现风险',
                            icon: 'success'
                        });

                        // 更新为正常状态
                        this.updateHealthIndex(1);
                    } else {
                        uni.showToast({
                            title: '评估完成，请查看结果',
                            icon: 'none'
                        });

                        // 重新加载数据
                        this.loadData();
                    }
                } else {
                    uni.showToast({
                        title: res.message || '评估失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                uni.hideLoading();
                console.error('风险评估失败：', error);
                uni.showToast({
                    title: '评估失败，请稍后重试',
                    icon: 'none'
                });
            }
        },

        // 获取预警图标
        getAlertIcon(level) {
            const icons = ['info', 'info', 'notification', 'warn', 'error'];
            return icons[level - 1] || 'info';
        },

        // 获取风险级别文本
        getRiskLevelText(level) {
            const texts = ['正常', '轻度风险', '中度风险', '高度风险', '紧急风险'];
            return texts[level - 1] || '未知风险';
        },

        // 格式化时间
        formatTime(timeStr) {
            if (!timeStr) return '';

            const date = new Date(timeStr);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        },

        // 显示帮助资源
        showHelpResources() {
            uni.showActionSheet({
                itemList: ['联系紧急联系人', '拨打心理咨询热线', '查看专业机构'],
                success: (res) => {
                    switch (res.tapIndex) {
                        case 0:
                            uni.navigateTo({ url: '/pages/settings/emergency-contacts' });
                            break;
                        case 1:
                            uni.makePhoneCall({
                                phoneNumber: '8008207117' // 国家心理健康热线
                            });
                            break;
                        case 2:
                            uni.navigateTo({ url: '/pages/resources/mental-health-institutions' });
                            break;
                    }
                }
            });
        },

        // 打开资源
        openResource(resource) {
            if (resource.link) {
                uni.navigateTo({ url: resource.link });
            }
        },

        // 导航到预警历史页面
        navigateToAlertHistory() {
            uni.navigateTo({ url: '/pages/mental-status/alert-history' });
        },

        // 导航到咨询页面
        navigateToConsultation() {
            uni.navigateTo({ url: '/pages/consultation/index' });
        },

        // 导航到测评页面
        navigateToTests() {
            uni.switchTab({ url: '/pages/psychological-test/index' });
        }
    }
};
</script>

<style>
.dashboard-container {
    padding: 20px 16px;
    background-color: #f9fafb;
    min-height: 100vh;
}

/* 状态栏样式 */
.status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 16px;
}

.status-normal {
    background-color: #d1fae5;
    color: #065f46;
}

.status-mild {
    background-color: #e0f2fe;
    color: #0369a1;
}

.status-moderate {
    background-color: #fef3c7;
    color: #92400e;
}

.status-severe {
    background-color: #fee2e2;
    color: #b91c1c;
}

.status-critical {
    background-color: #fee2e2;
    color: #7f1d1d;
}

.status-title {
    font-size: 14px;
    margin-bottom: 4px;
}

.status-value {
    font-size: 18px;
    font-weight: 600;
}

.action-btn {
    background-color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
}

/* 卡片样式 */
.card {
    background-color: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.card-title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
}

.update-time {
    font-size: 12px;
    color: #6b7280;
}

.view-more {
    font-size: 12px;
    color: #4f46e5;
}

/* 健康指数卡片 */
.health-chart {
    display: flex;
    margin-bottom: 16px;
}

.chart-container {
    width: 100px;
    min-width: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.circle-progress {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: conic-gradient(#4f46e5 0%, #8b5cf6 40%, #d8b4fe 70%, #f0f9ff 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

.circle-progress::after {
    content: '';
    position: absolute;
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background-color: white;
}

.health-score {
    position: relative;
    z-index: 1;
    font-size: 24px;
    font-weight: 700;
    color: #4f46e5;
}

.health-dimensions {
    flex: 1;
    margin-left: 16px;
}

.dimension-item {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}

.dimension-label {
    width: 70px;
    font-size: 12px;
    color: #4b5563;
}

.dimension-bar-container {
    flex: 1;
    height: 8px;
    background-color: #f3f4f6;
    border-radius: 4px;
    overflow: hidden;
    margin: 0 8px;
}

.dimension-bar {
    height: 100%;
    border-radius: 4px;
}

.dimension-value {
    width: 25px;
    font-size: 12px;
    color: #4b5563;
    text-align: right;
}

.assess-action {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #6b7280;
    padding: 8px 0;
    border-top: 1px solid #f3f4f6;
}

.assess-text {
    margin-left: 6px;
}

/* 预警卡片 */
.alert-item {
    display: flex;
    padding: 12px 0;
}

.border-bottom {
    border-bottom: 1px solid #f3f4f6;
}

.alert-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 12px;
}

.level-1 {
    background-color: #10b981;
}

.level-2 {
    background-color: #3b82f6;
}

.level-3 {
    background-color: #f59e0b;
}

.level-4 {
    background-color: #ef4444;
}

.level-5 {
    background-color: #b91c1c;
}

.alert-content {
    flex: 1;
}

.alert-title {
    font-size: 16px;
    font-weight: 500;
    color: #111827;
    margin-bottom: 4px;
}

.alert-desc {
    font-size: 14px;
    color: #4b5563;
    margin-bottom: 4px;
}

.alert-time {
    font-size: 12px;
    color: #9ca3af;
}

/* 资源推荐卡片 */
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
    font-size: 16px;
    font-weight: 500;
    color: #111827;
    margin-bottom: 2px;
}

.resource-desc {
    font-size: 12px;
    color: #6b7280;
}

/* 支持入口 */
.support-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
}

.support-btn {
    flex: 1;
    background-color: white;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.support-btn text {
    margin-top: 8px;
    font-size: 14px;
    color: #4b5563;
}
</style>