<template>
    <view class="flex flex-col h-screen bg-gray-50">
        <!-- 顶部标题 -->
        <view class="flex justify-between items-center p-4 bg-white border-b border-gray-100">
            <view class="text-lg font-semibold text-gray-800">通知中心</view>
            <text class="text-sm text-purple-700" @click="markAllAsRead" v-if="notifications.length > 0">全部标为已读</text>
        </view>

        <!-- 胶囊切换标签 -->
        <view class="bg-white px-5 pb-3 border-b border-gray-100">
            <view class="flex bg-gray-100 rounded-full p-1">
                <view class="flex-1 text-center text-sm py-2 rounded-full transition-all duration-300"
                    :class="activeTab === 'system' ? 'bg-purple-800 text-white font-medium' : 'text-gray-500'"
                    @click="switchTab('system')">
                    系统通知
                </view>
                <view class="flex-1 text-center text-sm py-2 rounded-full transition-all duration-300"
                    :class="activeTab === 'community' ? 'bg-purple-800 text-white font-medium' : 'text-gray-500'"
                    @click="switchTab('community')">
                    互动消息
                </view>
            </view>
        </view>

        <scroll-view scroll-y class="flex-1 h-0" refresher-enabled :refresher-triggered="refreshing"
            @refresherrefresh="refresh" @scrolltolower="loadMore">
            <view v-if="loading && !notifications.length" class="py-10 flex justify-center">
                <uni-load-more status="loading"></uni-load-more>
            </view>

            <view v-else-if="!notifications.length" class="py-16 flex flex-col items-center justify-center">
                <image src="/static/images/empty_notification.png" mode="aspectFit" class="w-32 h-32 mb-4"></image>
                <text class="text-sm text-gray-400">暂无通知</text>
            </view>

            <view v-else>
                <view v-for="item in notifications" :key="item.id" class="flex p-4 bg-white border-b border-gray-100"
                    :class="{ 'bg-blue-50': !item.isRead }" @click="handleNotificationClick(item)">
                    <view v-if="!item.isRead" class="absolute top-5 left-3 w-2 h-2 rounded-full bg-red-500"></view>
                    <view class="w-10 h-10 rounded-full flex justify-center items-center mr-3" :class="{
                        'bg-red-500': getIconClass(item) === 'type-alert',
                        'bg-blue-500': getIconClass(item) === 'type-system' || getIconClass(item) === 'type-comment',
                        'bg-green-500': getIconClass(item) === 'type-info' || getIconClass(item) === 'type-message',
                        'bg-purple-500': getIconClass(item) === 'type-follow',
                        'bg-yellow-500': getIconClass(item) === 'type-like',
                        'bg-gray-500': !getIconClass(item)
                    }">
                        <uni-icons :type="getIconByType(item)" size="20" color="#ffffff"></uni-icons>
                    </view>

                    <view class="flex-1">
                        <view class="text-base font-medium text-gray-800 mb-1.5">{{ item.title }}</view>
                        <view class="text-sm text-gray-500 mb-2">{{ formatContent(item.content) }}</view>
                        <view class="text-xs text-gray-400">{{ formatTime(item.createTime) }}</view>
                    </view>
                </view>

                <uni-load-more :status="loadMoreStatus" v-if="notifications.length > 0"></uni-load-more>
            </view>
        </scroll-view>

        <!-- 通知详情弹窗 -->
        <uni-popup ref="detailPopup" type="bottom">
            <view class="bg-white rounded-t-xl p-5 max-h-[70vh] overflow-y-auto">
                <view class="flex justify-between items-center mb-3">
                    <text class="text-lg font-semibold text-gray-800">{{ selectedNotification?.title }}</text>
                    <text class="text-sm text-gray-500" @click="closeDetail">关闭</text>
                </view>
                <view class="text-xs text-gray-400 mb-4">{{ formatTime(selectedNotification?.createTime) }}</view>
                <view class="text-base text-gray-700 leading-relaxed mb-6">{{ selectedNotification?.content }}</view>

                <view class="mt-4">
                    <button
                        class="h-11 w-full rounded-lg flex items-center justify-center bg-purple-800 text-white text-sm mb-3"
                        @click="navigateToRelatedContent()">
                        {{ getActionButtonText() }}
                    </button>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script>
import {
    getSystemNotifications,
    markNotificationAsRead as markSystemNotificationAsRead,
    markAllNotificationsAsRead as markAllSystemNotificationsAsRead
} from '@/api/alert';

import {
    getNotifications as getCommunityNotifications,
    markNotificationRead as markCommunityNotificationRead,
    markAllNotificationsRead as markAllCommunityNotificationsRead
} from '@/api/notification';

import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { request } from '@/api/request';

