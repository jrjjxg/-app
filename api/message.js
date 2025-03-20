import { request } from './request';

// 发送私信
export const sendPrivateMessage = (data) => {
  return request({
    url: '/api/community/message/send',
    method: 'POST',
    data
  });
};

// 获取私信会话列表
export const getMessageSessions = (pageNum = 1, pageSize = 10) => {
  return request({
    url: '/api/community/message/sessions',
    method: 'GET',
    params: { pageNum, pageSize }
  });
};

// 获取与指定用户的私信记录
export const getPrivateMessages = (targetUserId, pageNum = 1, pageSize = 10) => {
  return request({
    url: `/api/community/message/chat/${targetUserId}`,
    method: 'GET',
    params: { pageNum, pageSize }
  });
};

// 标记私信为已读
export const markMessageRead = (messageId) => {
  return request({
    url: `/api/community/message/read/${messageId}`,
    method: 'POST'
  });
};

// 标记与指定用户的所有私信为已读
export const markAllMessagesRead = (targetUserId) => {
  return request({
    url: `/api/community/message/read/all/${targetUserId}`,
    method: 'POST'
  });
}; 