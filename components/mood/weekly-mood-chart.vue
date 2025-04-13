<template>
    <view class="weekly-mood-chart">
        <view class="chart-container" :style="{ height: height + 'px' }">
            <view v-if="loading" class="loading-overlay flex items-center justify-center">
                <uni-load-more status="loading" :iconSize="24"></uni-load-more>
            </view>
            <view v-else-if="error" class="error-overlay flex items-center justify-center">
                <text class="text-gray-500">{{ error }}</text>
            </view>
            <view v-else-if="!hasData" class="empty-overlay flex items-center justify-center">
                <text class="text-gray-500">暂无情绪记录</text>
            </view>
            <l-echart v-else ref="chartRef" custom-style="width:100%;height:100%"></l-echart>
        </view>
    </view>
</template>

<script>
import { getWeeklyMoodStats } from '@/api/mood.js'

export default {
    name: 'WeeklyMoodChart',
    props: {
        height: {
            type: Number,
            default: 200
        }
    },
    data() {
        return {
            loading: true,
            error: null,
            myChart: null,
            chartData: {
                categories: [],
                values: [],
                emotionTypes: [],
                colors: []
            },
            emotionColors: {
                '快乐/愉悦': '#FFB800',
                '平静/满足': '#4CAF50',
                '焦虑/紧张': '#9C27B0',
                '悲伤/低落': '#2196F3',
                '愤怒/烦躁': '#F44336',
                '疲惫/无力': '#757575',
                '中性/平淡': '#607D8B'
            },
            chartOption: null
        };
    },
    computed: {
        hasData() {
            return this.chartData.categories.length > 0 &&
                this.chartData.values.some(item => item > 0);
        }
    },
    mounted() {
        this.fetchData();
    },
    // 组件销毁时处理
    beforeDestroy() {
        if (this.myChart) {
            this.myChart.dispose();
            this.myChart = null;
        }
    },
    methods: {
        // 初始化图表
        async initChart() {
            if (!this.hasData || !this.$refs.chartRef) return;

            try {
                // 使用Vue.prototype.$echarts
                const myChart = await this.$refs.chartRef.init(this.$echarts);
                this.myChart = myChart;

                if (this.chartOption) {
                    // 设置图表选项
                    myChart.setOption(this.chartOption);
                }

                console.log('图表初始化成功');
            } catch (error) {
                console.error('图表初始化失败:', error);
                this.error = '图表加载失败，请稍后再试';
            }
        },

        // 获取数据
        async fetchData() {
            this.loading = true;
            this.error = null;

            try {
                const response = await getWeeklyMoodStats();
                console.log('周情绪数据响应:', response);

                if (response.code === 200 && response.data) {
                    const rawData = response.data.data || [];

                    if (rawData.length === 0) {
                        this.error = '暂无情绪数据';
                        return;
                    }

                    // 处理数据
                    const categories = [];
                    const values = [];
                    const emotionTypes = [];
                    const colors = [];

                    rawData.forEach(item => {
                        categories.push(item.day || '');

                        // 确保强度值为数字
                        const intensity = typeof item.intensity === 'number' ?
                            item.intensity : (item.intensity ? parseFloat(item.intensity) : 0);
                        values.push(intensity);

                        // 记录情绪类型
                        const emotionType = item.emotion || null;
                        emotionTypes.push(emotionType);

                        // 获取对应的颜色
                        let color = '#CCCCCC'; // 默认灰色表示无情绪
                        if (emotionType && this.emotionColors[emotionType]) {
                            color = this.emotionColors[emotionType];
                        }
                        colors.push(color);
                    });

                    // 保存图表数据
                    this.chartData = {
                        categories,
                        values,
                        emotionTypes,
                        colors
                    };

                    console.log('处理后的图表数据:', this.chartData);

                    // 准备图表配置
                    this.prepareChartOption();

                    this.loading = false;

                    // 异步初始化图表
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this.initChart();
                        }, 300);
                    });
                } else {
                    this.error = response.message || '数据加载失败';
                }
            } catch (err) {
                console.error('获取周情绪数据失败:', err);
                this.error = '数据加载失败，请稍后再试';
            } finally {
                this.loading = false;
            }
        },

        // 准备图表配置选项
        prepareChartOption() {
            // 准备数据项
            const seriesData = this.chartData.values.map((value, index) => {
                return {
                    value: value,
                    itemStyle: {
                        color: this.chartData.colors[index]
                    },
                    // 增加额外的情绪信息用于tooltip显示
                    emotionType: this.chartData.emotionTypes[index]
                };
            });

            // 设置图表选项
            this.chartOption = {
                tooltip: {
                    trigger: 'axis',
                    formatter: (params) => {
                        const data = params[0];
                        let emotionText = '无数据';
                        if (data.data && data.data.emotionType) {
                            emotionText = this.getEmotionLabel(data.data.emotionType);
                        }
                        return `${data.name}: ${emotionText} (${data.value})`;
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    top: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: this.chartData.categories,
                    axisLine: {
                        lineStyle: {
                            color: '#999'
                        }
                    },
                    axisLabel: {
                        color: '#666',
                        fontSize: 12
                    }
                },
                yAxis: {
                    type: 'value',
                    show: false
                },
                series: [{
                    type: 'bar',
                    barWidth: 20,
                    data: seriesData,
                    itemStyle: {
                        borderRadius: [4, 4, 0, 0]
                    }
                }]
            };
        },

        getEmotionLabel(emotionType) {
            const emotionMap = {
                '快乐/愉悦': '快乐',
                '平静/满足': '平静',
                '焦虑/紧张': '焦虑',
                '悲伤/低落': '悲伤',
                '愤怒/烦躁': '愤怒',
                '疲惫/无力': '疲惫',
                '中性/平淡': '中性'
            };

            return emotionMap[emotionType] || emotionType || '无数据';
        }
    }
}
</script>

<style scoped>
.weekly-mood-chart {
    width: 100%;
    position: relative;
}

.chart-container {
    width: 100%;
    position: relative;
}

.loading-overlay,
.error-overlay,
.empty-overlay {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.5);
}
</style>