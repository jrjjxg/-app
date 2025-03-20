<template>
  <view class="flex flex-col h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <view class="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
      <view class="p-2" @click="goBack">
        <uni-icons type="back" size="20" color="#333"></uni-icons>
      </view>
      <view class="text-lg font-medium text-gray-800">发布帖子</view>
      <view class="px-4 py-1.5 rounded-full bg-blue-500 text-white text-sm font-medium"
        :class="canPublish ? 'opacity-100' : 'opacity-50'" @click="publishPost">
        发布
      </view>
    </view>

    <!-- 主体内容 -->
    <scroll-view scroll-y class="flex-1 px-4 py-3">
      <!-- 标题输入 -->
      <view class="mb-4">
        <input
          class="w-full px-3 py-2.5 text-lg font-medium bg-transparent border-b border-gray-200 focus:border-blue-500"
          type="text" v-model="title" placeholder="添加标题（选填）" placeholder-class="text-gray-400" />
      </view>

      <!-- 内容输入 -->
      <view class="mb-4">
        <textarea class="w-full min-h-[120px] px-3 py-2 text-base bg-transparent" v-model="content"
          placeholder="分享你的想法..." placeholder-class="text-gray-400" auto-height />
      </view>

      <!-- 图片上传 -->
      <view class="mb-6">
        <view v-if="images.length > 0" class="grid grid-cols-3 gap-2 mb-3">
          <view v-for="(img, index) in images" :key="index"
            class="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <image :src="img" mode="aspectFill" class="w-full h-full object-cover"></image>
            <view
              class="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-black bg-opacity-50"
              @click.stop="removeImage(index)">
              <uni-icons type="close" size="14" color="#fff"></uni-icons>
            </view>
          </view>

          <!-- 添加更多图片 -->
          <view v-if="images.length < 9"
            class="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50"
            @click="chooseImage">
            <uni-icons type="camera" size="24" color="#999"></uni-icons>
          </view>
        </view>

        <!-- 无图片时的上传按钮 -->
        <view v-else class="flex items-center space-x-4 py-3">
          <view class="flex items-center space-x-2 px-3 py-2 rounded-full bg-gray-100 text-gray-600"
            @click="chooseImage">
            <uni-icons type="image" size="18" color="#666"></uni-icons>
            <text class="text-sm">添加图片</text>
          </view>
        </view>
      </view>

      <!-- 话题选择 -->
      <view class="mb-6">
        <view class="flex items-center justify-between mb-2">
          <text class="text-base font-medium text-gray-800">添加话题</text>
          <view class="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-600" @click="showTopicSelector">
            {{ selectedTopic ? selectedTopic.name : '选择话题' }}
          </view>
        </view>

        <!-- 已选话题展示 -->
        <view v-if="selectedTopic" class="flex items-center px-3 py-2 bg-blue-50 rounded-lg">
          <image v-if="selectedTopic.icon" :src="selectedTopic.icon" class="w-8 h-8 rounded-md mr-2"></image>
          <view class="flex-1">
            <view class="text-sm font-medium text-gray-800">{{ selectedTopic.name }}</view>
            <view class="text-xs text-gray-500">{{ selectedTopic.postCount || 0 }}篇内容</view>
          </view>
          <uni-icons type="close" size="16" color="#999" @click="selectedTopic = null"></uni-icons>
        </view>
      </view>

      <!-- 位置信息 -->
      <view class="mb-6">
        <view class="flex items-center justify-between">
          <text class="text-base font-medium text-gray-800">添加位置</text>
          <switch :checked="enableLocation" @change="toggleLocation" color="#3b82f6" style="transform: scale(0.8);" />
        </view>

        <view v-if="enableLocation && location" class="mt-2 flex items-center px-3 py-2 bg-gray-100 rounded-lg">
          <uni-icons type="location" size="16" color="#666" class="mr-2"></uni-icons>
          <text class="text-sm text-gray-700">{{ location.name }}</text>
        </view>
      </view>

      <!-- 谁可以看 -->
      <view class="mb-6">
        <view class="flex items-center justify-between">
          <text class="text-base font-medium text-gray-800">谁可以看</text>
          <view class="flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-100" @click="showVisibilitySelector">
            <uni-icons :type="visibilityIcon" size="16" color="#666"></uni-icons>
            <text class="text-sm text-gray-600">{{ visibilityText }}</text>
          </view>
        </view>
      </view>

      <!-- 其他设置 -->
      <view class="space-y-4 mb-8">
        <view class="flex items-center justify-between">
          <text class="text-base text-gray-700">允许评论</text>
          <switch :checked="allowComment" @change="(e) => allowComment = e.detail.value" color="#3b82f6"
            style="transform: scale(0.8);" />
        </view>

        <view class="flex items-center justify-between">
          <text class="text-base text-gray-700">同步到动态</text>
          <switch :checked="syncToMoments" @change="(e) => syncToMoments = e.detail.value" color="#3b82f6"
            style="transform: scale(0.8);" />
        </view>
      </view>
    </scroll-view>

    <!-- 底部工具栏 -->
    <view class="flex items-center px-4 py-2 bg-white border-t border-gray-200">
      <view class="flex space-x-6">
        <view class="flex flex-col items-center" @click="chooseImage">
          <uni-icons type="image" size="24" color="#666"></uni-icons>
          <text class="text-xs text-gray-500 mt-1">图片</text>
        </view>

        <view class="flex flex-col items-center" @click="showTopicSelector">
          <uni-icons type="paperplane" size="24" color="#666"></uni-icons>
          <text class="text-xs text-gray-500 mt-1">话题</text>
        </view>

        <view class="flex flex-col items-center" @click="toggleLocation">
          <uni-icons type="location" size="24" color="#666"></uni-icons>
          <text class="text-xs text-gray-500 mt-1">位置</text>
        </view>

        <view class="flex flex-col items-center" @click="showEmojiSelector">
          <uni-icons type="emotion" size="24" color="#666"></uni-icons>
          <text class="text-xs text-gray-500 mt-1">表情</text>
        </view>
      </view>
    </view>

    <!-- 话题选择器弹窗 -->
    <uni-popup ref="topicPopup" type="bottom">
      <view class="bg-white rounded-t-xl p-4 max-h-[70vh]">
        <view class="text-center text-lg font-medium mb-4 text-gray-800">选择话题</view>

        <scroll-view scroll-y class="max-h-[50vh]">
          <view class="space-y-3">
            <view v-for="topic in topics" :key="topic.id"
              class="flex items-center p-3 rounded-lg hover:bg-gray-50 active:bg-gray-100" @click="selectTopic(topic)">
              <image v-if="topic.icon" :src="topic.icon" class="w-10 h-10 rounded-md mr-3"></image>
              <view v-else class="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center mr-3">
                <text class="text-blue-500 font-medium">#</text>
              </view>

              <view class="flex-1">
                <view class="text-base font-medium text-gray-800">{{ topic.name }}</view>
                <view class="text-sm text-gray-500">{{ topic.postCount || 0 }}篇内容</view>
              </view>

              <uni-icons v-if="selectedTopic && selectedTopic.id === topic.id" type="checkmarkempty" size="20"
                color="#3b82f6"></uni-icons>
            </view>
          </view>
        </scroll-view>

        <view class="mt-4 flex justify-end">
          <view class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700" @click="closeTopicSelector">取消</view>
        </view>
      </view>
    </uni-popup>

    <!-- 可见性选择器弹窗 -->
    <uni-popup ref="visibilityPopup" type="bottom">
      <view class="bg-white rounded-t-xl p-4">
        <view class="text-center text-lg font-medium mb-4 text-gray-800">谁可以看</view>

        <view class="space-y-4">
          <view v-for="(item, index) in visibilityOptions" :key="index"
            class="flex items-center p-3 rounded-lg hover:bg-gray-50 active:bg-gray-100"
            @click="selectVisibility(item.value)">
            <uni-icons :type="item.icon" size="20" color="#666" class="mr-3"></uni-icons>
            <view class="flex-1">
              <view class="text-base text-gray-800">{{ item.label }}</view>
              <view class="text-sm text-gray-500">{{ item.description }}</view>
            </view>
            <uni-icons v-if="visibility === item.value" type="checkmarkempty" size="20" color="#3b82f6"></uni-icons>
          </view>
        </view>

        <view class="mt-4 flex justify-end">
          <view class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700" @click="closeVisibilitySelector">取消</view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { createPost } from '@/api/post';

