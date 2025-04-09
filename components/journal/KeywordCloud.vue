<template>
    <view class="keyword-cloud-container" :style="{ height: height }">
        <view v-if="loading" class="flex items-center justify-center h-full">
            <uni-icons type="spinner-cycle" size="24" color="#4B5563" class="animate-spin"></uni-icons>
            <text class="ml-2 text-gray-600">加载中...</text>
        </view>
        <view v-else-if="isEmpty" class="flex flex-col items-center justify-center h-full">
            <text class="text-gray-500 mb-2">暂无关键词数据</text>
            <text class="text-xs text-gray-400">写更多日记以生成关键词云</text>
        </view>
        <view v-else class="h-full">
            <qiun-data-charts type="word" :chartData="chartData" :opts="opts" :canvas2d="false" background="none"
                @getIndex="onKeywordClick" />
        </view>
    </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// 组件属性
const props = defineProps({
    data: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
    height: {
        type: String,
        default: '300px'
    },
    colorRange: {
        type: Array,
        default: () => ['#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0']
    }
});

// 定义事件
const emit = defineEmits(['keyword-click']);

// 组件状态
const isEmpty = computed(() => !props.loading && (!props.data || props.data.length === 0));

// 图表数据
const chartData = computed(() => {
    if (isEmpty.value) return { series: [] };

    return {
        series: props.data.map(item => ({
            name: item.name,
            textSize: calculateFontSize(item.value),
            data: item.value
        }))
    };
});

// 计算字体大小 (12px ~ 36px)
const calculateFontSize = (value) => {
    // 找出最大和最小值
    let max = 0;
    let min = Number.MAX_VALUE;

    props.data.forEach(item => {
        const val = Number(item.value);
        max = Math.max(max, val);
        min = Math.min(min, val);
    });

    // 防止除以0
    const range = max === min ? 1 : max - min;

    // 计算字体大小
    return 12 + Math.floor((value - min) / range * 24);
};

// 配置选项
const opts = ref({
    color: props.colorRange,
    extra: {
        word: {
            type: "normal",
            autoColors: true
        }
    }
});

// 当关键词被点击时
const onKeywordClick = (params) => {
    if (props.data && props.data[params.index]) {
        emit('keyword-click', props.data[params.index].name);
    }
};

// 监听颜色范围变化
watch(() => props.colorRange, (newValue) => {
    opts.value.color = newValue;
}, { deep: true });
</script>

<style>
.keyword-cloud-container {
    width: 100%;
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    background-color: #ffffff;
}
</style>