<template>
    <view class="page-container bg-gray-50 flex flex-col h-screen">
        <!-- 头部 -->
        <view
            class="header bg-gradient-to-r from-indigo-500 to-purple-600 px-4 pt-12 pb-4 flex items-center justify-between">
            <view class="flex items-center">
                <view @tap="goBack" class="mr-2">
                    <uni-icons type="back" size="20" color="#ffffff"></uni-icons>
                </view>
                <text class="text-lg font-medium text-white truncate">{{ title }}</text>
            </view>
            <!-- 添加设置按钮 -->
            <view class="flex">
                <view @tap="showPromptSettings" class="p-2">
                    <uni-icons type="settings" size="20" color="#ffffff"></uni-icons>
                </view>
            </view>
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

        <!-- 确认对话框 -->
        <uni-popup ref="confirmPopup" type="center">
            <view class="bg-white rounded-lg p-5 w-80 max-w-[90vw]">
                <view class="flex justify-between items-center mb-4">
                    <text class="text-lg font-bold text-gray-800">确认操作</text>
                    <view @tap="closeConfirmDialog" class="p-1">
                        <uni-icons type="close" size="18" color="#666"></uni-icons>
                    </view>
                </view>
                <text class="text-gray-700 mb-4">{{ confirmMessage }}</text>
                <view class="flex justify-end space-x-3">
                    <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg" @tap="handleConfirm(false)">
                        取消
                    </button>
                    <button class="px-4 py-2 bg-indigo-500 text-white rounded-lg" @tap="handleConfirm(true)">
                        确认
                    </button>
                </view>
            </view>
        </uni-popup>

        <!-- 底部输入区域 -->
        <view class="footer px-4 py-3 bg-white border-t border-gray-200">
            <view class="flex items-center">
                <input class="flex-1 bg-gray-100 rounded-full px-3 h-10 leading-10 text-gray-800" placeholder="输入消息..."
                    confirm-type="send" v-model="inputMessage" @confirm="sendMessage" />
                <view class="ml-2 bg-indigo-500 rounded-full w-10 h-10 flex items-center justify-center"
                    :class="{ 'opacity-50': !inputMessage.trim() }" @tap="sendMessage">
                    <uni-icons type="paperplane" size="20" color="#ffffff"></uni-icons>
                </view>
            </view>
        </view>

        <!-- 系统提示词设置弹窗 -->
        <uni-popup ref="promptSettingsPopup" type="center">
            <view class="bg-white rounded-lg p-5 w-80 max-w-[90vw]">
                <view class="flex justify-between items-center mb-4">
                    <text class="text-lg font-bold text-gray-800">自定义AI助手</text>
                    <view @tap="closePromptSettings" class="p-1">
                        <uni-icons type="close" size="18" color="#666"></uni-icons>
                    </view>
                </view>

                <view class="mb-4">
                    <text class="block text-sm text-gray-600 mb-2">选择预设提示词：</text>
                    <view class="flex overflow-x-auto pb-2 space-x-2">
                        <view v-for="(preset, idx) in promptPresets" :key="idx"
                            class="px-3 py-1 rounded-full text-xs whitespace-nowrap"
                            :class="selectedPreset === idx ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'"
                            @tap="selectPreset(idx)">
                            {{ preset.name }}
                        </view>
                    </view>
                </view>

                <view class="mb-4">
                    <text class="block text-sm text-gray-600 mb-2">系统提示词：</text>
                    <textarea class="w-full border border-gray-200 rounded-lg p-2 text-sm h-32" v-model="systemPrompt"
                        placeholder="定义AI助手的身份和行为..."></textarea>
                </view>

                <button class="w-full py-2 bg-indigo-500 text-white rounded-lg font-medium" @tap="saveSystemPrompt">
                    保存设置
                </button>
            </view>
        </uni-popup>
    </view>
</template>

