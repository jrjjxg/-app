<template>
    <view class="report-detail-container transform-gpu bg-gray-50 min-h-screen">
        <!-- 固定头部 -->
        <view class="fixed-header sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-2">
            <view class="flex items-center">
                <navigator url="/pages/reports/index" open-type="navigateBack" hover-class="none">
                    <!-- 为了更好的点击区域，可以在 navigator 上加 padding 或直接设置宽高 -->
                    <view class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 cursor-pointer">
                        <text class="iconfont icon-arrow-left text-gray-600 text-lg"></text>
                    </view>
                </navigator>
                <text class="text-lg font-semibold text-gray-800 truncate">{{ report.reportTitle || '使用报告' }}</text>
            </view>
            <view class="mt-1 text-sm text-gray-500 pl-11"> <!-- 根据返回按钮调整左边距 -->
                {{ formatDateRange(report.startDate, report.endDate) }}
            </view>
        </view>

        <!-- 主内容区域 -->
        <!-- 计算高度时需要减去头部实际高度，这里用视口高度减去一个估算值，可能需要微调 -->
        <scroll-view class="content-area p-4" scroll-y :style="{ height: `calc(100vh - ${headerHeight}px)` }">
            <!-- 加载中状态 -->
            <view v-if="loading" class="loading-container flex flex-col items-center justify-center h-[150px]">
                <view
                    class="loading-spinner w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-2.5">
                </view>
                <text class="loading-text text-sm text-gray-500">数据加载中...</text>
            </view>

            <block v-else>
                <!-- 关键洞察部分 -->
                <view class="insights-section bg-blue-50 rounded-md p-3 mb-4 border border-blue-100">
                    <view class="section-title text-base font-semibold text-gray-800 mb-2.5 relative pl-2.5">
                        <view
                            class="absolute left-0 top-1/2 transform -translate-y-1/2 w-[4px] h-4 bg-blue-500 rounded-sm">
                        </view>
                        关键洞察
                    </view>
                    <view class="insights-content text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        <text>{{ formatInsights(report.keyInsights) }}</text>
                    </view>
                </view>

                <!-- 情绪趋势 -->
                <view class="chart-section mb-5 bg-white rounded-md p-3 shadow-sm"
                    v-if="moodChartData.categories && moodChartData.categories.length > 0">
                    <view class="section-title text-base font-semibold text-gray-800 mb-2.5 relative pl-2.5">
                        <view
                            class="absolute left-0 top-1/2 transform -translate-y-1/2 w-[4px] h-4 bg-blue-500 rounded-sm">
                        </view>
                        情绪趋势
                    </view>
                    <view class="chart-container h-[200px] w-full">
                        <qiun-data-charts type="line" :opts="moodChartOpts" :chartData="moodChartData" :canvas2d="true"
                            canvasId="moodLineChart" /> <!-- 确保 canvasId 唯一 -->
                    </view>
                    <view class="chart-legend mt-1.5">
                        <view class="flex items-center justify-center mt-2">
                            <view class="legend-item flex items-center mr-2.5">
                                <view class="legend-dot w-2 h-2 rounded-full mr-1" style="background-color: #5470c6;">
                                </view>
                                <text class="legend-text text-xs text-gray-500">情绪评分</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 情绪类型分布 -->
                <view class="chart-section mb-5 bg-white rounded-md p-3 shadow-sm"
                    v-if="emotionTypeData.series && emotionTypeData.series[0]?.data.length > 0">
                    <view class="section-title text-base font-semibold text-gray-800 mb-2.5 relative pl-2.5">
                        <view
                            class="absolute left-0 top-1/2 transform -translate-y-1/2 w-[4px] h-4 bg-blue-500 rounded-sm">
                        </view>
                        情绪类型分布
                    </view>
                    <view class="chart-container h-[220px] w-full"> <!-- 饼图可能需要更高的高度 -->
                        <qiun-data-charts type="pie" :opts="pieChartOpts" :chartData="emotionTypeData" :canvas2d="true"
                            canvasId="emotionPieChart" /> <!-- 确保 canvasId 唯一 -->
                    </view>
                </view>

                <!-- 日记写作频率 -->
                <view class="chart-section mb-5 bg-white rounded-md p-3 shadow-sm"
                    v-if="journalChartData.categories && journalChartData.categories.length > 0">
                    <view class="section-title text-base font-semibold text-gray-800 mb-2.5 relative pl-2.5">
                        <view
                            class="absolute left-0 top-1/2 transform -translate-y-1/2 w-[4px] h-4 bg-blue-500 rounded-sm">
                        </view>
                        日记写作频率
                    </view>
                    <view class="chart-container h-[200px] w-full">
                        <qiun-data-charts type="column" :opts="journalChartOpts" :chartData="journalChartData"
                            :canvas2d="true" canvasId="journalColumnChart" /> <!-- 确保 canvasId 唯一 -->
                    </view>
                </view>

                <!-- 关键词云 -->
                <view class="chart-section mb-5 bg-white rounded-md p-3 shadow-sm" v-if="keywordData.length > 0">
                    <view class="section-title text-base font-semibold text-gray-800 mb-2.5 relative pl-2.5">
                        <view
                            class="absolute left-0 top-1/2 transform -translate-y-1/2 w-[4px] h-4 bg-blue-500 rounded-sm">
                        </view>
                        常用关键词
                    </view>
                    <view class="keywords-cloud flex flex-wrap justify-center items-center p-2.5 gap-2">
                        <view v-for="(item, index) in keywordData" :key="index"
                            :class="['keyword-item py-1 px-2.5 rounded-full bg-gray-100', getKeywordSize(item.value)]"
                            :style="{ color: getKeywordColor(item.value), backgroundColor: getKeywordBgColor(item.value) }">
                            {{ item.name }}
                        </view>
                    </view>
                </view>

                <!-- 心理测试结果 -->
                <view class="chart-section mb-5 bg-white rounded-md p-3 shadow-sm"
                    v-if="testTypeData.series && testTypeData.series[0]?.data.length > 0">
                    <view class="section-title text-base font-semibold text-gray-800 mb-2.5 relative pl-2.5">
                        <view
                            class="absolute left-0 top-1/2 transform -translate-y-1/2 w-[4px] h-4 bg-blue-500 rounded-sm">
                        </view>
                        心理测试结果分布
                    </view>
                    <view class="chart-container h-[220px] w-full"> <!-- 环形图可能需要更高的高度 -->
                        <qiun-data-charts type="ring" :opts="ringChartOpts" :chartData="testTypeData" :canvas2d="true"
                            canvasId="testRingChart" /> <!-- 确保 canvasId 唯一 -->
                    </view>
                </view>

                <!-- 添加一个占位元素防止底部内容被遮挡 (如果需要) -->
                <view class="h-5"></view>

            </block>
        </scroll-view>
    </view>
