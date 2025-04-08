<!-- components/ConfirmationDialog.vue -->
<template>
    <view class="confirmation-dialog" v-if="visible">
        <view class="dialog-mask" @click="handleCancel"></view>
        <view class="dialog-content">
            <view class="dialog-title">{{ title }}</view>
            <view class="dialog-message">{{ message }}</view>
            <view class="dialog-buttons">
                <button class="btn-cancel" @click="handleCancel">取消</button>
                <button class="btn-confirm" @click="handleConfirm">确认</button>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: 'ConfirmationDialog',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: '确认提示'
        },
        message: {
            type: String,
            required: true
        }
    },
    methods: {
        handleConfirm() {
            this.$emit('confirm', true)
        },
        handleCancel() {
            this.$emit('confirm', false)
        }
    }
}
</script>

<style lang="scss">
.confirmation-dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;

    .dialog-mask {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
    }

    .dialog-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        background: #fff;
        border-radius: 8px;
        padding: 20px;

        .dialog-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .dialog-message {
            margin-bottom: 20px;
        }

        .dialog-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;

            button {
                padding: 8px 16px;
                border-radius: 4px;

                &.btn-cancel {
                    background: #f5f5f5;
                    color: #333;
                }

                &.btn-confirm {
                    background: #007AFF;
                    color: #fff;
                }
            }
        }
    }
}
</style>