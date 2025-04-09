<template>
    <view class="min-h-screen flex flex-col bg-gray-50">
        <!-- 顶部操作区 -->
        <view class="px-4 py-3 bg-white shadow-sm flex items-center justify-between sticky top-0 z-10">
            <!-- 返回按钮 -->
            <view class="w-9 h-9 flex items-center justify-center" @tap="goBack">
                <uni-icons type="back" size="22" color="#6B7280"></uni-icons>
            </view>
            <!-- 视图切换 -->
            <view class="flex items-center bg-gray-100 rounded-full px-2 py-1 mx-2">
                <text
                    :class="['px-3 py-1 text-sm rounded-full', currentView === 'timeline' ? 'bg-white text-blue-500 shadow-sm' : 'text-gray-600']"
                    @tap="switchView('timeline')">时间线</text>
                <text
                    :class="['px-3 py-1 text-sm rounded-full', currentView === 'calendar' ? 'bg-white text-blue-500 shadow-sm' : 'text-gray-600']"
                    @tap="switchView('calendar')">日历</text>
                <text
                    :class="['px-3 py-1 text-sm rounded-full', currentView === 'grid' ? 'bg-white text-blue-500 shadow-sm' : 'text-gray-600']"
                    @tap="switchView('grid')">网格</text>
            </view>
            <!-- 写日记按钮 -->
            <button class="bg-blue-500 text-white rounded-full px-3 py-1.5 flex items-center shadow-sm"
                @tap="navigateToEdit">
                <uni-icons type="compose" size="16" color="#FFFFFF" class="mr-1"></uni-icons>
                <text class="text-sm">写日记</text>
            </button>
        </view>

        <!-- 筛选区 -->
        <view class="px-4 py-2 bg-white border-t border-gray-100 flex items-center">
            <view class="flex-1 bg-gray-100 rounded-full flex items-center px-3 py-1.5">
                <uni-icons type="search" size="18" color="#9CA3AF" class="mr-2"></uni-icons>
                <input type="text" placeholder="搜索日记..." class="flex-1 text-sm bg-transparent" v-model="searchText"
                    @confirm="searchJournals" />
            </view>
            <view class="ml-3 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                @tap="showFilterOptions">
                <uni-icons type="settings" size="20" color="#6B7280"></uni-icons>
            </view>
            <view class="ml-3 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                @tap="navigateToKeywords">
                <uni-icons type="paperclip" size="20" color="#6B7280"></uni-icons>
            </view>
        </view>

        <!-- 时间线视图 - 使用页面滚动 -->
        <view v-if="currentView === 'timeline'" class="flex-1 px-4 pb-4">
            <view v-for="(group, month) in groupedJournals" :key="month" class="mb-6">
                <view class="flex justify-between items-center py-2 border-b border-gray-200"
                    @tap="toggleMonthCollapse(month)">
                    <text class="text-base font-semibold text-gray-700">{{ month }}</text>
                    <uni-icons :type="collapsedMonths[month] ? 'down' : 'up'" size="16" color="#6B7280"></uni-icons>
                </view>

                <view v-if="!collapsedMonths[month]" class="ml-3 border-l-2 border-blue-200">
                    <view v-for="(dayGroup, day) in group" :key="day" class="mb-4">
                        <view class="flex items-center ml-[-9px] mt-4">
                            <view class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></view>
                            <text class="ml-2 text-sm font-medium text-blue-600">{{ formatDayTitle(day) }}</text>
                        </view>

                        <view class="ml-6 space-y-3 mt-2">
                            <view v-for="journal in dayGroup" :key="journal.id"
                                class="bg-white rounded-lg shadow-sm p-3 border border-gray-100"
                                @tap="viewJournal(journal.id)">
                                <view class="flex justify-between items-center mb-2">
                                    <text class="text-xs text-gray-500">{{ formatTime(journal.createTime) }}</text>
                                    <view class="flex space-x-1">
                                        <uni-icons v-if="journal.isPrivate === 1" type="locked" size="12"
                                            color="#9CA3AF"></uni-icons>
                                        <uni-icons v-if="journal.isFavorite" type="star-filled" size="12"
                                            color="#F59E0B"></uni-icons>
                                    </view>
                                </view>

                                <view class="flex">
                                    <view v-if="hasImage(journal)"
                                        class="w-16 h-16 rounded-md overflow-hidden mr-3 flex-shrink-0">
                                        <image :src="getFirstImage(journal)" mode="aspectFill" class="w-full h-full">
                                        </image>
                                    </view>
                                    <view class="flex-1 overflow-hidden">
                                        <text class="text-base font-medium text-gray-800 mb-1 block">{{ journal.title ||
                                            '无标题' }}</text>
                                        <text class="text-sm text-gray-600 line-clamp-2">{{
                                            formatPreview(journal.content) }}</text>
                                    </view>
                                </view>

                                <view v-if="hasTagsOrMood(journal)" class="flex flex-wrap mt-2 gap-1">
                                    <view v-if="journal.relatedMoodId"
                                        class="px-2 py-0.5 bg-blue-50 rounded-full flex items-center">
                                        <text class="mr-1">{{ getMoodIcon(journal) }}</text>
                                        <text class="text-xs text-blue-600">{{ getMoodText(journal) }}</text>
                                    </view>
                                    <view v-for="keyword in getKeywords(journal)" :key="keyword"
                                        class="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                                        {{ keyword }}
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 加载状态 -->
            <view v-if="loading" class="py-4 text-center text-gray-500 text-sm">
                <text>加载中...</text>
            </view>
            <view v-if="!loading && !isEmpty && !hasMore" class="py-4 text-center text-gray-500 text-sm">
                <text>没有更多了</text>
            </view>

            <!-- 空状态 -->
            <view v-if="isEmpty" class="py-12 flex flex-col items-center justify-center">
                <image src="/static/images/empty-journal.png" mode="aspectFit" class="w-32 h-32 opacity-50 mb-4">
                </image>
                <text class="text-gray-500 mb-4">暂无日记记录</text>
                <button class="bg-blue-500 text-white rounded-full px-5 py-2 text-sm"
                    @tap="navigateToEdit">开始写日记</button>
            </view>
        </view>

        <!-- 日历视图 -->
        <view v-if="currentView === 'calendar'" class="flex-1 flex flex-col">
            <view class="bg-white p-4 flex items-center justify-between">
                <view class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100" @tap="prevMonth">
                    <uni-icons type="left" size="18" color="#6B7280"></uni-icons>
                </view>
                <text class="text-base font-medium text-gray-800">{{ currentMonthText }}</text>
                <view class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100" @tap="nextMonth">
                    <uni-icons type="right" size="18" color="#6B7280"></uni-icons>
                </view>
            </view>

            <view class="bg-white px-4 py-2 grid grid-cols-7 border-b border-gray-100">
                <text v-for="day in weekDays" :key="day" class="text-center text-xs text-gray-500">{{ day }}</text>
            </view>

            <view class="bg-white p-4 grid grid-cols-7 gap-1">
                <view v-for="(day, index) in calendarDays" :key="index" :class="['aspect-square flex flex-col items-center justify-center rounded-md',
                    day.isCurrentMonth ? 'text-gray-800' : 'text-gray-400',
                    day.hasJournal ? 'bg-blue-50' : '',
                    isSelectedCalendarDay(day.date) ? 'bg-blue-100 border border-blue-300' : '']"
                    @tap="selectCalendarDay(day)">
                    <text class="text-sm">{{ day.day }}</text>
                    <view v-if="day.hasJournal" class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1"></view>
                </view>
            </view>

            <view v-if="selectedCalendarDay" class="flex-1 bg-gray-50 p-4">
                <view class="bg-white rounded-lg shadow-sm p-3 mb-3">
                    <text class="text-base font-medium text-gray-800">{{ formatFullDate(selectedCalendarDay) }}</text>
                </view>

                <view class="space-y-3">
                    <view v-for="journal in selectedDayJournals" :key="journal.id"
                        class="bg-white rounded-lg shadow-sm p-3" @tap="viewJournal(journal.id)">
                        <text class="text-xs text-gray-500 mb-1 block">{{ formatTime(journal.createTime) }}</text>
                        <text class="text-base font-medium text-gray-800 mb-1 block">{{ journal.title || '无标题' }}</text>
                        <text class="text-sm text-gray-600 line-clamp-2">{{ formatPreview(journal.content) }}</text>
                    </view>

                    <view v-if="selectedDayJournals.length === 0"
                        class="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center">
                        <text class="text-gray-500 mb-3">该日期没有日记</text>
                        <button class="bg-blue-500 text-white rounded-full px-4 py-1.5 text-sm"
                            @tap="writeForSelectedDay">写一篇</button>
                    </view>
                </view>
            </view>
        </view>

        <!-- 网格视图 -->
        <view v-if="currentView === 'grid'" class="flex-1 p-4">
            <view class="grid grid-cols-2 gap-3">
                <view v-for="journal in journalList" :key="journal.id"
                    class="bg-white rounded-lg shadow-sm overflow-hidden" @tap="viewJournal(journal.id)">
                    <view v-if="hasImage(journal)" class="w-full aspect-square">
                        <image :src="getFirstImage(journal)" mode="aspectFill" class="w-full h-full"></image>
                    </view>
                    <view v-else class="w-full aspect-square bg-gray-100 flex items-center justify-center">
                        <uni-icons type="calendar-filled" size="40" color="#D1D5DB"></uni-icons>
                    </view>

                    <view class="p-2">
                        <view class="flex justify-between items-center">
                            <text class="text-sm font-medium text-gray-800 truncate flex-1">{{ journal.title || '无标题'
                            }}</text>
                            <uni-icons v-if="journal.isPrivate === 1" type="locked" size="12" color="#9CA3AF"
                                class="ml-1"></uni-icons>
                        </view>
                        <text class="text-xs text-gray-500 mt-1 block">{{ formatFullDate(journal.createTime) }}</text>
                    </view>
                </view>
            </view>

            <!-- 加载状态 -->
            <view v-if="loading" class="py-4 text-center text-gray-500 text-sm">
                <text>加载中...</text>
            </view>

            <!-- 空状态 -->
            <view v-if="isEmpty" class="py-12 flex flex-col items-center justify-center">
                <image src="/static/images/empty-journal.png" mode="aspectFit" class="w-32 h-32 opacity-50 mb-4">
                </image>
                <text class="text-gray-500 mb-4">暂无日记记录</text>
                <button class="bg-blue-500 text-white rounded-full px-5 py-2 text-sm"
                    @tap="navigateToEdit">开始写日记</button>
            </view>
        </view>

        <!-- 筛选弹窗 -->
        <filter-options v-if="showFilter" :initialFilters="filters" @apply="applyFilters" @close="closeFilterOptions" />
    </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { getJournalList, getJournalDates } from '@/api/journal';
