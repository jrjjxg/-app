<template>
    <view class="search-container">
        <!-- 顶部搜索栏 -->
        <view class="search-header">
            <view class="search-input-wrapper">
                <uni-icons type="search" size="16" color="#999"></uni-icons>
                <input class="search-input" type="text" v-model="keyword" placeholder="搜索帖子、用户" confirm-type="search"
                    @confirm="search" focus />
                <uni-icons v-if="keyword" type="clear" size="16" color="#999" @click="clearKeyword"></uni-icons>
            </view>
            <view class="cancel-btn" @click="goBack">取消</view>
        </view>

        <!-- 搜索历史 -->
        <view class="search-history" v-if="!keyword && searchHistory.length > 0">
            <view class="history-header">
                <text class="section-title">搜索历史</text>
                <uni-icons type="trash" size="18" color="#999" @click="clearHistory"></uni-icons>
            </view>
            <view class="history-list">
                <view v-for="(item, index) in searchHistory" :key="index" class="history-item"
                    @click="useHistoryKeyword(item)">
                    <uni-icons type="search" size="16" color="#999"></uni-icons>
                    <text class="history-text">{{ item }}</text>
                </view>
            </view>
        </view>

        <!-- 热门搜索 -->
        <view class="hot-search" v-if="!keyword && hotKeywords.length > 0">
            <view class="section-title">热门搜索</view>
            <view class="hot-list">
                <view v-for="(item, index) in hotKeywords" :key="index" class="hot-item"
                    @click="useHistoryKeyword(item)">
                    <text class="hot-rank" :class="{ 'top-rank': index < 3 }">{{ index + 1 }}</text>
                    <text class="hot-text">{{ item }}</text>
                </view>
            </view>
        </view>

        <!-- 搜索结果 -->
        <view class="search-result" v-if="keyword && hasSearched">
            <!-- 搜索结果标签页 -->
            <view class="result-tabs">
                <view class="tab-item" :class="{ active: activeTab === 'post' }" @click="changeTab('post')">
                    帖子
                </view>
                <view class="tab-item" :class="{ active: activeTab === 'user' }" @click="changeTab('user')">
                    用户
                </view>
            </view>

            <!-- 帖子搜索结果 -->
            <scroll-view v-if="activeTab === 'post'" scroll-y class="result-list" @scrolltolower="loadMoreResults"
                refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
                <view v-if="loading && results.length === 0" class="loading-container">
                    <uni-load-more status="loading"></uni-load-more>
                </view>

                <view v-else-if="results.length === 0" class="empty-container">
                    <image src="/static/images/empty-search.png" mode="aspectFit" class="empty-image"></image>
                    <text class="empty-text">没有找到相关帖子</text>
                </view>

                <view v-else>
                    <view v-for="post in results" :key="post.id" class="post-item" @click="goToPostDetail(post.id)">
                        <view class="post-content">
                            <view class="post-title" v-if="post.title">
                                <text v-html="highlightKeyword(post.title)"></text>
                            </view>
                            <view class="post-text">
                                <text v-html="highlightKeyword(post.content)"></text>
                            </view>
                        </view>
                        <view class="post-footer">
                            <view class="post-author">
                                <image :src="post.author.avatar" class="author-avatar"></image>
                                <text class="author-name">{{ post.author.nickname }}</text>
                            </view>
                            <view class="post-stats">
                                <view class="stat-item">
                                    <uni-icons type="eye" size="14"></uni-icons>
                                    <text>{{ post.viewCount || 0 }}</text>
                                </view>
                                <view class="stat-item">
                                    <uni-icons type="chat" size="14"></uni-icons>
                                    <text>{{ post.commentCount || 0 }}</text>
                                </view>
                                <view class="stat-item">
                                    <uni-icons type="heart" size="14"></uni-icons>
                                    <text>{{ post.likeCount || 0 }}</text>
                                </view>
                            </view>
                        </view>
                    </view>

                    <!-- 加载更多 -->
                    <uni-load-more v-if="results.length > 0" :status="loadMoreStatus"></uni-load-more>
                </view>
            </scroll-view>

            <!-- 用户搜索结果 -->
            <scroll-view v-if="activeTab === 'user'" scroll-y class="result-list" @scrolltolower="loadMoreResults"
                refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
                <view v-if="loading && results.length === 0" class="loading-container">
                    <uni-load-more status="loading"></uni-load-more>
                </view>

                <view v-else-if="results.length === 0" class="empty-container">
                    <image src="/static/images/empty-search.png" mode="aspectFit" class="empty-image"></image>
                    <text class="empty-text">没有找到相关用户</text>
                </view>

                <view v-else>
                    <view v-for="user in results" :key="user.id" class="user-item" @click="goToUserProfile(user.id)">
                        <image :src="user.avatar" class="user-avatar"></image>
                        <view class="user-info">
                            <view class="user-name">
                                <text v-html="highlightKeyword(user.nickname)"></text>
                                <view v-if="user.isExpert" class="expert-tag">专家</view>
                            </view>
                            <view class="user-bio">{{ user.bio || '这个人很懒，什么都没留下' }}</view>
                        </view>
                        <view class="follow-btn" :class="{ active: user.isFollowed }" @click.stop="toggleFollow(user)">
                            {{ user.isFollowed ? '已关注' : '关注' }}
                        </view>
                    </view>

                    <!-- 加载更多 -->
                    <uni-load-more v-if="results.length > 0" :status="loadMoreStatus"></uni-load-more>
                </view>
            </scroll-view>
        </view>
    </view>
