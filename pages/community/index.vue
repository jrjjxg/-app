<template>
  <view class="flex flex-col h-full bg-gray-50">
    <!-- 头部 -->
    <view class="bg-gradient-to-r from-purple-500 to-pink-500 px-4 pt-12 pb-6">
      <view class="flex items-center justify-between">
        <text class="text-xl font-bold text-white">心灵社区</text>
        <view class="flex items-center">
          <view class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
            <uni-icons type="search" size="18" color="#FFFFFF"></uni-icons>
          </view>
          <view class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <uni-icons type="notification" size="18" color="#FFFFFF"></uni-icons>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 分类标签 -->
    <scroll-view scroll-x class="whitespace-nowrap px-4 py-3 bg-white border-b border-gray-100" show-scrollbar="false">
      <view class="inline-flex space-x-2">
        <view 
          v-for="(tag, index) in tags" 
          :key="index"
          class="px-4 py-1.5 rounded-full text-sm font-medium"
          :class="activeTag === tag.id ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'"
          @click="changeTag(tag.id)"
        >
          {{ tag.name }}
        </view>
      </view>
    </scroll-view>
    
    <!-- 内容区域 -->
    <scroll-view scroll-y class="flex-1 px-4 py-3" @scrolltolower="loadMorePosts">
      <!-- 加载状态 -->
      <view v-if="loading" class="py-10 flex justify-center">
        <text class="text-gray-500">加载中...</text>
      </view>
      
      <!-- 帖子列表 -->
      <block v-else>
        <view 
          v-for="(post, index) in posts" 
          :key="post.id"
          class="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
          @click="goToPostDetail(post.id)"
        >
          <!-- 用户信息 -->
          <view class="p-4 flex items-center">
            <image :src="post.author.avatar" class="w-10 h-10 rounded-full bg-gray-200"></image>
            <view class="ml-3">
              <view class="flex items-center">
                <text class="font-medium text-gray-800">{{ post.author.nickname }}</text>
                <view v-if="post.author.isExpert" class="ml-2 px-1.5 py-0.5 bg-blue-100 rounded text-xs text-blue-600">专家</view>
              </view>
              <text class="text-xs text-gray-500">{{ formatTime(post.createTime) }}</text>
            </view>
          </view>
          
          <!-- 帖子内容 -->
          <view class="px-4 pb-2">
            <text class="font-medium text-gray-800 text-lg mb-2 block">{{ post.title }}</text>
            <text class="text-gray-600 mb-3 line-clamp-3">{{ post.content }}</text>
            
            <!-- 帖子图片 -->
            <view v-if="post.images && post.images.length > 0" class="mb-3">
              <view v-if="post.images.length === 1" class="w-full">
                <image :src="post.images[0]" mode="widthFix" class="w-full rounded-lg"></image>
              </view>
              <view v-else-if="post.images.length > 1" class="grid grid-cols-3 gap-1">
                <image 
                  v-for="(img, imgIndex) in post.images.slice(0, 3)" 
                  :key="imgIndex"
                  :src="img"
                  class="aspect-square rounded-lg object-cover"
                ></image>
              </view>
            </view>
            
            <!-- 帖子标签 -->
            <view v-if="post.tags && post.tags.length > 0" class="flex flex-wrap mb-3">
              <view 
                v-for="(tag, tagIndex) in post.tags" 
                :key="tagIndex"
                class="mr-2 mb-2 px-2 py-0.5 bg-purple-100 rounded text-xs text-purple-600"
              >
                {{ tag }}
              </view>
            </view>
            
            <!-- 互动数据 -->
            <view class="flex items-center justify-between py-2 border-t border-gray-100 mt-2">
              <view class="flex items-center">
                <view class="flex items-center mr-4">
                  <uni-icons type="heart" :color="post.isLiked ? '#EC4899' : '#9CA3AF'" size="18"></uni-icons>
                  <text class="ml-1 text-sm text-gray-500">{{ post.likeCount }}</text>
                </view>
                <view class="flex items-center">
                  <uni-icons type="chat" color="#9CA3AF" size="18"></uni-icons>
                  <text class="ml-1 text-sm text-gray-500">{{ post.commentCount }}</text>
                </view>
              </view>
              <view class="flex items-center">
                <uni-icons type="share" color="#9CA3AF" size="18"></uni-icons>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 加载更多 -->
        <view v-if="hasMore" class="py-4 flex justify-center">
          <text class="text-sm text-gray-500">加载更多...</text>
        </view>
        <view v-else class="py-4 flex justify-center">
          <text class="text-sm text-gray-500">没有更多内容了</text>
        </view>
      </block>
    </scroll-view>
    
    <!-- 底部导航栏 -->
    <view class="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-2">
      <navigator url="/pages/index/index" class="flex flex-col items-center">
        <uni-icons type="home" size="24" color="#9CA3AF"></uni-icons>
        <text class="text-xs mt-1 text-gray-500">首页</text>
      </navigator>
      
      <navigator url="/pages/toolbox/index" class="flex flex-col items-center">
        <uni-icons type="grid" size="24" color="#9CA3AF"></uni-icons>
        <text class="text-xs mt-1 text-gray-500">工具箱</text>
      </navigator>
      
      <view class="flex flex-col items-center">
        <uni-icons type="chat-filled" size="24" color="#8B5CF6"></uni-icons>
        <text class="text-xs mt-1 text-purple-600 font-medium">社区</text>
      </view>
      
      <navigator url="/pages/profile/index" class="flex flex-col items-center">
        <uni-icons type="person" size="24" color="#9CA3AF"></uni-icons>
        <text class="text-xs mt-1 text-gray-500">我的</text>
      </navigator>
    </view>
    
    <!-- 发布按钮 -->
    <view 
      class="fixed right-5 bottom-20 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
      @click="goToPublish"
    >
      <uni-icons type="plus" size="24" color="#FFFFFF"></uni-icons>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
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
      page: 1,
      pageSize: 10,
      hasMore: true
    }
  },
  onLoad() {
    this.loadPosts()
  },
  methods: {
    // 切换标签
    changeTag(tagId) {
      if (this.activeTag === tagId) return
      this.activeTag = tagId
      this.page = 1
      this.posts = []
      this.hasMore = true
      this.loadPosts()
    },
    
    // 加载帖子
    async loadPosts() {
      this.loading = true
      
      // 模拟网络请求
      setTimeout(() => {
        // 模拟数据
        const mockPosts = this.getMockPosts()
        
        if (this.page === 1) {
          this.posts = mockPosts
        } else {
          this.posts = [...this.posts, ...mockPosts]
        }
        
        // 模拟是否有更多数据
        this.hasMore = this.page < 3
        this.loading = false
      }, 1000)
    },
    
    // 加载更多
    loadMorePosts() {
      if (!this.hasMore || this.loading) return
      this.page++
      this.loadPosts()
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
        return `${Math.floor(diff / (60 * 1000))}分钟前`
      }
      
      // 小于24小时
      if (diff < 24 * 60 * 60 * 1000) {
        return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
      }
      
      // 小于30天
      if (diff < 30 * 24 * 60 * 60 * 1000) {
        return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
      }
      
      // 大于30天
      const year = postTime.getFullYear()
      const month = postTime.getMonth() + 1
      const day = postTime.getDate()
      return `${year}-${month}-${day}`
    },
    
    // 获取模拟数据
    getMockPosts() {
      const mockPosts = [
        {
          id: '1',
          title: '如何应对工作中的焦虑情绪？',
          content: '最近工作压力很大，经常感到焦虑和紧张，尤其是在面对截止日期时。我尝试了一些呼吸练习，但效果不是很明显。有没有人能分享一些有效的方法来缓解工作焦虑？',
          createTime: new Date(Date.now() - 3600000).toISOString(),
          author: {
            id: '101',
            nickname: '平静的湖',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            isExpert: false
          },
          images: [],
          tags: ['焦虑', '工作压力', '求助'],
          likeCount: 28,
          commentCount: 12,
          isLiked: false
        },
        {
          id: '2',
          title: '分享：冥想如何改变了我的生活',
          content: '坚持冥想练习三个月后，我发现自己的情绪稳定了很多，焦虑减轻，睡眠质量也提高了。想和大家分享我的冥想心得和一些适合初学者的冥想方法。',
          createTime: new Date(Date.now() - 86400000).toISOString(),
          author: {
            id: '102',
            nickname: '心灵导师',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            isExpert: true
          },
          images: [
            'https://images.unsplash.com/photo-1508672019048-805c876b67e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            'https://images.unsplash.com/photo-1515023115689-589c33041d3c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            'https://images.unsplash.com/photo-1470777639313-60af88918203?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          ],
          tags: ['冥想', '心得分享', '减压'],
          likeCount: 156,
          commentCount: 42,
          isLiked: true
        },
        {
          id: '3',
          title: '与抑郁共处：我的故事',
          content: '我想分享我与抑郁症斗争的经历，希望能给同样处境的朋友一些鼓励。抑郁不是软弱，寻求帮助是勇敢的表现。通过心理治疗和家人的支持，我现在已经能够更好地管理我的情绪了。',
          createTime: new Date(Date.now() - 172800000).toISOString(),
          author: {
            id: '103',
            nickname: '阳光总在风雨后',
            avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
            isExpert: false
          },
          images: [
            'https://images.unsplash.com/photo-1531951634065-2def7c9b8454?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          ],
          tags: ['抑郁', '心理健康', '个人经历'],
          likeCount: 215,
          commentCount: 78,
          isLiked: false
        },
        {
          id: '4',
          title: '睡眠问题的解决方案',
          content: '作为一名睡眠专家，我想分享一些改善睡眠质量的实用技巧。良好的睡眠习惯对心理健康至关重要，包括固定的睡眠时间、睡前放松活动、创造舒适的睡眠环境等。',
          createTime: new Date(Date.now() - 259200000).toISOString(),
          author: {
            id: '104',
            nickname: '睡眠博士',
            avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            isExpert: true
          },
          images: [],
          tags: ['睡眠', '专家建议', '健康习惯'],
          likeCount: 89,
          commentCount: 23,
          isLiked: false
        },
        {
          id: '5',
          title: '如何与家人进行有效沟通？',
          content: '家庭关系对心理健康有重要影响，但有时与家人沟通并不容易。我想分享一些改善家庭沟通的方法，包括积极倾听、使用"我"陈述句、选择合适的沟通时机等。',
          createTime: new Date(Date.now() - 345600000).toISOString(),
          author: {
            id: '105',
            nickname: '家庭和谐',
            avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
            isExpert: false
          },
          images: [
            'https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          ],
          tags: ['人际关系', '沟通技巧', '家庭'],
          likeCount: 76,
          commentCount: 31,
          isLiked: true
        }
      ]
      
      // 根据标签筛选
      if (this.activeTag !== 'all' && this.activeTag !== 'recommend') {
        const tagMap = {
          'emotion': ['情绪', '抑郁', '焦虑'],
          'anxiety': ['焦虑', '压力', '减压'],
          'sleep': ['睡眠'],
          'relationship': ['人际关系', '沟通', '家庭'],
          'growth': ['成长', '冥想', '习惯']
        }
        
        return mockPosts.filter(post => {
          return post.tags.some(tag => tagMap[this.activeTag].some(t => tag.includes(t)))
        })
      }
      
      return mockPosts
    }
  }
}
</script>

<style>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 