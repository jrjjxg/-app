<template>
    <view class="chat-container">
        <!-- 顶部导航栏 -->
        <view class="header">
            <view class="back-icon" @click="goBack">
                <uni-icons type="back" size="20"></uni-icons>
            </view>
            <view class="title">{{ targetUserNickname }}</view>
        </view>

        <!-- 聊天内容 -->
        <scroll-view scroll-y class="message-list" :scroll-top="scrollTop" :scroll-into-view="scrollIntoView"
            @scrolltoupper="loadMoreMessages" refresher-enabled :refresher-triggered="refreshing"
            @refresherrefresh="onRefresh">
            <view v-if="loading && messages.length === 0" class="loading-container">
                <uni-load-more status="loading"></uni-load-more>
            </view>

            <view v-else>
                <!-- 加载更多提示 -->
                <uni-load-more v-if="hasMore" :status="loadMoreStatus" class="load-more"></uni-load-more>

                <!-- 消息列表 -->
                <view v-for="(message, index) in messages" :key="message.id" :id="`msg-${message.id}`"
                    class="message-item" :class="{ 'self': message.isSelf }">
                    <!-- 日期分割线 -->
                    <view v-if="showDateDivider(index)" class="date-divider">
                        <text>{{ formatDate(message.createTime) }}</text>
                    </view>

                    <!-- 头像 -->
                    <image :src="message.isSelf ? selfAvatar : targetUserAvatar" class="avatar"
                        :class="{ 'self-avatar': message.isSelf }"></image>

                    <!-- 消息内容 -->
                    <view class="message-bubble" :class="{ 'self-bubble': message.isSelf }">
                        <text class="message-text">{{ message.content }}</text>
                        <view class="message-time">{{ formatMessageTime(message.createTime) }}</view>
                    </view>
                </view>
            </view>
        </scroll-view>

        <!-- 输入框 -->
        <view class="input-area">
            <textarea class="message-input" v-model="inputContent" placeholder="请输入消息..." :adjust-position="false"
                :cursor-spacing="10" :show-confirm-bar="false" :auto-height="true" :maxlength="-1" @focus="onInputFocus"
                @blur="onInputBlur" @confirm="sendMessage"></textarea>
            <view class="send-btn" :class="{ disabled: !canSend }" @click="sendMessage">发送</view>
        </view>
    </view>
</template>

<script>
import { getPrivateMessages, sendPrivateMessage, markAllMessagesRead } from '@/api/message';

