import { request } from './request';

/**
 * 获取用户预警设置
 */
export function getUserAlertSettings() {
  return request({
    url: '/api/alert/settings',
    method: 'GET'
  });
}

/**
 * 更新用户预警设置
 * @param {Object} settings 预警设置
 */
export function updateUserAlertSettings(settings) {
  return request({
    url: '/api/alert/settings',
    method: 'POST',
    data: settings
  });
}

/**
 * 获取紧急联系人列表
 */
export function getEmergencyContacts() {
  return request({
    url: '/api/alert/emergency-contacts',
    method: 'GET'
  });
}

/**
 * 添加紧急联系人
 * @param {Object} contact 联系人信息
 */
export function addEmergencyContact(contact) {
  return request({
    url: '/api/alert/emergency-contacts',
    method: 'POST',
    data: contact
  });
}

/**
 * 更新紧急联系人
 * @param {Object} contact 联系人信息
 */
export function updateEmergencyContact(contact) {
  return request({
    url: '/api/alert/emergency-contacts',
    method: 'PUT',
    data: contact
  });
}

/**
 * 删除紧急联系人
 * @param {String} contactId 联系人ID
 */
export function deleteEmergencyContact(contactId) {
  return request({
    url: `/api/alert/emergency-contacts/${contactId}`,
    method: 'DELETE'
  });
}

/**
 * 获取用户预警记录
 * @param {Number} page 页码
 * @param {Number} size 每页大小
 */
export function getAlertRecords(page = 1, size = 10) {
  return request({
    url: '/api/alert/records',
    method: 'GET',
    params: { page, size }
  });
}

/**
 * 主动触发风险评估
 */
export function triggerRiskAssessment() {
  return request({
    url: '/api/alert/assess',
    method: 'POST'
  });
}

/**
 * 处理预警记录
 * @param {String} alertId 预警ID
 * @param {Number} status 处理状态
 */
export function handleAlert(alertId, status) {
  return request({
    url: `/api/alert/handle/${alertId}`,
    method: 'POST',
    params: { status }
  });
}

/**
 * 获取未读通知数量
 */
export function getUnreadNotificationCount() {
  return request({
    url: '/api/system-notifications/unread-count',
    method: 'GET'
  });
}

/**
 * 获取通知列表
 */
export function getSystemNotifications(page = 1, size = 10, type) {
  return request({
    url: '/api/system-notifications',
    method: 'GET',
    params: { page, size, type }
  });
}

/**
 * 标记通知为已读
 */
export function markNotificationAsRead(id) {
  return request({
    url: `/api/system-notifications/${id}/read`,
    method: 'POST'
  });
}

/**
 * 标记所有通知为已读
 */
export function markAllNotificationsAsRead() {
  return request({
    url: '/api/system-notifications/read-all',
    method: 'POST'
  });
}

/**
 * 获取预警详情
 * @param {String} alertId 预警ID
 */
export function getAlertDetail(alertId) {
  return request({
    url: `/api/alert/records/${alertId}`,
    method: 'GET'
  });
}

/**
 * 测试预警通知功能
 * @param {Object} params 测试参数
 */
export function testAlertNotification(params) {
  return request({
    url: '/api/alert/test-alert',
    method: 'POST',
    data: params
  });
} 