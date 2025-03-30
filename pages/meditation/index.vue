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
            <!-- 音频播放器部分 -->
            <view v-if="currentAudio" class="audio-player mb-6">
                <!-- 冥想背景图 -->
                <view class="meditation-bg">
                    <image :src="currentAudio.coverUrl || defaultCover" mode="aspectFill" class="w-full h-full"></image>

                    <!-- 波纹动画效果 -->
                    <view class="ripple-container">
                        <view class="ripple ripple1" :class="{ 'animate-ripple': isPlaying }"></view>
                        <view class="ripple ripple2" :class="{ 'animate-ripple': isPlaying }"></view>
                        <view class="ripple ripple3" :class="{ 'animate-ripple': isPlaying }"></view>
                    </view>
                </view>

                <!-- 音频控制区 -->
                <view class="audio-controls p-4">
                    <!-- 音频信息 -->
                    <view class="audio-info mb-4">
                        <text class="text-xl font-bold block mb-2">{{ currentAudio.title }}</text>
                        <text class="text-gray-600 block mb-2">{{ currentAudio.description }}</text>
                    </view>

                    <!-- 进度条 -->
                    <view class="progress-bar-container mb-2">
                        <view class="progress-bg"></view>
                        <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
                        <view class="progress-handle" :style="{ left: progressPercent + '%' }"
                            @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
                        </view>
                    </view>

                    <!-- 时间显示 -->
                    <view class="time-display flex justify-between mb-6">
                        <text class="text-sm text-gray-500">{{ formatTime(currentTime) }}</text>
                        <text class="text-sm text-gray-500">{{ formatTime(currentAudio.duration) }}</text>
                    </view>

                    <!-- 播放控制按钮 -->
                    <view class="control-buttons flex justify-center items-center">
                        <view class="control-btn mr-6" @tap="rewind15">
                            <text class="iconfont icon-backward text-gray-700 text-xl"></text>
                            <text class="text-xs text-gray-500">-15s</text>
                        </view>

                        <view class="play-pause-btn" @tap="togglePlay">
                            <text class="iconfont" :class="isPlaying ? 'icon-pause' : 'icon-play'"
                                color="#FFFFFF"></text>
                        </view>

                        <view class="control-btn ml-6" @tap="forward15">
                            <text class="iconfont icon-forward text-gray-700 text-xl"></text>
                            <text class="text-xs text-gray-500">+15s</text>
                        </view>
                    </view>

                    <!-- 额外控制选项 -->
                    <view class="extra-controls flex justify-between mt-6">
                        <view class="timer-btn flex items-center" @tap="showTimerModal = true">
                            <text class="iconfont icon-time text-gray-600 mr-1"></text>
                            <text class="text-sm text-gray-600">定时</text>
                        </view>

                        <view class="speed-btn flex items-center" @tap="toggleSpeed">
                            <text class="text-sm text-gray-600">{{ playbackSpeed }}x</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 推荐冥想列表 -->
            <view class="recommended-meditations">
                <text class="text-lg font-medium block mb-4">推荐冥想</text>
                <view v-if="loading" class="flex justify-center py-4">
                    <text class="text-gray-500">加载中...</text>
                </view>
                <view v-else-if="audioList.length === 0" class="flex justify-center py-4">
                    <text class="text-gray-500">暂无推荐冥想</text>
                </view>
                <view v-else class="audio-list">
                    <view v-for="(audio, index) in audioList" :key="audio.id"
                        class="audio-item flex mb-4 pb-4 border-b border-gray-100" @tap="playAudio(audio)">
                        <view class="audio-thumb mr-3">
                            <image :src="audio.coverUrl || defaultCover" class="w-24 h-16 rounded-md object-cover">
                            </image>
                        </view>
                        <view class="audio-info flex-1">
                            <text class="text-base font-medium text-gray-800 line-clamp-2">{{ audio.title }}</text>
                            <view class="flex items-center mt-1">
                                <text class="text-xs text-gray-500 mr-2">{{ formatDuration(audio.duration) }}</text>
                                <text class="text-xs text-gray-500">{{ audio.viewCount || 0 }}次播放</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 定时器模态框 -->
        <view v-if="showTimerModal" class="timer-modal">
            <view class="timer-modal-mask" @tap="showTimerModal = false"></view>
            <view class="timer-modal-content">
                <text class="text-lg font-medium mb-4 block text-center">设置冥想定时</text>
                <view class="timer-options flex flex-wrap justify-center">
                    <view v-for="(time, index) in timerOptions" :key="index" class="timer-option"
                        :class="{ 'active': sleepTimer === time.value }" @tap="setSleepTimer(time.value)">
                        <text>{{ time.label }}</text>
                    </view>
                </view>
                <view class="timer-confirm-btn" @tap="showTimerModal = false">
                    <text>确定</text>
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
            audioList: [],
            currentAudio: null,
            audioContext: null,
            isPlaying: false,
            currentTime: 0,
            progressPercent: 0,
            defaultCover: '/static/images/meditation-default.jpg',
            categoryId: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', // 冥想音频分类ID
            playbackSpeed: 1.0,
            touchStartX: 0,
            isSeeking: false,
            showTimerModal: false,
            sleepTimer: 0,
            timerTimeout: null,
            timerOptions: [
                { label: '不设置', value: 0 },
                { label: '5分钟', value: 5 * 60 },
                { label: '10分钟', value: 10 * 60 },
                { label: '15分钟', value: 15 * 60 },
                { label: '30分钟', value: 30 * 60 },
                { label: '45分钟', value: 45 * 60 },
                { label: '60分钟', value: 60 * 60 }
            ]
        }
    },

    onLoad() {
        this.loadMeditationAudios()
    },

    onUnload() {
        // 页面关闭时销毁音频实例
        if (this.audioContext) {
            this.audioContext.destroy()
        }
        // 清除定时器
        if (this.timerTimeout) {
            clearTimeout(this.timerTimeout)
        }
    },

    methods: {
        goBack() {
            uni.navigateBack()
        },

        async loadMeditationAudios() {
            this.loading = true
            try {
                // 获取冥想分类的音频（仍使用视频API）
                const res = await videoApi.getVideosByCategory(this.categoryId)
                if (res.code === 200 && res.data) {
                    this.audioList = res.data

                    // 如果有音频，默认播放第一个
                    if (this.audioList.length > 0) {
                        this.playAudio(this.audioList[0])
                    }
                }
            } catch (error) {
                console.error('获取冥想音频失败:', error)
                uni.showToast({
                    title: '获取音频失败',
                    icon: 'none'
                })
            } finally {
                this.loading = false
            }
        },

        async playAudio(audio) {
            try {
                // 获取音频详情，包括播放地址
                const res = await videoApi.getVideoDetail(audio.id)
                if (res.code === 200 && res.data) {
                    // 销毁之前的音频实例
                    if (this.audioContext) {
                        this.audioContext.destroy()
                    }

                    this.currentAudio = res.data

                    // 创建新的音频实例
                    this.createAudioContext(this.currentAudio.playUrl)

                    // 记录播放历史
                    this.saveViewHistory(audio.id)
                }
            } catch (error) {
                console.error('获取音频详情失败:', error)
                uni.showToast({
                    title: '播放失败',
                    icon: 'none'
                })
            }
        },

        createAudioContext(url) {
            // 创建音频实例
            this.audioContext = uni.createInnerAudioContext()
            this.audioContext.src = url
            this.audioContext.autoplay = true

            // 设置播放速度
            if (this.playbackSpeed !== 1.0) {
                this.audioContext.playbackRate = this.playbackSpeed
            }

            // 绑定事件
            this.audioContext.onPlay(() => {
                this.isPlaying = true
            })

            this.audioContext.onPause(() => {
                this.isPlaying = false
            })

            this.audioContext.onTimeUpdate(() => {
                if (!this.isSeeking) {
                    this.currentTime = this.audioContext.currentTime
                    this.progressPercent = (this.currentTime / this.currentAudio.duration) * 100

                    // 每30秒保存一次播放进度
                    if (Math.floor(this.currentTime) % 30 === 0 && this.currentTime > 0) {
                        this.saveProgress()
                    }
                }
            })

            this.audioContext.onEnded(() => {
                this.isPlaying = false
                this.currentTime = 0
                this.progressPercent = 0

                // 播放结束提示
                uni.showToast({
                    title: '冥想完成，感觉如何？',
                    icon: 'none',
                    duration: 2000
                })

                // 保存最终进度
                this.saveProgress(true)
            })

            this.audioContext.onError((res) => {
                console.error('音频播放错误：', res)
                uni.showToast({
                    title: '音频播放失败',
                    icon: 'none'
                })
            })
        },

        togglePlay() {
            if (!this.audioContext) return

            if (this.isPlaying) {
                this.audioContext.pause()
            } else {
                this.audioContext.play()
            }
        },

        rewind15() {
            if (!this.audioContext) return

            const newTime = Math.max(0, this.currentTime - 15)
            this.audioContext.seek(newTime)
        },

        forward15() {
            if (!this.audioContext || !this.currentAudio) return

            const newTime = Math.min(this.currentAudio.duration, this.currentTime + 15)
            this.audioContext.seek(newTime)
        },

        toggleSpeed() {
            if (!this.audioContext) return

            // 切换播放速度 1.0 -> 1.25 -> 1.5 -> 0.75 -> 1.0
            const speeds = [1.0, 1.25, 1.5, 0.75, 1.0]
            const currentIndex = speeds.indexOf(this.playbackSpeed)
            const nextIndex = (currentIndex + 1) % speeds.length

            this.playbackSpeed = speeds[nextIndex]
            this.audioContext.playbackRate = this.playbackSpeed
        },

        handleTouchStart(e) {
            this.touchStartX = e.touches[0].clientX
            this.isSeeking = true
        },

        handleTouchMove(e) {
            if (!this.isSeeking || !this.currentAudio) return

            const progressBarElement = e.currentTarget.parentElement
            const progressBarRect = progressBarElement.getBoundingClientRect()
            const offsetX = e.touches[0].clientX - progressBarRect.left

            // 计算百分比
            let percent = (offsetX / progressBarRect.width) * 100
            percent = Math.max(0, Math.min(100, percent))

            this.progressPercent = percent
            this.currentTime = (percent / 100) * this.currentAudio.duration
        },

        handleTouchEnd(e) {
            if (!this.isSeeking || !this.audioContext || !this.currentAudio) return

            const seekTime = (this.progressPercent / 100) * this.currentAudio.duration
            this.audioContext.seek(seekTime)
            this.isSeeking = false
        },

        setSleepTimer(seconds) {
            // 清除现有定时器
            if (this.timerTimeout) {
                clearTimeout(this.timerTimeout)
                this.timerTimeout = null
            }

            // 设置新定时器
            this.sleepTimer = seconds

            if (seconds > 0) {
                this.timerTimeout = setTimeout(() => {
                    if (this.audioContext && this.isPlaying) {
                        this.audioContext.pause()
                        uni.showToast({
                            title: '定时结束，冥想已暂停',
                            icon: 'none'
                        })
                    }
                    this.sleepTimer = 0
                }, seconds * 1000)
            }
        },

        formatTime(seconds) {
            if (!seconds) return '00:00'

            const mins = Math.floor(seconds / 60)
            const secs = Math.floor(seconds % 60)

            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        },

        formatDuration(seconds) {
            if (!seconds) return '00:00'

            const minutes = Math.floor(seconds / 60)
            const remainingSeconds = Math.floor(seconds % 60)

            return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
        },

        async saveProgress(completed = false) {
            if (!this.currentAudio) return

            try {
                const userInfo = uni.getStorageSync('userInfo')
                if (!userInfo || !userInfo.id) return

                await videoApi.saveProgress({
                    userId: userInfo.id,
                    videoId: this.currentAudio.id,
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

.audio-player {
    background-color: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.meditation-bg {
    position: relative;
    width: 100%;
    height: 220px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
}

.meditation-bg image {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.7);
}

/* 波纹动画 */
.ripple-container {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.ripple {
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(0);
    opacity: 1;
}

.ripple2 {
    width: 100px;
    height: 100px;
}

.ripple3 {
    width: 120px;
    height: 120px;
}

.animate-ripple {
    animation: ripple 2s infinite ease-out;
}

.ripple2.animate-ripple {
    animation-delay: 0.4s;
}

.ripple3.animate-ripple {
    animation-delay: 0.8s;
}

@keyframes ripple {
    0% {
        transform: scale(0);
        opacity: 1;
    }

    100% {
        transform: scale(3);
        opacity: 0;
    }
}

/* 音频控制样式 */
.audio-controls {
    background-color: #fff;
    padding: 20px;
}

.progress-bar-container {
    position: relative;
    height: 6px;
    width: 100%;
    background-color: #f0f0f0;
    border-radius: 3px;
    overflow: visible;
}

.progress-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #e2e8f0;
    border-radius: 3px;
}

.progress-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(to right, #8b5cf6, #6366f1);
    border-radius: 3px;
    transition: width 0.1s linear;
}

.progress-handle {
    position: absolute;
    width: 16px;
    height: 16px;
    background-color: #fff;
    border: 3px solid #6366f1;
    border-radius: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 2;
}

.play-pause-btn {
    width: 60px;
    height: 60px;
    background: linear-gradient(to right, #8b5cf6, #6366f1);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
}

.play-pause-btn text {
    color: #fff;
    font-size: 24px;
}

.control-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* 定时器模态框样式 */
.timer-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
}

.timer-modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
}

.timer-modal-content {
    position: relative;
    width: 80%;
    background-color: #fff;
    border-radius: 12px;
    padding: 24px;
    z-index: 101;
}

.timer-options {
    margin-bottom: 20px;
}

.timer-option {
    width: calc(33.33% - 10px);
    height: 40px;
    margin: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f3f4f6;
    border-radius: 20px;
}

.timer-option.active {
    background-color: #e0e7ff;
    color: #6366f1;
    font-weight: bold;
}

.timer-confirm-btn {
    width: 100%;
    height: 44px;
    background: linear-gradient(to right, #8b5cf6, #6366f1);
    border-radius: 22px;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>