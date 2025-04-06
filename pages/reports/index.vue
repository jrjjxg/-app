<template>
    <view class="reports-container transform-gpu bg-gray-50 min-h-screen">
        <!-- 固定顶部 -->
        <view class="fixed-header sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-2">
            <view class="flex justify-between items-center">
                <text class="text-lg font-medium text-gray-800">我的使用报告</text>
                <!-- 添加自定义报告按钮 -->
                <view class="create-report-btn bg-blue-500 text-white text-sm rounded-full px-3 py-1.5"
                    @tap="showCustomReportModal">
                    <text class="iconfont icon-plus mr-1 text-xs"></text>自定义报告
                </view>
            </view>
        </view>

        <!-- 报告类型选择 -->
        <view class="report-tabs flex justify-around py-2.5 bg-white border-b border-gray-100">
            <view v-for="tab in tabs" :key="tab.value"
                :class="['tab-item relative py-1 px-2.5 text-sm cursor-pointer', currentTab === tab.value ? 'text-blue-500 font-medium' : 'text-gray-500']"
                @tap="switchTab(tab.value)">
                {{ tab.label }}
                <view v-if="currentTab === tab.value"
                    class="absolute bottom-[-5px] left-1/2 transform -translate-x-1/2 w-5 h-0.5 bg-blue-500 rounded-sm">
                </view>
            </view>
        </view>

        <!-- 主内容 -->
        <view class="content-area px-4 py-2.5">
            <!-- 报告列表 -->
            <view class="reports-list flex flex-col gap-2.5" v-if="filteredReports.length > 0">
                <view v-for="report in filteredReports" :key="report.id"
                    class="report-item p-4 bg-white rounded-lg shadow-sm cursor-pointer" @tap="viewReport(report.id)">

                    <view class="report-header flex justify-between items-center mb-2">
                        <text class="report-title text-base font-medium text-gray-800">{{ report.reportTitle }}</text>
                        <view class="report-badge text-xs text-white bg-red-500 px-2 py-0.5 rounded-full"
                            v-if="!report.isRead">未读</view>
                    </view>

                    <view class="report-period text-sm text-gray-500 mb-2">
                        {{ formatDateRange(report.startDate, report.endDate) }}
                    </view>

                    <view class="report-insights mt-2 mb-2.5">
                        <text class="insights-title text-sm text-gray-500">关键洞察：</text>
                        <text class="insights-content text-sm text-gray-800 leading-normal">{{
                            formatInsights(report.keyInsights) }}</text>
                    </view>

                    <view class="report-time text-xs text-gray-400 text-right">
                        {{ formatTime(report.createTime) }}
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view class="empty-state flex flex-col items-center py-12" v-if="filteredReports.length === 0 && !loading">
                <image class="empty-image w-24 h-24 mb-4" src="/static/images/empty-reports.png"></image>
                <text class="empty-text text-sm text-gray-400">暂无{{ getTabLabel() }}报告</text>
            </view>

            <!-- 加载状态 -->
            <view class="loading-state py-4 text-center" v-if="loading">
                <text class="loading-text text-sm text-gray-400">加载中...</text>
            </view>

            <!-- 加载更多 -->
            <view class="load-more text-center py-2.5 text-blue-500 text-sm cursor-pointer"
                v-if="hasMore && !loading && reports.length > 0" @tap="loadMore">
                加载更多
            </view>
        </view>

        <!-- 自定义报告弹窗 -->
        <view v-if="showCustomModal"
            class="custom-report-modal fixed inset-0 bg-black/30 flex items-center justify-center z-20">
            <view class="modal-content bg-white rounded-lg w-4/5 p-4 shadow-lg">
                <view class="modal-header flex justify-between items-center mb-4">
                    <text class="text-lg font-medium">创建自定义报告</text>
                    <view class="close-btn w-7 h-7 flex items-center justify-center rounded-full bg-gray-100"
                        @tap="showCustomModal = false">
                        <text class="iconfont icon-close text-gray-500 text-sm"></text>
                    </view>
                </view>

                <view class="modal-body">
                    <view class="date-range-picker mb-4">
                        <text class="text-sm text-gray-500 mb-2 block">选择报告时间范围</text>

                        <view class="start-date mb-3">
                            <text class="text-sm text-gray-600 mb-1 block">开始日期</text>
                            <picker mode="date" :value="customStartDate" @change="onStartDateChange"
                                class="border border-gray-200 rounded p-2 w-full text-sm">
                                <view class="picker-text text-gray-800">{{ formatPickerDate(customStartDate) }}</view>
                            </picker>
                        </view>

                        <view class="end-date">
                            <text class="text-sm text-gray-600 mb-1 block">结束日期</text>
                            <picker mode="date" :value="customEndDate" @change="onEndDateChange"
                                class="border border-gray-200 rounded p-2 w-full text-sm">
                                <view class="picker-text text-gray-800">{{ formatPickerDate(customEndDate) }}</view>
                            </picker>
                        </view>
                    </view>

                    <view class="modal-actions flex justify-end gap-2 mt-5">
                        <view class="cancel-btn py-2 px-4 border border-gray-200 rounded-md text-gray-500 text-sm"
                            @tap="showCustomModal = false">
                            取消
                        </view>
                        <view class="submit-btn py-2 px-4 bg-blue-500 text-white rounded-md text-sm"
                            @tap="createCustomReport" :class="{ 'opacity-50': isCreating }">
                            {{ isCreating ? '生成中...' : '生成报告' }}
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { getUserReports, createCustomReport } from '@/api/report';
import { formatTime, formatDateRange, formatDate } from '@/utils/timeUtil';

