<template>
  <!-- 头部 -->
  <view class="bg-white px-4 pt-12 pb-4 shadow-sm">
    <view class="flex items-center justify-between mb-4">
      <view class="flex items-center">
        <view class="flex items-center">
          <navigator url="/pages/mood-tracker/index" open-type="navigateBack" hover-class="none">
            <view class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
              <text class="iconfont icon-arrow-left text-gray-600"></text>
            </view>
          </navigator>
          <text class="text-xl font-bold text-gray-800">情绪历史</text>
        </view>

        <!-- 分享按钮 -->
        <view class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center" @tap="showShareOptions">
          <text class="iconfont icon-share text-blue-600"></text>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view scroll-y class="flex-1 px-4 py-5" @scrolltolower="loadMoreData">
      <!-- 日期筛选 -->
      <view class="bg-white rounded-xl p-4 shadow-sm mb-6 flex items-center justify-between">
        <view class="flex items-center">
          <text class="text-gray-600 mr-2">筛选：</text>
          <picker mode="selector" :range="dateRanges" :value="dateRangeIndex" @change="onDateRangeChange">
            <view class="flex items-center">
              <text class="text-blue-600">{{ dateRanges[dateRangeIndex] }}</text>
              <text class="iconfont icon-chevron-down text-blue-600 ml-1"></text>
            </view>
          </picker>
        </view>

        <view v-if="dateRangeIndex === 4" class="flex items-center">
          <picker mode="date" :value="customStartDate" @change="onStartDateChange">
            <text class="text-sm text-gray-600">{{ customStartDate }}</text>
          </picker>
          <text class="mx-2 text-gray-600">至</text>
          <picker mode="date" :value="customEndDate" @change="onEndDateChange">
            <text class="text-sm text-gray-600">{{ customEndDate }}</text>
          </picker>
        </view>
      </view>

      <!-- 情绪记录列表 -->
      <view v-if="loading && page === 1" class="flex justify-center py-6">
        <text class="text-gray-500">加载中...</text>
      </view>

      <view v-else-if="moods.length === 0" class="bg-white rounded-xl p-6 shadow-sm flex justify-center">
        <text class="text-gray-500">暂无情绪记录</text>
      </view>

      <view v-else>
        <!-- 日期分组 -->
        <view v-for="(group, date) in groupedMoods" :key="date" class="mb-6">
          <view class="flex items-center mb-2">
            <view class="w-2 h-2 rounded-full bg-blue-500 mr-2"></view>
            <text class="text-sm font-medium text-gray-700">{{ formatGroupDate(date) }}</text>
          </view>

          <mood-card v-for="mood in group" :key="mood.id" :mood="mood" @click="viewMoodDetail(mood.id)" />
        </view>

        <!-- 加载更多 -->
        <view v-if="hasMore && !loading" class="flex justify-center py-4">
          <text class="text-blue-500" @click="loadMoreData">加载更多</text>
        </view>

        <view v-if="loading && page > 1" class="flex justify-center py-4">
          <text class="text-gray-500">加载中...</text>
        </view>

        <view v-if="!hasMore && moods.length > 0" class="flex justify-center py-4">
          <text class="text-gray-500">没有更多记录了</text>
        </view>
      </view>
    </scroll-view>

    <!-- 分享弹窗 -->
    <view v-if="showShareModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      @tap="closeShareModal">
      <view class="bg-white rounded-xl w-4/5 max-h-4/5 overflow-hidden" @tap.stop>
        <view class="p-5">
          <view class="flex justify-between items-center mb-4">
            <text class="text-lg font-bold">分享情绪记录</text>
            <view class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" @tap="closeShareModal">
              <text class="iconfont icon-close text-gray-600"></text>
            </view>
          </view>

          <view class="mb-4">
            <text class="text-sm text-gray-600 mb-2 block">选择时间范围：</text>
            <picker mode="selector" :range="shareRanges" :value="shareRangeIndex" @change="onShareRangeChange">
              <view class="border border-gray-300 rounded-lg p-3 flex justify-between items-center">
                <text>{{ shareRanges[shareRangeIndex] }}</text>
                <text class="iconfont icon-chevron-down text-gray-500"></text>
              </view>
            </picker>
          </view>

          <!-- 使用抽离的分享卡片组件 -->
          <mood-share-card :loading="shareCardLoading" :card-data="shareCardData" :start-date="shareStartDate"
            :end-date="shareEndDate" />
        </view>
      </view>
    </view>
  </view>

</template>

<script>
import MoodCard from '@/components/mood-components/mood-card.vue';
import MoodShareCard from '@/components/mood-components/mood-share-card.vue';
import { getMoodHistory, getMoodByDateRange, generateMoodShareCard } from '@/api/mood';

