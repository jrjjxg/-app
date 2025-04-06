<template>
    <view class="page-container bg-gray-50 flex flex-col h-screen">
        <!-- 头部 -->
        <view class="header bg-gradient-to-r from-indigo-500 to-purple-600 px-4 pt-12 pb-4 flex items-center">
            <view @tap="goBack" class="mr-2">
                <uni-icons type="back" size="20" color="#ffffff"></uni-icons>
            </view>
            <text class="text-lg font-medium text-white truncate">{{ title }}</text>
        </view>

        <!-- 消息区域 -->
        <scroll-view scroll-y class="flex-1 px-4 py-5" scroll-with-animation :scroll-top="scrollTop"
            :scroll-into-view="scrollToMessageId" @scrolltoupper="onScrollToUpper" id="message-container">
            <view v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full py-16">
                <uni-icons type="chat" size="64" color="#d1d5db"></uni-icons>
                <text class="text-gray-400 mt-4 text-center">在下方输入框发送消息开始对话</text>
            </view>

            <view v-else class="pb-4">
                <view v-for="(message, index) in messages" :key="message.id" :id="'msg-' + message.id" class="mb-4">
                    <!-- 用户消息 -->
                    <view v-if="message.role === 'user'" class="flex justify-end">
                        <view class="bg-indigo-500 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] shadow-sm">
                            <text class="text-white">{{ message.content }}</text>
                        </view>
                    </view>

                    <!-- 机器人消息 -->
                    <view v-else-if="message.role === 'assistant'" class="flex justify-start">
                        <view class="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] shadow-sm">
                            <text class="text-gray-800">{{ message.content }}</text>
                        </view>
                    </view>

                    <!-- 显示时间分隔线 -->
                    <view v-if="shouldShowTimestamp(index)" class="flex justify-center my-4">
                        <text class="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded-full">{{
                            formatMessageTime(message.timestamp) }}</text>
                    </view>
                </view>

                <!-- 加载中动画 -->
                <view v-if="isLoading" class="flex justify-start mb-4">
                    <view class="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                        <view class="typing-indicator">
                            <view class="dot"></view>
                            <view class="dot"></view>
                            <view class="dot"></view>
                        </view>
                    </view>
                </view>
            </view>
        </scroll-view>

        <!-- 底部输入区域 -->
        <view class="footer px-4 py-3 bg-white border-t border-gray-200">
            <view class="flex items-center">
                <input class="flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-800" placeholder="输入消息..."
                    confirm-type="send" v-model="inputMessage" @confirm="sendMessage" />
                <view class="ml-2 bg-indigo-500 rounded-full w-10 h-10 flex items-center justify-center"
                    :class="{ 'opacity-50': !inputMessage.trim() }" @tap="sendMessage">
                    <uni-icons type="paperplane" size="20" color="#ffffff"></uni-icons>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { sendMessage, getChatHistory } from '@/api/chatbot.js'

export default {
    data() {
        return {
            threadId: '',
            title: '',
            messages: [],
            inputMessage: '',
            isLoading: false,
            scrollTop: 0,
            scrollToMessageId: '',
            loadingMoreHistory: false
        }
    },
    onLoad(options) {
        if (options.threadId) {
            this.threadId = options.threadId
            this.title = decodeURIComponent(options.title || '聊天对话')
            this.fetchChatHistory()
        } else {
            uni.showToast({
                title: '参数错误',
                icon: 'none'
            })
            setTimeout(() => {
                uni.navigateBack()
            }, 1500)
        }
    },
    methods: {
        async fetchChatHistory() {
            try {
                const res = await getChatHistory(this.threadId)
                this.messages = res.data || []
                this.$nextTick(() => {
                    this.scrollToBottom()
                })
            } catch (error) {
                console.error('获取聊天历史失败', error)
                uni.showToast({
                    title: '获取聊天历史失败',
                    icon: 'none'
                })
            }
        },
        async sendMessage() {
            if (!this.inputMessage.trim()) return

            const userMessage = this.inputMessage.trim()
            this.inputMessage = ''

            // 先将用户消息添加到列表中
            const tempUserId = 'temp-' + Date.now()
            this.messages.push({
                id: tempUserId,
                role: 'user',
                content: userMessage,
                timestamp: new Date().toISOString()
            })

            this.$nextTick(() => {
                this.scrollToBottom()
            })

            // 显示加载中
            this.isLoading = true

            try {
                // 发送消息到服务器
                const res = await sendMessage(this.threadId, userMessage)
                this.isLoading = false

                if (res.data) {
                    // 添加助手回复
                    this.messages.push({
                        id: 'msg-' + Date.now(),
                        role: 'assistant',
                        content: res.data.message,
                        timestamp: res.data.timestamp
                    })

                    this.$nextTick(() => {
                        this.scrollToBottom()
                    })
                }
            } catch (error) {
                this.isLoading = false
                console.error('发送消息失败', error)
                uni.showToast({
                    title: '发送消息失败',
                    icon: 'none'
                })
            }
        },
        goBack() {
            uni.navigateBack()
        },
        scrollToBottom() {
            // 获取最后一条消息ID
            if (this.messages.length > 0) {
                this.scrollToMessageId = 'msg-' + this.messages[this.messages.length - 1].id
            }

            // 使用延时确保滚动生效
            setTimeout(() => {
                const query = uni.createSelectorQuery().in(this)
                query.select('#message-container').boundingClientRect()
                query.exec((res) => {
                    if (res && res[0]) {
                        this.scrollTop = res[0].height * 2 // 设置一个足够大的值确保滚动到底部
                    }
                })
            }, 100)
        },
        shouldShowTimestamp(index) {
            // 第一条消息显示时间
            if (index === 0) return true

            // 相隔超过5分钟的消息显示时间
            if (index > 0) {
                const currentTime = new Date(this.messages[index].timestamp).getTime()
                const prevTime = new Date(this.messages[index - 1].timestamp).getTime()
                return Math.abs(currentTime - prevTime) > 5 * 60 * 1000
            }

            return false
        },
        formatMessageTime(timestamp) {
            if (!timestamp) return ''

            const date = new Date(timestamp)
            const now = new Date()

            // 如果是今天的日期，只显示时间
            if (date.toDateString() === now.toDateString()) {
                return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
            }

            // 否则显示完整日期
            return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
        },
        onScrollToUpper() {
            // 这里可以加载更多历史消息
            // 如果需要实现无限滚动加载历史消息功能
            console.log('滚动到顶部，可以实现加载更多历史消息')
        }
    }
}
</script>

<style>
.page-container {
    min-height: 100vh;
}

/* 打字指示器动画 */
.typing-indicator {
    display: flex;
    align-items: center;
    height: 20px;
}

.dot {
    width: 8px;
    height: 8px;
    background-color: #d1d5db;
    border-radius: 50%;
    margin: 0 2px;
    animation: bounce 1.5s infinite ease-in-out;
}

.dot:nth-child(1) {
    animation-delay: 0s;
}

.dot:nth-child(2) {
    animation-delay: 0.2s;
}

.dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: translateY(0);
    }

    40% {
        transform: translateY(-6px);
    }
}
</style>