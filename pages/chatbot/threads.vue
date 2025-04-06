<template>
    <view class="page-container bg-gray-50 flex flex-col h-screen">
        <!-- 头部 -->
        <view class="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 pt-12 pb-6">
            <view class="flex justify-between items-center">
                <text class="text-xl font-bold text-white">智能助手</text>
                <view @tap="createNewThread" class="bg-white/20 p-2 rounded-full">
                    <uni-icons type="plusempty" size="20" color="#ffffff"></uni-icons>
                </view>
            </view>
            <text class="text-white/80 mt-2">选择或创建一个新的对话</text>
        </view>

        <!-- 会话列表 -->
        <scroll-view scroll-y class="flex-1 px-4 py-5">
            <view v-if="threads.length === 0" class="flex flex-col items-center justify-center py-16">
                <uni-icons type="chat" size="64" color="#d1d5db"></uni-icons>
                <text class="text-gray-400 mt-4 text-center">没有对话记录，点击右上角创建一个新对话</text>
            </view>

            <view v-else>
                <view v-for="(thread, index) in threads" :key="thread.id"
                    class="bg-white rounded-lg shadow-sm p-4 mb-4 flex justify-between items-center"
                    @tap="navigateToChat(thread.id)">
                    <view>
                        <view class="flex items-center">
                            <uni-icons type="chat" size="16" color="#6366f1"></uni-icons>
                            <text class="font-medium text-gray-800 ml-2">{{ thread.title }}</text>
                        </view>
                        <text class="text-gray-500 text-sm mt-1">{{ thread.lastMessagePreview || '还没有消息' }}</text>
                        <text class="text-gray-400 text-xs mt-1">{{ formatDate(thread.createdAt) }}</text>
                    </view>

                    <view class="flex">
                        <view class="p-2" @tap.stop="deleteThreadConfirm(thread.id)">
                            <uni-icons type="trash" size="18" color="#9ca3af"></uni-icons>
                        </view>
                    </view>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script>
import { getThreads, createThread, deleteThread } from '@/api/chatbot.js'

export default {
    data() {
        return {
            threads: []
        }
    },
    onLoad() {
        this.fetchThreads()
    },
    onShow() {
        this.fetchThreads() // 每次页面显示时刷新数据
    },
    methods: {
        async fetchThreads() {
            try {
                const res = await getThreads()
                this.threads = res.data || []
            } catch (error) {
                console.error('获取会话列表失败', error)
                uni.showToast({
                    title: '获取会话列表失败',
                    icon: 'none'
                })
            }
        },
        async createNewThread() {
            uni.showModal({
                title: '新建对话',
                editable: true,
                placeholderText: '请输入对话标题',
                success: async (res) => {
                    if (res.confirm && res.content) {
                        try {
                            const title = res.content.trim() || `新对话 ${new Date().toLocaleString()}`
                            const response = await createThread(title)

                            const threadId = response.data;

                            console.log('Extracted threadId:', threadId, 'Type:', typeof threadId);

                            if (typeof threadId !== 'string' || !threadId) {
                                console.error("createThread API did not return a valid string ID:", threadId);
                                uni.showToast({ title: '创建对话失败 (无效ID)', icon: 'none' });
                                return;
                            }

                            uni.navigateTo({
                                url: `/pages/chatbot/chat?threadId=${encodeURIComponent(threadId)}&title=${encodeURIComponent(title)}`
                            })
                        } catch (error) {
                            console.error('创建会话失败', error)
                            uni.showToast({
                                title: '创建会话失败',
                                icon: 'none'
                            })
                        }
                    }
                }
            })
        },
        navigateToChat(threadId) {
            const thread = this.threads.find(t => t.id === threadId)
            if (thread) {
                uni.navigateTo({
                    url: `/pages/chatbot/chat?threadId=${threadId}&title=${encodeURIComponent(thread.title)}`
                })
            }
        },
        deleteThreadConfirm(threadId) {
            uni.showModal({
                title: '删除会话',
                content: '确定要删除这个会话吗？删除后将无法恢复。',
                success: async (res) => {
                    if (res.confirm) {
                        await this.deleteThread(threadId)
                    }
                }
            })
        },
        async deleteThread(threadId) {
            try {
                await deleteThread(threadId)
                // 删除成功后刷新列表
                this.threads = this.threads.filter(t => t.id !== threadId)
                uni.showToast({
                    title: '删除成功',
                    icon: 'success'
                })
            } catch (error) {
                console.error('删除会话失败', error)
                uni.showToast({
                    title: '删除会话失败',
                    icon: 'none'
                })
            }
        },
        formatDate(dateString) {
            if (!dateString) return ''

            const date = new Date(dateString)
            const now = new Date()

            // 如果是今天的日期，只显示时间
            if (date.toDateString() === now.toDateString()) {
                return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
            }

            // 否则显示完整日期
            return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
        }
    }
}
</script>

<style>
.page-container {
    min-height: 100vh;
}
</style>