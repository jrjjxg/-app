<template>
  <view class="post-detail-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-icon" @click="goBack">
        <uni-icons type="back" size="20"></uni-icons>
        </view>
      <view class="title">帖子详情</view>
      <view class="more-icon" @click="showActionSheet">
        <uni-icons type="more-filled" size="20"></uni-icons>
      </view>
    </view>
    
    <!-- 加载中 -->
    <view v-if="loading" class="loading-container">
      <uni-load-more status="loading"></uni-load-more>
      </view>
      
    <!-- 帖子内容 -->
    <scroll-view v-else scroll-y class="post-content-scroll" refresher-enabled :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh" @scrolltolower="loadMoreComments">
      <view class="post-content-wrapper">
          <!-- 用户信息 -->
        <view class="post-author">
          <image :src="post.author.avatar || '/static/images/default-avatar.png'" class="author-avatar"
            @click="goToUserProfile(post.author.id)"></image>
          <view class="author-info">
            <view class="author-name-wrapper">
              <text class="author-name">{{ post.author.nickname || post.author.username }}</text>
              <view v-if="post.author.isExpert" class="expert-tag">专家</view>
            </view>
            <text class="post-time">{{ formatTime(post.createTime) }}</text>
          </view>
          <view v-if="post.author.id !== currentUserId" class="follow-btn" :class="{ active: post.author.isFollowed }"
            @click="toggleFollow">
            {{ post.author.isFollowed ? '已关注' : '关注' }}
            </view>
          </view>
          
        <!-- 帖子标题和内容 -->
        <view class="post-main">
          <view v-if="post.title" class="post-title">{{ post.title }}</view>
          <view class="post-text">{{ post.content }}</view>
            
            <!-- 帖子图片 -->
          <view v-if="post.images && post.images.length > 0" class="post-images">
            <image v-for="(img, index) in post.images" :key="index" :src="img" mode="widthFix" class="post-image"
              @click="previewImage(index)"></image>
            </view>
            
            <!-- 帖子标签 -->
          <view v-if="post.tags && post.tags.length > 0" class="post-tags">
            <view v-for="tag in post.tags" :key="tag" class="tag-item">
                {{ tag }}
              </view>
            </view>
            
          <!-- 帖子来源 -->
          <view v-if="post.source" class="post-source">
            <view class="source-title">{{ post.source.title }}</view>
            <view class="source-content">{{ post.source.content }}</view>
                </view>
              </view>

        <!-- 帖子互动数据 -->
        <view class="post-stats">
          <view class="stat-item">
            <uni-icons type="eye" size="20"></uni-icons>
            <text>{{ post.viewCount || 0 }}</text>
          </view>
          <view class="stat-item" @click="toggleLike">
            <uni-icons :type="post.isLiked ? 'heart-filled' : 'heart'" size="20" color="#ff6b6b"></uni-icons>
            <text>{{ post.likeCount || 0 }}</text>
              </view>
          <view class="stat-item" @click="focusCommentInput">
            <uni-icons type="chat" size="20"></uni-icons>
            <text>{{ post.commentCount || 0 }}</text>
            </view>
          <view class="stat-item" @click="sharePost">
            <uni-icons type="redo" size="20"></uni-icons>
            <text>分享</text>
          </view>
        </view>
        
        <!-- 评论区 -->
        <view class="comment-section">
          <view class="section-title">评论 ({{ post.commentCount || 0 }})</view>
          
          <!-- 评论列表 -->
          <view v-if="comments.length === 0" class="empty-comment">
            <image src="/static/images/empty-comment.png" mode="aspectFit" class="empty-image"></image>
            <text class="empty-text">暂无评论，快来抢沙发吧</text>
          </view>

          <view v-else class="comment-list">
            <view v-for="(comment, index) in comments" :key="comment.id" class="comment-item">
              <!-- 评论用户头像 -->
              <image :src="comment.avatar || '/static/images/default-avatar.png'" class="comment-avatar"
                @click="goToUserProfile(comment.userId)"></image>

              <view class="comment-content">
                <!-- 评论用户名 -->
                <view class="comment-user">
                  <text class="comment-username" @click="goToUserProfile(comment.userId)">
                    {{ comment.username || '用户' }}
                  </text>
                  <text class="comment-time">{{ formatTime(comment.createTime) }}</text>
                  </view>

                <!-- 评论内容 -->
                <view class="comment-text">{{ comment.content }}</view>
                  
                  <!-- 评论操作 -->
                <view class="comment-actions">
                  <!-- 其他操作按钮 -->
                  <view class="action-item" @click="replyComment(comment)">
                    <uni-icons type="chat" size="16"></uni-icons>
                    <text>回复</text>
                  </view>
                  <!-- 点赞按钮 -->
                  <view class="action-item" @click="likeComment(comment)">
                    <uni-icons :type="comment.isLiked ? 'heart-filled' : 'heart'" size="16"
                      :color="comment.isLiked ? '#ff6b6b' : '#999'"></uni-icons>
                    <text>{{ comment.likeCount || 0 }}</text>
                      </view>
                    </view>
                    
                <!-- 回复列表 -->
                <view v-if="comment.children && comment.children.length > 0" class="reply-list">
                  <view v-for="(reply, replyIndex) in comment.children" :key="reply.id" class="reply-item">
                    <text class="reply-username" @click="goToUserProfile(reply.userId)">{{ reply.username || '用户'
                    }}</text>
                    <text v-if="reply.replyToUserId && reply.replyToUserId !== comment.userId" class="reply-to">
                      回复 <text class="reply-to-username" @click="goToUserProfile(reply.replyToUserId)">{{
                        reply.replyToUsername || '用户' }}</text>
                    </text>
                    <text class="reply-content">{{ reply.content }}</text>
                    </view>

                  <!-- 查看更多回复 -->
                  <view v-if="comment.hasMoreReplies" class="view-more-replies" @click="loadMoreReplies(comment)">
                    查看更多回复
                  </view>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 加载更多评论 -->
          <uni-load-more v-if="comments.length > 0 && hasMoreComments" :status="loadMoreStatus"></uni-load-more>
        </view>
      </view>
    </scroll-view>
    
    <!-- 评论输入框 -->
    <view class="comment-input-area">
      <input class="comment-input" type="text" v-model="commentContent" :placeholder="commentPlaceholder"
        confirm-type="send" :focus="inputFocus" @confirm="submitComment" @focus="onInputFocus" @blur="onInputBlur" />
      <view class="send-btn" :class="{ disabled: !commentContent.trim() }" @click="submitComment">发送</view>
    </view>
  </view>
