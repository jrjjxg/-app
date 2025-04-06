<template>
    <view class="profile-container">
        <!-- 顶部导航栏 -->
        <view class="header">
            <view class="back-icon" @click="goBack">
                <uni-icons type="back" size="20"></uni-icons>
            </view>
            <view class="title">{{ isCurrentUser ? '我的主页' : '用户主页' }}</view>
            <view class="more-icon" v-if="!isCurrentUser" @click="showActionSheet">
                <uni-icons type="more-filled" size="20"></uni-icons>
            </view>
        </view>

        <!-- 用户信息 -->
        <view class="user-info-section">
            <view class="user-info">
                <image :src="user.avatar || '/static/images/default-avatar.png'" class="avatar"
                    @error="handleAvatarError"></image>
                <view class="user-details">
                    <view class="nickname">
                        {{ user.nickname }}
                        <view v-if="user.isExpert" class="expert-tag">专家</view>
                    </view>
                </view>
            </view>

            <view class="user-stats">
                <view class="stat-item" @click="goToFollowing">
                    <view class="stat-count">{{ user.followingCount || 0 }}</view>
                    <view class="stat-label">关注</view>
                </view>
                <view class="stat-item" @click="goToFollowers">
                    <view class="stat-count">{{ user.followerCount || 0 }}</view>
                    <view class="stat-label">粉丝</view>
                </view>
                <view class="stat-item">
                    <view class="stat-count">{{ user.postCount || 0 }}</view>
                    <view class="stat-label">帖子</view>
                </view>
            </view>

            <view class="user-bio">{{ user.bio || '这个人很懒，什么都没留下' }}</view>

            <view class="action-buttons">
                <view v-if="!isCurrentUser" class="follow-button" :class="{ active: user.isFollowed }"
                    @click="toggleFollow">
                    {{ user.isFollowed ? '已关注' : '关注' }}
                </view>
                <view v-if="!isCurrentUser" class="message-button" @click="goToChat">
                    发消息
                </view>
                <view v-if="isCurrentUser" class="edit-button" @click="goToEditProfile">
                    编辑资料
                </view>
            </view>
        </view>

        <!-- 内容标签页 -->
        <view class="content-tabs">
            <view class="tab-item" :class="{ active: activeTab === 'posts' }" @click="changeTab('posts')">
                帖子
            </view>
            <view class="tab-item" :class="{ active: activeTab === 'liked' }" @click="changeTab('liked')">
                点赞
            </view>
        </view>

        <!-- 帖子列表 -->
        <scroll-view scroll-y class="post-list" @scrolltolower="loadMorePosts" refresher-enabled
            :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
            <view v-if="loading && posts.length === 0" class="loading-container">
                <uni-load-more status="loading"></uni-load-more>
            </view>

            <view v-else-if="posts.length === 0" class="empty-container">
                <image src="/static/images/empty-post.png" mode="aspectFit" class="empty-image"></image>
                <text class="empty-text">{{ emptyText }}</text>
            </view>

            <view v-else>
                <view v-for="post in posts" :key="post.id" class="post-item" @click="goToPostDetail(post.id)">
                    <!-- 帖子内容 -->
                    <view class="post-content">
                        <view class="post-title">{{ post.title }}</view>
                        <view class="post-text">{{ post.content }}</view>

                        <!-- 帖子图片 -->
                        <view v-if="post.images && post.images.length > 0" class="post-images">
                            <image v-for="(img, index) in post.images.slice(0, 3)" :key="index" :src="img"
                                mode="aspectFill" class="post-image"
                                :class="{ 'single-image': post.images.length === 1 }"></image>
                            <view v-if="post.images.length > 3" class="more-images">+{{ post.images.length - 3 }}</view>
                        </view>
                    </view>

                    <!-- 帖子互动数据 -->
                    <view class="post-stats">
                        <view class="stat-item">
                            <uni-icons type="eye" size="16"></uni-icons>
                            <text>{{ post.viewCount || 0 }}</text>
                        </view>
                        <view class="stat-item">
                            <uni-icons type="chat" size="16"></uni-icons>
                            <text>{{ post.commentCount || 0 }}</text>
                        </view>
                        <view class="stat-item">
                            <uni-icons :type="post.isLiked ? 'heart-filled' : 'heart'" size="16"
                                color="#ff6b6b"></uni-icons>
                            <text>{{ post.likeCount || 0 }}</text>
                        </view>
                    </view>
                </view>

                <!-- 加载更多 -->
                <uni-load-more v-if="posts.length > 0" :status="loadMoreStatus"></uni-load-more>
            </view>
        </scroll-view>
    </view>
</template>

<script>
import { getUserPosts, getUserLikedPosts } from '@/api/post';
import { toggleFollow, checkFollowed } from '@/api/follow';
import { getUserProfile } from '@/api/user';

