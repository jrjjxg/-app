import { request } from './request';

// 获取通知列表
export const getNotifications = (pageNum = 1, pageSize = 10) => {
  return request({
    url: '/api/community/notification/list',
    method: 'GET',
    params: { pageNum, pageSize }
  });
};

// 标记通知为已读
export const markNotificationRead = (notificationId) => {
  return request({
    url: `/api/community/notification/read/${notificationId}`,
    method: 'POST'
  });
};

// 标记所有通知为已读
export const markAllNotificationsRead = () => {
  return request({
    url: '/api/community/notification/read/all',
    method: 'POST'
  });
};

// 获取未读通知数
export const getUnreadCount = () => {
  return request({
    url: '/api/community/notification/unread',
    method: 'GET'
  });
}; 