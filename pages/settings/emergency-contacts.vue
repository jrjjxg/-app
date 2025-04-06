<template>
    <view class="container">
        <view class="header">
            <view class="title">紧急联系人</view>
            <view class="description">
                当您的心理健康状况达到预警级别时，系统将通知您的紧急联系人。所有通知会事先告知您。
            </view>
        </view>

        <!-- 功能开关设置 -->
        <view class="card settings-card">
            <view class="card-title">预警设置</view>
            <view class="setting-item">
                <view class="label">启用紧急联系人通知</view>
                <switch :checked="settings.enableEmergencyAlert" @change="toggleEmergencyAlert" color="#5b21b6" />
            </view>
            <view class="setting-item" v-if="settings.enableEmergencyAlert">
                <view class="label">紧急通知阈值</view>
                <picker :value="thresholdIndex" :range="thresholdOptions" @change="setThreshold">
                    <view class="picker">
                        <text>{{ thresholdOptions[thresholdIndex] }}</text>
                        <uni-icons type="right" size="16"></uni-icons>
                    </view>
                </picker>
            </view>
            <view class="hint" v-if="settings.enableEmergencyAlert">
                当您的心理状况达到"{{ thresholdOptions[thresholdIndex] }}"级别时，系统将通知您的紧急联系人。
            </view>
        </view>

        <!-- 联系人列表 -->
        <view class="card contacts-card" v-if="settings.enableEmergencyAlert">
            <view class="card-header">
                <view class="card-title">联系人列表</view>
                <button class="add-btn" @click="showAddContact">添加</button>
            </view>

            <view v-if="contacts.length === 0" class="empty-state">
                <view class="empty-icon">
                    <uni-icons type="contact" size="40" color="#9ca3af"></uni-icons>
                </view>
                <text class="empty-text">尚未添加紧急联系人</text>
                <text class="empty-hint">添加您信任的人作为紧急联系人</text>
            </view>

            <view v-for="contact in contacts" :key="contact.id" class="contact-item">
                <view class="contact-info">
                    <view class="contact-name">{{ contact.name }}</view>
                    <view class="contact-detail">
                        <text>{{ contact.relationship }}</text>
                        <text class="dot-separator">•</text>
                        <text>{{ contact.phone }}</text>
                    </view>
                    <view class="contact-threshold">
                        通知阈值: {{ getThresholdName(contact.notifyThreshold) }}
                    </view>
                </view>
                <view class="contact-actions">
                    <uni-icons type="compose" size="20" color="#6b7280" @click="editContact(contact)"></uni-icons>
                    <uni-icons type="trash" size="20" color="#6b7280"
                        @click="confirmDeleteContact(contact)"></uni-icons>
                </view>
            </view>
        </view>

        <!-- 隐私声明 -->
        <view class="privacy-notice">
            <view class="notice-title">隐私声明</view>
            <view class="notice-content">
                • 您的联系人信息将被安全加密存储
                • 系统仅在您的心理健康状况达到预设阈值时才会通知联系人
                • 联系人仅会收到标准化信息，不会获取您的详细测试结果
                • 您可以随时修改或撤销通知设置
            </view>
        </view>

        <!-- 在页面底部添加测试卡片 -->
        <view class="card test-card" v-if="settings.enableEmergencyAlert">
            <view class="card-title">测试通知功能</view>
            <view class="test-description">
                使用此功能可以测试预警通知是否正常发送到您的紧急联系人。
                <text class="test-warning">测试将会实际发送通知！</text>
            </view>

            <view class="setting-item">
                <view class="label">测试风险等级</view>
                <picker :value="testRiskLevelIndex" :range="thresholdOptions" @change="setTestRiskLevel">
                    <view class="picker">
                        <text>{{ thresholdOptions[testRiskLevelIndex] }}</text>
                        <uni-icons type="right" size="16"></uni-icons>
                    </view>
                </picker>
            </view>

            <view class="setting-item">
                <view class="label">测试消息</view>
                <input type="text" v-model="testMessage" placeholder="输入测试消息" class="test-input" />
            </view>

            <button class="test-button" @click="runAlertTest" :disabled="testRunning">
                {{ testRunning ? '测试中...' : '运行测试' }}
            </button>

            <!-- 测试结果显示 -->
            <view v-if="testResult" class="test-result">
                <view class="test-result-title">测试结果</view>
                <view class="test-result-item">
                    <text class="result-label">预警记录创建:</text>
                    <text :class="testResult.recordCreated ? 'success-text' : 'error-text'">
                        {{ testResult.recordCreated ? '成功' : '失败' }}
                    </text>
                </view>

                <view class="test-result-item">
                    <text class="result-label">紧急联系人通知功能:</text>
                    <text :class="testResult.emergencyAlertEnabled ? 'success-text' : 'error-text'">
                        {{ testResult.emergencyAlertEnabled ? '已启用' : '未启用' }}
                    </text>
                </view>

                <view class="test-result-item" v-if="testResult.emergencyAlertEnabled">
                    <text class="result-label">阈值检查:</text>
                    <text :class="testResult.thresholdReached ? 'success-text' : 'error-text'">
                        {{ testResult.thresholdReached ? '已达阈值' : '未达阈值' }}
                    </text>
                </view>

                <view class="test-result-item" v-if="testResult.thresholdReached">
                    <text class="result-label">联系人:</text>
                    <text :class="testResult.contactsFound ? 'success-text' : 'error-text'">
                        {{ testResult.contactsFound ? `找到${testResult.contactCount}个联系人` : '未找到联系人' }}
                    </text>
                </view>

                <view v-if="testResult.notifications && testResult.notifications.length > 0">
                    <view class="test-result-title">通知发送结果</view>
                    <view class="notification-item" v-for="(notification, index) in testResult.notifications"
                        :key="index">
                        <text class="notification-name">{{ notification.name }}</text>
                        <view class="notification-details">
                            <text v-if="notification.emailSent !== undefined">
                                邮件: {{ notification.emailSent ? '✓ 已发送' : '✗ 发送失败' }}
                            </text>
                            <text v-if="notification.phoneSmsSimulated">
                                短信: ✓ 已模拟发送
                            </text>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>

    <!-- 添加/编辑联系人弹窗 -->
    <uni-popup ref="contactPopup" type="bottom">
        <view class="popup-content">
            <view class="popup-header">
                <text>{{ isEdit ? '编辑联系人' : '添加联系人' }}</text>
                <uni-icons type="close" size="20" color="#6b7280" @click="closePopup"></uni-icons>
            </view>
            <view class="form-item">
                <text class="form-label">姓名</text>
                <input v-model="currentContact.name" placeholder="请输入联系人姓名" class="form-input" />
            </view>
            <view class="form-item">
                <text class="form-label">关系</text>
                <input v-model="currentContact.relationship" placeholder="如：家人、朋友" class="form-input" />
            </view>
            <view class="form-item">
                <text class="form-label">手机号码</text>
                <input v-model="currentContact.phone" placeholder="请输入手机号码" class="form-input" type="number" />
            </view>
            <view class="form-item">
                <text class="form-label">邮箱地址</text>
                <input v-model="currentContact.email" placeholder="请输入邮箱地址" class="form-input" />
            </view>
            <view class="form-item">
                <text class="form-label">通知阈值</text>
                <picker :value="contactThresholdIndex" :range="thresholdOptions" @change="setContactThreshold">
                    <view class="form-picker">
                        <text>{{ thresholdOptions[contactThresholdIndex] }}</text>
                        <uni-icons type="down" size="14" color="#6b7280"></uni-icons>
                    </view>
                </picker>
            </view>
            <button class="submit-btn" @click="saveContact">保存</button>
        </view>
    </uni-popup>

    <!-- 确认删除弹窗 -->
    <uni-popup ref="confirmPopup" type="dialog">
        <uni-popup-dialog type="warning" title="确认删除" content="确定要删除这个紧急联系人吗？此操作无法撤销。" :before-close="true"
            @confirm="deleteContact" @close="closeConfirmPopup"></uni-popup-dialog>
    </uni-popup>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import {
    getEmergencyContacts,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    getUserAlertSettings,
    updateUserAlertSettings,
    testAlertNotification
} from '@/api/alert';

