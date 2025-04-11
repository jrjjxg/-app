<template>
    <view class="min-h-screen flex flex-col relative" :class="[`theme-${selectedTheme}`]">
        <!-- 顶部工具栏 - 半透明 -->
        <view class="flex items-center justify-between px-4 py-3 bg-white/60 backdrop-blur-md sticky top-0 z-10">
            <view class="w-9 h-9 flex items-center justify-center rounded-full bg-black/10" @tap="goBack">
                <uni-icons type="back" size="20" color="#4B5563"></uni-icons>
            </view>
            <text class="text-base font-medium text-gray-800">{{ isEdit ? '编辑日记' : '新建日记' }}</text>
            <button class="bg-green-500 text-white rounded-full px-4 py-1.5 text-sm"
                @tap="handleSaveJournal">保存</button>
        </view>

        <!-- 内容区域直接在背景上 -->
        <scroll-view scroll-y class="flex-1 px-5 py-4">
            <!-- 标题输入 -->
            <view class="mb-6">
                <input class="w-full text-xl font-semibold pb-2 border-b border-black/10 bg-transparent" type="text"
                    v-model="journal.title" placeholder="请输入标题..." maxlength="50" />
                <view class="flex items-center mt-2 text-black/50 text-xs">
                    <uni-icons type="calendar" size="14" color="rgba(0,0,0,0.5)" class="mr-1"></uni-icons>
                    <text>{{ formatDate(new Date()) }}</text>
                </view>
            </view>

            <!-- 关联心情记录 -->
            <view class="mb-6">
                <view v-if="relatedMood" class="w-full">
                    <view class="flex justify-between items-center mb-2">
                        <text
                            class="relative pl-3 text-sm font-medium text-gray-700 before:absolute before:left-0 before:top-0.5 before:bottom-0.5 before:w-1 before:bg-green-500 before:rounded-sm">关联心情</text>
                        <text class="text-sm text-blue-500" @tap="unlinkMood">取消关联</text>
                    </view>
                    <view class="flex items-center p-3 rounded-lg bg-black/5">
                        <view class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                            :style="{ backgroundColor: relatedMood.color }">
                            <text class="text-white">{{ relatedMood.emotionIcon }}</text>
                        </view>
                        <view>
                            <text class="text-sm font-medium text-black/70">{{ relatedMood.emotionType }}</text>
                            <text class="text-xs text-black/50 block">{{ formatTime(relatedMood.createTime) }}</text>
                        </view>
                    </view>
                </view>
                <button v-else class="w-full py-2.5 text-sm text-blue-500 border border-blue-200 rounded-lg bg-white/20"
                    @tap="showMoodPicker">
                    关联心情记录
                </button>
            </view>

            <!-- 日记内容区域 - 直接在背景上 -->
            <view class="mb-6">
                <view class="flex justify-between items-center mb-3">
                    <text
                        class="relative pl-3 text-sm font-medium text-gray-700 before:absolute before:left-0 before:top-0.5 before:bottom-0.5 before:w-1 before:bg-green-500 before:rounded-sm">今日记录</text>
                    <view class="flex items-center">
                        <view class="px-2.5 py-1 rounded-full text-xs text-gray-600 bg-black/5 mr-2" @tap="showVoiceRecorder">
                            <uni-icons type="mic" size="14" color="#4B5563" class="mr-1"></uni-icons>
                            <text>语音输入</text>
                        </view>
                        <view class="px-2.5 py-1 rounded-full text-xs text-gray-600 bg-black/5"
                            @tap="showThemePicker">
                            <text>{{ getThemeName(selectedTheme) }}</text>
                            <uni-icons type="right" size="12" color="#4B5563" class="ml-1"></uni-icons>
                        </view>
                    </view>
                </view>

                <!-- 内容输入区 - 无背景 -->
                <textarea class="w-full min-h-[200px] text-base leading-7 text-black/80 mt-3 bg-transparent"
                    v-model="journal.content" placeholder="写下你的日记内容..." auto-height @input="countWords">
                </textarea>
            </view>

            <!-- 图片区域 -->
            <view class="mb-20">
                <view class="flex justify-between items-center mb-3">
                    <text
                        class="relative pl-3 text-sm font-medium text-gray-700 before:absolute before:left-0 before:top-0.5 before:bottom-0.5 before:w-1 before:bg-green-500 before:rounded-sm">添加图片</text>
                    <text class="text-xs text-black/50">{{ images.length }}/9</text>
                </view>

                <view class="grid grid-cols-3 gap-2.5">
                    <!-- 已上传图片 -->
                    <view v-for="(img, index) in images" :key="index"
                        class="relative rounded-lg overflow-hidden aspect-square">
                        <image :src="img" mode="aspectFill" class="w-full h-full" @tap="previewImage(index)"></image>
                        <view
                            class="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white"
                            @tap.stop="removeImage(index)">
                            <uni-icons type="closeempty" size="14" color="#FFFFFF"></uni-icons>
                        </view>
                    </view>

                    <!-- 添加图片按钮 -->
                    <view v-if="images.length < 9"
                        class="aspect-square rounded-lg border-2 border-dashed border-black/20 flex items-center justify-center text-black/30 text-2xl"
                        @tap="chooseImage">
                        <uni-icons type="image" size="36" color="rgba(0,0,0,0.3)"></uni-icons>
                    </view>
                </view>
            </view>
        </scroll-view>

        <!-- 底部信息栏 - 半透明 -->
        <view
            class="fixed bottom-0 left-0 right-0 flex justify-between items-center px-4 py-3 bg-white/60 backdrop-blur-md border-t border-black/5 z-10">
            <text class="text-sm text-black/50">{{ wordCount }}字</text>
            <view class="flex items-center">
                <switch :checked="journal.isPrivate === 1" @change="togglePrivacy" color="#4CAF50"
                    class="transform scale-90" />
                <text class="text-sm text-black/60 ml-1">私密日记</text>
            </view>
        </view>

        <!-- 主题选择器模态框 -->
        <theme-picker-modal v-if="showThemeModal" :selectedTheme="selectedTheme" @select="updateTheme"
            @close="closeThemePicker" />

        <!-- 心情选择器模态框 -->
        <mood-picker-modal v-if="showMoodModal" @select="linkMood" @close="closeMoodPicker" />
        
        <!-- 语音录制模态框 -->
        <uni-popup ref="voicePopup" type="center">
            <view class="bg-white rounded-xl w-90vw max-w-lg p-4">
                <view class="flex justify-between items-center mb-4">
                    <text class="text-lg font-medium">语音录制</text>
                    <uni-icons type="closeempty" size="20" @click="closeVoiceRecorder"></uni-icons>
                </view>
                <voice-recorder 
                    :journalId="journalId" 
                    @recording-result="handleVoiceResult"
                ></voice-recorder>
            </view>
        </uni-popup>
    </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import ThemePickerModal from '@/components/journal/ThemePickerModal.vue';
