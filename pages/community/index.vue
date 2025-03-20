<template>
  <view class="flex flex-col h-full bg-gray-100">
    <!-- 固定顶部区域 -->
    <view class="fixed-top">
      <!-- 状态栏占位 -->
      <view class="status-bar-height"></view>
      <!-- 顶部导航栏 -->
      <view class="flex items-center justify-between px-4 py-3 bg-white">
        <text class="text-xl font-bold">社区</text>
        <view class="flex items-center">
          <view class="mr-4" @click="goToSearch">
            <uni-icons type="search" size="22"></uni-icons>
          </view>
          <view class="mr-4" @click="goToNotifications">
            <uni-icons type="notification" size="22"></uni-icons>
          </view>
          <view @click="goToMyProfile">
            <image :src="userAvatar || '/static/images/default-avatar.png'" class="w-8 h-8 rounded-full"></image>
          </view>
        </view>
      </view>

      <!-- 标签栏 -->
      <scroll-view scroll-x class="whitespace-nowrap bg-white py-2 mb-2 tag-scroll-view">
        <view class="flex">
          <view v-for="tag in tags" :key="tag.id" class="px-4 py-1 mx-1 rounded-full text-center"
            :class="activeTag === tag.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'"
            @click="changeTag(tag.id)">
            {{ tag.name }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 内容区域（添加上边距，为固定顶部腾出空间） -->
    <view class="content-area">
      <!-- 帖子列表 - 使用uList组件替代普通scroll-view -->
      <uni-list ref="uniList" :border="false" :style="{ height: 'calc(100vh - var(--status-bar-height) - 110px)' }">
        <!-- 使用uni-list-item组件分段渲染帖子 -->
        <post-section v-for="(section, sIndex) in postSections" :key="sIndex" :posts="section"
          @post-click="goToPostDetail" @user-click="goToUserProfile">
        </post-section>

        <!-- 加载更多 -->
        <uni-load-more :status="loadMoreStatus" @clickLoadMore="loadMore"></uni-load-more>
      </uni-list>
    </view>

    <!-- 发布按钮 -->
    <view class="fixed right-5 bottom-8 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg"
      @click="goToPublish">
      <uni-icons type="plus" size="24" color="#fff"></uni-icons>
    </view>
  </view>
</template>

<script>
import { getPostList, getUserLikedPosts } from '@/api/post';
import { getUnreadCount } from '@/api/notification';
import PostSection from '@/components/post-section.vue'

export default {
  components: {
    PostSection
  },
  data() {
    return {
      loading: true,
      refreshing: false,
      tags: [
        { id: 'all', name: '全部' },
        { id: 'recommend', name: '推荐' },
        { id: 'emotion', name: '情绪管理' },
        { id: 'anxiety', name: '焦虑减压' },
        { id: 'sleep', name: '睡眠改善' },
        { id: 'relationship', name: '人际关系' },
        { id: 'growth', name: '个人成长' }
      ],
      activeTag: 'all',
      posts: [],
      postSections: [],
      sectionSize: 10,
      pageNum: 1,
      pageSize: 10,
      hasMore: true,
      loadMoreStatus: 'more',
      unreadCount: 0
    }
  },
  onLoad() {
    this.loadPosts()
    this.getUnreadNotificationCount()
  },
  onShow() {
    this.getUnreadNotificationCount()
    this.checkPageStack()
  },
  onPullDownRefresh() {
    console.log('用户触发了下拉刷新');
    this.refreshing = true;

    // 重置分页参数
    this.pageNum = 1;
    this.hasMore = true;
    this.loadMoreStatus = 'more';

    // 调用 loadPosts 方法加载数据
    this.loadPosts().then(() => {
      // 数据加载完成后
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
  watch: {
    posts(newVal) {
      this.splitPostsIntoSections(newVal);
    }
  },
  methods: {
    // 切换标签
    changeTag(tagId) {
      if (this.activeTag === tagId) return
      this.activeTag = tagId
      this.pageNum = 1
      this.posts = []
      this.hasMore = true
      this.loadMoreStatus = 'more'
      this.loadPosts()
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
      if (this.loading && this.pageNum > 1) return

      this.loading = true
      this.loadMoreStatus = 'loading'

      try {
        let params = {
          pageNum: this.pageNum,
          pageSize: this.pageSize
        }

        // 根据标签设置查询参数
        if (this.activeTag !== 'all') {
          if (this.activeTag === 'recommend') {
            params.recommend = 1
          } else {
            params.tag = this.activeTag
          }
        }

        const res = await getPostList(params)

        // 获取帖子列表
        let posts = res.data.records || []

        // 转换数据结构，为每个帖子创建author对象
        posts = posts.map(post => {
          // 如果post中没有author对象，则创建一个
          if (!post.author) {
            post.author = {
              id: post.userId,
              nickname: post.username || '用户',
              avatar: post.avatar || '/static/images/default-avatar.png',
              isExpert: post.isExpert || false
            }
          }
          return post
        })

        if (this.pageNum === 1) {
          this.posts = posts
        } else {
          this.posts = [...this.posts, ...posts]
        }

        this.hasMore = this.posts.length < res.data.total
        this.loadMoreStatus = this.hasMore ? 'more' : 'noMore'
      } catch (error) {
        console.error('加载帖子失败', error)
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        })
        this.loadMoreStatus = 'more'
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },

    // 下拉刷新
    onRefresh() {
      this.refreshing = true
      this.pageNum = 1
      this.loadPosts()
    },

    // 加载更多
    loadMorePosts() {
      if (!this.hasMore || this.loading) return
      this.pageNum++
      this.loadPosts()
    },

    // 获取未读通知数
    async getUnreadNotificationCount() {
      try {
        const res = await getUnreadCount()
        this.unreadCount = res.data.total || 0
      } catch (error) {
        console.error('获取未读通知数失败', error)
      }
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

    // 格式化时间
    formatTime(time) {
      if (!time) return ''

      const now = new Date()
      const postTime = new Date(time)
      const diff = now - postTime

      // 小于1分钟
      if (diff < 60 * 1000) {
        return '刚刚'
      }

      // 小于1小时
      if (diff < 60 * 60 * 1000) {
        return Math.floor(diff / (60 * 1000)) + '分钟前'
      }

      // 小于24小时
      if (diff < 24 * 60 * 60 * 1000) {
        return Math.floor(diff / (60 * 60 * 1000)) + '小时前'
      }

      // 小于30天
      if (diff < 30 * 24 * 60 * 60 * 1000) {
        return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前'
      }

      // 大于30天
      const year = postTime.getFullYear()
      const month = postTime.getMonth() + 1
      const day = postTime.getDate()

      return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`
    },

    // 点赞/取消点赞帖子
    async togglePostLike(post) {
      if (!this.currentUserId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        return
      }

      try {
        const res = await togglePostLike(post.id)
        if (res.code === 200) {
          post.isLiked = !post.isLiked
          post.likeCount = post.isLiked ? (post.likeCount + 1) : Math.max(0, post.likeCount - 1)

          uni.showToast({
            title: post.isLiked ? '点赞成功' : '已取消点赞',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('点赞操作失败', error)
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        })
      }
    },

    // 添加或修改 refresh 方法
    refresh() {
      console.log('用户触发了下拉刷新');
      this.refreshing = true;

      // 重置分页参数
      this.pageNum = 1;
      this.hasMore = true;
      this.loadMoreStatus = 'more';

      // 调用 loadPosts 方法加载数据
      this.loadPosts().then(() => {
        // 数据加载完成后
        this.refreshing = false;
      }).catch(err => {
        console.error('刷新数据失败:', err);
        this.refreshing = false;
        uni.showToast({
          title: '刷新失败，请稍后再试',
          icon: 'none'
        });
      });
    },

    // 添加一个方法来清理页面堆栈
    clearPageStack() {
      const pages = getCurrentPages();
      if (pages.length > 5) {
        uni.reLaunch({
          url: '/pages/community/index'
        });
      }
    },

    // 在onShow生命周期中检查页面堆栈
    checkPageStack() {
      const pages = getCurrentPages();
      console.log('当前页面堆栈数量:', pages.length);
      if (pages.length > 8) { // 如果页面堆栈过多
        uni.showModal({
          title: '提示',
          content: '页面较多，是否返回首页？',
          success: (res) => {
            if (res.confirm) {
              uni.reLaunch({
                url: '/pages/community/index'
              });
            }
          }
        });
      }
    }
  }
}
</script>

<style>
/* 可能需要的少量自定义样式 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
}

/* 防止滚动抖动 */
.scroll-view_H {
  width: 100%;
  white-space: nowrap;
}

/* 修复滚动闪烁问题 */
scroll-view {
  -webkit-overflow-scrolling: touch;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000;
  will-change: transform;
}

/* 帖子卡片样式 */
.post-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.post-card:active {
  transform: scale(0.98);
}

/* 状态栏高度 */
.status-bar-height {
  height: var(--status-bar-height);
  width: 100%;
}

/* 固定顶部区域 */
.fixed-top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: #fff;
}

/* 标签滚动区域 */
.tag-scroll-view {
  white-space: nowrap;
  width: 100%;
}

/* 内容区域 */
.content-area {
  margin-top: calc(var(--status-bar-height) + 110px);
  height: calc(100vh - var(--status-bar-height) - 110px);
  width: 100%;
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