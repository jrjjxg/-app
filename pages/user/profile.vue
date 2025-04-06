<template>
    <!-- 在个人资料页中添加报告入口 -->
    <view class="function-group">
        <view class="function-title">我的分析</view>
        <view class="grid grid-cols-4 gap-4">
            <view class="function-card" @tap="navigateToReports">
                <view class="card-icon">
                    <text class="iconfont icon-chart"></text>
                </view>
                <view class="card-name">使用报告</view>
            </view>
            <!-- 其他功能卡片 -->
        </view>
    </view>
</template>

<script>
export default {
    methods: {
        navigateToReports() {
            uni.navigateTo({
                url: '/pages/reports/index'
            });
        }
    }
}
</script>