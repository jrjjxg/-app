<template>
  <view class="page-container">
    <!-- 头部 - 固定在顶部 -->
    <view class="header bg-gradient-to-r from-blue-500 to-indigo-600 px-4 pt-12 pb-6">
      <view class="flex items-center mb-4">
        <text class="text-xl font-bold text-white">工具箱</text>
      </view>
      <text class="text-white/80">探索各种心理健康工具</text>
    </view>

    <!-- 内容区域 - 使用页面级滚动，不使用scroll-view -->
    <view class="content-container px-4 py-5 pb-20">


      <!-- 最近使用 -->
      <view class="mb-6">
        <view class="flex justify-between items-center mb-3">
          <text class="font-bold text-gray-800">最近使用</text>
        </view>

        <!-- 水平滚动区域 - 使用view模拟横向滚动 -->
        <view class="recent-tools-container">
          <!-- 深呼吸 -->
          <view class="recent-tool-card">
            <view class="tool-icon-container bg-gradient-to-r from-teal-400 to-emerald-400">
              <uni-icons type="refresh" size="28" color="#FFFFFF"></uni-icons>
            </view>
            <view class="p-2">
              <text class="font-medium text-gray-800 block text-center">深呼吸</text>
              <text class="text-xs text-gray-500 text-center block">5分钟</text>
            </view>
          </view>

          <!-- 冥想 -->
          <view class="recent-tool-card">
            <view class="tool-icon-container bg-gradient-to-r from-blue-400 to-indigo-400">
              <uni-icons type="staff" size="28" color="#FFFFFF"></uni-icons>
            </view>
            <view class="p-2">
              <text class="font-medium text-gray-800 block text-center">冥想</text>
              <text class="text-xs text-gray-500 text-center block">10分钟</text>
            </view>
          </view>

          <!-- 情绪日记 -->
          <view class="recent-tool-card" @tap="navigateToJournal">
            <view class="tool-icon-container bg-gradient-to-r from-purple-400 to-pink-400">
              <uni-icons type="compose" size="28" color="#FFFFFF"></uni-icons>
            </view>
            <view class="p-2">
              <text class="font-medium text-gray-800 block text-center">心灵日记</text>
              <text class="text-xs text-gray-500 text-center block">记录与反思</text>
            </view>
          </view>

          <!-- 使用报告 -->
          <view class="recent-tool-card" @tap="navigateToReports">
            <view class="tool-icon-container bg-gradient-to-r from-blue-400 to-teal-400">
              <uni-icons type="chart" size="28" color="#FFFFFF"></uni-icons>
            </view>
            <view class="p-2">
              <text class="font-medium text-gray-800 block text-center">使用报告</text>
              <text class="text-xs text-gray-500 text-center block">个性化分析</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 冥想与正念 -->
      <view class="mb-6">
        <view class="flex justify-between items-center mb-3">
          <text class="font-bold text-gray-800">冥想与正念</text>
          <text class="text-sm text-purple-500">全部</text>
        </view>

        <view class="grid grid-cols-2 gap-4">
          <!-- 引导冥想 -->
          <view class="meditation-card" @tap="navigateToMeditation">
            <view class="icon-circle bg-indigo-100">
              <uni-icons type="headphones" size="24" color="#6366F1"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">引导冥想</text>
            <text class="text-xs text-gray-500 text-center">10分钟</text>
          </view>

          <!-- 深呼吸练习 -->
          <view class="meditation-card">
            <view class="icon-circle bg-teal-100">
              <uni-icons type="refresh" size="24" color="#14B8A6"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">深呼吸练习</text>
            <text class="text-xs text-gray-500 text-center">5分钟</text>
          </view>

          <!-- 专注力训练 -->
          <view class="meditation-card">
            <view class="icon-circle bg-amber-100">
              <uni-icons type="eye" size="24" color="#F59E0B"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">专注力训练</text>
            <text class="text-xs text-gray-500 text-center">8分钟</text>
          </view>

          <!-- 身体扫描 -->
          <view class="meditation-card">
            <view class="icon-circle bg-blue-100">
              <uni-icons type="scan" size="24" color="#3B82F6"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">身体扫描</text>
            <text class="text-xs text-gray-500 text-center">12分钟</text>
          </view>
        </view>
      </view>

      <!-- 情绪调节 -->
      <view class="mb-6">
        <view class="flex justify-between items-center mb-3">
          <text class="font-bold text-gray-800">情绪调节</text>
          <text class="text-sm text-purple-500">全部</text>
        </view>

        <!-- 水平滚动区域 - 使用view模拟横向滚动 -->
        <view class="emotion-tools-container">
          <!-- 情绪识别 -->
          <view class="emotion-tool-card" @tap="navigateToEmotionTool">
            <view class="emotion-card-header">
              <view class="emotion-icon bg-pink-100">
                <uni-icons type="heart" size="24" color="#EC4899"></uni-icons>
              </view>
              <view class="emotion-title-container">
                <text class="emotion-title">情绪识别</text>
                <text class="emotion-time">5分钟</text>
              </view>
            </view>
            <text class="emotion-desc">学习识别和命名你的情绪，提高情绪觉察能力</text>
            <view class="progress-bar">
              <view class="progress-fill bg-pink-500" style="width: 35%;"></view>
            </view>
            <view class="emotion-button bg-gradient-to-r from-pink-500 to-purple-500">
              <text class="button-text">开始练习</text>
            </view>
          </view>

          <!-- 思维重塑 -->
          <view class="emotion-tool-card" @tap="navigateToThinkingTool">
            <view class="emotion-card-header">
              <view class="emotion-icon bg-orange-100">
                <uni-icons type="brain" size="24" color="#F97316"></uni-icons>
              </view>
              <view class="emotion-title-container">
                <text class="emotion-title">思维重塑</text>
                <text class="emotion-time">8分钟</text>
              </view>
            </view>
            <text class="emotion-desc">挑战消极思维模式，建立更健康的思考方式</text>
            <view class="progress-bar">
              <view class="progress-fill bg-orange-500" style="width: 60%;"></view>
            </view>
            <view class="emotion-button bg-gradient-to-r from-orange-500 to-amber-500">
              <text class="button-text">开始练习</text>
            </view>
          </view>

          <!-- 压力管理 -->
          <view class="emotion-tool-card" @tap="navigateToStressTool">
            <view class="emotion-card-header">
              <view class="emotion-icon bg-green-100">
                <uni-icons type="gear" size="24" color="#10B981"></uni-icons>
              </view>
              <view class="emotion-title-container">
                <text class="emotion-title">压力管理</text>
                <text class="emotion-time">10分钟</text>
              </view>
            </view>
            <text class="emotion-desc">学习有效的压力管理技巧，提高心理韧性</text>
            <view class="progress-bar">
              <view class="progress-fill bg-green-500" style="width: 25%;"></view>
            </view>
            <view class="emotion-button bg-gradient-to-r from-green-500 to-teal-500">
              <text class="button-text">查看技巧</text>
            </view>
          </view>

          <!-- 情绪日记 -->
          <view class="emotion-tool-card" @tap="navigateToJournal">
            <view class="emotion-card-header">
              <view class="emotion-icon bg-purple-100">
                <uni-icons type="compose" size="24" color="#8B5CF6"></uni-icons>
              </view>
              <view class="emotion-title-container">
                <text class="emotion-title">心灵日记</text>
                <text class="emotion-time">每日习惯</text>
              </view>
            </view>
            <text class="emotion-desc">记录思考与情绪，发现内心模式，获取个性化洞察</text>
            <view class="progress-bar">
              <view class="progress-fill bg-purple-500" style="width: 75%;"></view>
            </view>
            <view class="emotion-button bg-gradient-to-r from-purple-500 to-indigo-500">
              <text class="button-text">开始记录</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 社交支持 - 在情绪调节区块后添加 -->
      <view class="mb-6">
        <view class="flex justify-between items-center mb-3">
          <text class="font-bold text-gray-800">社交支持</text>
          <text class="text-sm text-purple-500">全部</text>
        </view>

        <view class="grid grid-cols-2 gap-4">
          <!-- 漂流瓶 -->
          <view class="meditation-card" @tap="navigateToDriftBottle">
            <view class="icon-circle bg-blue-100">
              <uni-icons type="paperplane" size="24" color="#3B82F6"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">漂流瓶</text>
            <text class="text-xs text-gray-500 text-center">匿名社交</text>
          </view>

          <!-- 支持圈 (预留位置，可以后续添加其他社交支持工具) -->
          <view class="meditation-card">
            <view class="icon-circle bg-purple-100">
              <uni-icons type="chat" size="24" color="#8B5CF6"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">支持圈</text>
            <text class="text-xs text-gray-500 text-center">团体交流</text>
          </view>
        </view>
      </view>

      <!-- 睡眠改善 -->
      <view class="mb-6">
        <view class="flex justify-between items-center mb-3">
          <text class="font-bold text-gray-800">睡眠改善</text>
          <text class="text-sm text-purple-500">全部</text>
        </view>

        <view class="grid grid-cols-2 gap-4">
          <!-- 夜间安眠 -->
          <view class="sleep-card">
            <view class="icon-circle bg-indigo-100">
              <uni-icons type="moon" size="24" color="#6366F1"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">夜间安眠</text>
            <text class="text-xs text-gray-500 text-center">15分钟</text>
          </view>

          <!-- 睡前放松 -->
          <view class="sleep-card">
            <view class="icon-circle bg-blue-100">
              <uni-icons type="wind-power" size="24" color="#3B82F6"></uni-icons>
            </view>
            <text class="font-medium text-gray-800 text-center">睡前放松</text>
            <text class="text-xs text-gray-500 text-center">10分钟</text>
          </view>
        </view>
      </view>

      <!-- 添加智能助手入口 -->
      <view class="tool-card" @click="navigateToChatbot">
        <view class="tool-icon bg-gradient-to-r from-indigo-500 to-purple-500">
          <uni-icons type="chat-filled" size="24" color="#ffffff"></uni-icons>
        </view>
        <view class="tool-info">
          <text class="tool-name">智能助手</text>
          <text class="tool-desc">与AI助手进行多轮对话，获取支持与解答</text>
        </view>
      </view>

      <!-- 添加心理健康状态入口 -->
      <view class="tool-card" @click="navigateToMentalStatus">
        <view class="tool-icon bg-gradient-to-r from-purple-500 to-pink-500">
          <uni-icons type="heart-filled" size="24" color="#ffffff"></uni-icons>
        </view>
        <view class="tool-info">
          <text class="tool-name">心理健康状态</text>
          <text class="tool-desc">查看您的心理健康评估和预警记录</text>
        </view>
      </view>

      <!-- 添加到工具列表中 -->
      <view class="tool-card" @click="navigateToEmotionRecognition">
        <view class="tool-icon bg-gradient-to-r from-yellow-500 to-amber-500">
          <uni-icons type="emotion" size="24" color="#ffffff"></uni-icons>
        </view>
        <view class="tool-info">
          <text class="tool-name">情绪识别</text>
          <text class="tool-desc">通过照片分析你的情绪状态</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeCard: null
    }
  },
  methods: {
    navigateToMoodJournal() {
      uni.navigateTo({
        url: '/pages/mood-journal/index'
      })
    },
    navigateToMeditation() {
      uni.navigateTo({
        url: '/pages/meditation/index'
      })
    },
    navigateToEmotionTool() {
      uni.showToast({
        title: '即将推出',
        icon: 'none'
      })
    },
    navigateToThinkingTool() {
      uni.showToast({
        title: '即将推出',
        icon: 'none'
      })
    },
    navigateToStressTool() {
      uni.showToast({
        title: '即将推出',
        icon: 'none'
      })
    },
    navigateToDriftBottle() {
      uni.navigateTo({
        url: '/pages/driftbottle/index'
      })
    },
    navigateToJournal() {
      uni.navigateTo({
        url: '/pages/journal/list'
      });
    },
    navigateToReports() {
      uni.navigateTo({
        url: '/pages/reports/index'
      });
    },
    navigateToMentalStatus() {
      uni.navigateTo({
        url: '/pages/mental-status/dashboard'
      });
    },
    navigateToEmotionRecognition() {
      uni.navigateTo({
        url: '/pages/emotion-recognition/index'
      });
    },
    navigateToChatbot() {
      uni.navigateTo({
        url: '/pages/chatbot/threads'
      });
    }
  }
}
</script>

