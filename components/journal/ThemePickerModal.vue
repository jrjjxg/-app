<template>
    <view class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <view class="w-10/12 max-h-[80vh] bg-white rounded-xl overflow-hidden flex flex-col">
            <!-- 标题栏 -->
            <view class="flex justify-between items-center p-4 border-b border-gray-100">
                <text class="text-lg font-medium text-gray-800">选择日记风格</text>
                <view class="w-10 h-10 flex items-center justify-center rounded-full" @tap="close">
                    <text class="iconfont icon-close text-gray-500"></text>
                </view>
            </view>

            <!-- 主题列表 -->
            <view class="p-4 grid grid-cols-2 gap-4 overflow-y-auto max-h-[60vh]">
                <view v-for="theme in themes" :key="theme.id"
                    class="bg-gray-50 rounded-lg overflow-hidden relative transition-transform duration-200"
                    :class="{ 'border-2 border-green-500 scale-105': selectedTheme === theme.id }"
                    @tap="selectTheme(theme.id)">
                    <image :src="theme.thumbnail" mode="aspectFill" class="w-full h-36" />
                    <text class="py-3 block text-center text-sm text-gray-700">{{ theme.name }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    selectedTheme: {
        type: String,
        default: 'vintage'
    }
});

const emit = defineEmits(['select', 'close']);

const themes = [
    { id: 'vintage', name: '牛皮纸', thumbnail: '/static/themes/vintage-bg.png' },
    { id: 'lined', name: '条格本', thumbnail: '/static/themes/lined-bg.png' },
    { id: 'minimal', name: '简约', thumbnail: '/static/themes/minimal-bg.png' },
    { id: 'kawaii', name: '日系可爱', thumbnail: '/static/themes/kawaii-bg.png' },
    { id: 'dark', name: '深色', thumbnail: '/static/themes/dark-bg.png' },
    { id: 'nature', name: '自然风景', thumbnail: '/static/themes/nature-bg.png' }
];

const selectTheme = (themeId) => {
    emit('select', themeId);
};

const close = () => {
    emit('close');
};
</script>