</template>

<script>
import { getPostDetail, deletePost } from '@/api/post';
import { getPostComments, getCommentReplies, createComment, deleteComment } from '@/api/comment';
import { toggleLike, checkUserLiked } from '@/api/like';
import { toggleFollow, checkFollowed } from '@/api/follow';
import { getUserInfo } from '@/api/user';

export default {
  data() {
    return {
      postId: '',
      post: {
        author: {}
      },
      comments: [],
      loading: true,
      refreshing: false,
      commentLoading: false,
      commentPageNum: 1,
      commentPageSize: 10,
      hasMoreComments: true,
      currentUserId: '',
      commentContent: '',
      commentPlaceholder: '写评论...',
      inputFocus: false,
      replyTo: null,
      showCommentInput: false,
      actionSheetItems: [],
    };
  },
  onLoad(options) {
    this.postId = options.id;
    // 获取当前用户信息
    this.getCurrentUser();
    // 加载帖子详情
    this.loadPostDetail();
    // 加载评论
    this.loadComments();
  },
  methods: {
    // 获取当前用户信息
    async getCurrentUser() {
      try {
        const res = await getUserInfo();
        if (res.code === 200 && res.data) {
          this.currentUserId = res.data.id;
        }
      } catch (error) {
        console.error('获取用户信息失败', error);
      }
    },
    
    // 加载帖子详情
    async loadPostDetail() {
      try {
        this.loading = true;
        const res = await getPostDetail(this.postId);

        if (res.code === 200) {
          let post = res.data;

          // 转换数据结构，创建author对象
          if (!post.author) {
            post.author = {
              id: post.userId,
              nickname: post.username || '用户',
              avatar: post.avatar || '/static/images/default-avatar.png',
              isExpert: post.isExpert || false
            };
          }

          this.post = post;

          // 检查是否已点赞
          if (this.currentUserId) {
            const likeRes = await checkUserLiked('post', this.postId);
            this.post.isLiked = likeRes.data;

            // 检查是否已关注作者
            if (this.post.author && this.post.author.id !== this.currentUserId) {
              const followRes = await checkFollowed(this.post.author.id);
              this.post.author.isFollowed = followRes.data;
            }
          }

          // 设置操作菜单
          this.setupActionSheet();
        }
      } catch (error) {
        console.error('加载帖子详情失败:', error);
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // 加载评论
    async loadComments(refresh = false) {
      if (refresh) {
        this.commentPageNum = 1;
        this.hasMoreComments = true;
        this.comments = [];
      }

      if (!this.hasMoreComments || this.commentLoading) return;

      this.commentLoading = true;
      try {
        const res = await getPostComments(this.postId, this.commentPageNum, this.commentPageSize);
        if (res.code === 200) {
          const newComments = res.data.records || [];

          // 检查评论是否已点赞
          if (this.currentUserId) {
            for (const comment of newComments) {
              const likeRes = await checkUserLiked('comment', comment.id);
              comment.isLiked = likeRes.data;

              // 加载评论的回复
              if (comment.replyCount > 0) {
                const replyRes = await getCommentReplies(comment.id, 1, 3);
                comment.children = replyRes.data.records || [];
                comment.hasMoreReplies = comment.replyCount > comment.children.length;
              } else {
                comment.children = [];
                comment.hasMoreReplies = false;
              }
            }
          }

          this.comments = [...this.comments, ...newComments];
          this.hasMoreComments = newComments.length === this.commentPageSize;
          this.commentPageNum++;
        }
      } catch (error) {
        console.error('获取评论失败', error);
        uni.showToast({
          title: '获取评论失败',
          icon: 'none'
        });
      } finally {
        this.commentLoading = false;
      }
    },

    // 设置操作菜单
    setupActionSheet() {
      this.actionSheetItems = [];

      // 分享
      this.actionSheetItems.push({
        text: '分享',
        icon: 'redo'
      });

      // 举报
      this.actionSheetItems.push({
        text: '举报',
        icon: 'info'
      });

      // 如果是帖子作者，添加删除选项
      if (this.currentUserId && this.post.author && this.post.author.id === this.currentUserId) {
        this.actionSheetItems.push({
          text: '删除',
          icon: 'trash',
          color: '#ff0000'
        });
      }
    },

    // 显示操作菜单
    showActionSheet() {
      uni.showActionSheet({
        itemList: this.actionSheetItems.map(item => item.text),
        success: res => {
          const index = res.tapIndex;
          const action = this.actionSheetItems[index];

          if (action.text === '删除') {
            this.confirmDeletePost();
          } else if (action.text === '举报') {
            this.reportPost();
          } else if (action.text === '分享') {
            this.sharePost();
          }
        }
      });
    },

    // 确认删除帖子
    confirmDeletePost() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这篇帖子吗？删除后无法恢复。',
        confirmColor: '#ff0000',
        success: async res => {
          if (res.confirm) {
            await this.deletePost();
          }
        }
      });
    },

    // 删除帖子
    async deletePost() {
      try {
        const res = await deletePost(this.postId);
        if (res.code === 200) {
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });

      setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }
      } catch (error) {
        console.error('删除帖子失败', error);
        uni.showToast({
          title: '删除失败，请重试',
          icon: 'none'
        });
      }
    },

    // 举报帖子
    reportPost() {
      uni.showToast({
        title: '举报功能开发中',
        icon: 'none'
      });
    },

    // 分享帖子
    sharePost() {
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      });
    },
    
    // 点赞/取消点赞
    async toggleLike() {
      if (!this.currentUserId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      try {
        const res = await toggleLike('post', this.postId);
        if (res.code === 200) {
          this.post.isLiked = res.data;
          this.post.likeCount = this.post.isLiked
            ? (this.post.likeCount || 0) + 1
            : Math.max((this.post.likeCount || 0) - 1, 0);

          uni.showToast({
            title: this.post.isLiked ? '点赞成功' : '已取消点赞',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('点赞操作失败', error);
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    },

    // 关注/取消关注
    async toggleFollow() {
      if (!this.currentUserId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      try {
        const res = await toggleFollow(this.post.author.id);
        if (res.code === 200) {
          this.post.author.isFollowed = res.data;

          uni.showToast({
            title: this.post.author.isFollowed ? '关注成功' : '已取消关注',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('关注操作失败', error);
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 评论点赞/取消点赞
    async toggleCommentLike(comment) {
      if (!this.currentUserId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      try {
        const res = await toggleLike('comment', comment.id);
        if (res.code === 200) {
          comment.isLiked = res.data;
          comment.likeCount = comment.isLiked
            ? (comment.likeCount || 0) + 1
            : Math.max((comment.likeCount || 0) - 1, 0);
        }
      } catch (error) {
        console.error('评论点赞操作失败', error);
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 回复评论
    replyToComment(comment) {
      if (!this.currentUserId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      this.replyTo = {
        commentId: comment.id,
        userId: comment.userId,
        nickname: comment.username
      };

      this.commentPlaceholder = `回复 ${comment.username}`;
      this.focusCommentInput();
    },

    // 发布评论
    async submitComment() {
      if (!this.currentUserId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      if (!this.commentContent.trim()) {
        return;
      }

      try {
        let params = {
          postId: this.postId,
          content: this.commentContent
        };

        // 如果是回复评论
        if (this.replyTo) {
          params.parentId = this.replyTo.commentId;
          params.replyUserId = this.replyTo.userId;
        }

        const res = await createComment(params);

        if (res.code === 200) {
          uni.showToast({
            title: '评论成功',
            icon: 'success'
          });

          // 清空输入框
          this.commentContent = '';
          this.replyTo = null;
          this.commentPlaceholder = '写评论...';

          // 刷新评论列表
          this.refreshComments();
        }
      } catch (error) {
        console.error('提交评论失败', error);
        uni.showToast({
          title: '评论失败，请重试',
          icon: 'none'
        });
      }
    },

    // 刷新评论列表
    refreshComments() {
      this.commentPageNum = 1;
      this.comments = [];
      this.hasMoreComments = true;
      this.loadComments(true);
    },

    // 删除评论
    async deleteComment(commentId) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条评论吗？',
        success: async res => {
          if (res.confirm) {
            try {
              const res = await deleteComment(commentId);
              if (res.code === 200) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                });

                // 从列表中移除评论
                const index = this.comments.findIndex(c => c.id === commentId);
                if (index !== -1) {
                  this.comments.splice(index, 1);
                  // 更新评论数
                  this.post.commentCount = Math.max((this.post.commentCount || 0) - 1, 0);
                }
              }
            } catch (error) {
              console.error('删除评论失败', error);
              uni.showToast({
                title: '删除失败，请重试',
                icon: 'none'
              });
            }
          }
        }
      });
    },

    // 加载更多回复
    async loadMoreReplies(comment) {
      try {
        const currentReplies = comment.children.length;
        const res = await getCommentReplies(comment.id, 1, comment.replyCount);
        if (res.code === 200) {
          comment.children = res.data.records || [];
          comment.hasMoreReplies = false;
        }
      } catch (error) {
        console.error('加载回复失败', error);
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      }
    },

    // 聚焦评论输入框
    focusCommentInput() {
      if (!this.currentUserId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      this.commentPlaceholder = this.replyTo
        ? `回复 ${this.replyTo.nickname}`
        : '写评论...';

      this.inputFocus = true;
      console.log('尝试聚焦输入框');
    },

    // 取消回复
    cancelReply() {
      this.replyTo = null;
      this.commentPlaceholder = '写评论...';
    },

    // 预览图片
    previewImage(index) {
      uni.previewImage({
        urls: this.post.images,
        current: this.post.images[index]
      });
    },

    // 下拉刷新
    onRefresh() {
      this.refreshing = true;
      this.loadPostDetail();
      this.commentPageNum = 1;
      this.comments = [];
      this.loadComments();
    },

    // 加载更多评论
    loadMoreComments() {
      this.loadComments();
    },

    // 返回上一页
    goBack() {
      uni.navigateBack();
    },

    // 跳转到用户主页
    goToUserProfile(userId) {
      uni.navigateTo({
        url: `/pages/community/user-profile?id=${userId}`
      });
    },
    // 格式化时间
    formatTime(time) {
      if (!time) return '';

      const now = new Date();
      const postTime = new Date(time);
      const diff = now - postTime;
      
      // 小于1分钟
      if (diff < 60 * 1000) {
        return '刚刚';
      }
      
      // 小于1小时
      if (diff < 60 * 60 * 1000) {
        return `${Math.floor(diff / (60 * 1000))}分钟前`;
      }
      
      // 小于24小时
      if (diff < 24 * 60 * 60 * 1000) {
        return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
      }
      
      // 小于30天
      if (diff < 30 * 24 * 60 * 60 * 1000) {
        return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
      }
      
      // 大于30天
      const year = postTime.getFullYear();
      const month = postTime.getMonth() + 1;
      const day = postTime.getDate();
      return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    },
    onInputFocus() {
      this.inputFocus = true;
      console.log('输入框获取焦点');
    },
    onInputBlur() {
      this.inputFocus = false;
      console.log('输入框失去焦点');
    }
  }
}
</script>

<style>
.post-detail-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.back-icon,
.more-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  flex: 1;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
}

.post-content-scroll {
  flex: 1;
  padding-bottom: 60px;
}

.post-content-wrapper {
  padding: 15px;
  padding-bottom: 80px;
  /* 为底部输入框留出空间 */
}

.post-author {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  margin-right: 10px;
}

.author-info {
  flex: 1;
}

.author-name-wrapper {
  display: flex;
  align-items: center;
}

.author-name {
  font-size: 16px;
  font-weight: bold;
  margin-right: 5px;
}

.expert-tag {
  font-size: 10px;
  color: #fff;
  background-color: #ff9500;
  padding: 1px 4px;
  border-radius: 3px;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.follow-btn {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  background-color: #f0f0f0;
  color: #666;
}

.follow-btn.active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.post-main {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.post-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.post-text {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 15px;
  white-space: pre-wrap;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.post-image {
  width: 100%;
  margin-bottom: 10px;
  border-radius: 8px;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.tag-item {
  font-size: 12px;
  color: #1890ff;
  background-color: #e6f2ff;
  padding: 3px 8px;
  border-radius: 12px;
  margin-right: 8px;
  margin-bottom: 8px;
}

.post-source {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 10px;
}

.source-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

.source-content {
  font-size: 12px;
  color: #666;
}

.post-stats {
  display: flex;
  justify-content: space-around;
  background-color: #fff;
  border-radius: 8px;
  padding: 12px 0;
  margin-bottom: 15px;
}

.stat-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.stat-item text {
  margin-left: 5px;
}

.comment-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
}

.empty-comment {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
}

.empty-image {
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

.comment-list {
  margin-bottom: 15px;
}

.comment-item {
  display: flex;
  margin-bottom: 20px;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  margin-right: 10px;
}

.comment-content {
  flex: 1;
}

.comment-user {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.comment-username {
  font-size: 14px;
  font-weight: bold;
  margin-right: 5px;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  font-size: 14px;
  line-height: 1.5;
}

.comment-actions {
  display: flex;
  align-items: center;
}

.action-item {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.reply-list {
  margin-top: 10px;
}

.reply-item {
  display: flex;
  margin-bottom: 10px;
}

.reply-username {
  font-size: 14px;
  font-weight: bold;
  margin-right: 5px;
}

.reply-to {
  font-size: 12px;
  color: #999;
  margin-right: 5px;
}

.reply-to-username {
  font-size: 12px;
  color: #999;
  margin-right: 5px;
}

.reply-content {
  font-size: 14px;
  line-height: 1.5;
}

.view-more-replies {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-top: 10px;
}

.comment-input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.comment-input {
  flex: 1;
  height: 36px;
  background-color: #f5f5f5;
  border-radius: 18px;
  padding: 0 15px;
  font-size: 14px;
}

.send-btn {
  margin-left: 10px;
  padding: 0 15px;
  height: 36px;
  line-height: 36px;
  border-radius: 18px;
  background-color: #007aff;
  color: #fff;
  font-size: 14px;
  text-align: center;
}

.send-btn.disabled {
  background-color: #cccccc;
}
</style> 
