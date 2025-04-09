// MyAi/api/emotion.js
import { request } from './request';

// 分析文本情感
export function analyzeText(text) {
  return request({
    url: '/api/emotion/analyze',
    method: 'post',
    data: text
  })
}

// 获取单个文本的情感分析结果
export function getEmotionAnalysis(journalId) {
  return request({
    url: `/api/emotion/analysis/${journalId}`,
    method: 'get'
  })
}

// 获取情感统计
export function getEmotionStats(userId, startDate, endDate) {
  return request({
    url: '/api/emotion/stats',
    method: 'get',
    params: {
      userId,
      startDate,
      endDate
    }
  })
}