export default {
    data() {
        return {
            userId: '',
            user: {
                id: '',
                nickname: '',
                avatar: '',
                bio: '',
                isExpert: false,
                isFollowed: false,
                followingCount: 0,
                followerCount: 0,
                postCount: 0
            },
            activeTab: 'posts',
            loading: true,
            refreshing: false,
            posts: [],
            pageNum: 1,
            pageSize: 10,
            hasMore: true,
            loadMoreStatus: 'more'
        }
    },
    computed: {
        isCurrentUser() {
            // 获取当前登录用户ID，这里需要根据实际情况修改
            const currentUserId = uni.getStorageSync('userId');
            console.log(currentUserId);
            return this.userId === currentUserId;
        },
        emptyText() {
            if (this.activeTab === 'posts') {
                return this.isCurrentUser ? '你还没有发布过帖子' : '该用户还没有发布过帖子';
            } else {
                return this.isCurrentUser ? '你还没有点赞过帖子' : '该用户还没有点赞过帖子';
            }
        }
    },
    onLoad(options) {
        this.userId = options.id || '';
        this.loadUserInfo();
        this.loadPosts();
    },
    methods: {
        goBack() {
            uni.navigateBack();
            // uni.navigateBack()是uni- app提供的API，用于返回到上一个页面。
        },

        // 加载用户信息
        async loadUserInfo() {
            try {
                this.loading = true;

                // getUserProfile，获取指定用户信息，返回一个对象:UserVo
                const res = await getUserProfile(this.userId);
                if (res.code === 200) {
                    this.user = res.data;

                    // 如果返回的数据缺少某些字段，设置默认值
                    if (!this.user.nickname) {
                        this.user.nickname = '用户' + this.userId.substring(0, 6);
                    }

                    if (!this.user.avatar) {
                        this.user.avatar = '/static/images/default-avatar.png';
                    }

                    if (!this.user.bio) {
                        this.user.bio = '这个人很懒，什么都没留下...';
                    }

                    // 检查是否已关注
                    if (!this.isCurrentUser) {
                        try {
                            const followRes = await checkFollowed(this.userId);
                            this.user.isFollowed = followRes.data;
                        } catch (error) {
                            console.error('检查关注状态失败', error);
                        }
                    }
                } else {
                    uni.showToast({
                        title: res.message || '获取用户信息失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('加载用户信息失败', error);
                uni.showToast({
                    title: '加载用户信息失败',
                    icon: 'none'
                });

                // 如果API调用失败，设置基本信息避免页面显示异常
                this.user = {
                    id: this.userId,
                    nickname: '用户' + this.userId.substring(0, 6),
                    avatar: '/static/images/default-avatar.png',
                    bio: '暂无个人简介',
                    followingCount: 0,
                    followerCount: 0,
                    postCount: 0
                };
            } finally {
                this.loading = false;
            }
        },

        // 加载帖子
        async loadPosts() {
            if (this.loading && this.pageNum > 1) return;

            this.loading = true;
            this.loadMoreStatus = 'loading';

            try {
                const res = await getUserPosts(this.userId, this.pageNum, this.pageSize);

                // 获取帖子列表
                let posts = res.data.records || [];

                // 转换数据结构，为每个帖子创建author对象
                posts = posts.map(post => {
                    // 如果post中没有author对象，则创建一个
                    if (!post.author) {
                        post.author = {
                            id: post.userId || this.userId,
                            nickname: post.username || this.user.nickname || '用户',
                            avatar: post.avatar || this.user.avatar || '/static/images/default-avatar.png',
                            isExpert: post.isExpert || this.user.isExpert || false
                        };
                    }
                    return post;
                });

                if (this.pageNum === 1) {
                    this.posts = posts;
                } else {
                    this.posts = [...this.posts, ...posts];
                }

                this.hasMore = posts.length >= this.pageSize;
                this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
            } catch (error) {
                console.error('加载用户帖子失败', error);
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

        // 下拉刷新
        onRefresh() {
            this.refreshing = true;
            this.pageNum = 1;
            this.loadPosts();
        },

        // 加载更多
        loadMorePosts() {
            if (!this.hasMore || this.loading) return;
            this.pageNum++;
            this.loadPosts();
        },

        // 切换标签
        changeTab(tab) {
            if (this.activeTab === tab) return;
            this.activeTab = tab;
            this.pageNum = 1;
            this.posts = [];
            this.hasMore = true;
            this.loadPosts();
        },

        // 关注/取消关注
        async toggleFollow() {
            try {
                const res = await toggleFollow(this.userId);
                this.user.isFollowed = res.data;

                // 更新粉丝数
                if (this.user.isFollowed) {
                    this.user.followerCount++;
                } else {
                    this.user.followerCount = Math.max(0, this.user.followerCount - 1);
                }

                uni.showToast({
                    title: this.user.isFollowed ? '关注成功' : '已取消关注',
                    icon: 'none'
                });
            } catch (error) {
                console.error('关注操作失败', error);
                uni.showToast({
                    title: '操作失败，请重试',
                    icon: 'none'
                });
            }
        },

        // 跳转到聊天页面
        goToChat() {
            uni.navigateTo({
                url: `/pages/community/chat?id=${this.userId}&nickname=${encodeURIComponent(this.user.nickname)}&avatar=${encodeURIComponent(this.user.avatar)}`
            });
        },

        // 跳转到编辑资料页面
        goToEditProfile() {
            uni.navigateTo({
                url: '/pages/community/edit-profile'
            });
        },

        // 跳转到关注列表
        goToFollowing() {
            uni.navigateTo({
                url: `/pages/community/following?id=${this.userId}&nickname=${encodeURIComponent(this.user.nickname)}`
            });
        },

        // 跳转到粉丝列表
        goToFollowers() {
            uni.navigateTo({
                url: `/pages/community/followers?id=${this.userId}&nickname=${encodeURIComponent(this.user.nickname)}`
            });
        },

        // 跳转到帖子详情
        goToPostDetail(postId) {
            uni.navigateTo({
                url: `/pages/community/post-detail?id=${postId}`
            });
        },

        // 显示操作菜单
        showActionSheet() {
            uni.showActionSheet({
                itemList: ['举报用户', '屏蔽用户'],
                success: (res) => {
                    if (res.tapIndex === 0) {
                        // 举报用户
                        uni.showToast({
                            title: '举报成功',
                            icon: 'none'
                        });
                    } else if (res.tapIndex === 1) {
                        // 屏蔽用户
                        uni.showToast({
                            title: '已屏蔽该用户',
                            icon: 'none'
                        });
                    }
                }
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

            // 大于30天，显示具体日期
            const year = postTime.getFullYear();
            const month = postTime.getMonth() + 1;
            const day = postTime.getDate();

            return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
        },

        // 跳转到其他用户的个人资料页
        goToOtherUserProfile(userId) {
            if (userId === this.userId) return; // 如果是当前用户，不跳转

            uni.navigateTo({
                url: `/pages/community/user-profile?id=${userId}`
            });
        },

        // 处理头像加载错误
        handleAvatarError() {
            console.error('头像加载失败:', this.user.avatar);
            this.user.avatar = '/static/images/default-avatar.png';
        }
    }
}
</script>

<style>
.profile-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f5f5;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    font-size: 18px;
    font-weight: bold;
}

.user-info-section {
    padding: 20px 15px;
    background-color: #fff;
    margin-bottom: 10px;
}

.user-info {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}

.avatar {
    width: 70px;
    height: 70px;
    border-radius: 35px;
    margin-right: 15px;
}

.user-details {
    flex: 1;
}

.nickname {
    font-size: 18px;
    font-weight: bold;
    display: flex;
    align-items: center;
    margin-bottom: 5px;
}

.expert-tag {
    font-size: 10px;
    color: #fff;
    background-color: #ff9500;
    padding: 2px 5px;
    border-radius: 3px;
    margin-left: 5px;
}

.user-id {
    font-size: 12px;
    color: #999;
}

.user-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 15px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-count {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 12px;
    color: #999;
}

.user-bio {
    font-size: 14px;
    color: #666;
    margin-bottom: 15px;
    line-height: 1.5;
}

.action-buttons {
    display: flex;
    justify-content: space-between;
}

.follow-button,
.message-button,
.edit-button {
    flex: 1;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    font-size: 14px;
}

.follow-button {
    background-color: #007aff;
    color: #fff;
    margin-right: 10px;
}

.follow-button.active {
    background-color: #f0f0f0;
    color: #333;
}

.message-button,
.edit-button {
    background-color: #f0f0f0;
    color: #333;
}

.content-tabs {
    display: flex;
    background-color: #fff;
    margin-bottom: 10px;
}

.tab-item {
    flex: 1;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #666;
    position: relative;
}

.tab-item.active {
    color: #007aff;
    font-weight: bold;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 25%;
    width: 50%;
    height: 2px;
    background-color: #007aff;
}

.post-list {
    flex: 1;
}

.loading-container,
.empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
}

.empty-image {
    width: 100px;
    height: 100px;
    margin-bottom: 10px;
}

.empty-text {
    color: #999;
    font-size: 14px;
}

.post-item {
    background-color: #fff;
    padding: 15px;
    margin-bottom: 10px;
}

.post-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
}

.post-text {
    font-size: 14px;
    color: #333;
    margin-bottom: 10px;
    line-height: 1.5;
}

.post-images {
    display: flex;
    flex-wrap: wrap;
    position: relative;
    margin-bottom: 10px;
}

.post-image {
    width: 32%;
    height: 80px;
    margin-right: 2%;
    margin-bottom: 2%;
    border-radius: 4px;
}

.post-image:nth-child(3n) {
    margin-right: 0;
}

.single-image {
    width: 70%;
    height: 150px;
}

.more-images {
    position: absolute;
    right: 10px;
    bottom: 10px;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 12px;
    padding: 2px 5px;
    border-radius: 3px;
}

.post-stats {
    display: flex;
    border-top: 1px solid #eee;
    padding-top: 10px;
}

.post-stats .stat-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-right: 15px;
    font-size: 12px;
    color: #666;
}

.post-stats .stat-item text {
    margin-left: 3px;
}
</style>
