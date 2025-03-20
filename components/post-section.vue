<template>
    <view>
        <view v-for="post in posts" :key="post.id"
            class="bg-white mb-4 mx-4 p-4 rounded-xl shadow-sm border border-gray-100 post-card"
            @click="onPostClick(post.id)">

            <!-- 用户信息 -->
            <view class="flex items-center mb-3">
                <image :src="post.author.avatar || '/static/images/default-avatar.png'"
                    class="w-10 h-10 rounded-full mr-3" @click.stop="onUserClick(post.author.id)">
                </image>

                <view class="flex-1">
                    <view class="flex items-center">
                        <text class="font-bold text-gray-800" @click.stop="onUserClick(post.author.id)">
                            {{ post.author.nickname || '用户' }}
                        </text>
                        <view v-if="post.author.isExpert"
                            class="ml-2 px-1 py-0.5 bg-red-500 text-white text-xs rounded">
                            专家
                        </view>
                    </view>
                    <text class="text-xs text-gray-500">{{ formatTime(post.createTime) }}</text>
                </view>
            </view>

            <!-- 帖子内容 - 减少嵌套层级 -->
            <text v-if="post.title" class="block text-base font-bold mb-1">{{ post.title }}</text>
            <text class="block text-gray-800 leading-relaxed line-clamp-3">{{ post.content }}</text>

            <!-- 帖子图片 - 优化渲染 -->
            <view v-if="post.images && post.images.length > 0" class="flex flex-wrap mt-2 mb-3">
                <view v-for="(img, index) in post.images.slice(0, 3)" :key="index" class="relative"
                    :class="post.images.length === 1 ? 'w-2/3 h-36' : 'w-1/3 pr-1 pb-1 h-20'">
                    <image :src="img" mode="aspectFill" class="w-full h-full rounded" :lazy-load="true"></image>
                    <view v-if="index === 2 && post.images.length > 3"
                        class="absolute right-2 bottom-2 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                        +{{ post.images.length - 3 }}
                    </view>
                </view>
            </view>

            <!-- 帖子统计 - 简化结构 -->
            <view class="flex pt-2 border-t border-gray-100">
                <text class="mr-4 text-gray-600 text-sm">浏览 {{ post.viewCount || 0 }}</text>
                <text class="mr-4 text-gray-600 text-sm">评论 {{ post.commentCount || 0 }}</text>
                <text class="text-gray-600 text-sm" :class="{ 'text-red-500': post.isLiked }">
                    点赞 {{ post.likeCount || 0 }}
                </text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        posts: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        onPostClick(id) {
            this.$emit('post-click', id);
        },
        onUserClick(id) {
            this.$emit('user-click', id);
        },
        formatTime(time) {
            // 时间格式化逻辑
            if (!time) return '';
            // ... 格式化代码
            return time;
        }
    }
}
</script>

<style>
.post-card {
    transition: transform 0.2s ease;
}

.post-card:active {
    transform: scale(0.98);
}

.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    line-clamp: 3;
    overflow: hidden;
}
</style>