<template>
    <view class="page-container bg-gray-50 flex flex-col h-screen">
        <!-- 头部 -->
        <view class="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 pt-12 pb-6">
            <view class="flex justify-between items-center">
                <text class="text-xl font-bold text-white">智能助手</text>
                <view @tap="showCreateThreadDialog" class="bg-white/20 p-2 rounded-full">
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

        <!-- 创建新对话弹窗 -->
        <uni-popup ref="createThreadPopup" type="center">
            <view class="bg-white rounded-lg p-5 w-80 max-w-[90vw]">
                <view class="flex justify-between items-center mb-4">
                    <text class="text-lg font-bold text-gray-800">创建新对话</text>
                    <view @tap="closeCreateThreadDialog" class="p-1">
                        <uni-icons type="close" size="18" color="#666"></uni-icons>
                    </view>
                </view>

                <view class="mb-4">
                    <text class="block text-sm text-gray-600 mb-2">对话标题：</text>
                    <input class="w-full border border-gray-200 rounded-lg p-2 text-sm" v-model="newThreadTitle"
                        placeholder="输入对话标题" />
                </view>

                <view class="mb-4">
                    <text class="block text-sm text-gray-600 mb-2">选择助手类型：</text>
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

                <button class="w-full py-2 bg-indigo-500 text-white rounded-lg font-medium" @tap="createNewThread">
                    创建对话
                </button>
            </view>
        </uni-popup>
    </view>
</template>

<script>
import { getThreads, createThread, deleteThread } from '@/api/chatbot.js'

export default {
    data() {
        return {
            threads: [],
            newThreadTitle: '',
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
            ]
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
        showCreateThreadDialog() {
            // 重置字段
            this.newThreadTitle = `新对话 ${new Date().toLocaleString()}`
            this.selectedPreset = 0
            this.systemPrompt = this.promptPresets[0].prompt
            // 显示弹窗
            this.$refs.createThreadPopup.open()
        },
        closeCreateThreadDialog() {
            this.$refs.createThreadPopup.close()
        },
        selectPreset(index) {
            this.selectedPreset = index
            this.systemPrompt = this.promptPresets[index].prompt
        },
        async createNewThread() {
            try {
                if (!this.newThreadTitle.trim()) {
                    this.newThreadTitle = `新对话 ${new Date().toLocaleString()}`
                }

                const title = this.newThreadTitle.trim()
                const response = await createThread(title, this.systemPrompt)

                const threadId = response.data;

                console.log('Extracted threadId:', threadId, 'Type:', typeof threadId);

                if (typeof threadId !== 'string' || !threadId) {
                    console.error("createThread API did not return a valid string ID:", threadId);
                    uni.showToast({ title: '创建对话失败 (无效ID)', icon: 'none' });
                    return;
                }

                // 关闭弹窗
                this.closeCreateThreadDialog()

                // 导航到聊天页面
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