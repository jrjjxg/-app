<template>
  <view class="flex flex-col h-full bg-gray-50">
    <!-- 固定顶部区域 -->
    <view class="fixed-top">
      <!-- 状态栏占位 -->
      <view class="status-bar-height"></view>
      <!-- 顶部导航栏 -->
      <view class="flex items-center justify-between px-4 py-3 bg-white">
        <text class="text-xl font-bold">情绪社交</text>
        <view class="flex items-center">
          <view class="mr-4" @click="goToSearch">
            <uni-icons type="search" size="22"></uni-icons>
          </view>
          <view class="mr-4" @click="goToNotifications">
            <uni-icons type="notification" size="22" :color="hasUnread ? '#4F46E5' : '#333'"></uni-icons>
            <view v-if="hasUnread" class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></view>
          </view>
          <view @click="goToMyProfile">
            <image :src="userAvatar || '/static/images/default-avatar.png'" class="w-8 h-8 rounded-full"></image>
          </view>
        </view>
      </view>
      
      <!-- 顶部切换标签 - 简洁设计 -->
      <view class="bg-white border-b border-gray-200">
        <view class="flex px-4 h-10">
          <view
            class="relative flex-1 h-full flex items-center justify-center"
            @click="switchTab('community')"
          >
            <view class="flex items-center space-x-1">
              <uni-icons
                type="chat"
                size="14"
                :color="activeTab === 'community' ? '#4F46E5' : '#9CA3AF'"
              ></uni-icons>
              <text
                class="text-sm"
                :class="activeTab === 'community' ? 'text-indigo-600 font-medium' : 'text-gray-500'"
              >社区</text>
            </view>
            <view 
              v-if="activeTab === 'community'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t"
            ></view>
          </view>
          <view
            class="relative flex-1 h-full flex items-center justify-center"
            @click="switchTab('driftbottle')"
          >
            <view class="flex items-center space-x-1">
              <uni-icons
                type="paperplane"
                size="14"
                :color="activeTab === 'driftbottle' ? '#4F46E5' : '#9CA3AF'"
              ></uni-icons>
              <text
                class="text-sm"
                :class="activeTab === 'driftbottle' ? 'text-indigo-600 font-medium' : 'text-gray-500'"
              >漂流瓶</text>
            </view>
            <view 
              v-if="activeTab === 'driftbottle'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t"
            ></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 社区内容 -->
      <view v-if="activeTab === 'community'" class="h-full">
        <!-- 标签栏 -->
        <scroll-view scroll-x class="whitespace-nowrap bg-white py-2 mb-2">
          <view class="flex px-2">
            <view v-for="tag in communityTags" :key="tag.id" 
                  class="px-4 py-1 mx-1 rounded-full text-center"
                  :class="activeTag === tag.id ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'"
                  @click="changeTag(tag.id)">
              {{ tag.name }}
            </view>
          </view>
        </scroll-view>

        <!-- 帖子列表 -->
        <uni-list ref="uniList" :border="false" class="px-2">
          <!-- 使用帖子分段组件渲染帖子列表 -->
          <post-section v-for="(section, sIndex) in postSections" :key="sIndex" 
                        :posts="section"
                        @post-click="goToPostDetail" 
                        @user-click="goToUserProfile">
          </post-section>
          
          <!-- 加载更多 -->
          <uni-load-more :status="loadMoreStatus" @clickLoadMore="loadMorePosts"></uni-load-more>
        </uni-list>
      </view>

      <!-- 漂流瓶内容 -->
      <view v-else class="flex flex-col h-full">
        <!-- 漂流瓶介绍卡片 -->
        <view class="bg-white m-3 rounded-xl shadow-sm p-4">
          <view class="flex items-center mb-2">
            <uni-icons type="info-filled" size="16" color="#4F46E5"></uni-icons>
            <text class="ml-2 text-gray-800 font-medium">匿名表达你的心声</text>
          </view>
          <text class="text-gray-600 text-sm">在这里你可以匿名分享心事，也可以捞取他人的心声，建立情感连接。</text>
        </view>
        
        <!-- 漂流瓶主要交互区域 -->
        <view class="flex-1 relative overflow-hidden">
          <!-- 海洋背景 -->
          <image src="/static/images/ocean.png" mode="aspectFill" class="absolute inset-0 w-full h-full"></image>
          
          <!-- 波浪动画 -->
          <view class="wave-animation absolute bottom-0 w-full h-[60%]">
            <view class="wave wave1"></view>
            <view class="wave wave2"></view>
          </view>
          
          <!-- 瓶子交互区 -->
          <view class="absolute inset-0 flex flex-col items-center justify-center z-10">
            <view class="bottle-container mb-8" @click="pickRandomBottle">
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
            
            <view class="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full">
              <text class="text-indigo-900">点击捞取一个漂流瓶</text>
            </view>
          </view>
        </view>
        
        <!-- 漂流瓶操作按钮 -->
        <view class="bg-white p-4 grid grid-cols-2 gap-3">
          <view @click="goToMyBottles" 
                class="bg-indigo-100 flex items-center justify-center rounded-lg py-3">
            <uni-icons type="inbox" size="20" color="#4F46E5" class="mr-2"></uni-icons>
            <text class="text-indigo-600 font-medium">我的漂流瓶</text>
          </view>
          <view @click="goToThrowBottle" 
                class="bg-indigo-500 flex items-center justify-center rounded-lg py-3">
            <uni-icons type="paperplane" size="20" color="#FFFFFF" class="mr-2"></uni-icons>
            <text class="text-white font-medium">投掷漂流瓶</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 浮动操作按钮 - 根据活动标签显示不同按钮 -->
    <view v-if="activeTab === 'community'"
          class="fixed right-5 bottom-8 w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg"
          @click="goToPublish">
      <uni-icons type="plus" size="24" color="#fff"></uni-icons>
    </view>
  </view>
