<template>
    <navigator :url="url" v-if="url" class="tool-card-wrapper" open-type="navigate">
        <view class="inline-block mr-4 w-64 bg-white rounded-xl shadow-md overflow-hidden card-hover h-64"
            :class="{ 'card-active': activeCard === cardId }" @tap.stop="$emit('tap')">
            <!-- 卡片顶部图片区域 -->
            <view class="relative">
                <image src="/static/images/mood-journal-cover.png"
                    class="w-full h-32 object-cover transition-transform duration-700"
                    :class="{ 'scale-110': activeCard === cardId }" />
                <!-- 图片上的渐变遮罩和标题 -->
                <view class="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 flex items-end p-4">
                    <view class="flex items-center">
                        <!-- 图标容器 -->
                        <view
                            class="w-8 h-8 rounded-full flex items-center justify-center mr-2 transform transition-transform duration-500"
                            :class="[iconBg, { 'rotate-12': activeCard === cardId }]">
                            <uni-icons :type="icon" size="16" :color="iconColor"></uni-icons>
                        </view>
                        <!-- 卡片标题 -->
                        <text class="font-medium text-white text-lg">{{ title }}</text>
                    </view>
                </view>
                <!-- 右上角时间标签 -->
                <view class="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
                    <text class="text-xs text-gray-700">{{ timeText }}</text>
                </view>
            </view>
            <!-- 卡片内容区域 -->
            <view class="p-4 flex flex-col justify-between" style="height: calc(100% - 8rem);">
                <!-- 描述文本，最多显示两行 -->
                <text class="text-xs text-gray-500 block line-clamp-2">{{ description }}</text>
                <!-- 底部按钮区域 -->
                <view class="mt-3 flex justify-end items-center">
                    <!-- 渐变按钮 -->
                    <view
                        class="bg-gradient-to-r px-4 py-2 rounded-full transform transition-transform duration-300 hover-scale"
                        :class="buttonGradient" @tap="$emit('button-click')">
                        <text class="text-xs text-white font-medium">{{ buttonText }}</text>
                    </view>
                </view>
            </view>
        </view>
    </navigator>

    <!-- 无导航链接的卡片版本 -->
    <view v-else class="inline-block mr-4 w-64 bg-white rounded-xl shadow-md overflow-hidden card-hover h-64"
        :class="{ 'card-active': activeCard === cardId }" @tap="$emit('tap')">
        <!-- 卡片顶部图片区域 -->
        <view class="relative">
            <image src="/static/images/mood-journal-cover.png"
                class="w-full h-32 object-cover transition-transform duration-700"
                :class="{ 'scale-110': activeCard === cardId }" />
            <!-- 图片上的渐变遮罩和标题 -->
            <view class="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 flex items-end p-4">
                <view class="flex items-center">
                    <!-- 图标容器 -->
                    <view
                        class="w-8 h-8 rounded-full flex items-center justify-center mr-2 transform transition-transform duration-500"
                        :class="[iconBg, { 'rotate-12': activeCard === cardId }]">
                        <uni-icons :type="icon" size="16" :color="iconColor"></uni-icons>
                    </view>
                    <!-- 卡片标题 -->
                    <text class="font-medium text-white text-lg">{{ title }}</text>
                </view>
            </view>
            <!-- 右上角时间标签 -->
            <view class="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
                <text class="text-xs text-gray-700">{{ timeText }}</text>
            </view>
        </view>
        <!-- 卡片内容区域 -->
        <view class="p-4 flex flex-col justify-between" style="height: calc(100% - 8rem);">
            <!-- 描述文本，最多显示两行 -->
            <text class="text-xs text-gray-500 block line-clamp-2">{{ description }}</text>
            <!-- 底部按钮区域 -->
            <view class="mt-3 flex justify-end items-center">
                <!-- 渐变按钮 -->
                <view
                    class="bg-gradient-to-r px-4 py-2 rounded-full transform transition-transform duration-300 hover-scale"
                    :class="buttonGradient" @tap="$emit('button-click')">
                    <text class="text-xs text-white font-medium">{{ buttonText }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: 'ToolCard',
    props: {
        // 卡片标题
        title: {
            type: String,
            required: true
        },
        // 卡片描述文本
        description: {
            type: String,
            required: true
        },
        // 图标类型
        icon: {
            type: String,
            required: true
        },
        // 图标颜色
        iconColor: {
            type: String,
            required: true
        },
        // 图标背景色
        iconBg: {
            type: String,
            required: true
        },
        // 进度条颜色（已移除进度条，但保留属性以兼容现有代码）
        progressColor: {
            type: String,
            required: false,
            default: ''
        },
        // 进度值（已移除进度条，但保留属性以兼容现有代码）
        progressValue: {
            type: [String, Number],
            required: false,
            default: 0
        },
        // 按钮文本
        buttonText: {
            type: String,
            required: true
        },
        // 按钮渐变色
        buttonGradient: {
            type: String,
            required: true
        },
        // 时间文本
        timeText: {
            type: String,
            required: true
        },
        // 卡片唯一ID，用于激活状态
        cardId: {
            type: String,
            required: true
        },
        // 当前激活的卡片ID
        activeCard: {
            type: String,
            default: null
        },
        // 导航链接
        url: {
            type: String,
            default: ''
        }
    }
}
</script>

<style>
/* 卡片悬停效果 */
.card-hover {
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 卡片激活状态 */
.card-active {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* 按钮点击缩放效果 */
.hover-scale:active {
    transform: scale(0.95);
}

/* 文本限制为两行 */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* 卡片包装器样式 */
.tool-card-wrapper {
    display: inline-block;
}
</style>