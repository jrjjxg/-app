<template>
    <view class="min-h-screen flex flex-col relative" :class="[`theme-${journal.theme || 'vintage'}`]">
        <!-- 顶部导航 - 半透明 -->
        <view class="flex items-center justify-between px-4 py-3 bg-white/60 backdrop-blur-md sticky top-0 z-10">
            <view class="w-9 h-9 flex items-center justify-center rounded-full bg-black/10" @tap="goBack">
                <uni-icons type="back" size="20" color="#4B5563"></uni-icons>
            </view>

            <view class="text-base font-medium text-gray-800">{{ formatDate(journal.createTime) }}</view>

            <view class="flex items-center space-x-2">
                <view class="w-9 h-9 flex items-center justify-center rounded-full bg-black/10" @tap="toggleFavorite">
                    <uni-icons :type="journal.isFavorite ? 'star-filled' : 'star'" size="20"
                        :color="journal.isFavorite ? '#F59E0B' : '#4B5563'"></uni-icons>
                </view>
                <view class="w-9 h-9 flex items-center justify-center rounded-full bg-black/10" @tap="shareJournal">
                    <uni-icons type="redo" size="20" color="#4B5563"></uni-icons>
                </view>
                <view class="w-9 h-9 flex items-center justify-center rounded-full bg-black/10" @tap="editJournal">
                    <uni-icons type="compose" size="20" color="#4B5563"></uni-icons>
                </view>
            </view>
        </view>

        <!-- 内容区域直接在背景上 -->
        <scroll-view scroll-y class="flex-1 px-5 pt-5 pb-20">
            <!-- 标题区域 -->
            <view class="mb-4">
                <text class="text-2xl font-bold text-black/85 block">{{ journal.title || '无标题' }}</text>

                <!-- 私密标记和日期 -->
                <view class="flex items-center justify-between mt-2">
                    <view v-if="journal.isPrivate === 1" class="flex items-center">
                        <uni-icons type="locked" size="12" color="rgba(0,0,0,0.6)" class="mr-1"></uni-icons>
                        <text class="text-xs text-black/60">私密</text>
                    </view>
                    <text class="text-xs text-black/50">{{ formatDetailDate(journal.createTime) }}</text>
                </view>

                <!-- 心情标签 -->
                <view v-if="relatedMood" class="flex items-center mt-3 p-2 rounded-lg bg-black/5 w-fit">
                    <view class="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                        :style="{ backgroundColor: relatedMood.color }">
                        <text class="text-white">{{ relatedMood.emotionIcon }}</text>
                    </view>
                    <text class="text-sm text-black/70">{{ relatedMood.emotionType }}</text>
                </view>

                <!-- 标签展示 -->
                <view v-if="journal.tags && journal.tags.length > 0" class="flex flex-wrap gap-2 mt-3">
                    <view v-for="tag in journal.tags" :key="tag"
                        class="px-3 py-1 rounded-full bg-black/5 text-xs text-black/60">
                        {{ tag }}
                    </view>
                </view>

                <!-- 情感分析结果 -->
                <view v-if="emotionAnalysis" class="mt-3 p-3 rounded-lg bg-black/5">
                    <view class="flex items-center justify-between mb-2">
                        <text class="text-sm font-medium text-gray-700">情感分析</text>
                        <text class="text-xs text-black/50">{{ formatDate(emotionAnalysis.analysisTime) }}</text>
                    </view>
                    <view class="flex items-center space-x-4">
                        <view class="flex-1">
                            <view class="flex items-center mb-1">
                                <text class="text-sm text-black/70">主要情感：</text>
                                <text class="text-sm font-medium" :class="getEmotionColorClass(emotionAnalysis.label)">
                                    {{ emotionAnalysis.label }}
                                </text>
                                <text class="text-xs text-black/50 ml-1">
                                    ({{ (emotionAnalysis.prob * 100).toFixed(1) }}%)
                                </text>
                            </view>
                            <view v-if="emotionAnalysis.subLabel" class="flex items-center">
                                <text class="text-sm text-black/70">次要情感：</text>
                                <text class="text-sm font-medium"
                                    :class="getEmotionColorClass(emotionAnalysis.subLabel)">
                                    {{ emotionAnalysis.subLabel }}
                                </text>
                                <text class="text-xs text-black/50 ml-1">
                                    ({{ (emotionAnalysis.subProb * 100).toFixed(1) }}%)
                                </text>
                            </view>
                        </view>
                        <view class="w-12 h-12 rounded-full flex items-center justify-center"
                            :class="getEmotionBgClass(emotionAnalysis.label)">
                            <text class="text-xl">{{ getEmotionIcon(emotionAnalysis.label) }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 分隔线 -->
            <view class="h-px bg-black/10 my-4"></view>

            <!-- 内容区域 -->
            <view class="mb-6">
                <rich-text :nodes="formattedContent" class="text-base leading-7 text-black/80"></rich-text>
            </view>

            <!-- 图片区域 -->
            <view v-if="imageList.length > 0" class="mb-6">
                <view class="grid gap-2"
                    :class="{ 'grid-cols-1': imageList.length === 1, 'grid-cols-2': imageList.length === 2, 'grid-cols-3': imageList.length >= 3 }">
                    <view v-for="(img, index) in imageList" :key="index" class="rounded-lg overflow-hidden"
                        @tap="previewImages(index)">
                        <image :src="img" mode="aspectFill"
                            :class="{ 'w-full aspect-video': imageList.length === 1, 'w-full aspect-square': imageList.length > 1 }">
                        </image>
                    </view>
                </view>
            </view>

            <!-- 底部信息 -->
            <view class="flex justify-between items-center text-xs text-black/50 mt-8 mb-4">
                <text>{{ journal.wordCount || 0 }}字</text>
                <text>{{ journal.location || '未知位置' }}</text>
            </view>
        </scroll-view>

        <!-- 分享弹窗 -->
        <view v-if="showShareOptions" class="fixed inset-0 bg-black/60 flex items-center justify-center z-20"
            @tap="closeShareOptions">
            <view class="bg-white rounded-xl w-80 p-5" @tap.stop>
                <text class="text-center block mb-4 text-lg">分享日记</text>
                <view class="grid grid-cols-3 gap-4">
                    <view class="flex flex-col items-center" @tap="shareAsImage">
                        <view
                            class="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-2">
                            <text class="iconfont icon-image text-white text-xl"></text>
                        </view>
                        <text class="text-xs">生成图片</text>
                    </view>
                    <view class="flex flex-col items-center" @tap="shareAsText">
                        <view
                            class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-2">
                            <text class="iconfont icon-copy text-white text-xl"></text>
                        </view>
                        <text class="text-xs">复制文本</text>
                    </view>
                    <view class="flex flex-col items-center" @tap="shareToBlog">
                        <view
                            class="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-2">
                            <text class="iconfont icon-global text-white text-xl"></text>
                        </view>
                        <text class="text-xs">发布动态</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getJournalDetail, toggleJournalFavorite } from '@/api/journal';
