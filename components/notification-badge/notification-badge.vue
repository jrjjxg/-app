<template>
    <view class="notification-badge" @click="navigateToNotifications">
        <uni-icons type="notification" size="24" color="#6b7280"></uni-icons>
        <view class="badge" v-if="unreadCount > 0">{{ displayCount }}</view>
    </view>
</template>

<script>
import { getUnreadNotificationCount } from '@/api/alert';

export default {
    name: 'NotificationBadge',
    data() {
        return {
            unreadCount: 0,
            timer: null
        };
    },

    computed: {
        displayCount() {
            return this.unreadCount > 99 ? '99+' : this.unreadCount;
        }
    },

    created() {
        this.fetchUnreadCount();
        // 定时刷新未读数
        this.timer = setInterval(() => {
            this.fetchUnreadCount();
        }, 60000); // 每分钟刷新一次
    },

    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    },

    methods: {
        async fetchUnreadCount() {
            try {
                const res = await getUnreadNotificationCount();
                if (res.code === 200) {
                    this.unreadCount = res.data || 0;
                }
            } catch (error) {
                console.error('获取未读通知数失败', error);
            }
        },

        navigateToNotifications() {
            uni.navigateTo({
                url: '/pages/notifications/index'
            });
        }
    }
};
</script>

<style scoped>
.notification-badge {
    position: relative;
    padding: 8px;
}

.badge {
    position: absolute;
    top: 4px;
    right: 4px;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    background-color: #ef4444;
    color: white;
    font-size: 10px;
    text-align: center;
    line-height: 16px;
    padding: 0 4px;
}
</style>