<template>
    <view class="container">
        <!-- 顶部导航栏 -->
        <view class="header">
            <view class="back-btn" @click="goBack">
                <uni-icons type="back" size="20"></uni-icons>
            </view>
            <view class="title">漂流瓶详情</view>
            <view class="more-btn" @click="showActionSheet">
                <uni-icons type="more-filled" size="20"></uni-icons>
            </view>
        </view>

        <!-- 加载中 -->
        <view v-if="loading" class="loading-container">
            <uni-load-more status="loading"></uni-load-more>
        </view>

        <!-- 漂流瓶内容 -->
        <scroll-view v-else scroll-y class="bottle-content-area" refresher-enabled :refresher-triggered="refreshing"
            @refresherrefresh="onRefresh">
            <view class="bottle-card">
                <!-- 用户信息 -->
                <view class="author-info" v-if="!bottle.isAnonymous">
                    <image :src="bottle.author.avatar || '/static/images/default-avatar.png'" class="author-avatar"
                        @click="goToUserProfile(bottle.author.id)"></image>
                    <view class="author-name">{{ bottle.author.nickname }}</view>
                </view>
                <view class="author-info" v-else>
                    <image src="/static/images/anonymous-avatar.png" class="author-avatar"></image>
                    <view class="author-name">匿名用户</view>
                </view>

                <!-- 漂流瓶内容 -->
                <view class="bottle-content">{{ bottle.content }}</view>

                <!-- 图片展示 -->
                <view v-if="bottle.images && bottle.images.length > 0" class="bottle-images">
                    <image v-for="(img, index) in bottle.images" :key="index" :src="img" class="bottle-image"
                        mode="widthFix" @click="previewImage(index)"></image>
                </view>

                <!-- 时间信息 -->
                <view class="bottle-time">{{ formatTime(bottle.createTime) }}</view>
            </view>

            <!-- 分割线 -->
            <view class="divider">
                <view class="divider-line"></view>
                <view class="divider-text">回复列表</view>
                <view class="divider-line"></view>
            </view>

            <!-- 回复列表 -->
            <view class="replies-area">
                <view v-if="bottle.replies && bottle.replies.length > 0">
                    <view v-for="(reply, index) in bottle.replies" :key="reply.id" class="reply-item">
                        <image :src="reply.author.avatar || '/static/images/default-avatar.png'" class="reply-avatar">
                        </image>
                        <view class="reply-content">
                            <view class="reply-author">{{ reply.author.nickname }}</view>
                            <view class="reply-text">{{ reply.content }}</view>
                            <view class="reply-time">{{ formatTime(reply.createTime) }}</view>
                        </view>
                    </view>
                </view>
                <view v-else class="empty-replies">
                    <image src="/static/images/empty-comment.png" mode="aspectFit" class="empty-image"></image>
                    <text class="empty-text">还没有人回复，快来说点什么吧</text>
                </view>
            </view>
        </scroll-view>

        <!-- 回复输入框 -->
        <view class="reply-input-area">
            <input class="reply-input" type="text" v-model="replyContent" placeholder="写下你的回复..." :disabled="isReplying"
                confirm-type="send" @confirm="sendReply" />
            <view class="send-btn" :class="{ disabled: !canReply }" @click="sendReply">发送</view>
        </view>
    </view>
</template>

<script>
import { getBottleDetail, replyBottle } from '@/api/driftbottle';