import MoodPickerModal from '@/components/mood/MoodPickerModal.vue';
import VoiceRecorder from '@/components/voice/voice-recorder.vue';
import { formatDate, formatTime } from '@/utils/timeUtil';
import { saveJournal as apiSaveJournal, getJournalDetail } from '@/api/journal';
import { analyzeText } from '@/api/emotion';

// 状态
const isEdit = ref(false);
const journalId = ref('');
const selectedTheme = ref('vintage');
const wordCount = ref(0);
const showThemeModal = ref(false);
const showMoodModal = ref(false);
const relatedMood = ref(null);
const images = ref([]);  // 图片URL数组

const journal = reactive({
    id: '',
    userId: uni.getStorageSync('userId'),
    title: '',
    content: '',
    theme: 'vintage',
    isPrivate: 0,
    relatedMoodId: '',
    imageUrls: '[]'  // 存储图片URL的JSON字符串
});

// 主题名称映射
const themeNames = {
    'vintage': '牛皮纸',
    'lined': '条格本',
    'minimal': '简约',
    'kawaii': '日系可爱',
    'dark': '暗黑',
    'nature': '自然'
};

onLoad((options) => {
    if (options.id) {
        isEdit.value = true;
        journalId.value = options.id;
        loadJournalDetail();
    }

    // 加载主题设置
    const theme = uni.getStorageSync('journal_theme');
    if (theme) {
        selectedTheme.value = theme;
        journal.theme = theme;
    }
});