</template>

<script>
import { getReportById } from '@/api/report';
import { formatDateRange, formatDate } from '@/utils/timeUtil'; // 确保导入 formatDate
import UCharts from 'qiun-data-charts/js_sdk/u-charts/u-charts.js'; // 引入 uCharts 以便获取颜色

export default {
    data() {
        return {
            reportId: '',
            report: {},
            reportContent: {},
            loading: true,
            headerHeight: 80, // 估算的头部高度，用于计算 scroll-view 高度
            moodChartData: {
                categories: [],
                series: []
            },
            emotionTypeData: {
                series: []
            },
            journalChartData: {
                categories: [],
                series: []
            },
            testTypeData: {
                series: []
            },
            keywordData: [],
            // 共享的颜色数组
            chartColors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#2f4554', '#61a0a8']
        }
    },
    computed: {
        moodChartOpts() {
            return {
                color: [this.chartColors[0]], // 使用颜色数组
                padding: [15, 15, 0, 15],
                enableScroll: true, // 启用滚动条交互
                legend: { show: false },
                xAxis: {
                    disableGrid: true,
                    itemCount: 7, // x轴单屏显示数据的数量，默认为5个
                    scrollShow: true, // 是否显示滚动条
                    fontColor: '#666666',
                    fontSize: 11 // 调小字体避免重叠
                },
                yAxis: {
                    gridType: 'dash',
                    dashLength: 2,
                    data: [
                        {
                            min: 0,
                            max: 10,
                            title: '情绪评分',
                            titleFontSize: 11,
                            fontSize: 11
                        }
                    ]
                },
                extra: {
                    line: {
                        type: 'curve', // curve 曲线, straight 直线
                        width: 2,
                        activeType: 'hollow' // 点击或拖动标记点的样式
                    }
                },
                tooltip: { // 添加 tooltip 交互
                    showCategory: true,
                    formatter: (item) => {
                        // item: {name: '06-01', data: '7.5', color: '#5470c6', index: 0}
                        return `${item.name}: ${item.data}`
                    }
                }
            }
        },
        pieChartOpts() {
            return {
                color: this.chartColors, // 使用颜色数组
                padding: [5, 5, 5, 5],
                legend: {
                    show: true,
                    position: 'bottom',
                    float: 'center',
                    fontSize: 11, // 调小图例字体
                    lineHeight: 15
                },
                extra: {
                    pie: {
                        activeRadius: 8, // 点击放大效果半径
                        offsetAngle: 0, // 起始角度
                        labelWidth: 15, // 牵引线宽度
                        border: false,
                        borderWidth: 2, // 图表块边框宽度
                        borderColor: '#FFFFFF',
                        linearType: 'custom' // 使用自定义颜色
                    }
                },
                title: { // 可以添加总计等信息
                    name: '', // 例如 '总计'
                    fontSize: 13,
                    color: '#666666'
                },
                subtitle: {
                    name: '', // 例如总数值
                    fontSize: 18,
                    color: '#333333'
                }
            }
        },
        journalChartOpts() {
            return {
                color: [this.chartColors[1]], // 使用颜色数组
                padding: [15, 15, 0, 15],
                enableScroll: true,
                legend: { show: false },
                xAxis: {
                    disableGrid: true,
                    itemCount: 7,
                    scrollShow: true,
                    fontColor: '#666666',
                    fontSize: 11
                },
                yAxis: {
                    gridType: 'dash',
                    dashLength: 2,
                    data: [
                        {
                            min: 0,
                            title: '日记数量',
                            titleFontSize: 11,
                            fontSize: 11
                        }
                    ]
                },
                extra: {
                    column: {
                        type: 'group', // group 分组柱状图, stack 堆叠柱状图
                        width: 20, // 柱子宽度
                        activeBgColor: '#000000',
                        activeBgOpacity: 0.08 // 点击时背景色透明度
                    }
                },
                tooltip: {
                    showCategory: true,
                    formatter: (item) => {
                        // item: {name: '06-01', series: [{name: '日记数量', data: 2, color: '#91cc75'}]}
                        return `${item.name}: ${item.series[0].data} 篇`
                    }
                }
            }
        },
        ringChartOpts() {
            return {
                color: this.chartColors, // 使用颜色数组
                padding: [5, 5, 5, 5],
                legend: {
                    show: true,
                    position: 'bottom',
                    float: 'center',
                    fontSize: 11,
                    lineHeight: 15
                },
                extra: {
                    ring: {
                        ringWidth: 25, // 圆环的宽度
                        activeOpacity: 0.5, // 点击时透明度
                        activeRadius: 8,
                        offsetAngle: 0,
                        labelWidth: 15,
                        border: false,
                        borderWidth: 2,
                        borderColor: '#FFFFFF',
                        linearType: 'custom'
                    }
                },
                title: {
                    name: '',
                    fontSize: 13,
                    color: '#666666'
                },
                subtitle: {
                    name: '',
                    fontSize: 18,
                    color: '#333333'
                }
            }
        }
    },
    onReady() {
        // 动态计算头部高度
        this.calculateHeaderHeight();
    },
    onLoad(options) {
        this.reportId = options.id;
        this.loadReportData();
    },
    methods: {
        // 计算头部实际高度
        calculateHeaderHeight() {
            const query = uni.createSelectorQuery().in(this);
            query.select('.fixed-header').boundingClientRect(data => {
                if (data && data.height) {
                    // 加上一些额外的 padding 或 margin
                    this.headerHeight = data.height + 10; // 10 是 content-area 的 padding-top 近似值
                }
            }).exec();
        },
        // 加载报告数据
        async loadReportData() {
            this.loading = true;
            try {
                const result = await getReportById(this.reportId);
                if (result.code === 200 && result.data) {
                    this.report = result.data;

                    // 将报告内容JSON字符串解析为对象
                    try {
                        this.reportContent = JSON.parse(result.data.reportContent || '{}'); // 提供默认空对象防止解析null出错
                        this.processReportData();
                    } catch (e) {
                        console.error('解析报告内容失败', e);
                        uni.showToast({
                            title: '报告内容格式错误',
                            icon: 'none'
                        });
                    }
                } else {
                    uni.showToast({
                        title: result.message || '获取报告失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('加载报告详情失败:', error);
                uni.showToast({
                    title: error.message || '网络错误',
                    icon: 'none'
                });
            } finally {
                this.loading = false;
            }
        },

        // 处理报告数据，转化为图表需要的格式
        processReportData() {
            // 处理情绪数据
            if (this.reportContent.moodData && this.reportContent.moodData.dailyMoods) {
                const moodData = this.reportContent.moodData.dailyMoods;
                const dates = [];
                const scores = [];

                moodData.forEach(item => {
                    // 格式化日期为 MM-dd
                    dates.push(formatDate(new Date(item.date), 'MM-dd'));
                    // 保留一位小数
                    scores.push(parseFloat(item.avg_score || 0).toFixed(1));
                });

                this.moodChartData = {
                    categories: dates,
                    series: [
                        {
                            name: '情绪评分',
                            data: scores,
                            // 可以为特定点添加标记
                            // pointShape: 'circle',
                            // legendShape: 'line'
                        }
                    ]
                };

                // 处理情绪类型分布
                if (this.reportContent.moodData.emotionTypeDistribution) {
                    const emotionData = this.reportContent.moodData.emotionTypeDistribution;
                    const pieData = emotionData.map(item => {
                        return {
                            name: item.emotion_type,
                            value: item.count
                        };
                    }).filter(item => item.value > 0); // 过滤掉数量为0的项

                    this.emotionTypeData = {
                        series: [{
                            data: pieData,
                            // format: (val, name) => { return `${name}:${val}次`} // 自定义图例显示格式
                        }]
                    };
                }
            } else {
                this.moodChartData = { categories: [], series: [] }; // 清空或设为默认
                this.emotionTypeData = { series: [] };
            }

            // 处理日记数据
            if (this.reportContent.journalData && this.reportContent.journalData.dailyStats) {
                const journalData = this.reportContent.journalData.dailyStats;
                const dates = [];
                const counts = [];

                journalData.forEach(item => {
                    dates.push(formatDate(new Date(item.date), 'MM-dd'));
                    counts.push(item.count);
                });

                this.journalChartData = {
                    categories: dates,
                    series: [
                        {
                            name: '日记数量',
                            data: counts
                        }
                    ]
                };
            } else {
                this.journalChartData = { categories: [], series: [] };
            }

            // 处理关键词云数据
            if (this.reportContent.keywordCloudData) {
                // 按频率排序，并限制数量（可选）
                this.keywordData = this.reportContent.keywordCloudData.map(item => {
                    return {
                        name: item.keywords,
                        value: parseInt(item.frequency)
                    };
                }).sort((a, b) => b.value - a.value).slice(0, 30); // 例如最多显示30个
            } else {
                this.keywordData = [];
            }

            // 处理测试数据
            if (this.reportContent.testData && this.reportContent.testData.testTypeDistribution) {
                const testData = this.reportContent.testData.testTypeDistribution;
                const ringData = testData.map(item => {
                    return {
                        // 优先使用 test_name，如果为空则用 id
                        name: item.test_name || `测试类型 ${item.test_type_id}`,
                        value: item.count
                    };
                }).filter(item => item.value > 0);

                this.testTypeData = {
                    series: [{
                        data: ringData
                    }]
                };
            } else {
                this.testTypeData = { series: [] };
            }
        },

        // 格式化日期范围
        formatDateRange(startDate, endDate) {
            if (!startDate || !endDate) return '';
            // 使用 utils 中的 formatDate
            return `${formatDate(new Date(startDate), 'yyyy.MM.dd')} - ${formatDate(new Date(endDate), 'yyyy.MM.dd')}`;
        },

        // 格式化洞察文本，处理换行
        formatInsights(insights) {
            if (!insights) return '暂无关键洞察信息。';
            // 保持原样，因为 template 中使用了 whitespace-pre-line
            return insights;
        },

        // 获取关键词大小类名 (Tailwind)
        getKeywordSize(frequency) {
            if (!frequency) return 'text-xs';
            if (frequency >= 8) return 'text-lg font-bold';
            if (frequency >= 5) return 'text-base font-medium';
            if (frequency >= 3) return 'text-sm';
            return 'text-xs';
        },

        // 获取关键词颜色 (保持不变)
        getKeywordColor(frequency) {
            if (!frequency) return '#6b7280'; // gray-500

            // 使用预定义的颜色数组
            const index = Math.min(Math.floor(frequency / 2), this.chartColors.length - 1);
            return this.chartColors[index];
        },
        // 获取关键词背景色（可选，增加对比度）
        getKeywordBgColor(frequency) {
            if (!frequency) return '#f3f4f6'; // gray-100

            const color = this.getKeywordColor(frequency);
            // 尝试生成一个浅色的背景
            try {
                // 简单地增加透明度，或者使用颜色库进行转换
                // 这里用 uCharts 内置方法尝试获取 RGBA
                const rgbaColor = UCharts.hexToRgb(color, 0.1); // 10% 透明度
                return rgbaColor || '#f3f4f6'; // 如果转换失败，使用默认灰色
            } catch (e) {
                return '#f3f4f6'; // uCharts 可能未完全加载或方法不存在
            }
        },

        // 引入的工具函数
        formatDate,
        formatDateRange
    }
}
</script>