import { getEmotionAnalysis } from '@/api/emotion';
import { formatDate } from '@/utils/timeUtil';

// 状态
const journal = ref({});
const relatedMood = ref(null);
const showShareOptions = ref(false);
const emotionAnalysis = ref(null);

// 图片列表
const imageList = computed(() => {
    if (journal.value.imageUrls) {
        try {
            return JSON.parse(journal.value.imageUrls);
        } catch (e) {
            console.error('解析图片失败', e);
            return [];
        }
    }
    return [];
});

// 格式化内容（处理换行等）
const formattedContent = computed(() => {
    if (!journal.value.content) return '';
    return journal.value.content
        .replace(/\n/g, '<br>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a class="text-blue-500">$1</a>');
});

// 加载日记详情
onLoad(async (options) => {
    if (options.id) {
        await loadJournalDetail(options.id);
    }
});

// 加载日记详情
const loadJournalDetail = async (id) => {
    try {
        uni.showLoading({ title: '加载中...' });
        const res = await getJournalDetail(id);

        if (res.code === 200 && res.data) {
            journal.value = res.data;

            // 如果有关联心情，获取心情数据
            if (journal.value.relatedMoodId) {
                await loadRelatedMood(journal.value.relatedMoodId);
            }

            // 获取情感分析结果
            await loadEmotionAnalysis(id);
        }

        uni.hideLoading();
    } catch (error) {
        uni.hideLoading();
        uni.showToast({
            title: '加载失败',
            icon: 'none'
        });
        console.error('加载日记详情失败', error);
    }
};

// 加载关联心情
const loadRelatedMood = async (moodId) => {
    try {
        const res = await getMoodById(moodId);
        if (res.code === 200 && res.data) {
            relatedMood.value = res.data;
        }
    } catch (error) {
        console.error('加载心情失败', error);
    }
};

