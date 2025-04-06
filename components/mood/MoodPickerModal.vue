<template>
    <view class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <view class="w-10/12 max-h-[80vh] bg-white rounded-xl overflow-hidden flex flex-col">
            <!-- 标题栏 -->
            <view class="flex justify-between items-center p-4 border-b border-gray-100">
                <text class="text-lg font-medium text-gray-800">选择心情记录</text>
                <view class="w-10 h-10 flex items-center justify-center rounded-full" @tap="close">
                    <text class="iconfont icon-close text-gray-500"></text>
                </view>
            </view>

            <!-- 搜索框 -->
            <view class="px-4 py-2 border-b border-gray-100">
                <view class="flex items-center bg-gray-100 rounded-full px-3 py-2">
                    <text class="iconfont icon-search text-gray-400 mr-2"></text>
                    <input type="text" placeholder="搜索心情记录..." v-model="searchText" class="flex-1 text-sm" />
                </view>
            </view>

            <!-- 心情列表 -->
            <scroll-view scroll-y class="p-4 flex-1 overflow-y-auto max-h-[50vh]">
                <view v-if="loading" class="py-4 flex justify-center">
                    <text class="text-gray-500">加载中...</text>
                </view>

                <view v-else-if="moodList.length === 0" class="py-10 flex flex-col items-center">
                    <text class="text-gray-500 mb-2">暂无心情记录</text>
                    <button class="text-sm text-blue-500 border border-blue-200 px-4 py-1 rounded-full"
                        @tap="createNewMood">
                        创建新的心情记录
                    </button>
                </view>

                <view v-else>
                    <view v-for="mood in filteredMoodList" :key="mood.id"
                        class="mb-3 p-3 bg-gray-50 rounded-lg flex items-center" @tap="selectMood(mood)">
                        <view class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                            :style="{ backgroundColor: mood.color }">
                            <text class="text-white">{{ mood.emotionIcon }}</text>
                        </view>
                        <view class="flex-1">
                            <view class="flex items-center">
                                <text class="font-medium">{{ mood.emotionType }}</text>
                                <text class="ml-2 text-xs px-2 py-0.5 rounded-full"
                                    :style="{ backgroundColor: `${mood.color}20`, color: mood.color }">
                                    {{ mood.intensity }}
                                </text>
                            </view>
                            <text class="text-xs text-gray-500">{{ formatTime(mood.createTime) }}</text>
                            <text v-if="mood.note" class="text-xs text-gray-600 mt-1 line-clamp-1">
                                {{ mood.note }}
                            </text>
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { formatTime } from '@/utils/timeUtil';
import { request } from '@/api/request';

const emit = defineEmits(['select', 'close']);
const moodList = ref([]);
const loading = ref(true);
const searchText = ref('');

// 过滤心情列表
const filteredMoodList = computed(() => {
    if (!searchText.value) return moodList.value;

    const query = searchText.value.toLowerCase();
    return moodList.value.filter(mood =>
        mood.emotionType.toLowerCase().includes(query) ||
        (mood.note && mood.note.toLowerCase().includes(query))
    );
});

// 加载用户心情记录
onMounted(async () => {
    loading.value = true;
    try {
        const userId = uni.getStorageSync('userId');
        const res = await request({
            url: `/api/moods/list?userId=${userId}&pageSize=50`,
            method: 'GET'
        });

        if (res.code === 200) {
            moodList.value = res.data.records || [];
        }
    } catch (error) {
        console.error('获取心情列表失败', error);
    } finally {
        loading.value = false;
    }
});

// 选择心情
const selectMood = (mood) => {
    emit('select', mood);
};

// 关闭模态框
const close = () => {
    emit('close');
};

// 创建新的心情记录
const createNewMood = () => {
    uni.navigateTo({
        url: '/pages/mood-tracker/record'
    });
};
</script>