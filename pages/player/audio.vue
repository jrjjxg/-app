<template>
  <view class="audio-player-page bg-gradient-to-b from-purple-50 to-indigo-50">
    <!-- 顶部导航栏 -->
    <view class="nav-bar bg-white/90 backdrop-blur-md flex items-center px-4 py-2 fixed top-0 left-0 right-0 z-10">
      <view @tap="goBack" class="mr-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-all">
        <text class="iconfont icon-back text-indigo-600 text-xl"></text>
      </view>
      <text class="text-lg font-medium flex-1 truncate text-gray-800">{{ audioTitle }}</text>
    </view>

    <!-- 主要内容区域 -->
    <view class="content pt-16 px-4 pb-20">
      <!-- 加载中提示 -->
      <view v-if="loading" class="flex flex-col justify-center items-center py-10 h-80">
        <view class="w-12 h-12 rounded-full border-4 border-t-indigo-500 border-r-indigo-300 border-b-indigo-200 border-l-indigo-100 animate-spin mb-4"></view>
        <text class="text-gray-500">加载中...</text>
      </view>
      
      <!-- 音频播放器 -->
      <view v-else class="audio-player animate-fadeIn">
        <!-- 音频封面 -->
        <view class="relative mb-6 overflow-hidden rounded-2xl shadow-xl">
          <view class="meditation-bg">
            <view class="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-indigo-800/80 z-0"></view>
            <image :src="audio.coverUrl || defaultCover" mode="aspectFill" class="rounded-2xl transform hover:scale-105 transition-transform duration-700"></image>
            
            <!-- 波形和标题容器 -->
            <view class="absolute bottom-0 left-0 right-0 z-2">
              <!-- 波形可视化效果 -->
              <view v-if="isPlaying" class="waveform-section h-20">
                <!-- 深色背景层 -->
                <view class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 backdrop-blur-sm"></view>
                <!-- 波形条 -->
                <view class="relative flex items-end justify-center h-full px-2 pt-4 pb-2"> 
                  <view v-for="(_, i) in 28" :key="i" 
                        class="waveform-bar mx-px bg-white/80"
                        :style="{ 
                          height: `${getRandomHeight(i)}px`, 
                          animationDelay: `${i * 0.05}s`,
                          animationDuration: `${0.5 + (i % 3) * 0.2}s`
                        }">
                  </view>
                </view>
              </view>
              
              <!-- 音频标题 -->
              <view class="title-section p-4 relative z-10">
                 <!-- 添加一个轻微的遮罩确保文字可见 -->
                <view class="absolute inset-0 bg-black/10 bottom-0 h-1/2"></view> 
                <text class="relative text-xl font-bold text-white drop-shadow-md">{{ audio.title }}</text>
                <view class="relative flex mt-1">
                  <text class="text-sm text-gray-200">{{ audio.categoryName }}</text>
                  <text class="text-sm text-gray-300 mx-2">|</text>
                  <text class="text-sm text-gray-200">{{ audio.views || 0 }}次播放</text>
                </view>
              </view>
            </view>

            <!-- 播放状态指示器 (不在播放时显示) -->
            <view v-if="!isPlaying" class="absolute inset-0 flex justify-center items-center z-5">
              <view class="w-20 h-20 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-110 transition-transform duration-300" @tap="togglePlay">
                <text class="iconfont icon-play text-white text-3xl ml-2"></text>
              </view>
            </view>
            
            <!-- 波纹动画 (播放中显示) -->
            <view v-if="isPlaying" class="ripple-container">
              <view class="ripple animate-ripple bg-white/10 backdrop-blur-sm"></view>
              <view class="ripple ripple2 animate-ripple bg-white/10 backdrop-blur-sm"></view>
              <view class="ripple ripple3 animate-ripple bg-white/10 backdrop-blur-sm"></view>
            </view>
            
          </view>
        </view>
        
        <!-- 音频控制 -->
        <view class="audio-controls bg-white rounded-2xl shadow-lg p-6">
          <!-- 进度条 -->
          <view class="mb-4 relative">
            <view class="progress-bar-container"
                  @touchstart="handleTouchStart"
                  @touchmove="handleTouchMove"
                  @touchend="handleTouchEnd">
              <view class="progress-bg"></view>
              <view class="progress-fill" :style="{ width: progressPercent + '%' }">
                <!-- 波浪效果 -->
                <view class="progress-wave"></view>
              </view>
              <view class="progress-handle" :style="{ left: progressPercent + '%' }">
                <view class="progress-handle-inner"></view>
              </view>
            </view>
            
            <!-- 时间显示 -->
            <view class="flex justify-between mt-3">
              <text class="text-xs font-medium text-gray-500">{{ formatTime(currentTime) }}</text>
              <text class="text-xs font-medium text-gray-500">{{ formatTime(audio.duration) }}</text>
            </view>
          </view>
          
          <!-- 控制按钮 -->
          <view class="flex items-center justify-between mb-8">
            <!-- 15秒倒退 -->
            <view 
              class="control-btn w-14 h-14 rounded-full flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 active:scale-95 transition-all duration-200" 
              @tap="rewind15">
              <text class="iconfont icon-backward text-indigo-600 text-xl mb-1"></text>
              <text class="text-xs text-gray-500">15秒</text>
            </view>
            
            <!-- 播放/暂停 -->
            <view 
              class="play-pause-btn transform hover:scale-105 active:scale-95 transition-all duration-300" 
              @tap="togglePlay">
              <text class="iconfont" :class="isPlaying ? 'icon-pause' : 'icon-play'"></text>
            </view>
            
            <!-- 15秒快进 -->
            <view 
              class="control-btn w-14 h-14 rounded-full flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 active:scale-95 transition-all duration-200" 
              @tap="forward15">
              <text class="iconfont icon-forward text-indigo-600 text-xl mb-1"></text>
              <text class="text-xs text-gray-500">15秒</text>
            </view>
          </view>
          
          <!-- 额外控制选项 -->
          <view class="flex justify-between items-center">
            <!-- 播放速度 -->
            <view 
              class="control-btn w-16 h-16 rounded-xl flex flex-col items-center justify-center hover:bg-gray-50 active:bg-gray-100 active:scale-95 transition-all duration-200" 
              @tap="toggleSpeed">
              <view class="w-9 h-9 rounded-full flex items-center justify-center" :class="playbackSpeed !== 1.0 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-700'">
                <text class="text-sm font-bold">{{ playbackSpeed }}x</text>
              </view>
              <text class="text-xs text-gray-500 mt-1">速度</text>
            </view>
            
            <!-- 收藏按钮 -->
            <view 
              class="control-btn w-16 h-16 rounded-xl flex flex-col items-center justify-center hover:bg-gray-50 active:bg-gray-100 active:scale-95 transition-all duration-200" 
              @tap="toggleFavorite">
              <view class="w-9 h-9 rounded-full flex items-center justify-center" :class="isFavorite ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-700'">
                <text class="iconfont" :class="isFavorite ? 'icon-heart-fill text-pink-600' : 'icon-heart text-gray-600'"></text>
              </view>
              <text class="text-xs text-gray-500 mt-1">{{ isFavorite ? '已收藏' : '收藏' }}</text>
            </view>
            
            <!-- 定时关闭 -->
            <view 
              class="control-btn w-16 h-16 rounded-xl flex flex-col items-center justify-center hover:bg-gray-50 active:bg-gray-100 active:scale-95 transition-all duration-200" 
              @tap="showTimerModal = true">
              <view class="w-9 h-9 rounded-full flex items-center justify-center" :class="sleepTimer > 0 ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-700'">
                <text class="iconfont icon-timer" :class="sleepTimer > 0 ? 'text-cyan-600' : 'text-gray-600'"></text>
              </view>
              <text class="text-xs text-gray-500 mt-1">{{ sleepTimer > 0 ? formatTime(sleepTimer) : '定时' }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 定时关闭弹窗 -->
    <uni-popup ref="popup" type="bottom" @change="popupChange">
      <view class="bg-white rounded-t-2xl p-6">
        <view class="text-center mb-6">
          <text class="text-xl font-bold text-gray-800">定时关闭</text>
        </view>
        
        <view class="grid grid-cols-3 gap-4">
          <view v-for="(option, index) in timerOptions" :key="index"
                class="py-3 rounded-xl text-center transform active:scale-95 transition-all duration-200"
                :class="sleepTimer === option.value ? 'bg-cyan-100 text-cyan-600 font-bold' : 'bg-gray-100 text-gray-700'"
                @tap="setSleepTimer(option.value)">
            <text>{{ option.label }}</text>
          </view>
        </view>
        
        <view class="mt-6">
          <button class="bg-gray-200 rounded-xl py-3 w-full text-gray-700 hover:bg-gray-300 active:bg-gray-400 active:text-white transition-all duration-200" @tap="showTimerModal = false">关闭</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { getMediaDetail, saveProgress } from '@/api/media';

export default {
  data() {
    return {
      loading: true,
      audioId: '',
      audioTitle: '',
      audio: {},
      audioContext: null,
      isPlaying: false,
      currentTime: 0,
      progressPercent: 0,
      defaultCover: '/static/images/meditation-default.jpg',
      playbackSpeed: 1.0,
      touchStartX: 0,
      isSeeking: false,
      showTimerModal: false,
      sleepTimer: 0,
      timerTimeout: null,
      saveProgressInterval: null,
      isFavorite: false,
      timerOptions: [
        { label: '不设置', value: 0 },
        { label: '5分钟', value: 5 * 60 },
        { label: '10分钟', value: 10 * 60 },
        { label: '15分钟', value: 15 * 60 },
        { label: '30分钟', value: 30 * 60 },
        { label: '45分钟', value: 45 * 60 },
        { label: '60分钟', value: 60 * 60 }
      ],
      backupAudioElement: null,
      waveformBars: 28
    }
  },

  onLoad(options) {
    if (options.id) {
      this.audioId = options.id;
      this.audioTitle = options.title || '音频播放';
      this.loadAudioDetail();
    } else {
      uni.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 1500);
    }
  },

  onUnload() {
    // 页面关闭时销毁音频实例
    if (this.audioContext) this.audioContext.destroy();
    
    // 清除定时器
    if (this.timerTimeout) clearTimeout(this.timerTimeout);
    if (this.saveProgressInterval) clearInterval(this.saveProgressInterval);
    
    // 保存最终进度
    this.saveProgress();
  },

  methods: {
    goBack() {
      uni.navigateBack();
    },

    async loadAudioDetail() {
      this.loading = true;
      try {
        const res = await getMediaDetail(this.audioId);
        
        if (res.code === 200 && res.data) {
          this.audio = res.data;
          this.audioTitle = res.data.title;
          
          // 如果后端未返回音频时长，设置默认值
          if (!this.audio.duration || this.audio.duration === 0) {
            this.audio.duration = 300; // 默认5分钟
          }
          
          this.initAudioContext();
          this.saveViewHistory(this.audioId);
        } else {
          uni.showToast({ title: '获取音频详情失败', icon: 'none' });
        }
      } catch (error) {
        console.error('获取音频详情失败:', error);
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
      } finally {
        this.loading = false;
      }
    },

    initAudioContext() {
      if (!this.audio.resourceUrl) {
        uni.showToast({ title: '音频资源不可用', icon: 'none' });
        return;
      }
      
      // 销毁旧的实例
      if (this.audioContext) this.audioContext.destroy();
      
      // 检查是否是跨域资源，如果是则使用备用播放器
      if (this.isCrossDomainUrl(this.audio.resourceUrl)) {
        this.tryLoadCorsAudio(this.audio.resourceUrl);
        return;
      }
      
      try {
        // 创建音频实例
        this.audioContext = uni.createInnerAudioContext();
        
        // 验证URL格式并设置
        const resourceUrl = this.audio.resourceUrl;
        if (!resourceUrl.startsWith('http://') && !resourceUrl.startsWith('https://')) {
          throw new Error('资源URL格式不正确');
        }
        
        this.audioContext.src = resourceUrl;
        this.audioContext.autoplay = false;
        
        // 设置事件监听
        this.setupAudioEvents();
        
        // 设置播放进度保存的定时器（每30秒保存一次）
        this.saveProgressInterval = setInterval(() => {
          if (this.isPlaying) this.saveProgress();
        }, 30000);
      } catch (error) {
        console.error('音频初始化失败:', error);
        uni.showToast({ title: '音频加载失败', icon: 'none' });
      }
    },
    
    setupAudioEvents() {
      if (!this.audioContext) return;
      
      // 开始播放
      this.audioContext.onPlay(() => this.isPlaying = true);
      
      // 暂停播放
      this.audioContext.onPause(() => this.isPlaying = false);
      
      // 播放结束
      this.audioContext.onEnded(() => {
        this.isPlaying = false;
        this.saveProgress(true);
      });
      
      // 更新进度
      this.audioContext.onTimeUpdate(() => {
        this.currentTime = this.audioContext.currentTime;
        if (this.audio.duration > 0 && !this.isSeeking) {
          this.progressPercent = (this.currentTime / this.audio.duration) * 100;
        }
      });
      
      // 加载资源
      this.audioContext.onCanplay(() => {
        // 如果有保存的进度，则跳转到上次播放位置
        if (this.audio.progress && this.audio.progress > 0) {
          this.audioContext.seek(this.audio.progress);
        }
      });
      
      // 捕获错误
      this.audioContext.onError((err) => {
        console.error('播放错误:', err);
        // 尝试替代方案处理音频
        if (err.errCode === 10002 || (err.errMsg && err.errMsg.includes('source'))) {
          this.tryLoadCorsAudio(this.audio.resourceUrl);
        } else {
          uni.showToast({
            title: '音频播放失败: ' + (err.errMsg || '未知错误'),
            icon: 'none',
            duration: 3000
          });
        }
      });
    },

    // 统一的播放控制方法，处理两种播放器
    togglePlay() {
      if (this.backupAudioElement) {
        try {
          this.isPlaying ? this.backupAudioElement.pause() : this.backupAudioElement.play().catch(e => {
            console.error('备用播放器播放失败:', e);
            uni.showToast({ title: '无法播放音频', icon: 'none' });
          });
        } catch (e) {
          console.error('备用播放器操作失败:', e);
        }
        return;
      }
      
      if (!this.audioContext) return;
      
      try {
        if (this.isPlaying) {
          this.audioContext.pause();
        } else {
          // 检查音频源是否有效
          if (!this.audioContext.src) {
            this.initAudioContext(); // 尝试重新初始化
            if (!this.audioContext || !this.audioContext.src) {
              uni.showToast({ title: '无法播放：音频源无效', icon: 'none' });
              return;
            }
          }
          
          this.audioContext.play();
        }
      } catch (error) {
        console.error('播放/暂停操作失败:', error);
        uni.showToast({ title: '播放操作失败', icon: 'none' });
      }
    },

    // 统一的控制方法
    seekAudio(offset) {
      const player = this.backupAudioElement || this.audioContext;
      if (!player || !this.audio) return;
      
      const newTime = offset > 0 
        ? Math.min(this.audio.duration, this.currentTime + offset)
        : Math.max(0, this.currentTime + offset);
        
      if (this.backupAudioElement) {
        this.backupAudioElement.currentTime = newTime;
      } else {
        this.audioContext.seek(newTime);
      }
    },
    
    // 使用统一的seek方法
    rewind15() {
      this.seekAudio(-15);
    },

    forward15() {
      this.seekAudio(15);
    },

    toggleSpeed() {
      // 切换播放速度 1.0 -> 1.25 -> 1.5 -> 0.75 -> 1.0
      const speeds = [1.0, 1.25, 1.5, 0.75, 1.0];
      const currentIndex = speeds.indexOf(this.playbackSpeed);
      const nextIndex = (currentIndex + 1) % speeds.length;
      
      this.playbackSpeed = speeds[nextIndex];
      
      const player = this.backupAudioElement || this.audioContext;
      if (player) player.playbackRate = this.playbackSpeed;
    },

    handleTouchStart(e) {
      this.touchStartX = e.touches[0].clientX;
      this.isSeeking = true;
    },

    handleTouchMove(e) {
      if (!this.isSeeking || !this.audio) return;
      
      const progressBarElement = e.currentTarget;
      const progressBarRect = progressBarElement.getBoundingClientRect();
      const offsetX = e.touches[0].clientX - progressBarRect.left;
      
      // 计算百分比
      let percent = (offsetX / progressBarRect.width) * 100;
      percent = Math.max(0, Math.min(100, percent));
      
      this.progressPercent = percent;
      this.currentTime = (percent / 100) * this.audio.duration;
    },

    handleTouchEnd() {
      if (!this.isSeeking) return;
      
      const seekTime = (this.progressPercent / 100) * this.audio.duration;
      
      if (this.backupAudioElement) {
        this.backupAudioElement.currentTime = seekTime;
      } else if (this.audioContext) {
        this.audioContext.seek(seekTime);
      }
      
      this.isSeeking = false;
    },

    setSleepTimer(seconds) {
      // 清除现有定时器
      if (this.timerTimeout) {
        clearTimeout(this.timerTimeout);
        this.timerTimeout = null;
      }
      
      // 设置新定时器
      this.sleepTimer = seconds;
      this.showTimerModal = false;
      
      if (seconds > 0) {
        this.timerTimeout = setTimeout(() => {
          const player = this.backupAudioElement || this.audioContext;
          if (player && this.isPlaying) {
            if (this.backupAudioElement) {
              this.backupAudioElement.pause();
            } else {
              this.audioContext.pause();
            }
            uni.showToast({ title: '定时结束，播放已暂停', icon: 'none' });
          }
          this.sleepTimer = 0;
        }, seconds * 1000);
      }
    },

    formatTime(seconds) {
      if (!seconds) return '00:00';
      
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    async saveProgress(completed = false) {
      if (!this.audio) return;
      
      try {
        const userInfo = uni.getStorageSync('userInfo');
        if (!userInfo || !userInfo.id) return;
        
        await saveProgress({
          userId: userInfo.id,
          videoId: this.audio.id,
          progress: Math.floor(this.currentTime),
          completed: completed
        });
      } catch (error) {
        console.error('保存播放进度失败:', error);
      }
    },

    async saveViewHistory(videoId) {
      // 后端已经在getMediaDetail中自动增加了观看次数
      // 此方法可以精简或用于其他目的
    },
    
    popupChange(e) {
      this.showTimerModal = e.show;
    },

    // 检查是否是跨域URL
    isCrossDomainUrl(url) {
      if (!url) return false;
      try {
        const urlObj = new URL(url);
        const currentLocation = window.location;
        return urlObj.hostname !== currentLocation.hostname;
      } catch (e) {
        return false;
      }
    },

    // 尝试处理跨域音频加载
    tryLoadCorsAudio(url) {
      try {
        // 清理旧的音频标签
        const oldAudio = document.getElementById('backupAudioPlayer');
        if (oldAudio) document.body.removeChild(oldAudio);
        
        // 创建新的音频标签
        const audioElement = document.createElement('audio');
        audioElement.id = 'backupAudioPlayer';
        audioElement.style.display = 'none';
        audioElement.controls = true;
        audioElement.src = url;
        audioElement.crossOrigin = 'anonymous';
        
        // 添加事件监听
        audioElement.addEventListener('play', () => this.isPlaying = true);
        audioElement.addEventListener('pause', () => this.isPlaying = false);
        audioElement.addEventListener('ended', () => {
          this.isPlaying = false;
          this.saveProgress(true);
        });
        
        audioElement.addEventListener('timeupdate', () => {
          this.currentTime = audioElement.currentTime;
          if (this.audio.duration > 0 && !this.isSeeking) {
            this.progressPercent = (this.currentTime / this.audio.duration) * 100;
          }
        });
        
        audioElement.addEventListener('canplay', () => {
          if (this.audio.progress && this.audio.progress > 0) {
            audioElement.currentTime = this.audio.progress;
          }
        });
        
        audioElement.addEventListener('error', () => {
          uni.showToast({
            title: '音频资源无法加载，可能是跨域限制',
            icon: 'none'
          });
        });
        
        // 将元素添加到DOM
        document.body.appendChild(audioElement);
        
        // 保存引用
        this.backupAudioElement = audioElement;
        
        uni.showToast({ title: '使用替代播放器加载音频', icon: 'none' });
      } catch (e) {
        console.error('创建替代播放器失败:', e);
        uni.showToast({ title: '音频播放器初始化失败', icon: 'none' });
      }
    },

    getRandomHeight(index) {
      if (!this.isPlaying) return 2;
      
      const mid = this.waveformBars / 2;
      const distFromMid = Math.abs(index - mid);
      const maxHeight = 30;
      const minHeight = 4;
      
      // 中间的bar更高，两侧逐渐降低
      let height = maxHeight - (distFromMid * 1.2);
      
      // 添加一些随机性
      height += Math.random() * 10 - 5;
      
      // 确保高度在合理范围内
      return Math.max(minHeight, Math.min(maxHeight, height));
    },
    
    toggleFavorite() {
      this.isFavorite = !this.isFavorite;
      uni.showToast({
        title: this.isFavorite ? '已添加到收藏' : '已取消收藏',
        icon: 'none'
      });
      // TODO: 调用实际的收藏API
    },
  }
}
</script>

<style>
/* 基础样式 */
.audio-player-page {
  min-height: 100vh;
}

.nav-bar {
  height: 44px;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.05);
}