// 加载日记详情
const loadJournalDetail = async () => {
    try {
        uni.showLoading({ title: '加载中...' });
        const res = await getJournalDetail(journalId.value);

        if (res.code === 200 && res.data) {
            // 填充数据
            journal.id = res.data.id;
            journal.title = res.data.title || '';
            journal.content = res.data.content || '';
            journal.isPrivate = res.data.isPrivate;
            journal.relatedMoodId = res.data.relatedMoodId;
            journal.theme = res.data.theme || 'vintage';

            // 加载图片列表
            if (res.data.imageUrls) {
                try {
                    images.value = JSON.parse(res.data.imageUrls);
                } catch (e) {
                    images.value = [];
                    console.error('解析图片列表失败', e);
                }
            }

            // 更新相关状态
            selectedTheme.value = journal.theme;
            wordCount.value = journal.content.length;

            // 加载关联的心情记录
            if (res.data.relatedMoodId) {
                // 实际项目中应该调用API获取心情记录详情
                // 这里使用模拟数据
                relatedMood.value = {
                    id: res.data.relatedMoodId,
                    emotionType: '快乐',
                    emotionIcon: '😊',
                    color: '#4CAF50',
                    createTime: new Date()
                };
            }
        }
    } catch (error) {
        console.error('加载日记详情失败', error);
        uni.showToast({ title: '加载失败', icon: 'none' });
    } finally {
        uni.hideLoading();
    }
};

// 显示主题选择器
const showThemePicker = () => {
    showThemeModal.value = true;
};

// 关闭主题选择器
const closeThemePicker = () => {
    showThemeModal.value = false;
};

// 更新选中的主题
const updateTheme = (themeId) => {
    selectedTheme.value = themeId;
    journal.theme = themeId;
    uni.setStorageSync('journal_theme', themeId);
    showThemeModal.value = false;
};

// 获取主题名称
const getThemeName = (themeId) => {
    return themeNames[themeId] || '默认';
};

// 显示心情选择器
const showMoodPicker = () => {
    showMoodModal.value = true;
};

// 关闭心情选择器
const closeMoodPicker = () => {
    showMoodModal.value = false;
};

// 关联心情记录
const linkMood = (mood) => {
    relatedMood.value = mood;
    journal.relatedMoodId = mood.id;
    showMoodModal.value = false;
};

// 取消关联心情
const unlinkMood = () => {
    relatedMood.value = null;
    journal.relatedMoodId = null;
};

// 切换私密状态
const togglePrivacy = (e) => {
    journal.isPrivate = e.detail.value ? 1 : 0;
};

// 字数统计
const countWords = () => {
    if (!journal.content) {
        wordCount.value = 0;
        return;
    }
    wordCount.value = journal.content.length;
};

// 选择图片
const chooseImage = async () => {
    try {
        const res = await uni.chooseImage({
            count: 9 - images.value.length,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera']
        });

        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            for (const filePath of res.tempFilePaths) {
                const imageUrl = await uploadImage(filePath);
                if (imageUrl) {
                    images.value.push(imageUrl);
                }
            }
        }
    } catch (error) {
        console.error('选择图片失败', error);
    }
};

// 上传图片
const uploadImage = async (filePath) => {
    uni.showLoading({ title: '上传中...' });

    try {
        const uploadRes = await uni.uploadFile({
            url: 'http://localhost:9000/api/upload/journal',
            filePath,
            name: 'file',
            header: {
                'Authorization': `Bearer ${uni.getStorageSync('token')}`
            }
        });

        const data = JSON.parse(uploadRes.data);
        if (data.code === 200) {
            uni.hideLoading();
            return data.data; // 返回图片URL
        } else {
            throw new Error(data.message || '上传失败');
        }
    } catch (error) {
        uni.hideLoading();
        uni.showToast({
            title: '图片上传失败',
            icon: 'none'
        });
        console.error('上传图片失败', error);
        return null;
    }
};

// 删除图片
const removeImage = (index) => {
    images.value.splice(index, 1);
};

// 预览图片
const previewImage = (index) => {
    uni.previewImage({
        current: images.value[index],
        urls: images.value
    });
};