export default {
    data() {
        return {
            loading: false,
            currentTab: 'all', // all, weekly, monthly, yearly
            pageNum: 1,
            pageSize: 10,
            total: 0,
            reports: [],
            hasMore: false,
            tabs: [
                { label: '全部', value: 'all' },
                { label: '周报告', value: 'weekly' },
                { label: '月报告', value: 'monthly' },
                { label: '年报告', value: 'yearly' },
                { label: '自定义', value: 'custom' },
            ],

            // 新增数据
            showCustomModal: false,
            customStartDate: this.getDefaultStartDate(),
            customEndDate: this.getDefaultEndDate(),
            isCreating: false,
        }
    },
    computed: {
        // 根据当前选择的标签过滤报告
        filteredReports() {
            if (this.currentTab === 'all') {
                return this.reports;
            }
            return this.reports.filter(report => report.reportType === this.currentTab);
        }
    },
    onLoad() {
        this.loadReports();
    },
    methods: {
        // 加载报告列表
        async loadReports(reset = true) {
            if (reset) {
                this.pageNum = 1;
                this.reports = [];
            }

            this.loading = true;
            try {
                const userId = uni.getStorageSync('userId');
                if (!userId) {
                    uni.navigateTo({ url: '/pages/login/index' });
                    return;
                }

                const result = await getUserReports(userId, this.pageNum, this.pageSize);

                if (result.code === 200 && result.data) {
                    if (reset) {
                        this.reports = result.data.records || [];
                    } else {
                        this.reports = [...this.reports, ...(result.data.records || [])];
                    }
                    this.total = result.data.total;
                    this.hasMore = this.reports.length < this.total;
                }
            } catch (error) {
                console.error('加载报告列表失败:', error);
                uni.showToast({
                    title: '加载数据失败',
                    icon: 'none'
                });
            } finally {
                this.loading = false;
            }
        },

        // 加载更多报告
        loadMore() {
            if (this.hasMore && !this.loading) {
                this.pageNum++;
                this.loadReports(false);
            }
        },

        // 切换报告类型标签
        switchTab(tab) {
            this.currentTab = tab;
        },

        // 查看报告详情
        viewReport(id) {
            uni.navigateTo({
                url: `/pages/reports/detail?id=${id}`
            });
        },

        // 格式化洞察内容（截取一部分）
        formatInsights(insights) {
            if (!insights) return '暂无洞察';
            // 只显示前50个字符，加上省略号
            return insights.length > 50 ? insights.substring(0, 50) + '...' : insights;
        },

        // 获取当前标签对应的文本
        getTabLabel() {
            return this.tabs.find(tab => tab.value === this.currentTab)?.label || '分析';
        },

        formatTime,
        formatDateRange,

        // 新增的方法
        // 显示自定义报告弹窗
        showCustomReportModal() {
            this.showCustomModal = true;
            // 重新初始化日期设置为最近30天
            this.customStartDate = this.getDefaultStartDate();
            this.customEndDate = this.getDefaultEndDate();
        },

        // 获取默认开始日期（30天前）
        getDefaultStartDate() {
            const date = new Date();
            date.setDate(date.getDate() - 30);
            return formatDate(date, 'yyyy-MM-dd');
        },

        // 获取默认结束日期（今天）
        getDefaultEndDate() {
            return formatDate(new Date(), 'yyyy-MM-dd');
        },

        // 日期选择器变化处理
        onStartDateChange(e) {
            this.customStartDate = e.detail.value;
        },

        onEndDateChange(e) {
            this.customEndDate = e.detail.value;
        },

        // 格式化显示的日期
        formatPickerDate(dateStr) {
            if (!dateStr) return '请选择日期';
            return formatDate(new Date(dateStr), 'yyyy年MM月dd日');
        },

        // 生成自定义报告
        async createCustomReport() {
            // 验证日期有效性
            const startDate = new Date(this.customStartDate);
            const endDate = new Date(this.customEndDate);

            if (isNaN(startDate) || isNaN(endDate)) {
                uni.showToast({
                    title: '请选择有效的日期',
                    icon: 'none'
                });
                return;
            }

            if (endDate < startDate) {
                uni.showToast({
                    title: '结束日期不能早于开始日期',
                    icon: 'none'
                });
                return;
            }

            // 设置开始时间为当天00:00:00，结束时间为当天23:59:59
            const formattedStartDate = `${this.customStartDate}T00:00:00`;
            const formattedEndDate = `${this.customEndDate}T23:59:59`;

            this.isCreating = true;
            try {
                const userId = uni.getStorageSync('userId');
                if (!userId) {
                    uni.navigateTo({ url: '/pages/login/index' });
                    return;
                }

                // 调用API
                const result = await createCustomReport(userId, formattedStartDate, formattedEndDate);

                if (result.code === 200 && result.data) {
                    uni.showToast({
                        title: '报告生成成功',
                        icon: 'success'
                    });

                    // 关闭弹窗
                    this.showCustomModal = false;

                    // 重新加载报告列表
                    this.loadReports(true);

                    // 跳转到报告详情页
                    setTimeout(() => {
                        uni.navigateTo({
                            url: `/pages/reports/detail?id=${result.data}`
                        });
                    }, 500);
                } else {
                    uni.showToast({
                        title: result.message || '生成报告失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('生成自定义报告失败:', error);
                uni.showToast({
                    title: '生成报告失败',
                    icon: 'none'
                });
            } finally {
                this.isCreating = false;
            }
        }
    }
}
</script>