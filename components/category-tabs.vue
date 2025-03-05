<template>
  <scroll-view scroll-x class="whitespace-nowrap -mx-4 px-4">
    <view 
      v-for="category in categories" 
      :key="category.id"
      class="inline-block px-4 py-2 rounded-full mr-2 text-sm"
      :class="active === category.id ? 'bg-blue-100 text-blue-600 font-medium' : 'bg-gray-100 text-gray-600'"
      @click="selectCategory(category.id)"
    >
      {{ category.name }}
    </view>
  </scroll-view>
</template>

<script>
export default {
  props: {
    categories: {
      type: Array,
      default: () => []
    },
    active: {
      type: String,
      default: ''
    }
  },
  methods: {
    selectCategory(id) {
      this.$emit('change', id)
    }
  }
}
</script>
