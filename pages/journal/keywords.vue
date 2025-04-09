<template>
    <view class="min-h-screen bg-gray-50 flex flex-col">
        <!-- 顶部导航栏 -->
        <view class="sticky top-0 z-10 px-4 py-3 bg-white shadow-sm flex items-center justify-between">
            <view class="w-9 h-9 flex items-center justify-center" @tap="goBack">
                <uni-icons type="back" size="22" color="#6B7280"></uni-icons>
            </view>
            <text class="text-lg font-medium text-gray-800">日记关键词</text>
            <view class="w-9 h-9 opacity-0">
                <!-- 占位用 -->
            </view>
        </view>

        <!-- 筛选条件区域 -->
        <view class="bg-white px-4 py-3 border-t border-gray-100">
            <view class="flex items-center justify-between mb-3">
                <text class="text-base font-medium text-gray-700">时间范围</text>
                <view class="flex items-center">
                    <view class="h-8 px-3 py-1 bg-gray-100 rounded-full flex items-center justify-center"
                        @tap="showDatePicker('start')">
                        <text class="text-sm text-gray-700">{{ formatShortDate(dateRange.startDate) }}</text>
                    </view>
                    <text class="mx-2 text-gray-500">至</text>
                    <view class="h-8 px-3 py-1 bg-gray-100 rounded-full flex items-center justify-center"
                        @tap="showDatePicker('end')">
                        <text class="text-sm text-gray-700">{{ formatShortDate(dateRange.endDate) }}</text>
                    </view>
                </view>
            </view>
            <view class="flex justify-between">
                <view v-for="(period, index) in quickPeriods" :key="index" class="px-3 py-1.5 rounded-full text-sm"
                    :class="selectedPeriod === period.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
                    @tap="selectPeriod(period.value)">
                    {{ period.label }}
                </view>
            </view>
        </view>

        <!-- 词云展示区域 -->
        <view class="flex-1 p-4">
            <view class="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
                <view class="p-4 border-b border-gray-100">
                    <text class="text-base font-medium text-gray-800">关键词云</text>
                    <text class="text-xs text-gray-500 ml-2">显示最频繁出现的关键词</text>
                </view>
                <view class="p-4">
                    <keyword-cloud :data="keywordCloudData" :loading="loading" height="300px"
                        :color-range="['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95']"
                        @keyword-click="searchJournalsByKeyword"></keyword-cloud>
                </view>
            </view>

            <!-- 关键词列表 -->
            <view class="bg-white rounded-lg shadow-sm overflow-hidden">
                <view class="p-4 border-b border-gray-100 flex justify-between items-center">
                    <view>
                        <text class="text-base font-medium text-gray-800">关键词列表</text>
                        <text class="text-xs text-gray-500 ml-2">按出现频率排序</text>
                    </view>
                    <view class="text-xs text-gray-500">共 {{ keywordCloudData.length }} 个</view>
                </view>
                <view v-if="loading" class="py-8 flex justify-center items-center">
                    <uni-icons type="spinner-cycle" size="24" color="#4B5563" class="animate-spin mr-2"></uni-icons>
                    <text class="text-gray-500">加载中...</text>
                </view>
                <view v-else-if="keywordCloudData.length === 0" class="py-8 flex flex-col items-center justify-center">
                    <text class="text-gray-500 mb-2">暂无关键词数据</text>
                    <text class="text-xs text-gray-400">写更多日记以生成关键词统计</text>
                </view>
                <view v-else class="divide-y divide-gray-100">
                    <view v-for="(item, index) in keywordCloudData" :key="index"
                        class="flex justify-between items-center p-4 hover:bg-gray-50"
                        @tap="searchJournalsByKeyword(item.name)">
                        <view class="flex items-center">
                            <text class="w-6 text-center text-sm text-gray-500">{{ index + 1 }}</text>
                            <text class="ml-3 text-base text-gray-800">{{ item.name }}</text>
                        </view>
                        <view class="flex items-center">
                            <text class="text-sm text-gray-600">{{ item.value }}次</text>
                            <uni-icons type="right" size="14" color="#9CA3AF" class="ml-2"></uni-icons>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 日期选择器弹窗 -->
        <uni-calendar v-if="showCalendar" :insert="false" :start-date="'2020-01-01'"
            :end-date="formatDateForCalendar(new Date())" :selected="getSelectedDate()" @confirm="confirmDate"
            @close="showCalendar = false" />
    </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import KeywordCloud from '@/components/journal/KeywordCloud.vue';
import { getKeywordCloudData } from '@/api/journal';

