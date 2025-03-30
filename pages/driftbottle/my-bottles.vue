<template>
    <view class="container">
        <!-- 顶部导航栏 -->
        <view class="header">
            <view class="back-btn" @click="goBack">
                <uni-icons type="back" size="20"></uni-icons>
            </view>
            <view class="title">我的漂流瓶</view>
        </view>

        <!-- 标签栏 -->
        <view class="tabs">
            <view class="tab-item" :class="{ active: activeTab === 'thrown' }" @click="changeTab('thrown')">
                我扔的
            </view>
            <view class="tab-item" :class="{ active: activeTab === 'picked' }" @click="changeTab('picked')">
                我捞的
            </view>
        </view>

        <!-- 漂流瓶列表 -->
        <scroll-view scroll-y class="bottle-list" @scrolltolower="loadMoreBottles" refresher-enabled
            :refresher-triggered="refreshing" @refresherrefresh="onRefresh">

            <view v-if="loading && bottles.length === 0" class="loading-container">
                <uni-load-more status="loading"></uni-load-more>
            </view>

            <view v-else-if="bottles.length === 0" class="empty-container">
                <image src="/static/images/empty-bottle.png" mode="aspectFit" class="empty-image"></image>
                <text class="empty-text">{{ activeTab === 'thrown' ? '你还没有投掷过漂流瓶' : '你还没有捞到过漂流瓶' }}</text>
            </view>

            <view v-else>
                <view v-for="bottle in bottles" :key="bottle.id" class="bottle-item"
                    @click="goToBottleDetail(bottle.id)">
                    <!-- 漂流瓶状态标签 -->
                    <view v-if="activeTab === 'thrown'" class="status-tag" :class="getStatusClass(bottle.status)">
                        {{ getStatusText(bottle.status) }}
                    </view>

                    <!-- 漂流瓶内容预览 -->
                    <view class="bottle-content">
                        <view class="bottle-text">{{ bottle.content }}</view>

                        <!-- 图片预览 -->
                        <view v-if="bottle.images && bottle.images.length > 0" class="bottle-images">
                            <image v-for="(img, index) in bottle.images.slice(0, 3)" :key="index" :src="img"
                                mode="aspectFill" class="bottle-image-preview"></image>
                            <view v-if="bottle.images.length > 3" class="more-images">+{{ bottle.images.length - 3 }}
                            </view>
                        </view>
                    </view>

                    <!-- 底部信息 -->
                    <view class="bottle-footer">
                        <view class="bottle-time">{{ formatTime(bottle.createTime) }}</view>
                        <view v-if="activeTab === 'thrown' && bottle.status === 2" class="picked-info">
                            已被捞取 {{ formatTime(bottle.pickTime) }}
                        </view>
                        <view v-if="activeTab === 'picked'" class="reply-btn" @click.stop="goToBottleDetail(bottle.id)">
                            回复
                        </view>
                    </view>
                </view>

                <!-- 加载更多 -->
                <uni-load-more v-if="hasMoreData" :status="loadMoreStatus"></uni-load-more>
            </view>

        </scroll-view>
    </view>
</template>

<script>
import { getMyThrownBottles, getMyPickedBottles } from '@/api/driftbottle';

