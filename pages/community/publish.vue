<template>
  <view class="flex flex-col h-full bg-gray-50">
    <!-- 头部 -->
    <view class="bg-white px-4 pt-12 pb-4 border-b border-gray-100">
      <view class="flex items-center justify-between">
        <view class="flex items-center">
          <view @click="goBack" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
            <uni-icons type="back" size="18" color="#6B7280"></uni-icons>
          </view>
          <text class="text-lg font-bold text-gray-800">发布帖子</text>
        </view>
        <view 
          class="px-4 py-1.5 rounded-full"
          :class="canPublish ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-400'"
          @click="publishPost"
        >
          <text>发布</text>
        </view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view scroll-y class="flex-1 px-4 py-3">
      <!-- 标题输入 -->
      <view class="mb-4">
        <input 
          type="text" 
          class="w-full bg-white rounded-xl p-4 text-base" 
          placeholder="请输入标题（必填）" 
          v-model="title"
          maxlength="50"
        />
        <text class="text-xs text-gray-500 mt-1 text-right">{{ title.length }}/50</text>
      </view>
      
      <!-- 内容输入 -->
      <view class="mb-4">
        <textarea 
          class="w-full bg-white rounded-xl p-4 text-base" 
          placeholder="分享你的想法、经验或问题..." 
          v-model="content"
          maxlength="2000"
          style="height: 200px;"
        ></textarea>
        <text class="text-xs text-gray-500 mt-1 text-right">{{ content.length }}/2000</text>
      </view>
      
      <!-- 图片上传 -->
      <view class="mb-4">
        <view class="bg-white rounded-xl p-4">
          <view class="flex items-center mb-3">
            <uni-icons type="image" size="20" color="#8B5CF6"></uni-icons>
            <text class="ml-2 text-gray-800">添加图片</text>
            <text class="ml-auto text-xs text-gray-500">{{ images.length }}/9</text>
          </view>
          
          <view class="grid grid-cols-3 gap-2">
            <!-- 已上传图片 -->
            <view 
              v-for="(img, index) in images" 
              :key="index"
              class="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <image :src="img" class="w-full h-full object-cover"></image>
              <view 
                class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
                @click="removeImage(index)"
              >
                <uni-icons type="close" size="12" color="#FFFFFF"></uni-icons>
              </view>
            </view>
            
            <!-- 添加图片按钮 -->
            <view 
              v-if="images.length < 9"
              class="aspect-square rounded-lg bg-gray-100 flex items-center justify-center"
              @click="chooseImage"
            >
              <uni-icons type="plus" size="24" color="#9CA3AF"></uni-icons>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 标签选择 -->
      <view class="mb-4">
        <view class="bg-white rounded-xl p-4">
          <view class="flex items-center mb-3">
            <uni-icons type="tag" size="20" color="#8B5CF6"></uni-icons>
            <text class="ml-2 text-gray-800">添加标签</text>
            <text class="ml-auto text-xs text-gray-500">{{ selectedTags.length }}/5</text>
          </view>
          
          <view class="flex flex-wrap">
            <view 
              v-for="(tag, index) in commonTags" 
              :key="index"
              class="mr-2 mb-2 px-3 py-1.5 rounded-full text-sm"
              :class="selectedTags.includes(tag) ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </view>
            
            <!-- 自定义标签 -->
            <view 
              v-if="!showCustomTagInput"
              class="mr-2 mb-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm flex items-center"
              @click="showCustomTagInput = true"
            >
              <uni-icons type="plus" size="14" color="#6B7280" class="mr-1"></uni-icons>
              <text>自定义</text>
            </view>
          </view>
          
          <!-- 自定义标签输入 -->
          <view v-if="showCustomTagInput" class="flex mt-2">
            <input 
              type="text" 
              class="flex-1 bg-gray-100 rounded-l-full px-4 py-2 text-sm" 
              placeholder="输入标签名称（不超过10个字）" 
              v-model="customTag"
              maxlength="10"
            />
            <view 
              class="px-4 py-2 bg-purple-500 rounded-r-full"
              @click="addCustomTag"
            >
              <text class="text-white text-sm">添加</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 隐私设置 -->
      <view class="mb-4">
        <view class="bg-white rounded-xl p-4">
          <view class="flex items-center justify-between">
            <view class="flex items-center">
              <uni-icons type="eye" size="20" color="#8B5CF6"></uni-icons>
              <text class="ml-2 text-gray-800">谁可以看到</text>
            </view>
            <view class="flex items-center">
              <text class="text-gray-600 mr-2">所有人</text>
              <uni-icons type="right" size="14" color="#9CA3AF"></uni-icons>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      title: '',
      content: '',
      images: [],
      selectedTags: [],
      commonTags: [
        '情绪管理', '焦虑', '抑郁', '压力', '睡眠',
        '冥想', '正念', '人际关系', '自我成长', '求助',
        '经验分享', '心得体会', '专业建议'
      ],
      customTag: '',
      showCustomTagInput: false
    }
  },
  computed: {
    canPublish() {
      return this.title.trim() !== '' && this.content.trim() !== ''
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    // 选择图片
    chooseImage() {
      if (this.images.length >= 9) {
        uni.showToast({
          title: '最多上传9张图片',
          icon: 'none'
        })
        return
      }
      
      uni.chooseImage({
        count: 9 - this.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          // 模拟上传，实际应用中应该调用上传API
          this.images = [...this.images, ...res.tempFilePaths]
        }
      })
    },
    
    // 移除图片
    removeImage(index) {
      this.images.splice(index, 1)
    },
    
    // 切换标签
    toggleTag(tag) {
      if (this.selectedTags.includes(tag)) {
        // 移除标签
        this.selectedTags = this.selectedTags.filter(t => t !== tag)
      } else {
        // 添加标签，最多5个
        if (this.selectedTags.length >= 5) {
          uni.showToast({
            title: '最多选择5个标签',
            icon: 'none'
          })
          return
        }
        this.selectedTags.push(tag)
      }
    },
    
    // 添加自定义标签
    addCustomTag() {
      if (!this.customTag.trim()) {
        uni.showToast({
          title: '标签不能为空',
          icon: 'none'
        })
        return
      }
      
      if (this.selectedTags.length >= 5) {
        uni.showToast({
          title: '最多选择5个标签',
          icon: 'none'
        })
        return
      }
      
      // 检查是否已存在
      if (this.selectedTags.includes(this.customTag.trim())) {
        uni.showToast({
          title: '标签已存在',
          icon: 'none'
        })
        return
      }
      
      // 添加到已选标签
      this.selectedTags.push(this.customTag.trim())
      
      // 添加到常用标签（如果不存在）
      if (!this.commonTags.includes(this.customTag.trim())) {
        this.commonTags.push(this.customTag.trim())
      }
      
      // 重置
      this.customTag = ''
      this.showCustomTagInput = false
    },
    
    // 发布帖子
    publishPost() {
      if (!this.canPublish) return
      
      // 显示加载
      uni.showLoading({
        title: '发布中...'
      })
      
      // 模拟网络请求
      setTimeout(() => {
        uni.hideLoading()
        
        // 显示成功提示
        uni.showToast({
          title: '发布成功',
          icon: 'success'
        })
        
        // 延迟返回
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }, 2000)
      
      // 实际应用中，这里应该调用API发布帖子
      // const postData = {
      //   title: this.title,
      //   content: this.content,
      //   images: this.images,
      //   tags: this.selectedTags
      // }
      // this.submitPostToServer(postData)
    }
  }
}
</script>

<style>
</style> 