<style>
.page-container {
  background-color: #f9fafb;
  min-height: 100vh;
}

.header {
  position: sticky;
  top: 0;
  z-index: 10;
}

.content-container {
  background-color: #f9fafb;
}

/* 最近使用工具卡片 */
.recent-tools-container {
  display: flex;
  overflow-x: auto;
  padding: 8px 0;
  margin: 0 -16px;
  padding-left: 16px;
  -webkit-overflow-scrolling: touch;
}

.recent-tool-card {
  flex: 0 0 auto;
  width: 112px;
  margin-right: 12px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.tool-icon-container {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 冥想卡片 */
.meditation-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

/* 情绪调节工具卡片 */
.emotion-tools-container {
  display: flex;
  overflow-x: auto;
  padding: 8px 0;
  margin: 0 -16px;
  padding-left: 16px;
  -webkit-overflow-scrolling: touch;
}

.emotion-tool-card {
  flex: 0 0 auto;
  width: 256px;
  margin-right: 16px;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.emotion-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.emotion-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emotion-title-container {
  margin-left: 12px;
}

.emotion-title {
  font-weight: 500;
  color: #1f2937;
}

.emotion-time {
  font-size: 12px;
  color: #6b7280;
}

.emotion-desc {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 12px;
}

.progress-bar {
  height: 6px;
  background-color: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
}

.emotion-button {
  padding: 8px 16px;
  border-radius: 999px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.button-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

/* 睡眠卡片 */
.sleep-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 隐藏滚动条但保持功能 */
.recent-tools-container::-webkit-scrollbar,
.emotion-tools-container::-webkit-scrollbar {
  display: none;
}

/* 优化滚动性能 */
.recent-tools-container,
.emotion-tools-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 工具卡片样式 */
.tool-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.tool-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.tool-info {
  flex: 1;
}

.tool-name {
  font-weight: 500;
  color: #1f2937;
  font-size: 16px;
  margin-bottom: 4px;
}

.tool-desc {
  font-size: 14px;
  color: #6b7280;
}
</style>