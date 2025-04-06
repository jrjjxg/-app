<!-- 添加到用户中心的功能区域 -->
<template>
    <view class="user-function-section">
        <view class="section-title">数据分析</view>
        <view class="function-grid">
            <view class="function-item" @tap="navigateToReports">
                <view class="function-icon bg-blue-100">
                    <text class="iconfont icon-chart text-blue-600"></text>
                </view>
                <text class="function-name">使用报告</text>
            </view>
            <!-- 其他功能项 -->
        </view>
    </view>
</template>

<script>
export default {
    // 原有代码...
    methods: {
        // 原有方法...
        navigateToReports() {
            uni.navigateTo({
                url: '/pages/reports/index'
            });
        }
    }
}
</script>