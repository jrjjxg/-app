<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="back" size="20"></uni-icons>
      </view>
      <view class="title">漂流瓶</view>
      <view class="mine-btn" @click="goToMyBottles">我的</view>
    </view>

    <!-- 中间海洋动画区域 -->
    <view class="ocean-area">
      <image src="/static/images/ocean.png" mode="aspectFill" class="ocean-bg"></image>

      <!-- 波浪动画 -->
      <view class="wave-animation">
        <view class="wave wave1"></view>
        <view class="wave wave2"></view>
      </view>

      <!-- 漂流瓶容器 -->
      <view class="bottle-container" @click="pickRandomBottle">
        <!-- 漂流瓶 -->
        <view class="bottle" :class="{ 'pick-animation': isPickAnimating }">
          <view class="bottle-top"></view>
          <view class="bottle-body"></view>
        </view>

        <!-- 水花效果 -->
        <view v-if="isPickAnimating" class="water-splash">
          <view class="splash splash1"></view>
          <view class="splash splash2"></view>
          <view class="splash splash3"></view>
          <view class="splash splash4"></view>
        </view>
      </view>

      <view class="ocean-tips">点击漂流瓶，捞取一个秘密</view>
    </view>

    <!-- 底部操作区 -->
    <view class="bottom-actions">
      <view class="action-btn throw-btn" @click="goToThrowBottle">
        <uni-icons type="paperplane" size="20" color="#ffffff"></uni-icons>
        <text>投掷漂流瓶</text>
      </view>
    </view>
  </view>
</template>

<script>
import { pickBottle } from '@/api/driftbottle';

export default {
  data() {
    return {
      isLoading: false,
      isPickAnimating: false
    };
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    goToThrowBottle() {
      uni.navigateTo({
        url: '/pages/driftbottle/throw'
      });
    },
    goToMyBottles() {
      uni.navigateTo({
        url: '/pages/driftbottle/my-bottles'
      });
    },
    async pickRandomBottle() {
      if (this.isLoading) return;

      this.isLoading = true;
      try {
        const res = await pickBottle();

        if (res.code === 200 && res.data) {
          // 播放捞起的动画
          this.playPickAnimation();

          // 跳转到漂流瓶详情页
          setTimeout(() => {
            uni.navigateTo({
              url: `/pages/driftbottle/detail?id=${res.data.id}`
            });
          }, 1000);
        } else {
          uni.showToast({
            title: '暂时没有漂流瓶可捞',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.showToast({
          title: '捞取失败，请重试',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    playPickAnimation() {
      this.isPickAnimating = true;

      // 播放拾取音效（可选）
      // const audio = uni.createInnerAudioContext();
      // audio.src = '/static/sounds/splash.mp3';
      // audio.play();

      setTimeout(() => {
        this.isPickAnimating = false;
      }, 1000);
    }
  }
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f8ff;
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
.mine-btn {
  padding: 5px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.ocean-area {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.ocean-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.wave-animation {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 60%;
  overflow: hidden;
}

.wave {
  position: absolute;
  bottom: 0;
  width: 200%;
  height: 100%;
/*  background: url('/static/images/wave.png') repeat-x; */
  background-size: 50% 100%;
  transform-origin: center bottom;
}

.wave1 {
  animation: wave 20s linear infinite;
  opacity: 0.8;
}

.wave2 {
  animation: wave 15s linear infinite reverse;
  opacity: 0.5;
}

@keyframes wave {
  0% {
    transform: translateX(0) scaleY(1);
  }

  50% {
    transform: translateX(-25%) scaleY(0.9);
  }

  100% {
    transform: translateX(-50%) scaleY(1);
  }
}

/* 漂流瓶样式 */
.bottle-container {
  position: relative;
  z-index: 2;
  cursor: pointer;
}

.bottle {
  width: 60px;
  height: 120px;
  position: relative;
  z-index: 3;
}

.bottle-top {
  width: 20px;
  height: 20px;
  background-color: #8B4513;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.bottle-body {
  width: 60px;
  height: 100px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 10px 10px 30px 30px;
  position: absolute;
  top: 15px;
  left: 0;
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.9);
}

.bottle.pick-animation {
  animation: pickBottle 1s ease-out;
}

@keyframes pickBottle {
  0% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-80px) rotate(10deg);
  }

  100% {
    transform: translateY(-50px) rotate(0deg);
  }
}

/* 水花效果 */
.water-splash {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

.splash {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: splashEffect 0.6s ease-out;
}

.splash1 {
  left: -20px;
  animation-delay: 0.1s;
}

.splash2 {
  left: 20px;
  animation-delay: 0.2s;
}

.splash3 {
  left: -10px;
  animation-delay: 0.15s;
}

.splash4 {
  left: 10px;
  animation-delay: 0.25s;
}

@keyframes splashEffect {
  0% {
    transform: translateY(0) scale(0.5);
    opacity: 1;
  }

  100% {
    transform: translateY(-40px) scale(1.5);
    opacity: 0;
  }
}

/* 修改原有的样式 */
.bottle-image {
  display: none;
  /* 隐藏原来的图片 */
}

.ocean-tips {
  margin-top: 20px;
  font-size: 14px;
  color: #666;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 5px 15px;
  border-radius: 15px;
  z-index: 2;
}

.bottom-actions {
  padding: 15px;
}

.action-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  border-radius: 25px;
  font-size: 16px;
}

.throw-btn {
  background: linear-gradient(to right, #007aff, #00aaff);
  color: #ffffff;
}

.throw-btn text {
  margin-left: 5px;
}
</style>