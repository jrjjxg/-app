<template>
    <view class="font-selector-modal">
        <view class="modal-content">
            <view class="modal-header">
                <text class="modal-title">选择字体</text>
                <text class="close-btn" @tap="close">×</text>
            </view>
            <scroll-view class="fonts-list" scroll-y>
                <view v-for="font in fonts" :key="font.id" class="font-item" :style="{ fontFamily: font.family }"
                    @tap="selectFont(font.family)">
                    <text>{{ font.name }}</text>
                    <text class="sample">汉字 ABC 123</text>
                </view>
            </scroll-view>
        </view>
    </view>
</template>

<script setup>
const fonts = [
    { id: 'default', name: '默认字体', family: 'sans-serif' },
    { id: 'serif', name: '衬线体', family: 'serif' },
    { id: 'monospace', name: '等宽字体', family: 'monospace' },
    { id: 'kaiti', name: '楷体', family: 'Kaiti, STKaiti' },
    { id: 'songti', name: '宋体', family: 'SimSun, NSimSun' },
    { id: 'heiti', name: '黑体', family: 'SimHei, Heiti' },
    { id: 'yahei', name: '微软雅黑', family: 'Microsoft YaHei' },
    { id: 'pingfang', name: '苹方', family: 'PingFang SC' }
];

const emit = defineEmits(['select', 'close']);

const selectFont = (fontFamily) => {
    emit('select', fontFamily);
};

const close = () => {
    emit('close');
};
</script>

<style>
.font-selector-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    width: 80%;
    max-height: 70vh;
    background-color: white;
    border-radius: 12rpx;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1px solid #eee;
}

.modal-title {
    font-size: 32rpx;
    font-weight: bold;
}

.close-btn {
    font-size: 40rpx;
    line-height: 1;
}

.fonts-list {
    flex: 1;
    max-height: 60vh;
}

.font-item {
    padding: 20rpx 30rpx;
    border-bottom: 1px solid #f5f5f5;
    display: flex;
    flex-direction: column;
}

.font-item:active {
    background-color: #f5f5f5;
}

.sample {
    margin-top: 10rpx;
    font-size: 28rpx;
    color: #666;
}
</style>