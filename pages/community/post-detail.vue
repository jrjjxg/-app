<template>
  <view class="flex flex-col h-full bg-gray-50">
    <!-- 头部 -->
    <view class="bg-white px-4 pt-12 pb-4 border-b border-gray-100">
      <view class="flex items-center">
        <view @click="goBack" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
          <uni-icons type="back" size="18" color="#6B7280"></uni-icons>
        </view>
        <text class="text-lg font-bold text-gray-800">帖子详情</text>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view scroll-y class="flex-1 px-4 py-3 pb-20">
      <!-- 加载状态 -->
      <view v-if="loading" class="py-10 flex justify-center">
        <text class="text-gray-500">加载中...</text>
      </view>
      
      <!-- 帖子详情 -->
      <block v-else>
        <view class="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
          <!-- 用户信息 -->
          <view class="p-4 flex items-center">
            <image :src="post.author.avatar" class="w-10 h-10 rounded-full bg-gray-200"></image>
            <view class="ml-3 flex-1">
              <view class="flex items-center">
                <text class="font-medium text-gray-800">{{ post.author.nickname }}</text>
                <view v-if="post.author.isExpert" class="ml-2 px-1.5 py-0.5 bg-blue-100 rounded text-xs text-blue-600">专家</view>
              </view>
              <text class="text-xs text-gray-500">{{ formatTime(post.createTime) }}</text>
            </view>
            <view class="px-2 py-1 bg-gray-100 rounded-full">
              <text class="text-xs text-gray-600">关注</text>
            </view>
          </view>
          
          <!-- 帖子内容 -->
          <view class="px-4 pb-4">
            <text class="font-medium text-gray-800 text-xl mb-3 block">{{ post.title }}</text>
            <text class="text-gray-600 mb-4 leading-relaxed">{{ post.content }}</text>
            
            <!-- 帖子图片 -->
            <view v-if="post.images && post.images.length > 0" class="mb-4">
              <image 
                v-for="(img, imgIndex) in post.images" 
                :key="imgIndex"
                :src="img"
                mode="widthFix"
                class="w-full rounded-lg mb-2"
              ></image>
            </view>
            
            <!-- 帖子标签 -->
            <view v-if="post.tags && post.tags.length > 0" class="flex flex-wrap mb-4">
              <view 
                v-for="(tag, tagIndex) in post.tags" 
                :key="tagIndex"
                class="mr-2 mb-2 px-2 py-0.5 bg-purple-100 rounded text-xs text-purple-600"
              >
                {{ tag }}
              </view>
            </view>
            
            <!-- 互动数据 -->
            <view class="flex items-center justify-between py-3 border-t border-gray-100">
              <view class="flex items-center">
                <view class="flex items-center mr-6" @click="toggleLike">
                  <uni-icons :type="post.isLiked ? 'heart-filled' : 'heart'" :color="post.isLiked ? '#EC4899' : '#9CA3AF'" size="20"></uni-icons>
                  <text class="ml-1 text-sm" :class="post.isLiked ? 'text-pink-500' : 'text-gray-500'">{{ post.likeCount }}</text>
                </view>
                <view class="flex items-center mr-6">
                  <uni-icons type="chat" color="#9CA3AF" size="20"></uni-icons>
                  <text class="ml-1 text-sm text-gray-500">{{ post.commentCount }}</text>
                </view>
                <view class="flex items-center">
                  <uni-icons type="star" color="#9CA3AF" size="20"></uni-icons>
                  <text class="ml-1 text-sm text-gray-500">收藏</text>
                </view>
              </view>
              <view class="flex items-center">
                <uni-icons type="share" color="#9CA3AF" size="20"></uni-icons>
                <text class="ml-1 text-sm text-gray-500">分享</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 评论区 -->
        <view class="bg-white rounded-xl shadow-sm overflow-hidden">
          <view class="p-4 border-b border-gray-100">
            <text class="font-bold text-gray-800">评论 ({{ post.commentCount }})</text>
          </view>
          
          <!-- 评论列表 -->
          <view v-if="comments.length > 0">
            <view 
              v-for="(comment, index) in comments" 
              :key="comment.id"
              class="p-4 border-b border-gray-100"
            >
              <view class="flex">
                <image :src="comment.author.avatar" class="w-8 h-8 rounded-full bg-gray-200"></image>
                <view class="ml-3 flex-1">
                  <view class="flex items-center mb-1">
                    <text class="font-medium text-gray-800 text-sm">{{ comment.author.nickname }}</text>
                    <view v-if="comment.author.isExpert" class="ml-2 px-1 py-0.5 bg-blue-100 rounded-sm text-xs text-blue-600">专家</view>
                    <text class="ml-auto text-xs text-gray-500">{{ formatTime(comment.createTime) }}</text>
                  </view>
                  <text class="text-gray-600 text-sm mb-2">{{ comment.content }}</text>
                  
                  <!-- 评论操作 -->
                  <view class="flex items-center">
                    <view class="flex items-center mr-4" @click="toggleCommentLike(index)">
                      <uni-icons :type="comment.isLiked ? 'heart-filled' : 'heart'" :color="comment.isLiked ? '#EC4899' : '#9CA3AF'" size="14"></uni-icons>
                      <text class="ml-1 text-xs" :class="comment.isLiked ? 'text-pink-500' : 'text-gray-500'">{{ comment.likeCount }}</text>
                    </view>
                    <view class="flex items-center" @click="replyToComment(comment)">
                      <uni-icons type="chat" color="#9CA3AF" size="14"></uni-icons>
                      <text class="ml-1 text-xs text-gray-500">回复</text>
                    </view>
                  </view>
                  
                  <!-- 回复列表 -->
                  <view v-if="comment.replies && comment.replies.length > 0" class="mt-3 bg-gray-50 rounded-lg p-3">
                    <view 
                      v-for="(reply, replyIndex) in comment.replies" 
                      :key="replyIndex"
                      class="mb-2 last:mb-0"
                    >
                      <view class="flex items-start">
                        <image :src="reply.author.avatar" class="w-6 h-6 rounded-full bg-gray-200"></image>
                        <view class="ml-2 flex-1">
                          <view class="flex items-center">
                            <text class="font-medium text-gray-800 text-xs">{{ reply.author.nickname }}</text>
                            <text class="ml-1 text-xs text-gray-500">回复</text>
                            <text class="ml-1 font-medium text-gray-800 text-xs">{{ reply.replyTo }}</text>
                          </view>
                          <text class="text-gray-600 text-xs">{{ reply.content }}</text>
                        </view>
                        <text class="text-xs text-gray-500 ml-2">{{ formatTime(reply.createTime) }}</text>
                      </view>
                    </view>
                    
                    <view v-if="comment.replyCount > comment.replies.length" class="mt-2">
                      <text class="text-xs text-purple-500">查看全部{{ comment.replyCount }}条回复</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 无评论状态 -->
          <view v-else class="p-8 flex flex-col items-center justify-center">
            <uni-icons type="chat" size="40" color="#D1D5DB"></uni-icons>
            <text class="mt-3 text-gray-500">暂无评论，快来发表你的看法吧</text>
          </view>
        </view>
      </block>
    </scroll-view>
    
    <!-- 底部评论框 -->
    <view class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
      <view class="flex items-center">
        <view class="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
          <input 
            type="text" 
            class="flex-1" 
            :placeholder="commentPlaceholder"
            v-model="commentContent"
          />
        </view>
        <view 
          class="ml-2 px-4 py-2 bg-purple-500 rounded-full"
          :class="commentContent.trim() ? 'opacity-100' : 'opacity-50'"
          @click="submitComment"
        >
          <text class="text-white">发送</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      postId: '',
      post: null,
      comments: [],
      commentContent: '',
      commentPlaceholder: '写下你的评论...',
      replyingTo: null
    }
  },
  onLoad(options) {
    this.postId = options.id
    this.loadPostDetail()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    // 加载帖子详情
    loadPostDetail() {
      this.loading = true
      
      // 模拟网络请求
      setTimeout(() => {
        // 模拟数据
        this.post = this.getMockPost(this.postId)
        this.comments = this.getMockComments()
        
        this.loading = false
      }, 1000)
    },
    
    // 点赞/取消点赞
    toggleLike() {
      if (!this.post) return
      
      this.post.isLiked = !this.post.isLiked
      this.post.likeCount += this.post.isLiked ? 1 : -1
      
      // 实际应用中，这里应该调用API更新点赞状态
      // this.updateLikeStatus(this.postId, this.post.isLiked)
    },
    
    // 评论点赞/取消点赞
    toggleCommentLike(index) {
      const comment = this.comments[index]
      if (!comment) return
      
      comment.isLiked = !comment.isLiked
      comment.likeCount += comment.isLiked ? 1 : -1
      
      // 实际应用中，这里应该调用API更新评论点赞状态
      // this.updateCommentLikeStatus(comment.id, comment.isLiked)
    },
    
    // 回复评论
    replyToComment(comment) {
      this.replyingTo = comment
      this.commentPlaceholder = `回复 ${comment.author.nickname}：`
      // 自动聚焦输入框
      // 由于uni-app的限制，这里可能需要使用DOM操作或其他方式实现
    },
    
    // 提交评论
    submitComment() {
      if (!this.commentContent.trim()) return
      
      // 模拟提交评论
      if (this.replyingTo) {
        // 回复评论
        const reply = {
          id: Date.now().toString(),
          content: this.commentContent,
          createTime: new Date().toISOString(),
          author: {
            id: 'current-user',
            nickname: '我',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
            isExpert: false
          },
          replyTo: this.replyingTo.author.nickname
        }
        
        // 如果回复列表不存在，创建一个
        if (!this.replyingTo.replies) {
          this.replyingTo.replies = []
        }
        
        // 添加回复
        this.replyingTo.replies.unshift(reply)
        this.replyingTo.replyCount = (this.replyingTo.replyCount || 0) + 1
        
        // 更新帖子评论数
        this.post.commentCount++
      } else {
        // 发表新评论
        const newComment = {
          id: Date.now().toString(),
          content: this.commentContent,
          createTime: new Date().toISOString(),
          author: {
            id: 'current-user',
            nickname: '我',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
            isExpert: false
          },
          likeCount: 0,
          isLiked: false,
          replyCount: 0,
          replies: []
        }
        
        // 添加到评论列表
        this.comments.unshift(newComment)
        
        // 更新帖子评论数
        this.post.commentCount++
      }
      
      // 重置评论框
      this.commentContent = ''
      this.commentPlaceholder = '写下你的评论...'
      this.replyingTo = null
      
      // 实际应用中，这里应该调用API提交评论
      // this.submitCommentToServer(this.postId, this.commentContent, this.replyingTo?.id)
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
    
    // 获取模拟帖子数据
    getMockPost(postId) {
      const mockPosts = {
        '1': {
          id: '1',
          title: '如何应对工作中的焦虑情绪？',
          content: '最近工作压力很大，经常感到焦虑和紧张，尤其是在面对截止日期时。我尝试了一些呼吸练习，但效果不是很明显。有没有人能分享一些有效的方法来缓解工作焦虑？\n\n我注意到当我感到焦虑时，会出现心跳加速、呼吸急促、注意力难以集中等症状，这严重影响了我的工作效率和生活质量。我希望能找到一些实用的方法来管理这些症状，重新找回平静和专注。',
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
          commentCount: 5,
          isLiked: false
        },
        '2': {
          id: '2',
          title: '分享：冥想如何改变了我的生活',
          content: '坚持冥想练习三个月后，我发现自己的情绪稳定了很多，焦虑减轻，睡眠质量也提高了。想和大家分享我的冥想心得和一些适合初学者的冥想方法。\n\n我是从每天早上10分钟的呼吸冥想开始的，逐渐增加到20分钟，现在已经能够保持30分钟的专注冥想。最大的变化是我不再被负面情绪所控制，能够以更平静的心态面对生活中的挑战。\n\n对于初学者，我建议从短时间的引导冥想开始，可以使用一些冥想App如Headspace或Calm，它们提供了很好的入门指导。保持耐心和持续练习是关键，效果会随着时间慢慢显现。',
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
        }
      }
      
      return mockPosts[postId] || mockPosts['1']
    },
    
    // 获取模拟评论数据
    getMockComments() {
      return [
        {
          id: '101',
          content: '我也经常感到工作焦虑，尝试了正念冥想后有很大改善。每天花10分钟进行深呼吸和身体扫描，帮助我更好地觉察自己的情绪变化，不再被焦虑所控制。',
          createTime: new Date(Date.now() - 1800000).toISOString(),
          author: {
            id: '201',
            nickname: '心灵旅者',
            avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
            isExpert: false
          },
          likeCount: 15,
          isLiked: false,
          replyCount: 2,
          replies: [
            {
              id: '301',
              content: '正念冥想确实很有效，我推荐"正念减压"这个方法，它结合了冥想和认知疗法，对工作焦虑特别有帮助。',
              createTime: new Date(Date.now() - 1500000).toISOString(),
              author: {
                id: '401',
                nickname: '心理顾问',
                avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
                isExpert: true
              },
              replyTo: '心灵旅者'
            },
            {
              id: '302',
              content: '谢谢分享！请问有推荐的冥想App吗？',
              createTime: new Date(Date.now() - 900000).toISOString(),
              author: {
                id: '101',
                nickname: '平静的湖',
                avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
                isExpert: false
              },
              replyTo: '心灵旅者'
            }
          ]
        },
        {
          id: '102',
          content: '作为一名心理咨询师，我建议你可以尝试"5-4-3-2-1"技巧来应对急性焦虑：找出你能看到的5样东西，听到的4种声音，触摸到的3样物品，闻到的2种气味，和尝到的1种味道。这个练习可以帮助你重新连接当下，打断焦虑思维。',
          createTime: new Date(Date.now() - 3600000).toISOString(),
          author: {
            id: '202',
            nickname: '专业心理师',
            avatar: 'https://randomuser.me/api/portraits/women/56.jpg',
            isExpert: true
          },
          likeCount: 42,
          isLiked: true,
          replyCount: 1,
          replies: [
            {
              id: '303',
              content: '这个方法太实用了！我刚刚试了一下，确实能感觉到焦虑在减轻。谢谢分享！',
              createTime: new Date(Date.now() - 1200000).toISOString(),
              author: {
                id: '101',
                nickname: '平静的湖',
                avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
                isExpert: false
              },
              replyTo: '专业心理师'
            }
          ]
        },
        {
          id: '103',
          content: '我发现定期运动对缓解焦虑非常有效。即使是每天30分钟的快走或瑜伽，也能显著改善我的情绪状态。运动会释放内啡肽，这是天然的"快乐激素"。',
          createTime: new Date(Date.now() - 7200000).toISOString(),
          author: {
            id: '203',
            nickname: '健康生活家',
            avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
            isExpert: false
          },
          likeCount: 18,
          isLiked: false,
          replyCount: 0,
          replies: []
        }
      ]
    }
  }
}
</script>

<style>
</style> 