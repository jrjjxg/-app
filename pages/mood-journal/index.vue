<template>
  <view class="flex flex-col h-full bg-gradient-to-b from-rose-50 to-blue-50">
    <!-- 头部 -->
    <view class="bg-white/80 backdrop-blur-sm px-4 py-3 flex justify-between items-center">
      <text class="text-lg font-medium text-gray-700">心灵日记</text>
      <view @tap="navigateToEdit"
        class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
        <uni-icons type="plusempty" size="20" color="#FFFFFF"></uni-icons>
      </view>
    </view>

    <!-- 替换为新日记列表组件 -->
    <journal-list></journal-list>
  </view>
</template>

<script>
import JournalList from '@/components/journal/JournalList.vue';

export default {
  components: {
    JournalList
  },
  methods: {
    navigateToEdit() {
      uni.navigateTo({
        url: '/pages/journal/edit'
      });
    }
  }
}
</script>