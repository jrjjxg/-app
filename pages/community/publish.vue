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
                class="flex items-center p-3 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                @click="selectTopic(topic)">
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
    </scroll-view>
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
      syncToMoments: false,
    };
  },
  computed: {
    canPublish() {
      return this.content.trim().length > 0;
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
      const uploadedUrls = [];

      // 如果没有图片，直接返回空数组
      if (!localPaths || localPaths.length === 0) {
        return uploadedUrls;
      }

      uni.showLoading({ title: '上传图片中...' });

      try {
        // 依次上传每张图片
        for (const path of localPaths) {
          // 直接使用path，通过后端处理文件上传
          const tempFilePath = path;

          // 使用uni.uploadFile上传文件
          const uploadResult = await new Promise((resolve, reject) => {
            uni.uploadFile({
              url: 'http://localhost:9000/api/upload/community',
              filePath: tempFilePath,
              name: 'file',
              success: (res) => {
                if (res.statusCode === 200) {
                  const responseData = JSON.parse(res.data);
                  if (responseData.code === 200) {
                    resolve(responseData.data); // 返回七牛云URL
                  } else {
                    reject(new Error(responseData.message || '上传失败'));
                  }
                } else {
                  reject(new Error('上传失败，状态码：' + res.statusCode));
                }
              },
              fail: (err) => {
                reject(err);
              }
            });
          });

          uploadedUrls.push(uploadResult);
        }

        return uploadedUrls;
      } catch (error) {
        console.error('图片上传失败:', error);
        uni.showToast({
          title: '图片上传失败，请重试',
          icon: 'none'
        });
        return [];
      } finally {
        uni.hideLoading();
      }
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