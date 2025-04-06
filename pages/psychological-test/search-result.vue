<template>
    <view class="flex flex-col h-full bg-white">
        <!-- 头部搜索区域 -->
        <view class="sticky top-0 z-10 bg-white px-4 pt-12 pb-3 shadow-sm">
            <view class="flex items-center">
                <view class="flex-none mr-2" @click="goBack">
                    <uni-icons type="back" size="22" color="#333333"></uni-icons>
                </view>
                <view class="flex items-center flex-1 bg-gray-100 rounded-full px-4 py-2">
                    <uni-icons type="search" size="18" color="#666666"></uni-icons>
                    <input class="flex-1 ml-2 text-sm" placeholder="搜搜你想做的测评" v-model="searchKeyword"
                        @confirm="handleSearch" />
                    <view v-if="searchKeyword" class="ml-2" @click="clearSearch">
                        <uni-icons type="close" size="16" color="#999999"></uni-icons>
                    </view>
                </view>
            </view>
        </view>

        <!-- 搜索过滤选项 -->
        <view class="px-4 py-2 flex justify-between border-b border-gray-100">
            <view class="text-sm font-medium">共找到 {{ tests.length }} 个测评</view>
            <view class="flex">
                <view class="flex items-center ml-3" @click="switchFilter('hot')">
                    <text :class="sortBy === 'hot' ? 'text-indigo-600' : 'text-gray-600'" class="text-sm">热门</text>
                    <uni-icons type="arrow-down" size="14"
                        :color="sortBy === 'hot' ? '#6366F1' : '#999999'"></uni-icons>
                </view>
                <view class="flex items-center ml-3" @click="switchFilter('new')">
                    <text :class="sortBy === 'new' ? 'text-indigo-600' : 'text-gray-600'" class="text-sm">最新</text>
                    <uni-icons type="arrow-down" size="14"
                        :color="sortBy === 'new' ? '#6366F1' : '#999999'"></uni-icons>
                </view>
            </view>
        </view>

        <!-- 搜索结果列表 -->
        <scroll-view scroll-y class="flex-1" v-if="loading">
            <view class="flex items-center justify-center py-10">
                <text class="text-gray-600">搜索中...</text>
            </view>
        </scroll-view>

        <scroll-view scroll-y class="flex-1" v-else-if="tests.length === 0">
            <view class="flex flex-col items-center justify-center py-16">
                <uni-icons type="info" size="40" color="#CCCCCC"></uni-icons>
                <text class="text-gray-400 mt-3">没有找到相关测评</text>
                <text class="text-gray-400 mt-1">换个关键词试试吧</text>
            </view>
        </scroll-view>

        <scroll-view scroll-y class="flex-1 pb-20" v-else>
            <view class="px-3 pt-2">
                <!-- 测试列表 -->
                <view v-for="(test, index) in tests" :key="index"
                    class="test-card mb-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                    @click="goToTestDetail(test)">
                    <!-- 卡片内容 -->
                    <view class="p-4">
                        <!-- 上部分：图片和名称 -->
                        <view class="flex mb-2">
                            <view class="w-16 h-16 rounded-lg overflow-hidden shadow-sm mr-3">
                                <image v-if="test.imageUrl" :src="test.imageUrl" mode="aspectFill" class="w-full h-full"
                                    lazy-load></image>
                                <view v-else class="w-full h-16 bg-indigo-500 flex items-center justify-center">
                                    <uni-icons type="person" size="28" color="#ffffff"></uni-icons>
                                </view>
                            </view>

                            <view class="flex-1">
                                <text class="text-base font-semibold text-gray-800 block mb-1">{{ test.name }}</text>
                                <view class="flex items-center">
                                    <view class="px-2 py-0.5 bg-indigo-100 rounded-full">
                                        <text class="text-xs text-indigo-700">{{ getCategoryLabel(test.category)
                                            }}</text>
                                    </view>
                                    <view class="flex items-center ml-2">
                                        <text class="text-xs text-gray-500 ml-1">{{ formatTestCount(test.testCount)
                                            }}人测过</text>
                                    </view>
                                </view>
                            </view>
                        </view>

                        <!-- 下部分：描述和统计 -->
                        <view>
                            <text class="text-sm text-gray-600 block line-clamp-2 mb-2">{{ test.description }}</text>

                            <view class="flex items-center justify-between">
                                <view class="flex items-center">
                                    <view class="flex items-center ml-3">
                                        <uni-icons type="time" size="12" color="#6B7280"></uni-icons>
                                        <text class="text-xs text-gray-500 ml-1">{{ test.timeMinutes || 10 }}分钟</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script>
import { searchTests } from '@/api/test.js'

export default {
    data() {
        return {
            searchKeyword: '',
            loading: true,
            tests: [],
            sortBy: ''
        }
    },
    onLoad(options) {
        if (options.keyword) {
            this.searchKeyword = decodeURIComponent(options.keyword)
            this.search()
        }
    },
    methods: {
        async search() {
            try {
                this.loading = true

                const response = await searchTests(this.searchKeyword, this.sortBy)

                if (response.code === 200) {
                    this.tests = response.data || []
                } else {
                    uni.showToast({
                        title: '搜索失败',
                        icon: 'none'
                    })
                }
            } catch (error) {
                console.error('搜索失败:', error)
                uni.showToast({
                    title: '搜索失败，请重试',
                    icon: 'none'
                })
            } finally {
                this.loading = false
            }
        },

        handleSearch() {
            if (!this.searchKeyword.trim()) return
            this.search()
        },

        clearSearch() {
            this.searchKeyword = ''
        },

        switchFilter(sortBy) {
            if (this.sortBy === sortBy) {
                this.sortBy = ''
            } else {
                this.sortBy = sortBy
            }
            this.search()
        },

        goBack() {
            uni.navigateBack()
        },

        goToTestDetail(test) {
            uni.navigateTo({
                url: `/pages/test-detail/index?id=${test.id}`
            })
        },

        formatTestCount(count) {
            if (!count) return '0'
            if (count < 1000) return count.toString()
            if (count < 10000) return (count / 1000).toFixed(1) + 'k'
            return (count / 10000).toFixed(1) + '万'
        },

        getCategoryLabel(category) {
            const categoryMap = {
                'personality': '人格',
                'emotion': '情绪',
                'common': '常用',
                'relationship': '关系',
                'career': '职业'
            }
            return categoryMap[category] || category
        }
    }
}
</script>

<style>
.test-card {
    background-color: white;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 2;
}
</style>