</template>

<script>
import { searchPosts, searchUsers } from '@/api/search';
import { toggleFollow } from '@/api/follow';

export default {
    data() {
        return {
            keyword: '',
            searchHistory: [],
            hotKeywords: ['焦虑', '抑郁', '失眠', '情绪管理', '心理健康', '压力', '自我成长', '冥想'],
            activeTab: 'post',
            hasSearched: false,
            loading: false,
            refreshing: false,
            results: [],
            pageNum: 1,
            pageSize: 10,
            hasMore: true,
            loadMoreStatus: 'more'
        }
    },
    onLoad() {
        // 从本地存储加载搜索历史
        const history = uni.getStorageSync('searchHistory');
        if (history) {
            this.searchHistory = JSON.parse(history);
        }
    },
    methods: {
        goBack() {
            uni.navigateBack();
        },

        // 清除关键词
        clearKeyword() {
            this.keyword = '';
            this.hasSearched = false;
        },

        // 使用历史关键词
        useHistoryKeyword(keyword) {
            this.keyword = keyword;
            this.search();
        },

        // 清除搜索历史
        clearHistory() {
            uni.showModal({
                title: '提示',
                content: '确定要清空搜索历史吗？',
                success: (res) => {
                    if (res.confirm) {
                        this.searchHistory = [];
                        uni.setStorageSync('searchHistory', JSON.stringify([]));
                    }
                }
            });
        },

        // 切换标签页
        changeTab(tab) {
            if (this.activeTab === tab) return;
            this.activeTab = tab;
            this.results = [];
            this.pageNum = 1;
            this.hasMore = true;
            this.loadMoreStatus = 'more';
            this.search();
        },

        // 搜索
        async search() {
            const keyword = this.keyword.trim();
            if (!keyword) return;

            // 添加到搜索历史
            if (!this.searchHistory.includes(keyword)) {
                this.searchHistory.unshift(keyword);
                // 只保留最近10条搜索记录
                if (this.searchHistory.length > 10) {
                    this.searchHistory = this.searchHistory.slice(0, 10);
                }
                uni.setStorageSync('searchHistory', JSON.stringify(this.searchHistory));
            }

            this.hasSearched = true;
            this.loading = true;
            this.pageNum = 1;
            this.results = [];
            this.loadMoreStatus = 'loading';

            try {
                let res;
                if (this.activeTab === 'post') {
                    res = await searchPosts(keyword, this.pageNum, this.pageSize);
                } else {
                    res = await searchUsers(keyword, this.pageNum, this.pageSize);
                }

                this.results = res.data.records || [];
                this.hasMore = this.results.length < res.data.total;
                this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
            } catch (error) {
                console.error('搜索失败', error);
                uni.showToast({
                    title: '搜索失败，请重试',
                    icon: 'none'
                });
                this.loadMoreStatus = 'more';
            } finally {
                this.loading = false;
                this.refreshing = false;
            }
        },

        // 下拉刷新
        onRefresh() {
            this.refreshing = true;
            this.search();
        },

        // 加载更多
        async loadMoreResults() {
            if (!this.hasMore || this.loading) return;

            this.pageNum++;
            this.loading = true;
            this.loadMoreStatus = 'loading';

            try {
                let res;
                if (this.activeTab === 'post') {
                    res = await searchPosts(this.keyword, this.pageNum, this.pageSize);
                } else {
                    res = await searchUsers(this.keyword, this.pageNum, this.pageSize);
                }

                const newResults = res.data.records || [];
                this.results = [...this.results, ...newResults];

                this.hasMore = this.results.length < res.data.total;
                this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
            } catch (error) {
                console.error('加载更多失败', error);
                uni.showToast({
                    title: '加载失败，请重试',
                    icon: 'none'
                });
                this.loadMoreStatus = 'more';
            } finally {
                this.loading = false;
            }
        },

        // 高亮关键词
        highlightKeyword(text) {
            if (!text) return '';

            const keyword = this.keyword.trim();
            if (!keyword) return text;

            // 转义特殊字符
            const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapeRegExp(keyword), 'gi');

            return text.replace(regex, match => `<span style="color: #007aff;">${match}</span>`);
        },

        // 关注/取消关注
        async toggleFollow(user) {
            try {
                const res = await toggleFollow(user.id);
                user.isFollowed = res.data;

                uni.showToast({
                    title: user.isFollowed ? '关注成功' : '已取消关注',
                    icon: 'none'
                });
            } catch (error) {
                console.error('关注操作失败', error);
                uni.showToast({
                    title: '操作失败，请重试',
                    icon: 'none'
                });
            }
        },

        // 跳转到帖子详情
        goToPostDetail(postId) {
            uni.navigateTo({
                url: `/pages/community/post-detail?id=${postId}`
            });
        },

        // 跳转到用户主页
        goToUserProfile(userId) {
            uni.navigateTo({
                url: `/pages/community/user-profile?id=${userId}`
            });
        }
    }
}
</script>