</template>

<script>
import { getPostList } from '@/api/post';
import { getUnreadCount } from '@/api/notification';
import { pickBottle } from '@/api/driftbottle';
import PostSection from '@/components/post-section.vue';

export default {
  components: {
    PostSection
  },
  data() {
    return {
      activeTab: 'community', // 默认显示社区标签
      activeTag: 'all', // 默认标签为"全部"
      communityTags: [
        { id: 'all', name: '全部' },
        { id: 'recommend', name: '推荐' },
        { id: 'emotion', name: '情绪管理' },
        { id: 'anxiety', name: '焦虑减压' },
        { id: 'sleep', name: '睡眠改善' },
        { id: 'relationship', name: '人际关系' },
        { id: 'growth', name: '个人成长' }
      ],
      posts: [],
      postSections: [],
      sectionSize: 10,
      pageNum: 1,
      pageSize: 10,
      hasMore: true,
      loadMoreStatus: 'more',
      loading: false,
      refreshing: false,
      userAvatar: '',
      hasUnread: false,
      isPickAnimating: false,
    };
  },
  onLoad() {
    this.loadInitialData();
  },
  onShow() {
    this.getUnreadNotificationCount();
    this.getUserInfo();
  },
  onPullDownRefresh() {
    this.refresh();
  },
  watch: {
    posts(newVal) {
      this.splitPostsIntoSections(newVal);
    },
    activeTab(newVal) {
      // 当切换标签时，重置滚动位置
      setTimeout(() => {
        uni.pageScrollTo({
          scrollTop: 0,
          duration: 0
        });
      }, 10);
    }
  },
  methods: {
    // 加载初始数据
    async loadInitialData() {
      this.getUserInfo();
      this.loadPosts();
      this.getUnreadNotificationCount();
    },
    
    // 获取用户信息
    getUserInfo() {
      try {
        const userInfo = uni.getStorageSync('userInfo');
        if (userInfo) {
          this.userInfo = JSON.parse(userInfo);
          this.userAvatar = this.userInfo.avatar || '/static/images/default-avatar.png';
        }
      } catch (e) {
        console.error('获取用户信息失败', e);
      }
    },
    
    // 获取未读通知数
    async getUnreadNotificationCount() {
      try {
        const res = await getUnreadCount();
        this.hasUnread = res.data && res.data.total > 0;
      } catch (error) {
        console.error('获取未读通知数失败', error);
      }
    },
    
    // 刷新数据
    refresh() {
      this.refreshing = true;
      this.pageNum = 1;
      this.hasMore = true;
      this.loadMoreStatus = 'more';
      
      this.loadPosts().then(() => {
        this.refreshing = false;
        uni.stopPullDownRefresh();
      }).catch(err => {
        console.error('刷新数据失败:', err);
        this.refreshing = false;
        uni.stopPullDownRefresh();
        uni.showToast({
          title: '刷新失败，请稍后再试',
          icon: 'none'
        });
      });
    },
    
    // 切换标签
    changeTag(tagId) {
      if (this.activeTag === tagId) return;
      this.activeTag = tagId;
      this.pageNum = 1;
      this.posts = [];
      this.hasMore = true;
      this.loadMoreStatus = 'more';
      this.loadPosts();
    },
    
    // 将帖子数据分段
    splitPostsIntoSections(posts) {
      this.postSections = [];
      const totalPosts = posts.length;
      const sectionCount = Math.ceil(totalPosts / this.sectionSize);
      
      for (let i = 0; i < sectionCount; i++) {
        const start = i * this.sectionSize;
        const end = Math.min(start + this.sectionSize, totalPosts);
        this.postSections.push(posts.slice(start, end));
      }
    },
    
    // 加载帖子
    async loadPosts() {
      if (this.loading && this.pageNum > 1) return;
      
      this.loading = true;
      this.loadMoreStatus = 'loading';
      
      try {
        let params = {
          pageNum: this.pageNum,
          pageSize: this.pageSize
        };
        
        // 根据标签设置查询参数
        if (this.activeTag !== 'all') {
          if (this.activeTag === 'recommend') {
            params.recommend = 1;
          } else {
            params.tag = this.activeTag;
          }
        }
        
        const res = await getPostList(params);
        
        // 获取帖子列表
        let posts = res.data.records || [];
        
        // 转换数据结构，为每个帖子创建author对象
        posts = posts.map(post => {
          // 如果post中没有author对象，则创建一个
          if (!post.author) {
            post.author = {
              id: post.userId,
              nickname: post.username || '用户',
              avatar: post.avatar || '/static/images/default-avatar.png',
              isExpert: post.isExpert || false
            };
          }
          return post;
        });
        
        if (this.pageNum === 1) {
          this.posts = posts;
        } else {
          this.posts = [...this.posts, ...posts];
        }
        
        this.hasMore = this.posts.length < res.data.total;
        this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
      } catch (error) {
        console.error('加载帖子失败', error);
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
        this.loadMoreStatus = 'more';
      } finally {
        this.loading = false;
        this.refreshing = false;
      }
    },
    
    // 加载更多帖子
    loadMorePosts() {
      if (!this.hasMore || this.loading) return;
      this.pageNum++;
      this.loadPosts();
    },
    
    // 跳转到帖子详情
    goToPostDetail(postId) {
      uni.showLoading({
        title: '加载中...'
      });
      
      uni.navigateTo({
        url: `/pages/community/post-detail?id=${postId}`,
        success: () => {
          uni.hideLoading();
        },
        fail: () => {
          uni.hideLoading();
          uni.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 跳转到用户个人资料页
    goToUserProfile(userId) {
      if (!userId) {
        console.error('用户ID不存在');
        return;
      }
      
      uni.navigateTo({
        url: `/pages/community/user-profile?id=${userId}`,
        animationType: 'slide-in-right',
        animationDuration: 300
      });
    },
    
    // 跳转到我的个人主页
    goToMyProfile() {
      try {
        const userId = uni.getStorageSync('userId');
        // 跳转到个人主页
        uni.navigateTo({
          url: `/pages/community/user-profile?id=${userId}`,
          animationType: 'slide-in-right',
          animationDuration: 300
        });
      } catch (error) {
        console.error('解析token出错:', error);
        uni.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
      }
    },
    
    // 跳转到发布页面
    goToPublish() {
      uni.navigateTo({
        url: '/pages/community/publish',
        animationType: 'slide-in-bottom',
        animationDuration: 300
      });
    },
    
    // 跳转到搜索页面
    goToSearch() {
      uni.navigateTo({
        url: '/pages/community/search',
        animationType: 'slide-in-top',
        animationDuration: 300
      });
    },
    
    // 跳转到通知页面
    goToNotifications() {
      uni.navigateTo({
        url: '/pages/community/notifications',
        animationType: 'slide-in-right',
        animationDuration: 300
      });
    },
    
    // 捞取随机漂流瓶
    async pickRandomBottle() {
      if (this.isPickAnimating) return;
      
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
      }
    },
    
    // 播放捞起漂流瓶的动画
    playPickAnimation() {
      this.isPickAnimating = true;
      
      setTimeout(() => {
        this.isPickAnimating = false;
      }, 1000);
    },
    
    // 跳转到我的漂流瓶页面
    goToMyBottles() {
      uni.navigateTo({
        url: '/pages/driftbottle/my-bottles'
      });
    },
    
    // 跳转到投掷漂流瓶页面
    goToThrowBottle() {
      uni.navigateTo({
        url: '/pages/driftbottle/throw'
      });
    },
    
    // 简化 switchTab 方法，移除选择器相关逻辑
    switchTab(tab) {
      if (this.activeTab !== tab) {
        this.activeTab = tab;
        
        // 添加轻微振动反馈
        uni.vibrateShort({
          success: function () { }
        });
        
        // 重置滚动位置
        setTimeout(() => {
          uni.pageScrollTo({
            scrollTop: 0,
            duration: 0
          });
        }, 10);
      }
    }
  }
};
</script>

<style>
/* 固定顶部样式 */
.fixed-top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: #fff;
}

/* 状态栏高度 */
.status-bar-height {
  height: var(--status-bar-height);
  width: 100%;
}

/* 内容区域样式 */
.content-area {
  margin-top: calc(var(--status-bar-height) + 82px); /* 调整为顶部导航+标签的高度 */
  height: calc(100vh - var(--status-bar-height) - 82px);
  width: 100%;
}

/* 波浪动画样式 */
.wave-animation {
  overflow: hidden;
}

.wave {
  position: absolute;
  bottom: 0;
  width: 200%;
  height: 100%;
  background: rgba(100, 116, 255, 0.2);
  border-radius: 50% 50% 0 0;
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

/* 优化滚动性能 */
:deep(uni-list),
:deep(uni-list-item) {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000;
  will-change: transform;
}
</style> 