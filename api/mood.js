import { request } from './request';

// 创建情绪记录
export const createMoodRecord = (moodData) => {
  return request({
    url: '/api/moods',
    method: 'POST',
    data: moodData,
  });
};

// 获取单个情绪记录
export const getMoodRecord = (id) => {
  return request({
    url: `/api/moods/${id}`,
    method: 'GET'
  });
};

// 获取情绪历史记录
export const getMoodHistory = (pageNum = 1, pageSize = 10) => {
  return request({
    url: '/api/moods/history',
    method: 'GET',
    params: { pageNum, pageSize },
  });
};

// 获取日期范围内的情绪记录
export const getMoodByDateRange = (startDate, endDate) => {
  return request({
    url: '/api/moods/date-range',
    method: 'GET',
    params: { startDate, endDate },
  });
};

// 获取情绪分析数据
export const getMoodAnalytics = (startDate, endDate) => {
  let url = '/api/moods/analytics';
  const params = [];
  
  if (startDate) {
    params.push(`startDate=${startDate}`);
  }
  
  if (endDate) {
    params.push(`endDate=${endDate}`);
  }
  
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }
  
  return request({
    url,
    method: 'GET'
  });
};

// 获取所有情绪类型
export const getAllEmotionTypes = () => {
  return request({
    url: '/api/moods/emotion-types',
    method: 'GET'
  });
};

// 获取所有标签
export const getAllTags = () => {
  return request({
    url: '/api/moods/tags',
    method: 'GET'
  });
};