export default {
    setup() {
        // 用户设置
        const settings = ref({
            enableSelfAlert: true,
            enableEmergencyAlert: false,
            emergencyThreshold: 4
        });

        // 紧急联系人列表
        const contacts = ref([]);

        // 阈值选项
        const thresholdOptions = ['轻度风险', '中度风险', '高度风险', '紧急风险'];
        const thresholdIndex = ref(2); // 默认高度风险

        // 弹窗相关
        const contactPopup = ref(null);
        const confirmPopup = ref(null);

        // 当前编辑的联系人
        const currentContact = reactive({
            id: '',
            name: '',
            relationship: '',
            phone: '',
            email: '',
            notifyThreshold: 3
        });
        const contactThresholdIndex = ref(2);

        const isEdit = ref(false);
        const contactToDelete = ref(null);

        // 测试相关
        const testRiskLevelIndex = ref(2);
        const testMessage = ref('这是一条测试预警消息');
        const testRunning = ref(false);
        const testResult = ref(null);

        // 加载设置
        const loadSettings = async () => {
            try {
                const res = await getUserAlertSettings();
                if (res.code === 200 && res.data) {
                    settings.value = res.data;

                    // 设置阈值索引
                    if (settings.value.emergencyThreshold) {
                        thresholdIndex.value = settings.value.emergencyThreshold - 2;
                    }
                }
            } catch (error) {
                console.error('加载设置失败:', error);
                uni.showToast({
                    title: '加载设置失败',
                    icon: 'none'
                });
            }
        };

        // 加载联系人
        const loadContacts = async () => {
            try {
                const res = await getEmergencyContacts();
                if (res.code === 200) {
                    contacts.value = res.data || [];
                }
            } catch (error) {
                console.error('加载联系人失败:', error);
                uni.showToast({
                    title: '加载联系人失败',
                    icon: 'none'
                });
            }
        };

        // 切换紧急联系人通知开关
        const toggleEmergencyAlert = async (e) => {
            try {
                const value = e.detail.value;
                settings.value.enableEmergencyAlert = value;

                // 更新设置
                await updateUserAlertSettings(settings.value);

                if (value) {
                    uni.showToast({
                        title: '已启用紧急联系人通知',
                        icon: 'none'
                    });
                } else {
                    uni.showToast({
                        title: '已关闭紧急联系人通知',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('更新设置失败:', error);
                uni.showToast({
                    title: '设置更新失败',
                    icon: 'none'
                });

                // 恢复原值
                settings.value.enableEmergencyAlert = !settings.value.enableEmergencyAlert;
            }
        };

        // 设置阈值
        const setThreshold = async (e) => {
            try {
                const index = e.detail.value;
                thresholdIndex.value = index;
                settings.value.emergencyThreshold = index + 2; // 转换为实际阈值

                // 更新设置
                await updateUserAlertSettings(settings.value);
            } catch (error) {
                console.error('更新阈值失败:', error);
                uni.showToast({
                    title: '设置更新失败',
                    icon: 'none'
                });
            }
        };

        // 显示添加联系人弹窗
        const showAddContact = () => {
            isEdit.value = false;
            Object.assign(currentContact, {
                id: '',
                name: '',
                relationship: '',
                phone: '',
                email: '',
                notifyThreshold: 3
            });
            contactThresholdIndex.value = 1;
            contactPopup.value.open();
        };

        // 编辑联系人
        const editContact = (contact) => {
            isEdit.value = true;
            Object.assign(currentContact, contact);
            contactThresholdIndex.value = contact.notifyThreshold - 2;
            contactPopup.value.open();
        };

        // 关闭弹窗
        const closePopup = () => {
            contactPopup.value.close();
        };

        // 设置联系人通知阈值
        const setContactThreshold = (e) => {
            const index = e.detail.value;
            contactThresholdIndex.value = index;
            currentContact.notifyThreshold = index + 2;
        };

        // 保存联系人
        const saveContact = async () => {
            // 表单验证
            if (!currentContact.name.trim()) {
                uni.showToast({
                    title: '请输入联系人姓名',
                    icon: 'none'
                });
                return;
            }

            if (!currentContact.phone && !currentContact.email) {
                uni.showToast({
                    title: '请至少填写一种联系方式',
                    icon: 'none'
                });
                return;
            }

            try {
                let res;
                if (isEdit.value) {
                    res = await updateEmergencyContact(currentContact);
                } else {
                    res = await addEmergencyContact(currentContact);
                }

                if (res.code === 200) {
                    uni.showToast({
                        title: isEdit.value ? '更新成功' : '添加成功',
                        icon: 'success'
                    });
                    closePopup();
                    loadContacts();
                } else {
                    uni.showToast({
                        title: res.message || '操作失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('保存联系人失败:', error);
                uni.showToast({
                    title: '操作失败，请重试',
                    icon: 'none'
                });
            }
        };

        // 确认删除联系人
        const confirmDeleteContact = (contact) => {
            contactToDelete.value = contact;
            confirmPopup.value.open();
        };

        // 关闭确认弹窗
        const closeConfirmPopup = () => {
            confirmPopup.value.close();
        };

        // 删除联系人
        const deleteContact = async () => {
            try {
                if (!contactToDelete.value) {
                    return;
                }

                const res = await deleteEmergencyContact(contactToDelete.value.id);
                if (res.code === 200) {
                    uni.showToast({
                        title: '删除成功',
                        icon: 'success'
                    });
                    loadContacts();
                } else {
                    uni.showToast({
                        title: res.message || '删除失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('删除联系人失败:', error);
                uni.showToast({
                    title: '删除失败，请重试',
                    icon: 'none'
                });
            }
        };

        // 获取阈值名称
        const getThresholdName = (threshold) => {
            const index = threshold - 2;
            return index >= 0 && index < thresholdOptions.length ?
                thresholdOptions[index] : '未知';
        };

        // 设置测试风险等级
        const setTestRiskLevel = (e) => {
            const index = e.detail.value;
            testRiskLevelIndex.value = index;
        };

        // 运行通知测试
        const runAlertTest = async () => {
            if (testRunning.value) return;

            testRunning.value = true;
            testResult.value = null;

            try {
                const riskLevel = testRiskLevelIndex.value + 2;
                const res = await testAlertNotification({
                    riskLevel: riskLevel,
                    content: testMessage.value,
                    createNotification: true,
                    sendEmail: true
                });

                if (res.code === 200) {
                    testResult.value = res.data;
                    uni.showToast({
                        title: '测试完成',
                        icon: 'success'
                    });
                } else {
                    uni.showToast({
                        title: res.message || '测试失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('测试预警通知失败:', error);
                uni.showToast({
                    title: '测试失败，请重试',
                    icon: 'none'
                });
            } finally {
                testRunning.value = false;
            }
        };

        onMounted(() => {
            loadSettings();
            loadContacts();
        });

        return {
            settings,
            contacts,
            thresholdOptions,
            thresholdIndex,
            contactPopup,
            confirmPopup,
            currentContact,
            contactThresholdIndex,
            isEdit,
            toggleEmergencyAlert,
            setThreshold,
            showAddContact,
            editContact,
            closePopup,
            setContactThreshold,
            saveContact,
            confirmDeleteContact,
            closeConfirmPopup,
            deleteContact,
            getThresholdName,
            testRiskLevelIndex,
            testMessage,
            testRunning,
            testResult,
            setTestRiskLevel,
            runAlertTest
        };
    }
};
</script>

<style scoped>
.container {
    background-color: #f5f7fa;
    padding: 20px;
    min-height: 100vh;
}

.header {
    margin-bottom: 24px;
    padding-top: 24px;
}

.title {
    font-size: 24px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 8px;
}

.description {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 20px;
    line-height: 1.5;
}

.card {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    padding: 16px;
    margin-bottom: 16px;
}

.card-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 12px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
}

.label {
    font-size: 16px;
    color: #4b5563;
}

.picker {
    background-color: #f9fafb;
    padding: 8px 12px;
    border-radius: 6px;
    display: flex;
    align-items: center;
}

.hint {
    margin-top: 12px;
    font-size: 14px;
    color: #6b7280;
    line-height: 1.5;
}

.add-btn {
    background-color: #5b21b6;
    color: white;
    font-size: 14px;
    padding: 6px 12px;
    border-radius: 6px;
}

.empty-state {
    padding: 36px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.empty-icon {
    margin-bottom: 12px;
}

.empty-text {
    font-size: 16px;
    color: #4b5563;
    margin-bottom: 8px;
}

.empty-hint {
    font-size: 14px;
    color: #9ca3af;
}

.contact-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f3f4f6;
}

.contact-item:last-child {
    border-bottom: none;
}

.contact-info {
    flex: 1;
}

.contact-name {
    font-size: 16px;
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 4px;
}

.contact-detail {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 4px;
}

.dot-separator {
    margin: 0 6px;
}

.contact-threshold {
    font-size: 12px;
    color: #9ca3af;
}

.contact-actions {
    display: flex;
    gap: 16px;
}

.privacy-notice {
    margin-top: 20px;
    padding: 16px;
    background-color: #f8fafc;
    border-radius: 8px;
}

.notice-title {
    font-size: 16px;
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 8px;
}

.notice-content {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.6;
}

/* 弹窗样式 */
.popup-content {
    background-color: #ffffff;
    padding: 24px;
    border-radius: 12px 12px 0 0;
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: 600;
}

.form-item {
    margin-bottom: 16px;
}

.form-label {
    display: block;
    font-size: 14px;
    color: #4b5563;
    margin-bottom: 8px;
}

.form-input {
    width: 100%;
    height: 44px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 16px;
}

.form-picker {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 44px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0 12px;
}

.submit-btn {
    margin-top: 24px;
    background-color: #5b21b6;
    color: white;
    height: 48px;
    border-radius: 8px;
    font-size: 16px;
    width: 100%;
}

.test-card {
    margin-top: 20px;
    padding: 16px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
}

.test-description {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 16px;
    line-height: 1.5;
}

.test-warning {
    color: #ef4444;
    font-weight: 500;
}

.test-input {
    background-color: #f9fafb;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    width: 100%;
}

.test-button {
    background-color: #5b21b6;
    color: white;
    border-radius: 6px;
    padding: 10px;
    margin-top: 16px;
    font-size: 16px;
}

.test-button:disabled {
    background-color: #9ca3af;
}

.test-result {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
}

.test-result-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 12px;
}

.test-result-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
}

.result-label {
    color: #4b5563;
}

.success-text {
    color: #10b981;
    font-weight: 500;
}

.error-text {
    color: #ef4444;
    font-weight: 500;
}

.notification-item {
    background-color: #f9fafb;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 8px;
}

.notification-name {
    font-weight: 600;
    color: #1f2937;
    display: block;
    margin-bottom: 4px;
}

.notification-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
    color: #4b5563;
}
</style>