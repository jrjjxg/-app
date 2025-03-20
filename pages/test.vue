<template>
    <view class="container">
        <view class="title">测试页面</view>
        <view class="form">
            <input type="text" v-model="inputValue" placeholder="请输入内容" />
            <button @tap="showInput">显示输入内容</button>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            inputValue: ''
        }
    },
    methods: {
        showInput() {
            uni.showToast({
                title: '您输入的内容是：' + this.inputValue,
                icon: 'none'
            });
        }
    },
    onLoad() {
        console.log('测试页面加载成功');
    }
}
</script>

<style>
.container {
    padding: 20px;
}

.title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
}

.form {
    display: flex;
    flex-direction: column;
}

input {
    height: 40px;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0 10px;
    margin-bottom: 15px;
}

button {
    height: 40px;
    background-color: #007AFF;
    color: white;
    border: none;
    border-radius: 4px;
}
</style>