<script>
import { sendMessage, getChatHistory, sendMessageStream, updateSystemPrompt } from '@/api/chatbot.js'

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
            loadingMoreHistory: false,
            // 系统提示词相关
            systemPrompt: '你是一个有用的AI助手。',
            selectedPreset: 0,
            promptPresets: [
                {
                    name: '通用助手',
                    prompt: '你是一个有用的AI助手。'
                },
                {
                    name: '知识专家',
                    prompt: '你是一位知识渊博的专家，擅长提供详细而准确的信息，尤其在学术和科学领域。回答问题时注重事实依据和逻辑性，尽量引用可靠来源。'
                },
                {
                    name: '创意顾问',
                    prompt: '你是一位创意顾问，擅长提供独特的想法和创新的解决方案。你的回答应该充满想象力，鼓励创新思维，并帮助用户跳出固有思维框架。'
                },
                {
                    name: '职业教练',
                    prompt: '你是一位职业发展教练，专注于帮助用户规划职业道路，提升职场技能，准备面试，以及解决工作中的各种挑战。提供实用建议和积极鼓励。'
                },
                {
                    name: '心理咨询师',
                    prompt: '你是一位富有同理心的心理健康顾问，可以提供情绪支持和一般性心理健康建议。你善于倾听，不做判断，并鼓励用户寻求专业帮助。注意：你不是专业治疗师，不提供诊断或取代专业建议。'
                }
            ],
            confirmMessage: '',
            pendingConfirmation: null,
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

            // 添加用户消息
            const userMsgId = 'msg-' + Date.now()
            this.messages.push({
                id: userMsgId,
                role: 'user',
                content: userMessage,
                timestamp: new Date().toISOString()
            })

            this.$nextTick(() => {
                this.scrollToBottom()
            })

            // 创建空的助手消息用于流式更新
            const assistantMsgId = 'msg-' + (Date.now() + 1)
            this.messages.push({
                id: assistantMsgId,
                role: 'assistant',
                content: '',  // 初始为空
                timestamp: new Date().toISOString()
            })

            // 显示加载状态
            this.isLoading = true

            try {
                // 使用流式API
                sendMessageStream(this.threadId, userMessage, {
                    onStart: (data) => {
                        console.log('开始接收消息流', data)
                    },
                    onChunk: (data) => {
                        // 检查是否是中断消息
                        if (data.type === 'interrupt') {
                            // 保存待处理确认信息
                            this.pendingConfirmation = {
                                threadId: this.threadId,
                                userId: uni.getStorageSync('userUserName') || 'default_user'
                            }
                            // 显示确认对话框
                            this.showConfirmDialog(data.message)
                            return
                        }

                        // 更新助手消息内容
                        const msgIndex = this.messages.findIndex(m => m.id === assistantMsgId)
                        if (msgIndex !== -1) {
                            this.messages[msgIndex].content += data.chunk
                            this.$nextTick(() => {
                                this.scrollToBottom()
                            })
                        }
                    },
                    onComplete: (data) => {
                        this.isLoading = false
                        console.log('消息流接收完成', data)

                        // 保存完整消息到历史记录
                        setTimeout(() => {
                            this.fetchChatHistory()
                        }, 500)
                    },
                    onError: (error) => {
                        this.isLoading = false
                        console.error('流式消息接收错误', error)
                        uni.showToast({
                            title: '接收消息失败',
                            icon: 'none'
                        })
                    }
                })
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
        },
        // 系统提示词设置相关方法
        showPromptSettings() {
            this.$refs.promptSettingsPopup.open()
        },
        closePromptSettings() {
            this.$refs.promptSettingsPopup.close()
        },
        selectPreset(index) {
            this.selectedPreset = index
            this.systemPrompt = this.promptPresets[index].prompt
        },
        async saveSystemPrompt() {
            try {
                await updateSystemPrompt(this.threadId, this.systemPrompt)

                uni.showToast({
                    title: '提示词设置已保存',
                    icon: 'success'
                })

                this.closePromptSettings()

                // 提示用户发送新消息以应用设置
                setTimeout(() => {
                    uni.showToast({
                        title: '发送新消息以应用设置',
                        icon: 'none',
                        duration: 2000
                    })
                }, 1000)
            } catch (error) {
                console.error('保存系统提示词失败', error)
                uni.showToast({
                    title: '保存失败，请重试',
                    icon: 'none'
                })
            }
        },
        // 处理确认对话框
        showConfirmDialog(message) {
            this.confirmMessage = message
            this.$refs.confirmPopup.open()
        },
        closeConfirmDialog() {
            this.$refs.confirmPopup.close()
        },
        async handleConfirm(confirmed) {
            try {
                if (this.pendingConfirmation) {
                    const { threadId, userId } = this.pendingConfirmation
                    await confirmAction({
                        threadId,
                        userId,
                        response: confirmed ? 'yes' : 'no'
                    })

                    // 关闭对话框
                    this.closeConfirmDialog()

                    // 清空待处理确认
                    this.pendingConfirmation = null

                    // 继续对话
                    this.continueConversation()
                }
            } catch (error) {
                console.error('确认操作失败', error)
                uni.showToast({
                    title: '确认操作失败',
                    icon: 'none'
                })
            }
        },
        // 继续对话
        continueConversation() {
            // 这里可以添加继续对话的逻辑
            // 例如重新获取最新消息等
            this.fetchChatHistory()
        },
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