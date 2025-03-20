<template>
  <view class="flex flex-col h-full bg-gray-100">
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
    <scroll-view scroll-x class="whitespace-nowrap bg-white py-2 mb-2">
      <view class="flex">
        <view v-for="tag in tags" :key="tag.id" class="px-4 py-1 mx-1 rounded-full text-center"
          :class="activeTag === tag.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'"
          @click="changeTag(tag.id)">
          {{ tag.name }}
        </view>
      </view>
    </scroll-view>

    <!-- 帖子列表 -->
    <scroll-view scroll-y class="flex-1" @scrolltolower="loadMore" refresher-enabled :refresher-triggered="refreshing"
      @refresherrefresh="refresh">

      <!-- 加载中 -->
      <view v-if="loading && posts.length === 0" class="flex flex-col items-center justify-center py-20">
        <uni-load-more status="loading"></uni-load-more>
      </view>

      <!-- 空状态 -->
      <view v-else-if="posts.length === 0" class="flex flex-col items-center justify-center py-20">
        <image src="/static/images/empty-posts.png" class="w-24 h-24 mb-3"></image>
        <text class="text-gray-500">暂无内容</text>
      </view>

      <!-- 帖子列表 -->
      <view v-else>
        <view v-for="post in posts" :key="post.id" class="bg-white mb-2 p-4 rounded-lg"
          @click="goToPostDetail(post.id)">

          <!-- 用户信息 -->
          <view class="flex items-center mb-3">
            <image :src="post.author.avatar || '/static/images/default-avatar.png'" class="w-10 h-10 rounded-full mr-3"
              @click.stop="goToUserProfile(post.author.id)">
            </image>

            <view class="flex-1">
              <view class="flex items-center">
                <text class="font-bold text-gray-800" @click.stop="goToUserProfile(post.author.id)">
                  {{ post.author.nickname || '用户' }}
                </text>
                <view v-if="post.author.isExpert" class="ml-2 px-1 py-0.5 bg-red-500 text-white text-xs rounded">
                  专家
                </view>
              </view>
              <text class="text-xs text-gray-500">{{ formatTime(post.createTime) }}</text>
            </view>
          </view>

          <!-- 帖子内容 -->
          <view class="mb-3">
            <view v-if="post.title" class="text-base font-bold mb-1">{{ post.title }}</view>
            <text class="text-gray-800 leading-relaxed line-clamp-3">{{ post.content }}</text>
          </view>

          <!-- 帖子图片 -->
          <view v-if="post.images && post.images.length > 0" class="flex flex-wrap mb-3">
            <view v-for="(img, index) in post.images.slice(0, 3)" :key="index" class="relative"
              :class="post.images.length === 1 ? 'w-2/3 h-36' : 'w-1/3 pr-1 pb-1 h-20'">
              <image :src="img" mode="aspectFill" class="w-full h-full rounded"></image>
              <view v-if="index === 2 && post.images.length > 3"
                class="absolute right-2 bottom-2 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                +{{ post.images.length - 3 }}
              </view>
            </view>
          </view>

          <!-- 帖子标签 -->
          <view v-if="post.tags && post.tags.length > 0" class="flex flex-wrap mb-2">
            <text v-for="(tag, index) in post.tags" :key="index" class="mr-2 text-blue-500 text-sm">
              #{{ tag }}
            </text>
          </view>

          <!-- 帖子统计 -->
          <view class="flex pt-2 border-t border-gray-100">
            <view class="flex items-center mr-4 text-gray-600">
              <uni-icons type="eye" size="16"></uni-icons>
              <text class="ml-1 text-sm">{{ post.viewCount || 0 }}</text>
            </view>
            <view class="flex items-center mr-4 text-gray-600">
              <uni-icons type="chat" size="16"></uni-icons>
              <text class="ml-1 text-sm">{{ post.commentCount || 0 }}</text>
            </view>
            <view class="flex items-center text-gray-600">
              <uni-icons :type="post.isLiked ? 'heart-filled' : 'heart'" size="16"
                :color="post.isLiked ? '#ef4444' : '#666'"></uni-icons>
              <text class="ml-1 text-sm">{{ post.likeCount || 0 }}</text>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <uni-load-more :status="loadMoreStatus"></uni-load-more>
      </view>
    </scroll-view>

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

export default {
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
      uni.navigateTo({
        url: `/pages/community/post-detail?id=${postId}`
      })
    },

    // 跳转到发布页面
    goToPublish() {
      uni.navigateTo({
        url: '/pages/community/publish'
      })
    },

    // 跳转到搜索页面
    goToSearch() {
      uni.navigateTo({
        url: '/pages/community/search'
      })
    },

    // 跳转到通知页面
    goToNotifications() {
      uni.navigateTo({
        url: '/pages/community/notifications'
      })
    },

    // 跳转到我的个人主页
    goToMyProfile() {
      try {
        const userId = uni.getStorageSync('userId');
        // 跳转到个人主页
        uni.navigateTo({
          url: `/pages/community/user-profile?id=${userId}`
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
        url: `/pages/community/user-profile?id=${userId}`
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
</style>