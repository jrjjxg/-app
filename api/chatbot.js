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
export function createThread(title, systemPrompt = null) {
  const data = { title };
  
  // 如果提供了系统提示词，添加到请求数据中
  if (systemPrompt) {
    data.systemPrompt = systemPrompt;
  }
  
  return request({
    url: '/api/chatbot/thread',
    method: 'POST',
    data
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
    finalThreadId = finalThreadId.id || String(finalThreadId);
  }
  
  // 再次检查是否为空或无效
  if (!finalThreadId || typeof finalThreadId !== 'string') {
    return Promise.reject(new Error('Invalid threadId'));
  }
  
  // 检查是否包含前缀，如果是完整格式，提取正确部分
  if (finalThreadId.split('_').length > 2) {
    // 如果ID格式是 prefix_userId_threadId
    // 只保留 userId_threadId 部分
    const parts = finalThreadId.split('_');
    finalThreadId = parts.slice(1).join('_');
  }
  
  console.log('使用处理后的threadId获取历史:', finalThreadId);
  
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


export function sendMessageStream(threadId, message, callbacks) {
  const userId = uni.getStorageSync('userUserName') || 'default_user'
  const debugId = Math.random().toString(36).substring(2, 10)
  
  console.log(`[FE-${debugId}] 开始发送流式请求: threadId=${threadId}`)
  
  const BASE_URL = 'http://localhost:5000'
  const encodedMessage = encodeURIComponent(message)
  const url = `${BASE_URL}/api/chat/stream?threadId=${threadId}&userId=${userId}&message=${encodedMessage}`
  
  console.log(`[FE-${debugId}] 请求URL: ${url}`)
  
  // 创建EventSource连接
  const eventSource = new EventSource(url)
  console.log(`[FE-${debugId}] EventSource已创建`)
  
  // 添加open事件监听
  eventSource.onopen = function(event) {
    console.log(`[FE-${debugId}] EventSource连接已打开`)
  }
  
  eventSource.addEventListener('start', event => {
    console.log(`[FE-${debugId}] 收到start事件: ${event.data}`)
    try {
      const data = JSON.parse(event.data)
      if (callbacks.onStart) callbacks.onStart(data)
    } catch (error) {
      console.error(`[FE-${debugId}] 解析start事件数据失败:`, error, event.data)
    }
  })
  
  eventSource.addEventListener('chunk', event => {
    try {
      const data = JSON.parse(event.data)
      console.log(`[FE-${debugId}] 收到chunk: 长度=${data.chunk ? data.chunk.length : 0}`)
      if (callbacks.onChunk) callbacks.onChunk(data)
    } catch (error) {
      console.error(`[FE-${debugId}] 解析chunk事件数据失败:`, error, event.data)
    }
  })
  
  eventSource.addEventListener('complete', event => {
    console.log(`[FE-${debugId}] 收到complete事件`)
    try {
      const data = JSON.parse(event.data)
      if (callbacks.onComplete) callbacks.onComplete(data)
    } catch (error) {
      console.error(`[FE-${debugId}] 解析complete事件数据失败:`, error)
    }
    console.log(`[FE-${debugId}] 关闭EventSource连接`)
    eventSource.close()
  })
  
  eventSource.addEventListener('error', event => {
    console.error(`[FE-${debugId}] 收到error事件:`, event)
    if (callbacks.onError) callbacks.onError(event)
  })
  
  eventSource.onerror = error => {
    console.error(`[FE-${debugId}] EventSource错误:`, error)
    // 尝试检查readyState
    console.error(`[FE-${debugId}] EventSource readyState: ${eventSource.readyState}`)
    if (callbacks.onError) callbacks.onError(error)
    console.log(`[FE-${debugId}] 由于错误关闭EventSource连接`)
    eventSource.close()
  }
  
  return eventSource
}

// 更新系统提示词
export function updateSystemPrompt(threadId, systemPrompt) {
  // 从线程ID中提取用户名
  let userId = 'default_user'
  if (threadId && threadId.includes('_')) {
    const parts = threadId.split('_')
    userId = parts[0]
    console.log('从线程ID提取的用户名:', userId)
  } else {
    // 备用方案：从本地存储获取
    userId = uni.getStorageSync('userUserName') || 'default_user'
    console.log('使用本地存储的用户名:', userId)
  }
  
  const BASE_URL = 'http://localhost:5000'
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/api/chatbot/prompt`,
      method: 'POST',
      data: {
        thread_id: threadId,
        user_id: userId,
        system_prompt: systemPrompt
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      },
      fail: (err) => {
        console.error('更新系统提示词请求失败:', err)
        reject(err)
      }
    })
  })
}

export function confirmAction(data) {
  return request({
    url: '/api/confirm',
    method: 'post',
    data
  })
}