// 确保全局注册了qiun-data-charts组件
// 组件已经从uni_modules自动注册，不需要手动导入

// 状态
const loading = ref(false);
const keywordCloudData = ref([]);
const showCalendar = ref(false);
const datePickerType = ref('start');
const selectedPeriod = ref('month');

// 预定义的时间周期选项
const quickPeriods = [
    { label: '一周', value: 'week' },
    { label: '一月', value: 'month' },
    { label: '三月', value: 'quarter' },
    { label: '一年', value: 'year' },
    { label: '全部', value: 'all' }
];

// 日期范围
const dateRange = reactive({
    startDate: getPeriodStartDate('month'),
    endDate: new Date()
});

// 获取指定周期的开始日期
function getPeriodStartDate(period) {
    const now = new Date();
    switch (period) {
        case 'week':
            return new Date(now.setDate(now.getDate() - 7));
        case 'month':
            return new Date(now.setMonth(now.getMonth() - 1));
        case 'quarter':
            return new Date(now.setMonth(now.getMonth() - 3));
        case 'year':
            return new Date(now.setFullYear(now.getFullYear() - 1));
        case 'all':
            return new Date(2020, 0, 1); // 假设2020年为系统上线时间
        default:
            return new Date(now.setMonth(now.getMonth() - 1));
    }
}

// 选择预定义时间周期
function selectPeriod(period) {
    selectedPeriod.value = period;
    dateRange.startDate = getPeriodStartDate(period);
    dateRange.endDate = new Date();
    fetchKeywordData();
}

// 显示日期选择器
function showDatePicker(type) {
    datePickerType.value = type;
    showCalendar.value = true;
}

// 确认日期选择
function confirmDate(e) {
    const date = new Date(e.fulldate);
    if (datePickerType.value === 'start') {
        dateRange.startDate = date;
        // 确保开始日期不晚于结束日期
        if (date > dateRange.endDate) {
            dateRange.endDate = date;
        }
    } else {
        dateRange.endDate = date;
        // 确保结束日期不早于开始日期
        if (date < dateRange.startDate) {
            dateRange.startDate = date;
        }
    }
    showCalendar.value = false;
    selectedPeriod.value = 'custom';
    fetchKeywordData();
}

// 获取日历组件需要的已选择日期
function getSelectedDate() {
    if (datePickerType.value === 'start') {
        return [formatDateForCalendar(dateRange.startDate)];
    } else {
        return [formatDateForCalendar(dateRange.endDate)];
    }
}

// 格式化日期，用于日历组件
function formatDateForCalendar(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 格式化日期，显示在UI上
function formatShortDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

// 根据关键词搜索日记
function searchJournalsByKeyword(keyword) {
    uni.navigateTo({
        url: `/pages/journal/list?keyword=${encodeURIComponent(keyword)}`
    });
}

// 返回上一页
function goBack() {
    uni.navigateBack();
}

// 获取关键词云数据
async function fetchKeywordData() {
    try {
        loading.value = true;
        const params = {
            startDate: formatDateForCalendar(dateRange.startDate),
            endDate: formatDateForCalendar(dateRange.endDate),
            limit: 50
        };

        // 添加测试数据，真实环境请注释掉
        const testData = [
            { name: "心情", value: 30 },
            { name: "工作", value: 25 },
            { name: "学习", value: 22 },
            { name: "家庭", value: 20 },
            { name: "朋友", value: 18 },
            { name: "旅行", value: 15 },
            { name: "健康", value: 14 },
            { name: "爱好", value: 13 },
            { name: "生活", value: 12 },
            { name: "音乐", value: 10 },
            { name: "电影", value: 9 },
            { name: "阅读", value: 8 },
            { name: "运动", value: 7 },
            { name: "美食", value: 6 },
            { name: "思考", value: 5 },
            { name: "梦想", value: 4 },
            { name: "未来", value: 3 },
            { name: "回忆", value: 2 },
            { name: "感恩", value: 1 }
        ];

        try {
            const res = await getKeywordCloudData(params);
            if (res && res.data && res.data.length > 0) {
                keywordCloudData.value = res.data;
            } else {
                // 如果API没有返回数据，使用测试数据
                keywordCloudData.value = testData;
            }
        } catch (error) {
            console.error('API调用失败，使用测试数据', error);
            keywordCloudData.value = testData;
        }

    } catch (error) {
        console.error('获取关键词云数据失败', error);
        uni.showToast({
            title: '获取数据失败',
            icon: 'none'
        });
    } finally {
        loading.value = false;
    }
}

// 初始化
onMounted(() => {
    fetchKeywordData();
});
</script>

<style></style>