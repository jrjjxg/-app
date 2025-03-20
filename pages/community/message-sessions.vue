<template>
    <view class="sessions-container">
        <!-- 顶部导航栏 -->
        <view class="header">
            <view class="back-icon" @click="goBack">
                <uni-icons type="back" size="20"></uni-icons>
            </view>
            <view class="title">私信</view>
        </view>

        <!-- 会话列表 -->
        <scroll-view scroll-y class="session-list" @scrolltolower="loadMoreSessions" refresher-enabled
            :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
            <view v-if="loading && sessions.length === 0" class="loading-container">
                <uni-load-more status="loading"></uni-load-more>
            </view>

            <view v-else-if="sessions.length === 0" class="empty-container">
                <image src="/static/images/empty-message.png" mode="aspectFit" class="empty-image"></image>
                <text class="empty-text">暂无私信</text>
            </view>

            <view v-else>
                <view v-for="session in sessions" :key="session.id" class="session-item" @click="goToChat(session)">
                    <view class="avatar-container">
                        <image :src="session.targetUser.avatar" class="user-avatar"></image>
                        <view v-if="session.unreadCount > 0" class="unread-badge">{{ session.unreadCount > 99 ? '99+' :
                            session.unreadCount }}</view>
                    </view>
                    <view class="session-info">
                        <view class="session-header">
                            <view class="user-name">{{ session.targetUser.nickname }}</view>
                            <view class="message-time">{{ formatTime(session.lastMessageTime) }}</view>
                        </view>
                        <view class="last-message">{{ session.lastMessage }}</view>
                    </view>
                </view>

                <!-- 加载更多 -->
                <uni-load-more v-if="sessions.length > 0" :status="loadMoreStatus"></uni-load-more>
            </view>
        </scroll-view>
    </view>
</template>

<script>
import { getMessageSessions } from '@/api/message';

export default {
    data() {
        return {
            loading: true,
            refreshing: false,
            sessions: [],
            pageNum: 1,
            pageSize: 20,
            hasMore: true,
            loadMoreStatus: 'more'
        }
    },
    onLoad() {
        this.loadSessions();
    },
    onShow() {
        // 每次页面显示时刷新会话列表
        this.refreshSessions();
    },
    methods: {
        goBack() {
            uni.navigateBack();
        },

        // 加载会话列表
        async loadSessions() {
            if (this.loading && this.pageNum > 1) return;

            this.loading = true;
            this.loadMoreStatus = 'loading';

            try {
                const res = await getMessageSessions(this.pageNum, this.pageSize);

                if (this.pageNum === 1) {
                    this.sessions = res.data.records || [];
                } else {
                    this.sessions = [...this.sessions, ...(res.data.records || [])];
                }

                this.hasMore = this.sessions.length < res.data.total;
                this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
            } catch (error) {
                console.error('加载会话列表失败', error);
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

        // 刷新会话列表
        refreshSessions() {
            this.pageNum = 1;
            this.loadSessions();
        },

        // 下拉刷新
        onRefresh() {
            this.refreshing = true;
            this.refreshSessions();
        },

        // 加载更多
        loadMoreSessions() {
            if (!this.hasMore || this.loading) return;
            this.pageNum++;
            this.loadSessions();
        },

        // 跳转到聊天页面
        goToChat(session) {
            uni.navigateTo({
                url: `/pages/community/chat?id=${session.targetUser.id}&nickname=${encodeURIComponent(session.targetUser.nickname)}&avatar=${encodeURIComponent(session.targetUser.avatar)}`
            });
        },

        // 格式化时间
        formatTime(time) {
            if (!time) return '';

            const now = new Date();
            const messageTime = new Date(time);
            const diff = now - messageTime;

            // 今天的消息只显示时间
            if (messageTime.toDateString() === now.toDateString()) {
                const hours = messageTime.getHours();
                const minutes = messageTime.getMinutes();
                return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
            }

            // 昨天的消息显示"昨天"
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            if (messageTime.toDateString() === yesterday.toDateString()) {
                return '昨天';
            }

            // 一周内的消息显示星期几
            if (diff < 7 * 24 * 60 * 60 * 1000) {
                const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
                return `星期${weekdays[messageTime.getDay()]}`;
            }

            // 更早的消息显示日期
            const month = messageTime.getMonth() + 1;
            const day = messageTime.getDate();
            return `${month}月${day}日`;
        }
    }
}
</script>

<style>
.sessions-container {
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

.session-list {
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

.session-item {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: #fff;
    border-bottom: 1px solid #eee;
}

.avatar-container {
    position: relative;
    margin-right: 10px;
}

.user-avatar {
    width: 50px;
    height: 50px;
    border-radius: 25px;
}

.unread-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    background-color: #ff3b30;
    color: #fff;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
}

.session-info {
    flex: 1;
}

.session-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}

.user-name {
    font-size: 16px;
    font-weight: bold;
}

.message-time {
    font-size: 12px;
    color: #999;
}

.last-message {
    font-size: 14px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>