export default {
    data() {
        return {
            activeTab: 'system', // 默认显示系统通知
            notifications: [],
            page: 1,
            size: 20,
            total: 0,
            loading: false,
            refreshing: false,
            loadMoreStatus: 'more',
            selectedNotification: null,
            // 用于缓存评论相关的帖子ID
            commentToPostMap: {}
        };
    },

    onLoad() {
        this.loadNotifications();
    },

    methods: {
        // 切换标签
        switchTab(tab) {
            if (this.activeTab === tab) return;
            this.activeTab = tab;
            this.page = 1;
            this.notifications = [];
            this.loadMoreStatus = 'more';
            this.loadNotifications(true);
        },

        async loadNotifications(reset = false) {
            if (reset) {
                this.page = 1;
                this.notifications = [];
            }

            if (this.loading) return;

            this.loading = true;
            try {
                let res;
                if (this.activeTab === 'system') {
                    // 加载系统通知
                    res = await getSystemNotifications(this.page, this.size);
                } else {
                    // 加载社区通知
                    res = await getCommunityNotifications(this.page, this.size);
                }

                if (res.code === 200 && res.data) {
                    const list = res.data.records || [];
                    if (reset) {
                        this.notifications = list;
                    } else {
                        this.notifications = [...this.notifications, ...list];
                    }
                    this.total = res.data.total || 0;

                    // 更新加载更多状态
                    if (this.notifications.length >= this.total) {
                        this.loadMoreStatus = 'noMore';
                    } else {
                        this.loadMoreStatus = 'more';
                    }
                }
            } catch (error) {
                console.error('加载通知失败', error);
                uni.showToast({
                    title: '加载通知失败',
                    icon: 'none'
                });
            } finally {
                this.loading = false;
                this.refreshing = false;
            }
        },

        refresh() {
            this.refreshing = true;
            this.loadNotifications(true);
        },

        loadMore() {
            if (this.loadMoreStatus === 'noMore' || this.loading) return;

            this.page++;
            this.loadMoreStatus = 'loading';
            this.loadNotifications();
        },

        getIconClass(item) {
            if (this.activeTab === 'system') {
                return 'type-' + (item.type ? item.type.toLowerCase() : 'system');
            } else {
                // 社区通知的图标类型处理
                switch (item.type) {
                    case 'follow': return 'type-follow';
                    case 'like': return 'type-like';
                    case 'comment': return 'type-comment';
                    case 'message': return 'type-message';
                    default: return 'type-system';
                }
            }
        },

        getIconByType(item) {
            if (this.activeTab === 'system') {
                // 系统通知图标映射
                const iconMap = {
                    'ALERT': 'info',
                    'SYSTEM': 'notification',
                    'INFO': 'info-filled',
                    'follow': 'person-filled'
                };
                return iconMap[item.type] || 'notification';
            } else {
                // 社区通知图标映射
                const iconMap = {
                    'follow': 'person-filled',
                    'like': 'heart',
                    'comment': 'chat',
                    'message': 'email',
                    'system': 'notification'
                };
                return iconMap[item.type] || 'notification';
            }
        },

        formatContent(content) {
            if (!content) return '';
            // 移除换行符、限制长度
            return content.replace(/\n/g, ' ').slice(0, 50) + (content.length > 50 ? '...' : '');
        },

        formatTime(time) {
            if (!time) return '';
            try {
                const date = new Date(time);
                return formatDistance(date, new Date(), { addSuffix: true, locale: zhCN });
            } catch (e) {
                return time;
            }
        },

        // 处理通知点击事件
        handleNotificationClick(notification) {
            // 标记为已读
            if (!notification.isRead) {
                this.markAsRead(notification.id);
                // 更新本地状态
                const index = this.notifications.findIndex(n => n.id === notification.id);
                if (index !== -1) {
                    this.notifications[index].isRead = true;
                }
            }

            // 尝试直接跳转到相关页面
            const canDirectNavigate = this.navigateDirectly(notification);

            // 如果无法直接跳转，则显示详情弹窗
            if (!canDirectNavigate) {
                this.selectedNotification = notification;
                this.$refs.detailPopup.open();
            }
        },

        // 尝试直接跳转到相关页面
        navigateDirectly(notification) {
            try {
                if (this.activeTab === 'system') {
                    // 系统通知需要data字段
                    if (!notification.data) return false;

                    const data = typeof notification.data === 'string' ?
                        JSON.parse(notification.data) : notification.data;

                    // 系统通知直接跳转
                    if (notification.type === 'ALERT' && data.id) {
                        uni.navigateTo({
                            url: `/pages/mental-status/alert-detail?id=${data.id}`
                        });
                        return true;
                    }
                } else {
                    // 社区通知可以直接使用targetId
                    switch (notification.type) {
                        case 'follow':
                            // 对于关注通知，targetId就是发送者用户ID
                            uni.navigateTo({
                                url: `/pages/user/profile?id=${notification.targetId || notification.senderId}`
                            });
                            return true;

                        case 'like':
                            // 对于点赞通知，targetId是被点赞的帖子或评论ID
                            uni.navigateTo({
                                url: `/pages/community/post-detail?id=${notification.targetId}`
                            });
                            return true;

                        case 'comment':
                        case 'reply':
                            // 对于评论通知，需要先获取帖子ID
                            this.navigateToComment(notification.targetId);
                            return true;

                        case 'message':
                            if (notification.senderId) {
                                uni.navigateTo({
                                    url: `/pages/message/chat?userId=${notification.senderId}`
                                });
                                return true;
                            }
                            break;
                    }
                }
            } catch (error) {
                console.error('解析通知数据失败', error);
            }

            return false;
        },

        // 获取操作按钮文本
        getActionButtonText() {
            if (!this.selectedNotification) return '查看详情';

            if (this.activeTab === 'system') {
                if (this.selectedNotification.type === 'ALERT') {
                    return '查看预警详情';
                }
                return '查看详情';
            } else {
                switch (this.selectedNotification.type) {
                    case 'follow': return '查看用户主页';
                    case 'like': return '查看帖子详情';
                    case 'comment': return '查看评论详情';
                    case 'reply': return '查看回复详情';
                    case 'message': return '查看聊天记录';
                    default: return '查看详情';
                }
            }
        },

        // 从详情弹窗导航到相关内容
        navigateToRelatedContent() {
            if (!this.selectedNotification) return;

            try {
                if (this.activeTab === 'system') {
                    // 系统通知需要data字段
                    if (this.selectedNotification.data) {
                        const data = typeof this.selectedNotification.data === 'string' ?
                            JSON.parse(this.selectedNotification.data) : this.selectedNotification.data;

                        // 系统通知
                        if (this.selectedNotification.type === 'ALERT' && data.id) {
                            uni.navigateTo({
                                url: `/pages/mental-status/alert-detail?id=${data.id}`
                            });
                        }
                    }
                } else {
                    // 社区通知
                    const notification = this.selectedNotification;
                    switch (notification.type) {
                        case 'follow':
                            // 对于关注通知，targetId就是发送者用户ID
                            uni.navigateTo({
                                url: `/pages/user/profile?id=${notification.targetId || notification.senderId}`
                            });
                            break;

                        case 'like':
                            // 对于点赞通知，targetId是被点赞的帖子或评论ID
                            uni.navigateTo({
                                url: `/pages/community/post-detail?id=${notification.targetId}`
                            });
                            break;

                        case 'comment':
                        case 'reply':
                            // 对于评论通知，需要先获取帖子ID
                            this.navigateToComment(notification.targetId);
                            break;

                        case 'message':
                            if (notification.senderId) {
                                uni.navigateTo({
                                    url: `/pages/message/chat?userId=${notification.senderId}`
                                });
                            }
                            break;
                    }
                }
            } catch (error) {
                console.error('解析通知数据失败', error);
                uni.showToast({
                    title: '无法打开相关页面',
                    icon: 'none'
                });
            }

            this.closeDetail();
        },

        // 处理评论通知的跳转逻辑
        navigateToComment(commentId) {
            // 如果已经缓存了这个评论对应的帖子ID，直接跳转
            if (this.commentToPostMap[commentId]) {
                uni.navigateTo({
                    url: `/pages/community/post-detail?id=${this.commentToPostMap[commentId]}&commentId=${commentId}`
                });
                return;
            }

            // 显示加载提示
            uni.showLoading({
                title: '跳转中...'
            });

            // 调用API获取评论对应的帖子ID
            this.getCommentDetail(commentId).then(res => {
                if (res.code === 200 && res.data) {
                    const postId = res.data.postId;
                    // 缓存评论ID与帖子ID的映射
                    this.commentToPostMap[commentId] = postId;

                    uni.hideLoading();
                    uni.navigateTo({
                        url: `/pages/community/post-detail?id=${postId}&commentId=${commentId}`
                    });
                } else {
                    uni.hideLoading();
                    uni.showToast({
                        title: '无法获取评论信息',
                        icon: 'none'
                    });
                }
            }).catch(err => {
                console.error('获取评论详情失败', err);
                uni.hideLoading();
                uni.showToast({
                    title: '获取评论信息失败',
                    icon: 'none'
                });

                // 失败时直接尝试跳转到社区页面
                uni.switchTab({
                    url: '/pages/community/index'
                });
            });
        },

        // 获取评论详情的API
        getCommentDetail(commentId) {
            return request({
                url: '/api/community/comment/info/' + commentId,
                method: 'GET'
            });
        },

        closeDetail() {
            this.$refs.detailPopup.close();
            this.selectedNotification = null;
        },

        async markAsRead(id) {
            try {
                if (this.activeTab === 'system') {
                    await markSystemNotificationAsRead(id);
                } else {
                    await markCommunityNotificationRead(id);
                }
            } catch (error) {
                console.error('标记通知为已读失败', error);
            }
        },

        async markAllAsRead() {
            try {
                uni.showLoading({ title: '处理中...' });
                let res;

                if (this.activeTab === 'system') {
                    res = await markAllSystemNotificationsAsRead();
                } else {
                    res = await markAllCommunityNotificationsRead();
                }

                if (res.code === 200) {
                    // 更新本地通知状态
                    this.notifications.forEach(item => {
                        item.isRead = true;
                    });

                    uni.showToast({
                        title: '已全部标为已读',
                        icon: 'success'
                    });
                }
            } catch (error) {
                console.error('标记全部已读失败', error);
                uni.showToast({
                    title: '操作失败',
                    icon: 'none'
                });
            } finally {
                uni.hideLoading();
            }
        }
    }
}
</script>
