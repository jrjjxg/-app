<template>
    <!-- 添加漂流瓶入口 -->
    <view class="function-item" @click="navigateToDriftBottle">
        <view class="function-icon">
            <uni-icons type="paperplane" size="20" color="#007aff"></uni-icons>
        </view>
        <view class="function-text">漂流瓶</view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
    </view>
</template>

<script>
export default {
    methods: {
        // 跳转到漂流瓶页面
        navigateToDriftBottle() {
            uni.navigateTo({
                url: '/pages/driftbottle/index'
            });
        }
    }
}
</script>