export default {
  components: {
    MoodCard,
    MoodShareCard
  },
  data() {
    return {
      loading: true,
      moods: [],
      page: 1,
      pageSize: 10,
      total: 0,
      hasMore: true,
      dateRanges: ['全部', '最近7天', '最近30天', '最近90天', '自定义'],
      dateRangeIndex: 0,
      customStartDate: this.formatDateForPicker(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
      customEndDate: this.formatDateForPicker(new Date()),

      // 分享相关数据
      showShareModal: false,
      shareRanges: ['最近7天', '最近30天', '最近90天', '本月', '自定义'],
      shareRangeIndex: 0,
      shareStartDate: '',
      shareEndDate: '',
      shareCardLoading: false,
      shareCardData: null
    }
  },
  computed: {
    groupedMoods() {
      const groups = {};
      this.moods.forEach(mood => {
        const date = new Date(mood.createTime).toISOString().split('T')[0];
        if (!groups[date]) groups[date] = [];
        groups[date].push(mood);
      });

      return Object.keys(groups)
        .sort((a, b) => new Date(b) - new Date(a))
        .reduce((result, key) => {
          result[key] = groups[key];
          return result;
        }, {});
    }
  },
  onLoad() {
    this.loadMoodData();
  },
  methods: {
    async loadMoodData(reset = true) {
      try {
        this.loading = true;
        if (reset) {
          this.page = 1;
          this.moods = [];
        }

        let response;
        if (this.dateRangeIndex === 0) {
          // 全部记录，使用分页
          response = await getMoodHistory(this.page, this.pageSize);
        } else {
          // 日期范围筛选
          let startDate, endDate;
          const today = new Date();

          switch (this.dateRangeIndex) {
            case 1: // 最近7天
              startDate = new Date(today);
              startDate.setDate(today.getDate() - 7);
              break;
            case 2: // 最近30天
              startDate = new Date(today);
              startDate.setDate(today.getDate() - 30);
              break;
            case 3: // 最近90天
              startDate = new Date(today);
              startDate.setDate(today.getDate() - 90);
              break;
            case 4: // 自定义
              startDate = new Date(this.customStartDate);
              endDate = new Date(this.customEndDate);
              break;
          }

          if (!endDate) endDate = today;
          response = await getMoodByDateRange(
            this.formatDateForApi(startDate),
            this.formatDateForApi(endDate)
          );
        }

        if (response.code === 200) {
          if (this.dateRangeIndex === 0) {
            const { records, total } = response.data;
            this.moods = [...this.moods, ...records];
            this.total = total;
            this.hasMore = this.moods.length < total;
          } else {
            this.moods = response.data;
            this.hasMore = false;
          }
        }
      } catch (error) {
        uni.showToast({ title: '加载数据失败', icon: 'none' });
      } finally {
        this.loading = false;
      }
    },

    loadMoreData() {
      if (this.loading || !this.hasMore || this.dateRangeIndex !== 0) return;
      this.page++;
      this.loadMoodData(false);
    },

    onDateRangeChange(e) {
      this.dateRangeIndex = e.detail.value;
      this.loadMoodData();
    },

    onStartDateChange(e) {
      this.customStartDate = e.detail.value;
      if (this.dateRangeIndex === 4) this.loadMoodData();
    },

    onEndDateChange(e) {
      this.customEndDate = e.detail.value;
      if (this.dateRangeIndex === 4) this.loadMoodData();
    },

    viewMoodDetail(id) {
      const mood = this.moods.find(m => m.id === id);
      if (mood) {
        uni.showModal({
          title: mood.emotionType,
          content: mood.note || '无记录内容',
          showCancel: false
        });
      }
    },

    formatGroupDate(dateStr) {
      const date = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      if (dateStr === today.toISOString().split('T')[0]) return '今天';
      if (dateStr === yesterday.toISOString().split('T')[0]) return '昨天';
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    },

    // 分享相关方法
    showShareOptions() {
      this.showShareModal = true;

      // 设置默认日期范围
      const today = new Date();
      let startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);

      this.shareStartDate = this.formatDateForPicker(startDate);
      this.shareEndDate = this.formatDateForPicker(today);

      this.loadShareCardData();
    },

    closeShareModal() {
      this.showShareModal = false;
    },

    onShareRangeChange(e) {
      this.shareRangeIndex = e.detail.value;
      const today = new Date();
      let startDate;

      switch (this.shareRangeIndex) {
        case 0: // 最近7天
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          break;
        case 1: // 最近30天
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 30);
          break;
        case 2: // 最近90天
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 90);
          break;
        case 3: // 本月
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case 4: // 自定义
          return; // 自定义时不自动更新日期
      }

      this.shareStartDate = this.formatDateForPicker(startDate);
      this.shareEndDate = this.formatDateForPicker(today);
      this.loadShareCardData();
    },

    async loadShareCardData() {
      try {
        this.shareCardLoading = true;
        this.shareCardData = null;

        // 确保日期参数存在
        if (!this.shareStartDate || !this.shareEndDate) {
          const today = new Date();
          let startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);

          this.shareStartDate = this.formatDateForPicker(startDate);
          this.shareEndDate = this.formatDateForPicker(today);
        }

        const formattedStartDate = this.formatDateForApi(new Date(this.shareStartDate));
        const formattedEndDate = this.formatDateForApi(new Date(this.shareEndDate));

        const response = await generateMoodShareCard(formattedStartDate, formattedEndDate);

        if (response.code === 200) {
          this.shareCardData = response.data;
        }
      } catch (error) {
        uni.showToast({ title: '加载分享数据失败', icon: 'none' });
      } finally {
        this.shareCardLoading = false;
      }
    },

    formatDateForPicker(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },

    formatDateForApi(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
  }
}
</script>

<style>
#shareCardContainer {
  transition: all 0.3s ease;
}
</style>