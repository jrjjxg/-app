<template>
    <view class="meditation-page">
        <!-- 顶部导航栏 -->
        <view class="nav-bar bg-white flex items-center px-4 py-2 fixed top-0 left-0 right-0 z-10">
            <view @tap="goBack" class="mr-4">
                <text class="iconfont icon-back text-gray-700 text-xl"></text>
            </view>
            <text class="text-lg font-medium">冥想放松</text>
        </view>

        <!-- 主要内容区域 -->
        <view class="content pt-16 px-4 pb-20">
            <!-- 视频播放器 -->
            <view v-if="currentVideo" class="video-container mb-6">
                <video :src="currentVideo.playUrl" :poster="currentVideo.coverUrl" controls autoplay object-fit="cover"
                    class="w-full rounded-lg" @timeupdate="onTimeUpdate" @ended="onVideoEnded"></video>
            </view>

            <!-- 视频信息 -->
            <view v-if="currentVideo" class="video-info mb-6">
                <text class="text-xl font-bold block mb-2">{{ currentVideo.title }}</text>
                <text class="text-gray-600 block mb-4">{{ currentVideo.description }}</text>
                <view class="flex items-center text-gray-500 text-sm">
                    <text class="mr-4">{{ formatDuration(currentVideo.duration) }}</text>
                    <text>{{ currentVideo.viewCount || 0 }}次播放</text>
                </view>
            </view>

            <!-- 推荐视频列表 -->
            <view class="recommended-videos">
                <text class="text-lg font-medium block mb-4">推荐冥想</text>
                <view v-if="loading" class="flex justify-center py-4">
                    <text class="text-gray-500">加载中...</text>
                </view>
                <view v-else-if="videoList.length === 0" class="flex justify-center py-4">
                    <text class="text-gray-500">暂无推荐视频</text>
                </view>
                <view v-else class="video-list">
                    <view v-for="(video, index) in videoList" :key="video.id"
                        class="video-item flex mb-4 pb-4 border-b border-gray-100" @tap="playVideo(video)">
                        <view class="video-thumb mr-3 relative">
                            <image :src="video.coverUrl || defaultCover" class="w-24 h-16 rounded-md object-cover">
                            </image>
                            <text
                                class="absolute right-1 bottom-1 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
                                {{ formatDuration(video.duration) }}
                            </text>
                        </view>
                        <view class="video-info flex-1">
                            <text class="text-base font-medium text-gray-800 line-clamp-2">{{ video.title }}</text>
                            <text class="text-xs text-gray-500 mt-1">{{ video.viewCount || 0 }}次播放</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { videoApi } from '@/api/video'

export default {
    data() {
        return {
            loading: true,
            videoList: [],
            currentVideo: null,
            currentTime: 0,
            defaultCover: '/static/images/default-cover.jpg',
            categoryId: 'meditation' // 冥想视频分类ID
        }
    },

    onLoad() {
        this.loadMeditationVideos()
    },

    methods: {
        goBack() {
            uni.navigateBack()
        },

        async loadMeditationVideos() {
            this.loading = true
            try {
                // 获取冥想分类的视频
                const res = await videoApi.getVideosByCategory(this.categoryId)
                if (res.code === 200 && res.data) {
                    this.videoList = res.data

                    // 如果有视频，默认播放第一个
                    if (this.videoList.length > 0) {
                        this.playVideo(this.videoList[0])
                    }
                }
            } catch (error) {
                console.error('获取冥想视频失败:', error)
                uni.showToast({
                    title: '获取视频失败',
                    icon: 'none'
                })
            } finally {
                this.loading = false
            }
        },

        async playVideo(video) {
            try {
                // 获取视频详情，包括播放地址
                const res = await videoApi.getVideoDetail(video.id)
                if (res.code === 200 && res.data) {
                    this.currentVideo = res.data

                    // 记录播放历史
                    this.saveViewHistory(video.id)
                }
            } catch (error) {
                console.error('获取视频详情失败:', error)
                uni.showToast({
                    title: '播放失败',
                    icon: 'none'
                })
            }
        },

        onTimeUpdate(e) {
            this.currentTime = e.detail.currentTime

            // 每30秒保存一次播放进度
            if (Math.floor(this.currentTime) % 30 === 0 && this.currentTime > 0) {
                this.saveProgress()
            }
        },

        onVideoEnded() {
            // 视频播放结束，可以做一些操作，比如显示完成提示
            uni.showToast({
                title: '冥想完成，感觉如何？',
                icon: 'none',
                duration: 2000
            })

            // 保存最终进度
            this.saveProgress(true)
        },

        async saveProgress(completed = false) {
            if (!this.currentVideo) return

            try {
                const userInfo = uni.getStorageSync('userInfo')
                if (!userInfo || !userInfo.id) return

                await videoApi.saveProgress({
                    userId: userInfo.id,
                    videoId: this.currentVideo.id,
                    progress: Math.floor(this.currentTime),
                    completed: completed
                })
            } catch (error) {
                console.error('保存播放进度失败:', error)
            }
        },

        async saveViewHistory(videoId) {
            try {
                const userInfo = uni.getStorageSync('userInfo')
                if (!userInfo || !userInfo.id) return

                // 这里可以调用记录观看历史的API
                // 后端已经在getVideoDetail中自动增加了观看次数
            } catch (error) {
                console.error('记录观看历史失败:', error)
            }
        },

        formatDuration(seconds) {
            if (!seconds) return '00:00'

            const minutes = Math.floor(seconds / 60)
            const remainingSeconds = Math.floor(seconds % 60)

            return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
        }
    }
}
</script>

<style>
.meditation-page {
    min-height: 100vh;
    background-color: #f8f9fa;
}

.nav-bar {
    height: 44px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.video-container {
    aspect-ratio: 16/9;
    background-color: #000;
    border-radius: 8px;
    overflow: hidden;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>