<template>
    <view class="following-container">
        <!-- 顶部导航栏 -->
        <view class="header">
            <view class="back-icon" @click="goBack">
                <uni-icons type="back" size="20"></uni-icons>
            </view>
            <view class="title">{{ nickname }}的关注</view>
        </view>

        <!-- 用户列表 -->
        <scroll-view scroll-y class="user-list" @scrolltolower="loadMoreUsers" refresher-enabled
            :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
            <view v-if="loading && users.length === 0" class="loading-container">
                <uni-load-more status="loading"></uni-load-more>
            </view>

            <view v-else-if="users.length === 0" class="empty-container">
                <image src="/static/images/empty-follow.png" mode="aspectFit" class="empty-image"></image>
                <text class="empty-text">暂无关注</text>
            </view>

            <view v-else>
                <view v-for="user in users" :key="user.id" class="user-item" @click="goToUserProfile(user.id)">
                    <image :src="user.avatar || '/static/images/default-avatar.png'" class="user-avatar"></image>
                    <view class="user-info">
                        <view class="user-name">
                            {{ user.nickname || user.username }}
                            <view v-if="user.isExpert" class="expert-tag">专家</view>
                        </view>
                        <view class="user-bio">{{ user.bio || '这个人很懒，什么都没留下' }}</view>
                    </view>
                    <view class="follow-btn" :class="{ active: user.isFollowed }" @click.stop="toggleFollow(user)">
                        {{ user.isFollowed ? '已关注' : '关注' }}
                    </view>
                </view>

                <!-- 加载更多 -->
                <uni-load-more v-if="users.length > 0" :status="loadMoreStatus"></uni-load-more>
            </view>
        </scroll-view>
    </view>
</template>

<script>
import { getFollowingList, toggleFollow } from '@/api/follow';


export default {
    data() {
        return {
            userId: '',
            nickname: '',
            loading: true,
            refreshing: false,
            users: [],
            pageNum: 1,
            pageSize: 20,
            hasMore: true,
            loadMoreStatus: 'more'
        }
    },
    onLoad(options) {
        this.userId = options.id || '';
        this.nickname = decodeURIComponent(options.nickname || '用户');
        this.loadUsers();
    },
    methods: {
        goBack() {
            uni.navigateBack();
        },

        // 加载用户列表
        async loadUsers() {
            if (this.loading && this.pageNum > 1) return;

            this.loading = true;
            this.loadMoreStatus = 'loading';

            try {
                const res = await getFollowingList(this.userId, this.pageNum, this.pageSize);

                if (this.pageNum === 1) {
                    this.users = res.data.records || [];
                } else {
                    this.users = [...this.users, ...(res.data.records || [])];
                }

                this.hasMore = this.users.length < res.data.total;
                this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
            } catch (error) {
                console.error('加载关注列表失败', error);
                uni.showToast({
                    title: '加载失败，请重试',
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
            this.pageNum = 1;
            this.loadUsers();
        },

        // 加载更多
        loadMoreUsers() {
            if (!this.hasMore || this.loading) return;
            this.pageNum++;
            this.loadUsers();
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
.following-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f5f5;
}

.header {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    background-color: #fff;
    border-bottom: 1px solid #eee;
}

.back-icon {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.title {
    flex: 1;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
}

.user-list {
    flex: 1;
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

.user-item {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: #fff;
    border-bottom: 1px solid #eee;
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
    font-size: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
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
    max-width: 200px;
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