import { formatTime, formatFullDate } from '@/utils/timeUtil';

// 视图状态
const currentView = ref('timeline'); // timeline, calendar, grid
const journalList = ref([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(20);
const hasMore = ref(true);
const searchText = ref('');
const showFilter = ref(false);

// 分组后的日记数据
const groupedJournals = computed(() => {
    const groups = {};

    journalList.value.forEach(journal => {
        const date = new Date(journal.createTime);
        const month = `${date.getFullYear()}年${date.getMonth() + 1}月`;
        const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        if (!groups[month]) {
            groups[month] = {};
        }

        if (!groups[month][day]) {
            groups[month][day] = [];
        }

        groups[month][day].push(journal);
    });

    return groups;
});

// 月份折叠状态
const collapsedMonths = reactive({});

// 筛选相关
const selectedMood = ref('');
const filters = reactive({
    hasImage: false,
    isPrivate: false,
    isFavorite: false,
    startDate: '',
    endDate: ''
});

// 日历相关
const currentMonth = ref(new Date());
const selectedCalendarDay = ref(null);
const selectedDayJournals = ref([]);
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

// 日历数据
const calendarDays = computed(() => {
    const year = currentMonth.value.getFullYear();
    const month = currentMonth.value.getMonth();

    // 当月第一天
    const firstDay = new Date(year, month, 1);
    // 当月最后一天
    const lastDay = new Date(year, month + 1, 0);

    // 日历起始日期（上月补齐）
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // 日历结束日期（下月补齐）
    const endDate = new Date(lastDay);
    if (endDate.getDay() < 6) {
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    }

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        days.push({
            date: new Date(currentDate),
            day: currentDate.getDate(),
            isCurrentMonth: currentDate.getMonth() === month,
            hasJournal: false // 将在加载日历数据时更新
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
});

// 当前月份文本
const currentMonthText = computed(() => {
    const year = currentMonth.value.getFullYear();
    const month = currentMonth.value.getMonth() + 1;
    return `${year}年${month}月`;
});

// 空状态判断
const isEmpty = computed(() => {
    return journalList.value.length === 0 && !loading.value;
});

// 加载日记列表
const loadJournals = async (refresh = false) => {
    if (loading.value) return;

    if (refresh) {
        pageNum.value = 1;
        hasMore.value = true;
        journalList.value = [];
    }

    if (!hasMore.value && !refresh) return;

    loading.value = true;

    try {
        const params = {
            pageNum: pageNum.value,
            pageSize: pageSize.value
        };

        // 添加搜索条件
        if (searchText.value) {
            params.keyword = searchText.value;
        }

        // 添加筛选条件
        if (selectedMood.value) {
            params.mood = selectedMood.value;
        }

        if (filters.hasImage) {
            params.hasImage = true;
        }

        if (filters.isPrivate) {
            params.isPrivate = true;
        }

        if (filters.isFavorite) {
            params.isFavorite = true;
        }

        if (filters.startDate) {
            params.startDate = filters.startDate;
        }

        if (filters.endDate) {
            params.endDate = filters.endDate;
        }

        const res = await getJournalList(params);

        if (res.code === 200 && res.data) {
            if (refresh) {
                journalList.value = res.data.records || [];
            } else {
                journalList.value = [...journalList.value, ...(res.data.records || [])];
            }

            hasMore.value = journalList.value.length < res.data.total;
            pageNum.value++;
        }
    } catch (error) {
        console.error('加载日记列表失败:', error);
        uni.showToast({
            title: '加载失败，请重试',
            icon: 'none'
        });
    } finally {
        loading.value = false;
        uni.stopPullDownRefresh();
    }
};

// 加载更多
const loadMore = () => {
    if (!loading.value && hasMore.value) {
        loadJournals();
    }
};

// 切换视图
const switchView = (view) => {
    currentView.value = view;

    if (view === 'calendar') {
        updateCalendarData();
    }
};

// 切换月份折叠状态
const toggleMonthCollapse = (month) => {
    collapsedMonths[month] = !collapsedMonths[month];
};

// 格式化内容预览
const formatPreview = (content) => {
    if (!content) return '';

    // 移除HTML标签
    const plainText = content.replace(/<[^>]+>/g, '');
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
};

// 判断是否有图片
const hasImage = (journal) => {
    return journal.imageUrls && journal.imageUrls !== '' && journal.imageCount > 0;
};

// 获取第一张图片
const getFirstImage = (journal) => {
    if (!journal.imageUrls) return '';

    try {
        // 尝试解析JSON
        if (typeof journal.imageUrls === 'string') {
            const images = JSON.parse(journal.imageUrls);
            return Array.isArray(images) && images.length > 0 ? images[0] : '';
        }

        // 如果已经是数组
        if (Array.isArray(journal.imageUrls) && journal.imageUrls.length > 0) {
            return journal.imageUrls[0];
        }

        return '';
    } catch (e) {
        console.error('解析图片URL失败:', e);
        return '';
    }
};

// 判断是否有标签或心情
const hasTagsOrMood = (journal) => {
    return (journal.keywords && journal.keywords.length > 0) || journal.relatedMoodId;
};

// 获取关键词列表
const getKeywords = (journal) => {
    if (!journal.keywords) return [];

    return journal.keywords.split(',').filter(k => k.trim());
};

// 查看日记详情
const viewJournal = (id) => {
    uni.navigateTo({
        url: `/pages/journal/detail?id=${id}`
    });
};

// 前往编辑页面
const navigateToEdit = () => {
    uni.navigateTo({
        url: '/pages/journal/edit'
    });
};

// 为选中日期写日记
const writeForSelectedDay = () => {
    if (!selectedCalendarDay.value) return;

    const date = selectedCalendarDay.value;
    uni.navigateTo({
        url: `/pages/journal/edit?date=${date.toISOString()}`
    });
};

// 更新日历数据
const updateCalendarData = async () => {
    try {
        // 获取当月第一天和最后一天
        const year = currentMonth.value.getFullYear();
        const month = currentMonth.value.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // 扩展到日历的实际范围
        const startDate = new Date(calendarDays.value[0].date);
        const endDate = new Date(calendarDays.value[calendarDays.value.length - 1].date);

        const params = {
            startDate: formatDateToYYYYMMDD(startDate),
            endDate: formatDateToYYYYMMDD(endDate)
        };

        const res = await getJournalDates(params);

        if (res.code === 200 && res.data) {
            const journalDates = res.data;

            // 更新日历数据
            calendarDays.value.forEach(day => {
                const dateStr = formatDateToYYYYMMDD(day.date);
                day.hasJournal = journalDates.includes(dateStr);
            });
        }
    } catch (error) {
        console.error('加载日历数据失败:', error);
    }
};

// 格式化日期为YYYY-MM-DD
const formatDateToYYYYMMDD = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// 上一个月
const prevMonth = () => {
    const newDate = new Date(currentMonth.value);
    newDate.setMonth(newDate.getMonth() - 1);
    currentMonth.value = newDate;
    updateCalendarData();
};

// 下一个月
const nextMonth = () => {
    const newDate = new Date(currentMonth.value);
    newDate.setMonth(newDate.getMonth() + 1);
    currentMonth.value = newDate;
    updateCalendarData();
};

// 判断是否为选中的日历日期
const isSelectedCalendarDay = (date) => {
    if (!selectedCalendarDay.value) return false;

    const selected = selectedCalendarDay.value;
    return date.getFullYear() === selected.getFullYear() &&
        date.getMonth() === selected.getMonth() &&
        date.getDate() === selected.getDate();
};

// 选择日历日期
const selectCalendarDay = async (day) => {
    selectedCalendarDay.value = day.date;

    // 加载选中日期的日记
    const dateStr = formatDateToYYYYMMDD(day.date);

    try {
        const res = await getJournalList({
            date: dateStr,
            pageSize: 100
        });

        if (res.code === 200 && res.data) {
            selectedDayJournals.value = res.data.records || [];
        }
    } catch (error) {
        console.error('加载日期日记失败:', error);
    }
};

// 新增返回方法
const goBack = () => {
    uni.navigateBack();
};

// 显示筛选选项
const showFilterOptions = () => {
    showFilter.value = true;
};

// 关闭筛选选项
const closeFilterOptions = () => {
    showFilter.value = false;
};

// 应用筛选条件
const applyFilters = () => {
    loadJournals(true);
};

// 搜索日记
const searchJournals = () => {
    loadJournals(true);
};

// 前往关键词云页面
const navigateToKeywords = () => {
    uni.navigateTo({
        url: '/pages/journal/keywords'
    });
};

// 格式化日期为标题格式 例如：5月15日 星期三
const formatDayTitle = (dayStr) => {
    const date = new Date(dayStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDay = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
    return `${month}月${day}日 星期${weekDay}`;
};

onLoad(() => {
    loadJournals(true);
    if (currentView.value === 'calendar') {
        updateCalendarData();
    }
});

// 下拉刷新
onPullDownRefresh(() => {
    loadJournals(true).finally(() => {
        uni.stopPullDownRefresh();
    });
    if (currentView.value === 'calendar') {
        updateCalendarData();
    }
});

// 上拉加载更多 (页面级)
onReachBottom(() => {
    if (currentView.value === 'timeline' || currentView.value === 'grid') {
        loadMore();
    }
});
</script>