export default {
    data() {
        return {
            activeTab: 'thrown',
            bottles: [],
            pageNum: 1,
            pageSize: 10,
            total: 0,
            loading: false,
            refreshing: false,
            loadMoreStatus: 'more'
        };
    },
    computed: {
        hasMoreData() {
            return this.bottles.length < this.total;
        }
    },
    onLoad() {
        this.loadBottles();
    },
    methods: {
        goBack() {
            uni.navigateBack();
        },
        changeTab(tab) {
            if (this.activeTab !== tab) {
                this.activeTab = tab;
                this.bottles = [];
                this.pageNum = 1;
                this.total = 0;
                this.loadBottles();
            }
        },
        async loadBottles(loadMore = false) {
            if (this.loading && !this.refreshing) return;

            this.loading = true;
            if (loadMore) {
                this.loadMoreStatus = 'loading';
            }

            try {
                const fetchFunc = this.activeTab === 'thrown' ? getMyThrownBottles : getMyPickedBottles;
                const res = await fetchFunc(this.pageNum, this.pageSize);

                if (res.code === 200) {
                    const newBottles = res.data.records || [];

                    // 处理图片数据
                    newBottles.forEach(bottle => {
                        if (typeof bottle.images === 'string') {
                            bottle.images = bottle.images.split(',').filter(img => img);
                        } else if (!bottle.images) {
                            bottle.images = [];
                        }
                    });

                    if (loadMore) {
                        this.bottles = [...this.bottles, ...newBottles];
                    } else {
                        this.bottles = newBottles;
                    }

                    this.total = res.data.total || 0;

                    if (this.hasMoreData) {
                        this.loadMoreStatus = 'more';
                    } else {
                        this.loadMoreStatus = 'noMore';
                    }
                } else {
                    uni.showToast({
                        title: res.message || '获取漂流瓶列表失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                uni.showToast({
                    title: '获取漂流瓶列表失败',
                    icon: 'none'
                });
            } finally {
                this.loading = false;
                this.refreshing = false;
            }
        },
        loadMoreBottles() {
            if (this.hasMoreData && !this.loading) {
                this.pageNum++;
                this.loadBottles(true);
            }
        },
        onRefresh() {
            this.refreshing = true;
            this.pageNum = 1;
            this.loadBottles();
        },
        goToBottleDetail(bottleId) {
            uni.navigateTo({
                url: `/pages/driftbottle/detail?id=${bottleId}`
            });
        },
        getStatusClass(status) {
            switch (status) {
                case 0: return 'status-pending';
                case 1: return 'status-published';
                case 2: return 'status-picked';
                case 3: return 'status-rejected';
                default: return '';
            }
        },
        getStatusText(status) {
            switch (status) {
                case 0: return '待审核';
                case 1: return '已发布';
                case 2: return '已被捞取';
                case 3: return '审核拒绝';
                default: return '未知状态';
            }
        },
        formatTime(time) {
            if (!time) return '';
            const date = new Date(time);
            const now = new Date();
            const diff = now - date;

            // 一小时内
            if (diff < 3600000) {
                const minutes = Math.floor(diff / 60000);
                return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
            }

            // 24小时内
            if (diff < 86400000) {
                return `${Math.floor(diff / 3600000)}小时前`;
            }

            // 30天内
            if (diff < 2592000000) {
                return `${Math.floor(diff / 86400000)}天前`;
            }

            // 超过30天
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    }
};
</script>

<style>
.container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f8f8f8;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background-color: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.back-btn {
    padding: 5px;
}

.title {
    font-size: 18px;
    font-weight: bold;
}

.tabs {
    display: flex;
    background-color: #ffffff;
    border-bottom: 1px solid #eeeeee;
}

.tab-item {
    flex: 1;
    height: 44px;
    line-height: 44px;
    text-align: center;
    font-size: 16px;
    color: #666666;
    position: relative;
}

.tab-item.active {
    color: #007aff;
    font-weight: bold;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 3px;
    background-color: #007aff;
    border-radius: 1.5px;
}

.bottle-list {
    flex: 1;
    padding: 15px;
}

.loading-container,
.empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
}

.empty-image {
    width: 120px;
    height: 120px;
    margin-bottom: 10px;
}

.empty-text {
    font-size: 14px;
    color: #999999;
}

.bottle-item {
    background-color: #ffffff;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    position: relative;
}

.status-tag {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 3px 8px;
    border-radius: 10px;
    font-size: 12px;
    color: #ffffff;
}

.status-pending {
    background-color: #ff9500;
}

.status-published {
    background-color: #34c759;
}

.status-picked {
    background-color: #007aff;
}

.status-rejected {
    background-color: #ff3b30;
}

.bottle-content {
    margin-top: 10px;
    margin-bottom: 10px;
}

.bottle-text {
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
}

.bottle-images {
    display: flex;
    margin-bottom: 10px;
    position: relative;
}

.bottle-image-preview {
    width: 80px;
    height: 80px;
    margin-right: 5px;
    border-radius: 4px;
}

.more-images {
    position: absolute;
    right: 8px;
    bottom: 8px;
    background-color: rgba(0, 0, 0, 0.5);
    color: #ffffff;
    font-size: 12px;
    padding: 2px 5px;
    border-radius: 8px;
}

.bottle-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #999999;
}

.picked-info {
    font-size: 12px;
    color: #007aff;
}

.reply-btn {
    padding: 4px 10px;
    background-color: #007aff;
    color: #ffffff;
    font-size: 12px;
    border-radius: 12px;
}
</style>