.audio-player {
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease forwards;
}

.meditation-bg {
  position: relative;
  width: 100%;
  height: 260px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
}

.meditation-bg image {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* 波形可视化动画 */
.waveform-bar {
  width: 3px;
  border-radius: 6px;
  animation: waveform 1s ease-in-out infinite;
}

@keyframes waveform {
  0%, 100% { transform: scaleY(0.5); }
  50% { transform: scaleY(1); }
}

/* 波纹动画 */
.ripple-container {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.ripple {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  transform: scale(0);
  opacity: 1;
}

.ripple2 {
  width: 120px;
  height: 120px;
}

.ripple3 {
  width: 140px;
  height: 140px;
}

.animate-ripple {
  animation: ripple 3s infinite cubic-bezier(0.22, 0.61, 0.36, 1);
}

.ripple2.animate-ripple {
  animation-delay: 0.6s;
}

.ripple3.animate-ripple {
  animation-delay: 1.2s;
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 0.8;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

/* 音频控制样式 */
.audio-controls {
  padding: 24px;
}

.progress-bar-container {
  position: relative;
  height: 8px;
  width: 100%;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: visible;
  cursor: pointer;
}

.progress-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #e2e8f0;
  border-radius: 4px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(to right, #8b5cf6, #6366f1);
  border-radius: 4px;
  transition: width 0.1s linear;
  overflow: hidden;
}

/* 进度条波浪效果 */
.progress-wave {
  position: absolute;
  top: -5px;
  right: -5px;
  bottom: -5px;
  width: 20px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3));
  animation: wave 2s linear infinite;
}

@keyframes wave {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-handle {
  position: absolute;
  width: 22px;
  height: 22px;
  background-color: #fff;
  border: 3px solid #6366f1;
  border-radius: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  z-index: 2;
  transition: transform 0.2s;
}

.progress-handle:active {
  transform: translate(-50%, -50%) scale(1.2);
}

.progress-handle-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background-color: #6366f1;
  border-radius: 50%;
}

.play-pause-btn {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.play-pause-btn text {
  color: #fff;
  font-size: 28px;
}

.control-btn:active {
  transform: scale(0.95);
}

/* 确保波形和标题容器层级正确 */
.waveform-section {
  position: relative;
}

.title-section {
  /* 确保标题在波形背景之上，但如果需要，可以在波形动画之上 */
  position: relative;
}
</style> 