<!-- emotion-animation.vue -->
<template>
    <view class="emotion-animation" :class="[`emotion-${type}`]">
      <view class="animation-container">
        <view class="animation-element" v-for="i in 5" :key="i"></view>
      </view>
    </view>
  </template>
  
  <script>
  export default {
    props: {
      type: {
        type: String,
        default: 'happy'
      }
    }
  }
  </script>
  
  <style scoped>
  .emotion-animation {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 10;
    overflow: hidden;
  }
  
  .animation-container {
    position: relative;
    width: 100%;
    height: 100%;
  }
  
  .animation-element {
    position: absolute;
    border-radius: 50%;
    opacity: 0;
    transform: scale(0);
  }
  
  /* 快乐动画 */
  .emotion-happy .animation-element {
    background-color: rgba(250, 204, 21, 0.3);
    animation: floatUp 2s ease-out forwards;
  }
  
  /* 平静动画 */
  .emotion-calm .animation-element {
    background-color: rgba(52, 211, 153, 0.3);
    animation: pulse 2s ease-out forwards;
  }
  
  /* 焦虑动画 */
  .emotion-anxious .animation-element {
    background-color: rgba(167, 139, 250, 0.3);
    animation: shake 2s ease-out forwards;
  }
  
  /* 悲伤动画 */
  .emotion-sad .animation-element {
    background-color: rgba(96, 165, 250, 0.3);
    animation: fallDown 2s ease-out forwards;
  }
  
  /* 愤怒动画 */
  .emotion-angry .animation-element {
    background-color: rgba(248, 113, 113, 0.3);
    animation: expand 2s ease-out forwards;
  }
  
  @keyframes floatUp {
    0% { opacity: 0; transform: scale(0) translateY(0); }
    20% { opacity: 0.7; transform: scale(1) translateY(0); }
    100% { opacity: 0; transform: scale(0.5) translateY(-100px); }
  }
  
  @keyframes pulse {
    0% { opacity: 0; transform: scale(0); }
    50% { opacity: 0.7; transform: scale(1); }
    100% { opacity: 0; transform: scale(1.5); }
  }
  
  @keyframes shake {
    0% { opacity: 0; transform: scale(0) translateX(0); }
    20% { opacity: 0.7; transform: scale(1) translateX(0); }
    40% { transform: translateX(-10px); }
    60% { transform: translateX(10px); }
    80% { transform: translateX(-5px); }
    100% { opacity: 0; transform: scale(0.5) translateX(0); }
  }
  
  @keyframes fallDown {
    0% { opacity: 0; transform: scale(0) translateY(-50px); }
    20% { opacity: 0.7; transform: scale(1) translateY(0); }
    100% { opacity: 0; transform: scale(0.5) translateY(100px); }
  }
  
  @keyframes expand {
    0% { opacity: 0; transform: scale(0); }
    20% { opacity: 0.7; transform: scale(1); }
    40% { transform: scale(1.2); }
    60% { transform: scale(0.9); }
    80% { transform: scale(1.1); }
    100% { opacity: 0; transform: scale(1.5); }
  }
  </style>