export default {
    data() {
        return {
            bottleId: '',
            bottle: {},
            loading: true,
            refreshing: false,
            replyContent: '',
            isReplying: false
        };
    },
    computed: {
        canReply() {
            return this.replyContent.trim().length > 0 && !this.isReplying;
        }
    },
    onLoad(options) {
        if (options.id) {
            this.bottleId = options.id;
            this.loadBottleDetail();
        } else {
            uni.showToast({
                title: '参数错误',
                icon: 'none'
            });
            setTimeout(() => {
                uni.navigateBack();
            }, 1500);
        }
    },
    methods: {
        goBack() {
            uni.navigateBack();
        },
        async loadBottleDetail() {
            this.loading = true;
            try {
                const res = await getBottleDetail(this.bottleId);
                if (res.code === 200) {
                    this.bottle = res.data;

                    // 处理图片数据
                    if (typeof this.bottle.images === 'string') {
                        this.bottle.images = this.bottle.images.split(',').filter(img => img);
                    }
                } else {
                    uni.showToast({
                        title: res.message || '获取漂流瓶详情失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                uni.showToast({
                    title: '获取漂流瓶详情失败',
                    icon: 'none'
                });
            } finally {
                this.loading = false;
                this.refreshing = false;
            }
        },
        onRefresh() {
            this.refreshing = true;
            this.loadBottleDetail();
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
        },
        previewImage(index) {
            uni.previewImage({
                urls: this.bottle.images,
                current: this.bottle.images[index]
            });
        },
        goToUserProfile(userId) {
            if (userId) {
                uni.navigateTo({
                    url: `/pages/community/user-profile?id=${userId}`
                });
            }
        },
        async sendReply() {
            if (!this.canReply) return;

            this.isReplying = true;
            try {
                const replyData = {
                    bottleId: this.bottleId,
                    content: this.replyContent
                };

                const res = await replyBottle(replyData);

                if (res.code === 200) {
                    // 重新加载详情，获取最新回复
                    await this.loadBottleDetail();

                    // 清空输入框
                    this.replyContent = '';

                    uni.showToast({
                        title: '回复成功',
                        icon: 'success'
                    });
                } else {
                    uni.showToast({
                        title: res.message || '回复失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                uni.showToast({
                    title: '回复失败，请重试',
                    icon: 'none'
                });
            } finally {
                this.isReplying = false;
            }
        },
        showActionSheet() {
            uni.showActionSheet({
                itemList: ['举报', '分享'],
                success: (res) => {
                    switch (res.tapIndex) {
                        case 0:
                            this.reportBottle();
                            break;
                        case 1:
                            this.shareBottle();
                            break;
                    }
                }
            });
        },
        reportBottle() {
            uni.showToast({
                title: '举报功能开发中',
                icon: 'none'
            });
        },
        shareBottle() {
            uni.showToast({
                title: '分享功能开发中',
                icon: 'none'
            });
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

.back-btn,
.more-btn {
    padding: 5px;
}

.title {
    font-size: 18px;
    font-weight: bold;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
}

.bottle-content-area {
    flex: 1;
    padding: 15px;
}

.bottle-card {
    background-color: #ffffff;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.author-info {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.author-avatar {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    margin-right: 10px;
}

.author-name {
    font-size: 16px;
    font-weight: bold;
}

.bottle-content {
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 10px;
}

.bottle-images {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 10px;
}

.bottle-image {
    width: 100%;
    max-width: 100%;
    border-radius: 5px;
    margin-bottom: 5px;
}

.bottle-time {
    font-size: 12px;
    color: #999999;
    text-align: right;
}

.divider {
    display: flex;
    align-items: center;
    margin: 15px 0;
}

.divider-line {
    flex: 1;
    height: 1px;
    background-color: #eeeeee;
}

.divider-text {
    margin: 0 10px;
    font-size: 14px;
    color: #999999;
}

.replies-area {
    min-height: 200px;
}

.reply-item {
    display: flex;
    margin-bottom: 15px;
}

.reply-avatar {
    width: 30px;
    height: 30px;
    border-radius: 15px;
    margin-right: 10px;
}

.reply-content {
    flex: 1;
}

.reply-author {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 5px;
}

.reply-text {
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 5px;
}

.reply-time {
    font-size: 12px;
    color: #999999;
}

.empty-replies {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 0;
}

.empty-image {
    width: 100px;
    height: 100px;
    margin-bottom: 10px;
}

.empty-text {
    font-size: 14px;
    color: #999999;
}

.reply-input-area {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    background-color: #ffffff;
    border-top: 1px solid #eeeeee;
}

.reply-input {
    flex: 1;
    height: 36px;
    padding: 0 10px;
    border-radius: 18px;
    background-color: #f0f0f0;
    font-size: 14px;
}

.send-btn {
    margin-left: 10px;
    padding: 0 12px;
    height: 36px;
    line-height: 36px;
    border-radius: 18px;
    background-color: #007aff;
    color: #ffffff;
    font-size: 14px;
    text-align: center;
}

.send-btn.disabled {
    background-color: #cccccc;
}
</style>