// 保存日记 - 将函数名改为 handleSaveJournal
const handleSaveJournal = async () => {
    if (!journal.title.trim()) {
        uni.showToast({
            title: '请输入标题',
            icon: 'none'
        });
        return;
    }

    uni.showLoading({ title: '保存中...' });

    try {
        // 更新图片URL
        journal.imageUrls = JSON.stringify(images.value);

        // 创建保存数据
        const data = {
            ...journal,
            wordCount: wordCount.value,
            imageCount: images.value.length
        };

        if (isEdit.value) {
            data.id = journalId.value;
        }

        // 调用API保存日记 - 使用导入的API函数
        const res = await apiSaveJournal(data);

        if (res.code === 200) {
            // 保存成功后，进行情感分析
            if (journal.content && journal.content.length > 10) {
                try {
                    const emotionRes = await analyzeText(journal.content);
                    if (emotionRes.code === 200 && emotionRes.data) {
                        // 更新日记的情感分析结果
                        await apiSaveJournal({
                            ...data,
                            id: res.data.id,
                            emotionType: emotionRes.data.label,
                            emotionProb: emotionRes.data.prob,
                            emotionSubtype: emotionRes.data.subLabel,
                            emotionSubtypeProb: emotionRes.data.subProb,
                            emotionAnalysisTime: new Date().toISOString(),
                            emotionAnalysisResult: JSON.stringify(emotionRes.data)
                        });
                    }
                } catch (error) {
                    console.error('情感分析失败', error);
                }
            }

            uni.hideLoading();
            uni.showToast({
                title: '保存成功',
                icon: 'success'
            });

            setTimeout(() => {
                uni.navigateBack();
            }, 1500);
        } else {
            throw new Error(res.message || '保存失败');
        }
    } catch (error) {
        uni.hideLoading();
        uni.showToast({
            title: '保存失败',
            icon: 'none'
        });
        console.error('保存日记失败', error);
    }
};

// 返回
const goBack = () => {
    uni.showModal({
        title: '提示',
        content: '是否放弃当前编辑？',
        success: (res) => {
            if (res.confirm) {
                uni.navigateBack();
            }
        }
    });
};

// 语音录制模态框
const voicePopup = ref(null);
const handleVoiceResult = (result) => {
    if (result && result.transcription) {
        // 将语音转写文本添加到日记内容
        journal.content += (journal.content ? '\n\n' : '') + result.transcription;
        wordCount.value = journal.content.length;
        
        // 如果有情感分析结果，可以设置日记的情感
        if (result.dominantEmotion) {
            // 这里可以添加根据情感分析结果影响日记情感分析的逻辑
            // 例如: journal.emotionType = result.dominantEmotion;
        }
    }
    closeVoiceRecorder();
};
const closeVoiceRecorder = () => {
    uni.hideLoading();
    if (voicePopup.value) {
        voicePopup.value.close();
    }
};
const showVoiceRecorder = () => {
    // 检查平台兼容性
    // #ifdef H5
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        uni.showToast({
            title: '您的浏览器不支持录音功能',
            icon: 'none'
        });
        return;
    }
    
    // 请求麦克风权限
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
            if (voicePopup.value) {
                voicePopup.value.open();
            }
        })
        .catch(err => {
            console.error('获取麦克风权限失败', err);
            uni.showToast({
                title: '未获得录音权限',
                icon: 'none'
            });
        });
    return;
    // #endif
    
    // 原生平台
    uni.showLoading({ title: '准备录音功能...' });
    
    // 请求录音权限
    uni.authorize({
        scope: 'scope.record',
        success: function() {
            uni.hideLoading();
            if (voicePopup.value) {
                voicePopup.value.open();
            }
        },
        fail: function() {
            uni.hideLoading();
            uni.showToast({
                title: '未获得录音权限',
                icon: 'none'
            });
        }
    });
};
</script>

<style>
/* 主题样式 */
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
.theme-dark input,
.theme-dark textarea {
    color: rgba(255, 255, 255, 0.85);
}

.theme-dark button {
    color: rgba(255, 255, 255, 0.85);
}

.theme-dark text {
    color: rgba(255, 255, 255, 0.7);
}

.theme-dark .text-gray-700,
.theme-dark .text-gray-800 {
    color: rgba(255, 255, 255, 0.85) !important;
}

.theme-dark .text-black\/50,
.theme-dark .text-black\/60,
.theme-dark .text-black\/70,
.theme-dark .text-black\/80 {
    color: rgba(255, 255, 255, 0.7) !important;
}

.theme-dark .bg-black\/5,
.theme-dark .bg-black\/10 {
    background-color: rgba(255, 255, 255, 0.1) !important;
}

.theme-dark .bg-white\/60,
.theme-dark .bg-white\/20 {
    background-color: rgba(42, 42, 42, 0.7) !important;
}

.theme-dark .border-black\/5,
.theme-dark .border-black\/10,
.theme-dark .border-black\/20 {
    border-color: rgba(255, 255, 255, 0.2) !important;
}

.theme-dark .border-blue-200 {
    border-color: rgba(96, 165, 250, 0.5) !important;
}

.theme-nature {
    background-image: url('/static/themes/nature-bg.png');
    background-size: cover;
    background-position: center;
}
</style>