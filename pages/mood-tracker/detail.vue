<template>
    <!-- 已有代码 -->

    <!-- 关联的日记 -->
    <view v-if="relatedJournals.length > 0" class="mt-4 bg-white rounded-xl p-4 shadow-sm">
        <view class="font-medium mb-2">关联的日记</view>
        <view v-for="journal in relatedJournals" :key="journal.id" class="border-b border-gray-100 last:border-0 py-2"
            @tap="navigateToJournal(journal.id)">
            <text class="font-medium">{{ journal.title || '无标题' }}</text>
            <text class="text-xs text-gray-500 block mt-1">{{ formatTime(journal.createTime) }}</text>
        </view>
    </view>

    <!-- 添加日记按钮 -->
    <view class="mt-4 mb-8">
        <button class="bg-blue-500 text-white rounded-full w-full py-2 flex items-center justify-center"
            @tap="createJournal">
            <uni-icons type="compose" size="16" color="#FFFFFF" class="mr-2"></uni-icons>
            <text>写一篇关联日记</text>
        </button>
    </view>
</template>

<script setup>
import { ref, watch } from 'vue';
import { formatTime } from '@/utils/timeUtil';
import { request } from '@/api/request';

// 添加日记相关状态和方法
const relatedJournals = ref([]);

// 获取关联日记
const getRelatedJournals = async () => {
    if (!moodDetail.value || !moodDetail.value.id) return;

    try {
        const res = await request({
            url: `/api/journal/by-mood/${moodDetail.value.id}`,
            method: 'GET'
        });

        if (res.code === 200) {
            relatedJournals.value = res.data || [];
        }
    } catch (error) {
        console.error('获取关联日记失败', error);
    }
};

// 导航到日记详情
const navigateToJournal = (journalId) => {
    uni.navigateTo({
        url: `/pages/journal/detail?id=${journalId}`
    });
};

// 创建关联日记
const createJournal = () => {
    if (!moodDetail.value || !moodDetail.value.id) return;

    uni.navigateTo({
        url: `/pages/journal/edit?moodId=${moodDetail.value.id}`
    });
};

// 在加载心情详情后获取关联日记
watch(() => moodDetail.value, () => {
    getRelatedJournals();
}, { immediate: true });
</script>