export default {
  data() {
    return {
      title: '',
      content: '',
      images: [],
      selectedTopic: null,
      enableLocation: false,
      location: null,
      visibility: 'public',
      allowComment: true,
      syncToMoments: false,
      topics: [
        { id: 1, name: '生活日常', postCount: 1234, icon: '/static/images/topics/daily.png' },
        { id: 2, name: '美食分享', postCount: 987, icon: '/static/images/topics/food.png' },
        { id: 3, name: '旅行攻略', postCount: 756, icon: '/static/images/topics/travel.png' },
        { id: 4, name: '科技数码', postCount: 543, icon: '/static/images/topics/tech.png' },
        { id: 5, name: '职场经验', postCount: 321, icon: '/static/images/topics/career.png' },
      ],
      visibilityOptions: [
        { label: '公开', value: 'public', icon: 'earth', description: '所有人可见' },
        { label: '仅关注者', value: 'followers', icon: 'personadd', description: '仅你的关注者可见' },
        { label: '仅自己', value: 'private', icon: 'locked', description: '仅自己可见' }
      ]
    };
  },
  computed: {
    canPublish() {
      return this.content.trim().length > 0;
    },
    visibilityText() {
      const option = this.visibilityOptions.find(item => item.value === this.visibility);
      return option ? option.label : '公开';
    },
    visibilityIcon() {
      const option = this.visibilityOptions.find(item => item.value === this.visibility);
      return option ? option.icon : 'earth';
    }
  },
  methods: {
    goBack() {
      if (this.content.trim() || this.title.trim() || this.images.length > 0) {
        uni.showModal({
          title: '提示',
          content: '是否放弃编辑？',
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack();
            }
          }
        });
      } else {
        uni.navigateBack();
      }
    },
    async publishPost() {
      if (!this.canPublish) return;

      uni.showLoading({ title: '发布中...' });

      try {
        // 上传图片
        let imageUrls = [];
        if (this.images.length > 0) {
          imageUrls = await this.uploadImages(this.images);
        }

        // 构建帖子数据
        const postData = {
          title: this.title.trim(),
          content: this.content.trim(),
          images: imageUrls,
          topicId: this.selectedTopic ? this.selectedTopic.id : null,
          location: this.enableLocation ? this.location : null,
          visibility: this.visibility,
          allowComment: this.allowComment,
          syncToMoments: this.syncToMoments
        };

        // 发布帖子
        const res = await createPost(postData);

        if (res.code === 200) {
          uni.hideLoading();
          uni.showToast({
            title: '发布成功',
            icon: 'success'
          });

          // 延迟返回，让用户看到成功提示
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          throw new Error(res.message || '发布失败');
        }
      } catch (error) {
        console.error('发布失败', error);
        uni.hideLoading();
        uni.showToast({
          title: '发布失败，请重试',
          icon: 'none'
        });
      }
    },
    chooseImage() {
      if (this.images.length >= 9) {
        uni.showToast({
          title: '最多选择9张图片',
          icon: 'none'
        });
        return;
      }

      uni.chooseImage({
        count: 9 - this.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.images = [...this.images, ...res.tempFilePaths];
        }
      });
    },
    removeImage(index) {
      this.images.splice(index, 1);
    },
    async uploadImages(localPaths) {
      // 模拟上传图片，实际项目中需要实现真正的上传逻辑
      return new Promise((resolve) => {
        setTimeout(() => {
          // 假设返回的是上传后的图片URL
          const uploadedUrls = localPaths.map(path => path);
          resolve(uploadedUrls);
        }, 1000);
      });
    },
    showTopicSelector() {
      this.$refs.topicPopup.open();
    },
    closeTopicSelector() {
      this.$refs.topicPopup.close();
    },
    selectTopic(topic) {
      this.selectedTopic = topic;
      this.closeTopicSelector();
    },
    toggleLocation() {
      if (!this.enableLocation) {
        this.enableLocation = true;
        // 获取位置信息
        uni.getLocation({
          type: 'gcj02',
          success: (res) => {
            // 模拟获取位置名称
            this.location = {
              latitude: res.latitude,
              longitude: res.longitude,
              name: '北京市海淀区中关村'
            };
          },
          fail: () => {
            this.enableLocation = false;
            uni.showToast({
              title: '获取位置失败',
              icon: 'none'
            });
          }
        });
      } else {
        this.enableLocation = false;
        this.location = null;
      }
    },
    showVisibilitySelector() {
      this.$refs.visibilityPopup.open();
    },
    closeVisibilitySelector() {
      this.$refs.visibilityPopup.close();
    },
    selectVisibility(value) {
      this.visibility = value;
      this.closeVisibilitySelector();
    },
    showEmojiSelector() {
      uni.showToast({
        title: '表情功能开发中',
        icon: 'none'
      });
    }
  }
};
</script>