export default {
    data() {
        return {
            targetUserId: '',
            targetUserNickname: '',
            targetUserAvatar: '',
            selfAvatar: '', // 当前用户头像
            loading: true,
            refreshing: false,
            messages: [],
            pageNum: 1,
            pageSize: 20,
            hasMore: true,
            loadMoreStatus: 'more',
            inputContent: '',
            scrollTop: 0,
            scrollIntoView: '',
            isKeyboardShow: false
        }
    },
    computed: {
        canSend() {
            return this.inputContent.trim().length > 0;
        }
    },
    onLoad(options) {
        this.targetUserId = options.id || '';
        this.targetUserNickname = decodeURIComponent(options.nickname || '用户');
        this.targetUserAvatar = decodeURIComponent(options.avatar || '');

        // 获取当前用户头像
        this.selfAvatar = uni.getStorageSync('userAvatar') || '/static/images/default-avatar.png';

        this.loadMessages();

        // 标记所有消息为已读
        this.markAllRead();
    },
    methods: {
        goBack() {
            uni.navigateBack();
        },

        // 加载消息列表
        async loadMessages() {
            if (this.loading && this.pageNum > 1) return;

            this.loading = true;
            this.loadMoreStatus = 'loading';

            try {
                const res = await getPrivateMessages(this.targetUserId, this.pageNum, this.pageSize);

                let newMessages = res.data.records || [];

                // 处理消息，添加isSelf标记
                newMessages = newMessages.map(msg => ({
                    ...msg,
                    isSelf: msg.senderId === uni.getStorageSync('userId')
                }));

                if (this.pageNum === 1) {
                    this.messages = newMessages;
                    // 滚动到底部
                    this.$nextTick(() => {
                        this.scrollToBottom();
                    });
                } else {
                    // 加载更多时，消息需要添加到顶部
                    this.messages = [...newMessages, ...this.messages];
                }

                this.hasMore = newMessages.length >= this.pageSize;
                this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
            } catch (error) {
                console.error('加载消息失败', error);
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
            this.loadMessages();
        },

        // 加载更多
        loadMoreMessages() {
            if (!this.hasMore || this.loading) return;
            this.pageNum++;
            this.loadMessages();
        },

        // 发送消息
        async sendMessage() {
            if (!this.canSend) return;

            const content = this.inputContent.trim();
            this.inputContent = '';

            // 先添加到本地消息列表
            const tempId = 'temp-' + Date.now();
            const tempMessage = {
                id: tempId,
                content: content,
                senderId: uni.getStorageSync('userId'),
                receiverId: this.targetUserId,
                createTime: new Date().toISOString(),
                isSelf: true,
                sending: true
            };

            this.messages.push(tempMessage);

            // 滚动到底部
            this.$nextTick(() => {
                this.scrollToBottom();
            });

            try {
                const res = await sendPrivateMessage({
                    receiverId: this.targetUserId,
                    content: content
                });

                // 更新临时消息
                const index = this.messages.findIndex(msg => msg.id === tempId);
                if (index !== -1) {
                    this.messages[index] = {
                        ...res.data,
                        isSelf: true,
                        sending: false
                    };
                }
            } catch (error) {
                console.error('发送消息失败', error);

                // 更新临时消息状态为发送失败
                const index = this.messages.findIndex(msg => msg.id === tempId);
                if (index !== -1) {
                    this.messages[index].sending = false;
                    this.messages[index].failed = true;
                }

                uni.showToast({
                    title: '发送失败，请重试',
                    icon: 'none'
                });
            }
        },

        // 标记所有消息为已读
        async markAllRead() {
            try {
                await markAllMessagesRead(this.targetUserId);
            } catch (error) {
                console.error('标记已读失败', error);
            }
        },

        // 滚动到底部
        scrollToBottom() {
            if (this.messages.length > 0) {
                const lastMessage = this.messages[this.messages.length - 1];
                this.scrollIntoView = `msg-${lastMessage.id}`;
            }
        },

        // 输入框获取焦点
        onInputFocus() {
            this.isKeyboardShow = true;
            // 延迟滚动到底部，等待键盘弹出
            setTimeout(() => {
                this.scrollToBottom();
            }, 300);
        },

        // 输入框失去焦点
        onInputBlur() {
            this.isKeyboardShow = false;
        },

        // 是否显示日期分割线
        showDateDivider(index) {
            if (index === 0) return true;

            const currentDate = new Date(this.messages[index].createTime).toDateString();
            const prevDate = new Date(this.messages[index - 1].createTime).toDateString();

            return currentDate !== prevDate;
        },

        // 格式化日期
        formatDate(time) {
            if (!time) return '';

            const messageDate = new Date(time);
            const now = new Date();

            // 今天
            if (messageDate.toDateString() === now.toDateString()) {
                return '今天';
            }

            // 昨天
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            if (messageDate.toDateString() === yesterday.toDateString()) {
                return '昨天';
            }

            // 一周内
            const weekDiff = Math.floor((now - messageDate) / (24 * 60 * 60 * 1000));
            if (weekDiff < 7) {
                const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
                return weekdays[messageDate.getDay()];
            }

            // 其他日期
            const year = messageDate.getFullYear();
            const month = messageDate.getMonth() + 1;
            const day = messageDate.getDate();

            // 如果是今年，不显示年份
            if (year === now.getFullYear()) {
                return `${month}月${day}日`;
            }

            return `${year}年${month}月${day}日`;
        },

        // 格式化消息时间
        formatMessageTime(time) {
            if (!time) return '';

            const date = new Date(time);
            const hours = date.getHours();
            const minutes = date.getMinutes();

            return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
        }
    }
}
</script>

<style>
.chat-container {
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

.message-list {
    flex: 1;
    padding: 10px;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100px;
}

.load-more {
    margin: 10px 0;
}

.date-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 10px 0;
}

.date-divider text {
    font-size: 12px;
    color: #999;
    background-color: #f5f5f5;
    padding: 2px 10px;
    border-radius: 10px;
}

.message-item {
    display: flex;
    margin-bottom: 15px;
}

.message-item.self {
    flex-direction: row-reverse;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    margin-right: 10px;
}

.self-avatar {
    margin-right: 0;
    margin-left: 10px;
}

.message-bubble {
    max-width: 70%;
    padding: 10px;
    border-radius: 10px;
    background-color: #fff;
    position: relative;
}

.self-bubble {
    background-color: #007aff;
    color: #fff;
}

.message-text {
    font-size: 16px;
    word-break: break-all;
}

.message-time {
    font-size: 10px;
    color: #999;
    text-align: right;
    margin-top: 5px;
}

.self-bubble .message-time {
    color: rgba(255, 255, 255, 0.7);
}

.input-area {
    display: flex;
    align-items: flex-end;
    padding: 10px;
    background-color: #fff;
    border-top: 1px solid #eee;
}

.message-input {
    flex: 1;
    min-height: 36px;
    max-height: 120px;
    padding: 8px 10px;
    background-color: #f5f5f5;
    border-radius: 18px;
    font-size: 16px;
    margin-right: 10px;
}

.send-btn {
    width: 60px;
    height: 36px;
    background-color: #007aff;
    color: #fff;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}

.send-btn.disabled {
    background-color: #ccc;
}
</style>