<style>
.search-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f5f5;
}

.search-header {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    background-color: #fff;
    border-bottom: 1px solid #eee;
}

.search-input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    height: 36px;
    background-color: #f0f0f0;
    border-radius: 18px;
    padding: 0 10px;
    margin-right: 10px;
}

.search-input {
    flex: 1;
    height: 36px;
    margin: 0 5px;
    font-size: 14px;
}

.cancel-btn {
    font-size: 14px;
    color: #007aff;
}

.search-history,
.hot-search {
    background-color: #fff;
    margin-bottom: 10px;
    padding: 15px;
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
}

.history-list,
.hot-list {
    display: flex;
    flex-direction: column;
}

.history-item {
    display: flex;
    align-items: center;
    height: 40px;
    font-size: 14px;
    color: #333;
    border-bottom: 1px solid #f5f5f5;
}

.history-text {
    margin-left: 10px;
}

.hot-item {
    display: flex;
    align-items: center;
    height: 40px;
    font-size: 14px;
    color: #333;
    border-bottom: 1px solid #f5f5f5;
}

.hot-rank {
    width: 20px;
    height: 20px;
    background-color: #f0f0f0;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    margin-right: 10px;
}

.top-rank {
    background-color: #ff6b6b;
    color: #fff;
}

.search-result {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.result-tabs {
    display: flex;
    background-color: #fff;
    border-bottom: 1px solid #eee;
}

.tab-item {
    flex: 1;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #666;
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
    left: 25%;
    width: 50%;
    height: 2px;
    background-color: #007aff;
}

.result-list {
    flex: 1;
    background-color: #f5f5f5;
}

.loading-container,
.empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
}

.empty-image {
    width: 100px;
    height: 100px;
    margin-bottom: 10px;
}

.empty-text {
    color: #999;
    font-size: 14px;
}

.post-item {
    background-color: #fff;
    padding: 15px;
    margin-bottom: 10px;
}

.post-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
}

.post-text {
    font-size: 14px;
    color: #333;
    line-height: 1.5;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
}

.post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #f0f0f0;
    padding-top: 10px;
}

.post-author {
    display: flex;
    align-items: center;
}

.author-avatar {
    width: 24px;
    height: 24px;
    border-radius: 12px;
    margin-right: 5px;
}

.author-name {
    font-size: 12px;
    color: #666;
}

.post-stats {
    display: flex;
}

.stat-item {
    display: flex;
    align-items: center;
    margin-left: 10px;
    font-size: 12px;
    color: #999;
}

.stat-item text {
    margin-left: 3px;
}

.user-item {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: #fff;
    margin-bottom: 10px;
}

.user-avatar {
    width: 50px;
    height: 50px;
    border-radius: 25px;
    margin-right: 10px;
}

.user-info {
    flex: 1;
}

.user-name {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
}

.expert-tag {
    font-size: 10px;
    color: #fff;
    background-color: #ff9500;
    padding: 2px 5px;
    border-radius: 3px;
    margin-left: 5px;
}

.user-bio {
    font-size: 12px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.follow-btn {
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
    background-color: #007aff;
    color: #fff;
}

.follow-btn.active {
    background-color: #f0f0f0;
    color: #333;
}
</style>
