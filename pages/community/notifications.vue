<template>
    <view class="notifications-container">
        <!-- 顶部导航栏 -->
        <view class="header">
            <view class="back-icon" @click="goBack">
                <uni-icons type="back" size="20"></uni-icons>
            </view>
            <view class="title">消息通知</view>
            <view class="read-all" @click="markAllAsRead">全部已读</view>
        </view>

        <!-- 通知列表 -->
        <scroll-view scroll-y class="notification-list" @scrolltolower="loadMoreNotifications" refresher-enabled
            :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
            <view v-if="loading && notifications.length === 0" class="loading-container">
                <uni-load-more status="loading"></uni-load-more>
            </view>

            <view v-else-if="notifications.length === 0" class="empty-container">
                <image src="/static/images/empty-notification.png" mode="aspectFit" class="empty-image"></image>
                <text class="empty-text">暂无通知</text>
            </view>

            <view v-else>
                <view v-for="notification in notifications" :key="notification.id" class="notification-item"
                    :class="{ unread: !notification.isRead }" @click="handleNotification(notification)">
                    <!-- 通知图标 -->
                    <view class="notification-icon" :class="getIconClass(notification.type)">
                        <uni-icons :type="getIconType(notification.type)" size="20" color="#fff"></uni-icons>
                    </view>

                    <!-- 通知内容 -->
                    <view class="notification-content">
                        <view class="notification-message">
                            <text class="sender-name">{{ notification.sender.nickname }}</text>
                            <text class="notification-text">{{ notification.content }}</text>
                        </view>
                        <view class="notification-time">{{ formatTime(notification.createTime) }}</view>
                    </view>

                    <!-- 未读标记 -->
                    <view v-if="!notification.isRead" class="unread-dot"></view>
                </view>

                <!-- 加载更多 -->
                <uni-load-more v-if="notifications.length > 0" :status="loadMoreStatus"></uni-load-more>
            </view>
        </scroll-view>
    </view>
</template>

<script>
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/api/notification';

export default {
    data() {
        return {
            loading: true,
            refreshing: false,
            notifications: [],
            pageNum: 1,
            pageSize: 20,
            hasMore: true,
            loadMoreStatus: 'more'
        }
    },
    onLoad() {
        this.loadNotifications();
    },
    methods: {
        goBack() {
            uni.navigateBack();
        },

        // 加载通知
        async loadNotifications() {
            if (this.loading && this.pageNum > 1) return;

            this.loading = true;
            this.loadMoreStatus = 'loading';

            try {
                const res = await getNotifications(this.pageNum, this.pageSize);

                if (this.pageNum === 1) {
                    this.notifications = res.data.records || [];
                } else {
                    this.notifications = [...this.notifications, ...(res.data.records || [])];
                }

                this.hasMore = this.notifications.length < res.data.total;
                this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
            } catch (error) {
                console.error('加载通知失败', error);
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
            this.loadNotifications();
        },

        // 加载更多
        loadMoreNotifications() {
            if (!this.hasMore || this.loading) return;
            this.pageNum++;
            this.loadNotifications();
        },

        // 处理通知点击
        async handleNotification(notification) {
            // 标记为已读
            if (!notification.isRead) {
                try {
                    await markNotificationRead(notification.id);
                    notification.isRead = true;
                } catch (error) {
                    console.error('标记通知已读失败', error);
                }
            }

            // 根据通知类型跳转到相应页面
            switch (notification.type) {
                case 'like':
                    // 跳转到被点赞的内容
                    if (notification.targetType === 'post') {
                        uni.navigateTo({
                            url: `/pages/community/post-detail?id=${notification.targetId}`
                        });
                    }
                    break;
                case 'comment':
                    // 跳转到评论的帖子
                    uni.navigateTo({
                        url: `/pages/community/post-detail?id=${notification.targetId}`
                    });
                    break;
                case 'reply':
                    // 跳转到回复的评论
                    uni.navigateTo({
                        url: `/pages/community/post-detail?id=${notification.postId}&commentId=${notification.targetId}`
                    });
                    break;
                case 'follow':
                    // 跳转到关注者的个人主页
                    uni.navigateTo({
                        url: `/pages/community/user-profile?id=${notification.senderId}`
                    });
                    break;
                case 'system':
                    // 系统通知，可能需要特殊处理
                    break;
            }
        },

        // 标记所有通知为已读
        async markAllAsRead() {
            try {
                const res = await markAllNotificationsRead();
                const count = res.data || 0;

                if (count > 0) {
                    // 更新本地通知状态
                    this.notifications.forEach(notification => {
                        notification.isRead = true;
                    });

                    uni.showToast({
                        title: `已将${count}条通知标记为已读`,
                        icon: 'none'
                    });
                } else {
                    uni.showToast({
                        title: '没有未读通知',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('标记所有通知已读失败', error);
                uni.showToast({
                    title: '操作失败，请重试',
                    icon: 'none'
                });
            }
        },

        // 获取通知图标类名
        getIconClass(type) {
            switch (type) {
                case 'like': return 'icon-like';
                case 'comment': return 'icon-comment';
                case 'reply': return 'icon-comment';
                case 'follow': return 'icon-follow';
                case 'system': return 'icon-system';
                default: return 'icon-system';
            }
        },

        // 获取通知图标类型
        getIconType(type) {
            switch (type) {
                case 'like': return 'heart-filled';
                case 'comment': return 'chat';
                case 'reply': return 'chat';
                case 'follow': return 'person-filled';
                case 'system': return 'info-filled';
                default: return 'info-filled';
            }
        },

        // 格式化时间
        formatTime(time) {
            if (!time) return '';

            const now = new Date();
            const notificationTime = new Date(time);
            const diff = now - notificationTime;

            // 小于1分钟
            if (diff < 60 * 1000) {
                return '刚刚';
            }

            // 小于1小时
            if (diff < 60 * 60 * 1000) {
                return `${Math.floor(diff / (60 * 1000))}分钟前`;
            }

            // 小于24小时
            if (diff < 24 * 60 * 60 * 1000) {
                return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
            }

            // 小于30天
            if (diff < 30 * 24 * 60 * 60 * 1000) {
                return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
            }

            // 大于30天，显示具体日期
            const year = notificationTime.getFullYear();
            const month = notificationTime.getMonth() + 1;
            const day = notificationTime.getDate();

            return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
        }
    }
}
</script>

<style>
.notifications-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f5f5;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    font-size: 18px;
    font-weight: bold;
}

.read-all {
    font-size: 14px;
    color: #007aff;
}

.notification-list {
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

.notification-item {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: #fff;
    border-bottom: 1px solid #eee;
    position: relative;
}

.notification-item.unread {
    background-color: #f0f7ff;
}

.notification-icon {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
}

.icon-like {
    background-color: #ff6b6b;
}

.icon-comment {
    background-color: #4dabf7;
}

.icon-follow {
    background-color: #51cf66;
}

.icon-system {
    background-color: #fcc419;
}

.notification-content {
    flex: 1;
}

.notification-message {
    font-size: 14px;
    color: #333;
    margin-bottom: 5px;
}

.sender-name {
    font-weight: bold;
    margin-right: 5px;
}

.notification-time {
    font-size: 12px;
    color: #999;
}

.unread-dot {
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background-color: #007aff;
    position: absolute;
    right: 15px;
    top: 15px;
}
</style>