// 加载情感分析结果
const loadEmotionAnalysis = async (journalId) => {
    try {
        const res = await getEmotionAnalysis(journalId);
        if (res.code === 200 && res.data) {
            emotionAnalysis.value = res.data;
        }
    } catch (error) {
        console.error('加载情感分析结果失败', error);
    }
};

// 切换收藏状态
const toggleFavorite = async () => {
    try {
        const res = await toggleJournalFavorite(journal.value.id);
        if (res.code === 200) {
            journal.value.isFavorite = !journal.value.isFavorite;
            uni.showToast({
                title: journal.value.isFavorite ? '已收藏' : '已取消收藏',
                icon: 'success'
            });
        }
    } catch (error) {
        console.error('切换收藏状态失败', error);
    }
};

// 返回上一页
const goBack = () => {
    uni.navigateBack();
};

// 编辑日记
const editJournal = () => {
    uni.navigateTo({
        url: `/pages/journal/edit?id=${journal.value.id}`
    });
};

// 打开分享选项
const shareJournal = () => {
    showShareOptions.value = true;
};

// 关闭分享选项
const closeShareOptions = () => {
    showShareOptions.value = false;
};

// 分享为图片
const shareAsImage = () => {
    // 实现分享为图片的逻辑
    uni.showToast({
        title: '生成图片分享',
        icon: 'none'
    });
    closeShareOptions();
};

// 分享为文本
const shareAsText = () => {
    const text = `${journal.value.title}\n\n${journal.value.content}`;
    uni.setClipboardData({
        data: text,
        success: () => {
            uni.showToast({
                title: '已复制到剪贴板',
                icon: 'success'
            });
        }
    });
    closeShareOptions();
};

// 分享到博客
const shareToBlog = () => {
    // 实现分享到博客的逻辑
    uni.showToast({
        title: '发布到动态',
        icon: 'none'
    });
    closeShareOptions();
};

// 预览图片
const previewImages = (index) => {
    uni.previewImage({
        current: imageList.value[index],
        urls: imageList.value
    });
};

// 获取情感颜色类
const getEmotionColorClass = (emotion) => {
    const colorMap = {
        'positive': 'text-green-600',
        'negative': 'text-red-600',
        'neutral': 'text-gray-600'
    };
    return colorMap[emotion] || 'text-gray-600';
};

// 获取情感背景类
const getEmotionBgClass = (emotion) => {
    const bgMap = {
        'positive': 'bg-green-100',
        'negative': 'bg-red-100',
        'neutral': 'bg-gray-100'
    };
    return bgMap[emotion] || 'bg-gray-100';
};

// 获取情感图标
const getEmotionIcon = (emotion) => {
    const iconMap = {
        'positive': '😊',
        'negative': '😢',
        'neutral': '😐'
    };
    return iconMap[emotion] || '😐';
};
</script>

<style>
/* 主题样式 - 与编辑页保持一致 */
.theme-vintage {
    background-image: url('/static/themes/vintage-bg.png');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
}

.theme-lined {
    background-image: url('/static/themes/lined-bg.png');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
}

.theme-minimal {
    background-color: #f8f9fa;
}

.theme-kawaii {
    background-image: url('/static/themes/kawaii-bg.png');
    background-size: cover;
    background-position: center;
}

.theme-dark {
    background-color: #2a2a2a;
}

/* 暗色主题特殊处理 */
.theme-dark text {
    color: rgba(255, 255, 255, 0.7);
}

.theme-dark .text-gray-700,
.theme-dark .text-gray-800,
.theme-dark .text-gray-600 {
    color: rgba(255, 255, 255, 0.85) !important;
}

.theme-dark .text-black\/50,
.theme-dark .text-black\/60,
.theme-dark .text-black\/70,
.theme-dark .text-black\/80,
.theme-dark .text-black\/85 {
    color: rgba(255, 255, 255, 0.7) !important;
}

.theme-dark .bg-black\/5,
.theme-dark .bg-black\/10 {
    background-color: rgba(255, 255, 255, 0.1) !important;
}

.theme-dark .bg-white\/60 {
    background-color: rgba(42, 42, 42, 0.7) !important;
}

.theme-dark .border-black\/5,
.theme-dark .border-black\/10 {
    border-color: rgba(255, 255, 255, 0.2) !important;
}

.theme-nature {
    background-image: url('/static/themes/nature-bg.png');
    background-size: cover;
    background-position: center;
}
</style>