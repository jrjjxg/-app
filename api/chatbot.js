import { request } from '@/api/request.js'

// 发送消息
export function sendMessage(threadId, message) {
  let finalThreadId = threadId;
  
  // 严格检查并转换threadId
  if (typeof finalThreadId === 'object' && finalThreadId !== null) {
    console.warn('sendMessage received object threadId:', finalThreadId);
    finalThreadId = finalThreadId.id || String(finalThreadId);
    console.log('Converted threadId to string:', finalThreadId);
  }
  
  // 再次检查是否为空或无效
  if (!finalThreadId || typeof finalThreadId !== 'string') {
    console.error('Invalid threadId after conversion:', finalThreadId);
    return Promise.reject(new Error('Invalid or missing threadId for sendMessage'));
  }
  
  console.log('Sending message for threadId:', finalThreadId);
  
  return request({
    url: '/api/chatbot/chat',
    method: 'POST',
    data: {
      threadId: finalThreadId, // 使用转换后的ID
      message
    }
  })
}

// 创建新的聊天线程
export function createThread(title) {
  return request({
    url: '/api/chatbot/thread',
    method: 'POST',
    data: {
      title
    }
  })
}

// 获取用户的所有聊天线程
export function getThreads() {
  return request({
    url: '/api/chatbot/threads',
    method: 'GET'
  })
}

// 获取线程的聊天历史
export function getChatHistory(threadId) {
  let finalThreadId = threadId;
  
  // 严格检查并转换threadId
  if (typeof finalThreadId === 'object' && finalThreadId !== null) {
    console.warn('getChatHistory received object threadId:', finalThreadId);
    // 尝试获取id属性，如果失败，则强制转为字符串，避免传递[object Object]
    finalThreadId = finalThreadId.id || String(finalThreadId);
    console.log('Converted threadId to string:', finalThreadId);
  }
  
  // 再次检查是否为空或无效
  if (!finalThreadId || typeof finalThreadId !== 'string') {
    console.error('Invalid threadId after conversion:', finalThreadId);
    return Promise.reject(new Error('Invalid or missing threadId for getChatHistory'));
  }
  
  console.log('Fetching chat history for threadId:', finalThreadId);
  
  return request({
    url: `/api/chatbot/history/${encodeURIComponent(finalThreadId)}`,
    method: 'GET'
  });
}

// 删除聊天线程
export function deleteThread(threadId) {
  let finalThreadId = threadId;
  
  // 严格检查并转换threadId
  if (typeof finalThreadId === 'object' && finalThreadId !== null) {
    console.warn('deleteThread received object threadId:', finalThreadId);
    finalThreadId = finalThreadId.id || String(finalThreadId);
    console.log('Converted threadId to string:', finalThreadId);
  }
  
  // 再次检查是否为空或无效
  if (!finalThreadId || typeof finalThreadId !== 'string') {
    console.error('Invalid threadId after conversion:', finalThreadId);
    return Promise.reject(new Error('Invalid or missing threadId for deleteThread'));
  }
  
  console.log('Deleting thread with threadId:', finalThreadId);
  
  return request({
    url: `/api/chatbot/thread/${encodeURIComponent(finalThreadId)}`,
    method: 'DELETE'
  });
} 